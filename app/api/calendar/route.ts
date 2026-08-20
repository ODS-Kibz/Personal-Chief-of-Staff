import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { CalendarItem } from "@/lib/types";

const GOOGLE = "https://www.googleapis.com/calendar/v3";

function dayBounds(date: string) {
  return {
    timeMin: `${date}T00:00:00+03:00`,
    timeMax: `${date}T23:59:59+03:00`,
  };
}

function formatTime(value?: string) {
  if (!value) return "All day";
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Nairobi",
  }).format(new Date(value));
}

function classify(summary = ""): CalendarItem["kind"] {
  const text = summary.toLowerCase();
  if (text.includes("focus") || text.includes("deep work")) return "focus";
  if (text.includes("admin") || text.includes("follow-up")) return "admin";
  if (text.includes("date") || text.includes("family") || text.includes("personal")) return "personal";
  return "meeting";
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as typeof session & { accessToken?: string } | null)?.accessToken;

  if (!accessToken) {
    return NextResponse.json({ connected: false, items: [] }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const { timeMin, timeMax } = dayBounds(date);
  const headers = { Authorization: `Bearer ${accessToken}` };

  const calendarListResponse = await fetch(`${GOOGLE}/users/me/calendarList`, { headers, cache: "no-store" });
  if (!calendarListResponse.ok) {
    return NextResponse.json({ connected: true, items: [], error: "Unable to read calendar list." }, { status: calendarListResponse.status });
  }

  const calendarList = (await calendarListResponse.json()) as { items?: Array<{ id: string; summary?: string; selected?: boolean }> };
  const calendars = (calendarList.items ?? []).filter(calendar => calendar.selected !== false);

  const eventGroups = await Promise.all(
    calendars.map(async calendar => {
      const params = new URLSearchParams({
        timeMin,
        timeMax,
        singleEvents: "true",
        orderBy: "startTime",
        maxResults: "50",
      });
      const response = await fetch(`${GOOGLE}/calendars/${encodeURIComponent(calendar.id)}/events?${params}`, {
        headers,
        cache: "no-store",
      });
      if (!response.ok) return [] as CalendarItem[];

      const payload = (await response.json()) as {
        items?: Array<{
          id: string;
          summary?: string;
          location?: string;
          start?: { dateTime?: string; date?: string };
          end?: { dateTime?: string; date?: string };
        }>;
      };

      return (payload.items ?? []).map((event): CalendarItem => ({
        id: `${calendar.id}:${event.id}`,
        start: event.start?.dateTime ? formatTime(event.start.dateTime) : "All day",
        end: event.end?.dateTime ? formatTime(event.end.dateTime) : "",
        title: event.summary ?? "Untitled event",
        context: [calendar.summary, event.location].filter(Boolean).join(" · "),
        kind: classify(event.summary),
      }));
    })
  );

  const items = eventGroups.flat().sort((a, b) => a.start.localeCompare(b.start));
  return NextResponse.json({ connected: true, items });
}

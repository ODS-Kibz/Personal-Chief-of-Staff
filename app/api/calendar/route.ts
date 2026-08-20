import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { CalendarItem } from "@/lib/types";
import { dayBounds, normalizeGoogleEvents, sortCalendarItems } from "@/lib/calendar-core.mjs";

const GOOGLE = "https://www.googleapis.com/calendar/v3";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as typeof session & { accessToken?: string } | null)?.accessToken;

  if (!accessToken) {
    return NextResponse.json({ connected: false, items: [] }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  let timeMin: string;
  let timeMax: string;
  try {
    ({ timeMin, timeMax } = dayBounds(date));
  } catch {
    return NextResponse.json({ connected: true, items: [], error: "Invalid date. Use YYYY-MM-DD." }, { status: 400 });
  }
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

      return normalizeGoogleEvents(calendar, payload.items ?? []);
    })
  );

  const items = sortCalendarItems(eventGroups.flat());
  return NextResponse.json({ connected: true, items });
}

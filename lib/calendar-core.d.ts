import type { CalendarItem } from "./types";

export type GoogleCalendar = { id: string; summary?: string };
export type GoogleEvent = {
  id: string;
  status?: string;
  summary?: string;
  location?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
};

export function dayBounds(date: string): { timeMin: string; timeMax: string };
export function formatCalendarTime(value?: string): string;
export function classifyCalendarEvent(summary?: string): CalendarItem["kind"];
export function normalizeGoogleEvents(calendar: GoogleCalendar, events?: GoogleEvent[]): CalendarItem[];
export function sortCalendarItems(items: CalendarItem[]): CalendarItem[];

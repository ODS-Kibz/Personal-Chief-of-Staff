import type { CalendarItem } from "./types";

export function minutesBetween(start: string, end: string): number;

export function calculateCapacity(calendar: CalendarItem[], workdayMinutes?: number): {
  scheduledMinutes: number;
  focusBookedMinutes: number;
  meetingMinutes: number;
  nonFocusMinutes: number;
  bufferMinutes: number;
  focusMinutes: number;
  unallocatedFocusMinutes: number;
};

import type { CalendarItem, OpenLoop } from "./types";

export function minutesBetween(start: string, end: string) {
  if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) return 0;
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  return Math.max(0, endHour * 60 + endMinute - startHour * 60 - startMinute);
}

export function calculateCapacity(calendar: CalendarItem[]) {
  const scheduledMinutes = calendar.reduce((total, item) => total + minutesBetween(item.start, item.end), 0);
  const meetingMinutes = calendar.filter(item => item.kind === "meeting").reduce((total, item) => total + minutesBetween(item.start, item.end), 0);
  const bufferMinutes = Math.min(90, Math.max(45, Math.round(scheduledMinutes * 0.2)));
  const focusMinutes = Math.max(0, 8 * 60 - scheduledMinutes - bufferMinutes);
  return { scheduledMinutes, meetingMinutes, bufferMinutes, focusMinutes };
}

export function briefFingerprint(date: string, loops: OpenLoop[], calendar: CalendarItem[]) {
  const loopState = loops
    .filter(loop => loop.status !== "done" && (loop.priority === "Now" || loop.priority === "Today" || loop.status === "waiting"))
    .map(loop => [loop.id, loop.title, loop.status, loop.priority, loop.dueDate ?? loop.dueLabel ?? ""].join("|"))
    .sort();
  const calendarState = calendar.map(item => [item.id, item.start, item.end, item.title].join("|")).sort();
  return JSON.stringify([date, loopState, calendarState]);
}

export function formatHours(minutes: number) {
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
}

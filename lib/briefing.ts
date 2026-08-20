import { calculateCapacity, minutesBetween } from "./capacity-core.mjs";
import type { CalendarItem, OpenLoop } from "./types";

export { calculateCapacity, minutesBetween };

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

export function isOverdue(loop: OpenLoop, today: string) {
  return loop.status !== "done" && Boolean(loop.dueDate && loop.dueDate < today);
}

const priorityRank: Record<OpenLoop["priority"], number> = {
  Now: 0,
  Today: 1,
  Scheduled: 2,
  Waiting: 3,
  Dormant: 4,
};

export function prioritizeLoops(loops: OpenLoop[], today: string) {
  return loops
    .filter(loop => loop.status !== "done")
    .sort((a, b) => {
      const overdueDifference = Number(isOverdue(b, today)) - Number(isOverdue(a, today));
      if (overdueDifference) return overdueDifference;
      const priorityDifference = priorityRank[a.priority] - priorityRank[b.priority];
      if (priorityDifference) return priorityDifference;
      return (a.dueDate ?? "9999-12-31").localeCompare(b.dueDate ?? "9999-12-31");
    });
}

export function dayBounds(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Invalid calendar date");
  return { timeMin: `${date}T00:00:00+03:00`, timeMax: `${date}T23:59:59+03:00` };
}

export function formatCalendarTime(value) {
  if (!value) return "All day";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "All day";
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Nairobi",
  }).format(date);
}

export function classifyCalendarEvent(summary = "") {
  const text = summary.toLowerCase();
  if (text.includes("focus") || text.includes("deep work")) return "focus";
  if (text.includes("admin") || text.includes("follow-up")) return "admin";
  if (text.includes("date") || text.includes("family") || text.includes("personal")) return "personal";
  return "meeting";
}

export function normalizeGoogleEvents(calendar, events = []) {
  return events
    .filter(event => event.status !== "cancelled")
    .map(event => ({
      id: `${calendar.id}:${event.id}`,
      start: event.start?.dateTime ? formatCalendarTime(event.start.dateTime) : "All day",
      end: event.end?.dateTime ? formatCalendarTime(event.end.dateTime) : "",
      title: event.summary?.trim() || "Untitled event",
      context: [calendar.summary, event.location].filter(Boolean).join(" · "),
      kind: classifyCalendarEvent(event.summary),
    }));
}

export function sortCalendarItems(items) {
  return [...items].sort((a, b) => {
    if (a.start === "All day" && b.start !== "All day") return -1;
    if (b.start === "All day" && a.start !== "All day") return 1;
    return a.start.localeCompare(b.start) || a.title.localeCompare(b.title);
  });
}

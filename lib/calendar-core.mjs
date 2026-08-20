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
  const has = (...terms) => terms.some(term => text.includes(term));

  if (has("focus", "deep work", "writing block", "work block")) return "focus";
  if (has("admin", "follow-up", "follow up", "inbox", "expenses")) return "admin";
  if (has("date night", "family", "personal", "gym", "workout", "doctor", "dentist", "therapy", "birthday", "leave", "holiday", "lunch", "dinner")) return "personal";
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

export function dedupeCalendarItems(items) {
  const seen = new Set();
  return items.filter(item => {
    const key = [item.start, item.end, item.title.trim().toLowerCase()].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function sortCalendarItems(items) {
  return [...items].sort((a, b) => {
    if (a.start === "All day" && b.start !== "All day") return -1;
    if (b.start === "All day" && a.start !== "All day") return 1;
    return a.start.localeCompare(b.start) || a.title.localeCompare(b.title);
  });
}

export function prepareCalendarItems(items) {
  return sortCalendarItems(dedupeCalendarItems(items));
}

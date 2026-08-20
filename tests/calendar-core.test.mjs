import test from "node:test";
import assert from "node:assert/strict";
import { classifyCalendarEvent, dayBounds, normalizeGoogleEvents, sortCalendarItems } from "../lib/calendar-core.mjs";

test("dayBounds creates Nairobi day boundaries and rejects malformed dates", () => {
  assert.deepEqual(dayBounds("2026-08-20"), {
    timeMin: "2026-08-20T00:00:00+03:00",
    timeMax: "2026-08-20T23:59:59+03:00",
  });
  assert.throws(() => dayBounds("20-08-2026"), /Invalid calendar date/);
});

test("event classification recognizes focus, admin, and personal language", () => {
  assert.equal(classifyCalendarEvent("Deep work: proposal"), "focus");
  assert.equal(classifyCalendarEvent("Admin follow-ups"), "admin");
  assert.equal(classifyCalendarEvent("Family dinner"), "personal");
  assert.equal(classifyCalendarEvent("Client review"), "meeting");
});

test("Google fixtures normalize safely and remove cancelled events", () => {
  const items = normalizeGoogleEvents({ id: "primary", summary: "Work" }, [
    { id: "all-day", start: { date: "2026-08-20" } },
    { id: "meeting", summary: "Client review", location: "Online", start: { dateTime: "2026-08-20T10:00:00+03:00" }, end: { dateTime: "2026-08-20T11:00:00+03:00" } },
    { id: "cancelled", status: "cancelled", summary: "Old meeting" },
  ]);
  assert.equal(items.length, 2);
  assert.deepEqual(items[0], { id: "primary:all-day", start: "All day", end: "", title: "Untitled event", context: "Work", kind: "meeting" });
  assert.equal(items[1].context, "Work · Online");
});

test("all-day events sort before timed events", () => {
  const sorted = sortCalendarItems([
    { id: "2", start: "14:00", end: "", title: "Later", kind: "meeting" },
    { id: "1", start: "All day", end: "", title: "Deadline", kind: "admin" },
    { id: "0", start: "09:00", end: "", title: "Earlier", kind: "focus" },
  ]);
  assert.deepEqual(sorted.map(item => item.id), ["1", "0", "2"]);
});

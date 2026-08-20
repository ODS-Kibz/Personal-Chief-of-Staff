import assert from "node:assert/strict";
import test from "node:test";
import { calculateCapacity, minutesBetween } from "../lib/capacity-core.mjs";

test("minutesBetween returns clock-minute differences", () => {
  assert.equal(minutesBetween("09:00", "10:30"), 90);
  assert.equal(minutesBetween("bad", "10:30"), 0);
  assert.equal(minutesBetween("11:00", "10:30"), 0);
});

test("focus blocks protect capacity instead of consuming it", () => {
  const result = calculateCapacity([
    { start: "09:00", end: "11:00", kind: "focus" },
    { start: "11:00", end: "12:00", kind: "meeting" },
  ]);

  assert.equal(result.focusBookedMinutes, 120);
  assert.equal(result.meetingMinutes, 60);
  assert.equal(result.nonFocusMinutes, 60);
  assert.equal(result.bufferMinutes, 45);
  assert.equal(result.focusMinutes, 375);
  assert.equal(result.unallocatedFocusMinutes, 255);
});

test("non-focus commitments and buffer reduce usable focus capacity", () => {
  const result = calculateCapacity([
    { start: "09:00", end: "11:00", kind: "meeting" },
    { start: "12:00", end: "13:00", kind: "personal" },
    { start: "15:00", end: "16:00", kind: "admin" },
  ]);

  assert.equal(result.nonFocusMinutes, 240);
  assert.equal(result.bufferMinutes, 48);
  assert.equal(result.focusMinutes, 192);
});

test("capacity never becomes negative on overloaded days", () => {
  const result = calculateCapacity([
    { start: "08:00", end: "13:00", kind: "meeting" },
    { start: "13:00", end: "18:00", kind: "personal" },
  ]);

  assert.equal(result.focusMinutes, 0);
  assert.equal(result.unallocatedFocusMinutes, 0);
});

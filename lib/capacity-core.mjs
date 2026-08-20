export function minutesBetween(start, end) {
  if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) return 0;
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  return Math.max(0, endHour * 60 + endMinute - startHour * 60 - startMinute);
}

export function calculateCapacity(calendar, workdayMinutes = 8 * 60) {
  const durations = calendar.map(item => ({ ...item, minutes: minutesBetween(item.start, item.end) }));
  const scheduledMinutes = durations.reduce((total, item) => total + item.minutes, 0);
  const focusBookedMinutes = durations
    .filter(item => item.kind === "focus")
    .reduce((total, item) => total + item.minutes, 0);
  const meetingMinutes = durations
    .filter(item => item.kind === "meeting")
    .reduce((total, item) => total + item.minutes, 0);
  const nonFocusMinutes = durations
    .filter(item => item.kind !== "focus")
    .reduce((total, item) => total + item.minutes, 0);

  // Focus blocks are already protected capacity, so they should not reduce the
  // day's potential focused-work total. Meetings/admin/personal commitments do.
  // The buffer protects transitions, interruptions and recovery time.
  const bufferMinutes = Math.min(90, Math.max(45, Math.round(nonFocusMinutes * 0.2)));
  const focusMinutes = Math.max(0, workdayMinutes - nonFocusMinutes - bufferMinutes);
  const unallocatedFocusMinutes = Math.max(0, focusMinutes - focusBookedMinutes);

  return {
    scheduledMinutes,
    focusBookedMinutes,
    meetingMinutes,
    nonFocusMinutes,
    bufferMinutes,
    focusMinutes,
    unallocatedFocusMinutes,
  };
}

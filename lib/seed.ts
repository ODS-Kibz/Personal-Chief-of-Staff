import type { CalendarItem, OpenLoop } from "./types";

export const seedCalendar: CalendarItem[] = [
  { id: "c1", start: "09:00", end: "10:00", title: "Deep Work", context: "Focus time", kind: "focus" },
  { id: "c2", start: "10:00", end: "11:00", title: "Client Call", context: "Project review", kind: "meeting" },
  { id: "c3", start: "14:00", end: "15:00", title: "Internal Alignment", context: "Strategy", kind: "meeting" },
  { id: "c4", start: "16:00", end: "17:00", title: "Admin & Follow-ups", kind: "admin" }
];

export const seedLoops: OpenLoop[] = [
  {
    id: "l1",
    title: "Send assessments to Kelvin",
    type: "Promise",
    owner: "Kenneth",
    dueLabel: "Due today before 12:00",
    status: "open",
    priority: "Now",
    definitionOfDone: "Assessments sent",
    source: "Manual"
  },
  {
    id: "l2",
    title: "Review proposal section 2",
    type: "Task",
    owner: "Kenneth",
    dueLabel: "Due today",
    status: "open",
    priority: "Today",
    definitionOfDone: "Section reviewed and comments captured",
    source: "Manual"
  },
  {
    id: "l3",
    title: "Confirm scope with Sarah",
    type: "Follow-up",
    owner: "Kenneth",
    dueLabel: "Due today",
    status: "waiting",
    priority: "Waiting",
    definitionOfDone: "Scope confirmed",
    source: "Manual"
  }
];

export type LoopType = "Promise" | "Task" | "Dependency" | "Follow-up" | "Obligation";
export type LoopStatus = "open" | "waiting" | "done";
export type PriorityState = "Now" | "Today" | "Scheduled" | "Waiting" | "Dormant";

export type OpenLoop = {
  id: string;
  title: string;
  type: LoopType;
  owner: string;
  dueLabel?: string;
  dueDate?: string;
  status: LoopStatus;
  priority: PriorityState;
  definitionOfDone?: string;
  source: "Manual" | "Calendar";
};

export type CalendarItem = {
  id: string;
  start: string;
  end: string;
  title: string;
  context?: string;
  kind: "focus" | "meeting" | "admin" | "personal";
};

export type DayCloseout = {
  date: string;
  completedLoopIds: string[];
  carryForwardLoopIds: string[];
  note: string;
  closedAt: string;
};

export type BriefSnapshot = {
  date: string;
  fingerprint: string;
  acknowledgedAt: string;
};

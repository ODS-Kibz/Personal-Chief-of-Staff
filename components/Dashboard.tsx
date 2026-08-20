"use client";

import { useEffect, useMemo, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  Bell, CalendarDays, CheckCircle2, CircleDot, Clock3, Home, Inbox,
  LayoutDashboard, ListTodo, LogIn, LogOut, Mic, Pause, Play, Plus, RotateCcw,
  Send, Settings, Square, Sparkles, TimerReset
} from "lucide-react";
import { seedCalendar, seedLoops } from "@/lib/seed";
import { usePersistentState } from "@/lib/usePersistentState";
import type { CalendarItem, LoopType, OpenLoop } from "@/lib/types";

const nav = [
  ["Home", Home], ["Today", CalendarDays], ["Open Loops", ListTodo],
  ["Projects", LayoutDashboard], ["Calendar", CalendarDays],
  ["Work Sessions", Clock3], ["Review & Learn", RotateCcw], ["Library", Inbox]
] as const;

type SessionState = {
  activeTask: string | null;
  sessionStart: number | null;
  elapsed: number;
};

const emptySession: SessionState = { activeTask: null, sessionStart: null, elapsed: 0 };

function id() {
  return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 9);
}

function nairobiDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default function Dashboard() {
  const { data: session, status: authStatus } = useSession();
  const [loops, setLoops] = usePersistentState<OpenLoop[]>("cos.openLoops.v1", seedLoops);
  const [workSession, setWorkSession] = usePersistentState<SessionState>("cos.workSession.v1", emptySession);
  const [capture, setCapture] = useState("");
  const [loopType, setLoopType] = useState<LoopType>("Task");
  const [calendar, setCalendar] = useState<CalendarItem[]>(seedCalendar);
  const [calendarState, setCalendarState] = useState<"seed" | "loading" | "live" | "error">("seed");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!workSession.sessionStart) return;
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, [workSession.sessionStart]);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      if (authStatus === "unauthenticated") {
        setCalendar(seedCalendar);
        setCalendarState("seed");
      }
      return;
    }

    const controller = new AbortController();
    setCalendarState("loading");
    fetch(`/api/calendar?date=${nairobiDate()}`, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("Calendar request failed");
        return response.json() as Promise<{ items: CalendarItem[] }>;
      })
      .then(data => {
        setCalendar(data.items);
        setCalendarState("live");
      })
      .catch(error => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setCalendarState("error");
      });

    return () => controller.abort();
  }, [authStatus]);

  const openLoops = loops.filter(loop => loop.status !== "done");
  const mustMove = openLoops.filter(loop => loop.priority === "Now" || loop.priority === "Today");
  const waiting = openLoops.filter(loop => loop.status === "waiting").length;
  const meetingCount = calendar.filter(item => item.kind === "meeting").length;
  const totalElapsed = workSession.elapsed + (workSession.sessionStart ? now - workSession.sessionStart : 0);

  const summary = useMemo(
    () => `${mustMove.length} must-move item${mustMove.length === 1 ? "" : "s"}. ${meetingCount} meeting${meetingCount === 1 ? "" : "s"}. ~4.5 focused work hours available.`,
    [meetingCount, mustMove.length]
  );

  function addLoop() {
    const title = capture.trim();
    if (!title) return;
    setLoops(previous => [{
      id: id(),
      title,
      type: loopType,
      owner: "Kenneth",
      status: "open",
      priority: "Today",
      definitionOfDone: "Confirm when complete",
      source: "Manual",
    }, ...previous]);
    setCapture("");
  }

  function toggleDone(loopId: string) {
    setLoops(previous => previous.map(loop => loop.id === loopId
      ? { ...loop, status: loop.status === "done" ? "open" : "done" }
      : loop
    ));
  }

  function startSession(title: string) {
    setNow(Date.now());
    setWorkSession({ activeTask: title, sessionStart: Date.now(), elapsed: 0 });
  }

  function pauseSession() {
    setWorkSession(previous => {
      if (!previous.sessionStart) return previous;
      return {
        ...previous,
        elapsed: previous.elapsed + (Date.now() - previous.sessionStart),
        sessionStart: null,
      };
    });
  }

  function resumeSession() {
    setNow(Date.now());
    setWorkSession(previous => previous.activeTask && !previous.sessionStart
      ? { ...previous, sessionStart: Date.now() }
      : previous
    );
  }

  function stopSession() {
    setWorkSession(previous => {
      const elapsed = previous.elapsed + (previous.sessionStart ? Date.now() - previous.sessionStart : 0);
      console.info("Work session completed", { task: previous.activeTask, elapsedMs: elapsed });
      return emptySession;
    });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brandmark"><Sparkles size={18}/></div><div><b>Chief of Staff</b><span>for Kenneth</span></div></div>
        <nav>{nav.map(([label, Icon], index) => <button key={label} className={index === 0 ? "nav-item active" : "nav-item"}><Icon size={18}/><span>{label}</span></button>)}</nav>
        <div className="sidebar-bottom">
          <button className="nav-item"><Settings size={18}/><span>Settings</span></button>
          <div className="profile"><div className="avatar">K</div><span>{session?.user?.name ?? "Kenneth"}</span></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><h1>Good morning, Kenneth.</h1><p>Build 1 · Continuity Core</p></div>
          <div className="top-actions">
            <button className="ghost"><Bell size={18}/></button>
            {authStatus === "authenticated"
              ? <button className="primary" onClick={() => signOut()}><LogOut size={16}/> Disconnect Google</button>
              : <button className="primary" onClick={() => signIn("google")}><LogIn size={16}/> Connect Google Calendar</button>}
          </div>
        </header>

        <section className="hero-note">
          <Sparkles size={22}/><div><b>Here’s what matters today.</b><span>{summary}</span></div>
          <button>View full brief</button>
        </section>

        <div className="grid">
          <section className="card schedule-card">
            <div className="card-head"><div><CalendarDays size={18}/><b>Today’s Schedule</b></div><span className={calendarState === "live" ? "live" : "quiet"}>{calendarState === "live" ? "Google Calendar" : calendarState === "loading" ? "Loading…" : calendarState === "error" ? "Calendar error" : "Preview data"}</span></div>
            <div className="schedule-list">
              {calendar.length === 0 ? <p className="empty-copy">No calendar events found for today.</p> : calendar.map(item => <div className="schedule-row" key={item.id}><div className="time">{item.start}{item.end && <span>– {item.end}</span>}</div><div className={`event ${item.kind}`}><b>{item.title}</b>{item.context && <span>{item.context}</span>}</div></div>)}
            </div>
          </section>

          <section className="card must-card">
            <div className="card-head"><div><CircleDot size={18}/><b>Must Move Today</b><span className="badge">{mustMove.length}</span></div></div>
            <div className="loop-list">{mustMove.map(loop => <div className="loop-row" key={loop.id}>
              <button className="check" onClick={() => toggleDone(loop.id)} aria-label={`Mark ${loop.title} done`}><span/></button>
              <div className="loop-copy"><b>{loop.title}</b><span>{loop.type}{loop.dueLabel ? ` · ${loop.dueLabel}` : ""}</span></div>
              <button className="start-small" onClick={() => startSession(loop.title)}><Play size={13}/> Start</button>
            </div>)}</div>
          </section>

          <section className="card side-card">
            <div className="card-head"><div><ListTodo size={18}/><b>Open Loops</b></div></div>
            <div className="metric"><span>Must move</span><b>{mustMove.length}</b></div>
            <div className="metric"><span>Waiting on others</span><b>{waiting}</b></div>
            <div className="metric"><span>Total open</span><b>{openLoops.length}</b></div>
            <div className="metric muted"><span>Completed</span><b>{loops.length - openLoops.length}</b></div>
          </section>

          <section className="card recommendations">
            <div className="card-head"><div><Sparkles size={18}/><b>What I Recommend</b></div></div>
            <div className="recommend"><div className="rec-icon"><Play size={15}/></div><div><b>Clear the highest-consequence item first.</b><span>{mustMove[0]?.title ?? "No must-move item right now."}</span></div></div>
            <div className="recommend"><div className="rec-icon"><CalendarDays size={15}/></div><div><b>Prepare before the next meeting.</b><span>Protect context-recovery time instead of relying on memory.</span></div></div>
            <div className="recommend"><div className="rec-icon"><TimerReset size={15}/></div><div><b>Keep buffer available.</b><span>Open calendar time is not the same as usable work capacity.</span></div></div>
          </section>

          <section className="card capacity-card">
            <div className="card-head"><div><Clock3 size={18}/><b>Capacity Today</b></div></div>
            <div className="capacity"><div className="ring"><div><strong>~4.5h</strong><span>usable focus</span></div></div><div className="capacity-list"><span>Meetings <b>{meetingCount}.0h</b></span><span>Focus plan <b>4.5h</b></span><span>Buffer <b>1.5h</b></span></div></div>
            <p className="status-line"><CheckCircle2 size={15}/> Plan includes buffer for interruptions and transitions.</p>
          </section>

          <section className="card capture-card">
            <div className="card-head"><div><Plus size={18}/><b>Quick Capture</b></div></div>
            <div className="capture-row">
              <select value={loopType} onChange={event => setLoopType(event.target.value as LoopType)}><option>Task</option><option>Promise</option><option>Dependency</option><option>Follow-up</option><option>Obligation</option></select>
              <input value={capture} onChange={event => setCapture(event.target.value)} onKeyDown={event => { if (event.key === "Enter") addLoop(); }} placeholder="Tell me what needs to be remembered…"/>
              <button className="icon-btn" title="Voice capture is the next input slice"><Mic size={17}/></button>
              <button className="send-btn" onClick={addLoop}><Send size={17}/></button>
            </div>
            <p>Training mode: explicitly identify the type; the CoS will learn recurring patterns later. Open loops now survive refreshes on this browser.</p>
          </section>

          <section className="card session-card">
            <div className="card-head"><div><Clock3 size={18}/><b>Active Work Session</b></div><span className={workSession.activeTask ? "live" : "quiet"}>{workSession.activeTask ? "Tracking" : "Not tracking"}</span></div>
            {!workSession.activeTask
              ? <div className="session-empty"><p>Start from a Must Move item or enter a session manually.</p><button className="secondary" onClick={() => startSession("Manual work session")}><Play size={15}/> Start work session</button></div>
              : <div className="session-live"><b>{workSession.activeTask}</b><span>{workSession.sessionStart ? "Running" : "Paused"} · {Math.floor(totalElapsed / 60000)} min logged</span><div className="session-actions">{workSession.sessionStart ? <button onClick={pauseSession}><Pause size={15}/> Pause</button> : <button onClick={resumeSession}><Play size={15}/> Resume</button>}<button onClick={stopSession}><Square size={15}/> Finish</button></div></div>}
          </section>
        </div>
      </main>
    </div>
  );
}

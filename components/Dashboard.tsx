"use client";

import { useMemo, useState } from "react";
import {
  Bell, CalendarDays, CheckCircle2, CircleDot, Clock3, Home, Inbox,
  LayoutDashboard, ListTodo, Mic, Pause, Play, Plus, RotateCcw,
  Send, Settings, Square, Sparkles, TimerReset
} from "lucide-react";
import { seedCalendar, seedLoops } from "@/lib/seed";
import type { LoopType, OpenLoop } from "@/lib/types";

const nav = [
  ["Home", Home], ["Today", CalendarDays], ["Open Loops", ListTodo],
  ["Projects", LayoutDashboard], ["Calendar", CalendarDays],
  ["Work Sessions", Clock3], ["Review & Learn", RotateCcw], ["Library", Inbox]
] as const;

function id() { return Math.random().toString(36).slice(2, 9); }

export default function Dashboard() {
  const [loops, setLoops] = useState<OpenLoop[]>(seedLoops);
  const [capture, setCapture] = useState("");
  const [loopType, setLoopType] = useState<LoopType>("Task");
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const openLoops = loops.filter(l => l.status !== "done");
  const mustMove = openLoops.filter(l => l.priority === "Now" || l.priority === "Today");
  const waiting = openLoops.filter(l => l.status === "waiting").length;

  const summary = useMemo(() => {
    return `${mustMove.length} must-move item${mustMove.length === 1 ? "" : "s"}. ${seedCalendar.filter(c => c.kind === "meeting").length} meetings. ~4.5 focused work hours available.`;
  }, [mustMove.length]);

  function addLoop() {
    const title = capture.trim();
    if (!title) return;
    setLoops(prev => [{
      id: id(), title, type: loopType, owner: "Kenneth", status: "open",
      priority: "Today", definitionOfDone: "Confirm when complete", source: "Manual"
    }, ...prev]);
    setCapture("");
  }

  function toggleDone(loopId: string) {
    setLoops(prev => prev.map(l => l.id === loopId ? { ...l, status: l.status === "done" ? "open" : "done" } : l));
  }

  function startSession(title: string) {
    setActiveTask(title);
    setSessionStart(Date.now());
    setElapsed(0);
  }

  function pauseSession() {
    if (!sessionStart) return;
    setElapsed(prev => prev + (Date.now() - sessionStart));
    setSessionStart(null);
  }

  function resumeSession() { if (activeTask && !sessionStart) setSessionStart(Date.now()); }
  function stopSession() { pauseSession(); setActiveTask(null); setSessionStart(null); }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brandmark"><Sparkles size={18}/></div><div><b>Chief of Staff</b><span>for Kenneth</span></div></div>
        <nav>{nav.map(([label, Icon], i) => <button key={label} className={i===0?"nav-item active":"nav-item"}><Icon size={18}/><span>{label}</span></button>)}</nav>
        <div className="sidebar-bottom">
          <button className="nav-item"><Settings size={18}/><span>Settings</span></button>
          <div className="profile"><div className="avatar">K</div><span>Kenneth</span></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><h1>Good morning, Kenneth.</h1><p>Build 1 · Continuity Core</p></div>
          <div className="top-actions"><button className="ghost"><Bell size={18}/></button><button className="primary"><Sparkles size={16}/> Ask or update anything</button></div>
        </header>

        <section className="hero-note">
          <Sparkles size={22}/><div><b>Here’s what matters today.</b><span>{summary}</span></div>
          <button>View full brief</button>
        </section>

        <div className="grid">
          <section className="card schedule-card">
            <div className="card-head"><div><CalendarDays size={18}/><b>Today’s Schedule</b></div><button>View calendar</button></div>
            <div className="schedule-list">{seedCalendar.map(item => <div className="schedule-row" key={item.id}><div className="time">{item.start}<span>– {item.end}</span></div><div className={`event ${item.kind}`}><b>{item.title}</b>{item.context && <span>{item.context}</span>}</div></div>)}</div>
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
            <div className="metric muted"><span>Completed today</span><b>{loops.length-openLoops.length}</b></div>
          </section>

          <section className="card recommendations">
            <div className="card-head"><div><Sparkles size={18}/><b>What I Recommend</b></div></div>
            <div className="recommend"><div className="rec-icon"><Play size={15}/></div><div><b>Clear the highest-consequence item first.</b><span>{mustMove[0]?.title ?? "No must-move item right now."}</span></div></div>
            <div className="recommend"><div className="rec-icon"><CalendarDays size={15}/></div><div><b>Prepare before the next meeting.</b><span>Protect context-recovery time instead of relying on memory.</span></div></div>
            <div className="recommend"><div className="rec-icon"><TimerReset size={15}/></div><div><b>Keep buffer available.</b><span>Open calendar time is not the same as usable work capacity.</span></div></div>
          </section>

          <section className="card capacity-card">
            <div className="card-head"><div><Clock3 size={18}/><b>Capacity Today</b></div></div>
            <div className="capacity"><div className="ring"><div><strong>~4.5h</strong><span>usable focus</span></div></div><div className="capacity-list"><span>Meetings <b>2.0h</b></span><span>Focus plan <b>4.5h</b></span><span>Buffer <b>1.5h</b></span></div></div>
            <p className="status-line"><CheckCircle2 size={15}/> Plan includes buffer for interruptions and transitions.</p>
          </section>

          <section className="card capture-card">
            <div className="card-head"><div><Plus size={18}/><b>Quick Capture</b></div></div>
            <div className="capture-row">
              <select value={loopType} onChange={e => setLoopType(e.target.value as LoopType)}><option>Task</option><option>Promise</option><option>Dependency</option><option>Follow-up</option><option>Obligation</option></select>
              <input value={capture} onChange={e=>setCapture(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addLoop()}} placeholder="Tell me what needs to be remembered…"/>
              <button className="icon-btn" title="Voice capture (UI only in this slice)"><Mic size={17}/></button>
              <button className="send-btn" onClick={addLoop}><Send size={17}/></button>
            </div>
            <p>V0.1 training mode: you explicitly identify the type; the CoS learns patterns later.</p>
          </section>

          <section className="card session-card">
            <div className="card-head"><div><Clock3 size={18}/><b>Active Work Session</b></div><span className={activeTask?"live":"quiet"}>{activeTask?"Tracking":"Not tracking"}</span></div>
            {!activeTask ? <div className="session-empty"><p>Start from a Must Move item or enter a session manually.</p><button className="secondary" onClick={()=>startSession("Manual work session")}><Play size={15}/> Start work session</button></div> : <div className="session-live"><b>{activeTask}</b><span>{sessionStart ? "Running" : "Paused"} · {Math.round(elapsed/60000)} min logged</span><div className="session-actions">{sessionStart?<button onClick={pauseSession}><Pause size={15}/> Pause</button>:<button onClick={resumeSession}><Play size={15}/> Resume</button>}<button onClick={stopSession}><Square size={15}/> Finish</button></div></div>}
          </section>
        </div>
      </main>
    </div>
  );
}

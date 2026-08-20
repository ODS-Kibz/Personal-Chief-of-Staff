# Chief of Staff — Build 1 (Continuity Core)

This branch contains the first working implementation of the Personal Chief of Staff continuity loop.

## Working now

- Dashboard/app shell
- Must Move Today
- Master Open-Loop Register
- Open-loop persistence in browser storage
- Quick capture with explicit loop type
- Mark open loops complete
- Work-session start / pause / resume / finish
- Active work-session persistence across refreshes
- Conservative capacity/buffer view
- Google sign-in scaffold
- Read-only Google Calendar endpoint
- Automatic discovery of visible Google calendars
- Today view switches from preview data to real Calendar events after Google is connected
- Automatic Google access-token refresh for long-running sessions
- Browser voice dictation wired into Quick Capture (where Web Speech is supported)
- Morning brief with priorities, schedule pressure, and conservative capacity
- Material-change detection and rebrief prompt after the brief is acknowledged
- Persistent end-of-day closeout and next-day handoff note

## Google Calendar setup required

The application code is ready, but Google OAuth credentials must be supplied locally before the live connection can work.

Copy `.env.example` to `.env.local` and provide:

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

The Google OAuth client must allow this callback URL during local development:

```text
http://localhost:3000/api/auth/callback/google
```

The app requests only `calendar.readonly` in this build.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Still intentionally deferred

- Server/database-backed open-loop persistence across devices
- Cross-browser/server voice transcription (Build 1 uses the browser speech API)
- AI reasoning/orchestration
- Gmail intake
- Google Drive intelligence
- Meeting transcript processing
- Finance layer

## Build philosophy

Build 1 proves the daily continuity loop before adding more information sources or autonomy. The system should reduce manual tracking rather than become another tracker Kenneth has to maintain.

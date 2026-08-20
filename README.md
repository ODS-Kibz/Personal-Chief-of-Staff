# Chief of Staff — Build 1 (Continuity Core)

This is the first tangible implementation slice of the Personal Chief of Staff.

## Included now

- Dashboard/app shell based on the agreed starting UI direction
- Today schedule (seed data in this slice)
- Must Move Today
- Master Open-Loop Register in local client state
- Quick capture with explicit loop type (Task / Promise / Dependency / Follow-up / Obligation)
- Mark open loops complete
- Capacity card with conservative buffer assumption
- Chief of Staff recommendations panel
- Work-session start / pause / resume / finish UI
- Responsive layout

## Not connected yet

- Google Calendar API
- Persistent database
- Voice transcription (button is present but intentionally not wired in this first slice)
- AI reasoning/orchestration
- Gmail
- Google Drive intelligence

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Next implementation slice

Connect Google Calendar read-only and replace seeded schedule data with real calendar events, then add persistence for the Master Open-Loop Register.

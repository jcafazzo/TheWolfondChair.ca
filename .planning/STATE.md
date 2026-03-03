# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-02)

**Core value:** The presentation must work smoothly on mobile devices without breaking the existing desktop experience
**Current focus:** Phase 1 — Mobile Fixes

## Current Position

Phase: 1 of 2 (Mobile Fixes)
Plan: 2 of TBD in current phase (01-02 complete)
Status: In progress
Last activity: 2026-03-03 — Plan 01-02 complete (JS touch handler + Page Visibility API fixes)

Progress: [██░░░░░░░░] 20%

## Performance Metrics

**Velocity:**
- Total plans completed: 2
- Average duration: ~3.5 min
- Total execution time: ~7 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-mobile-fixes | 2 | ~7 min | ~3.5 min |

**Recent Trend:**
- Last 5 plans: 01-01 (2 min), 01-02 (5 min)
- Trend: -

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Fix-first approach — CSS/JS fixes in Phase 1, Playwright tests in Phase 2; tests written after fixes are confirmed working
- [Phase 1]: Use `100svh` with `100vh` fallback (not `100dvh`) for layout stability — dvh causes visible resize jitter on address bar show/hide; must be decided explicitly before writing CSS
- [Phase 1]: Use `touch-action: pan-y` (CSS-level) as primary swipe discrimination mechanism; avoid `preventDefault` on passive listeners
- [Phase 1]: On `touchstart`, record `e.target.closest('.scroll-content')` and use stored reference in `touchend` — fixes scroll area detection bug
- [Phase 1, Plan 02]: Resume auto-advance from `secondsLeft` (remaining time), not `AUTO_SECONDS` — user explicitly decided this; avoids full-reset on tab return
- [Phase 1, Plan 02]: `autoTimerPaused` flag distinguishes system-pause (tab hidden) from other stop reasons — prevents accidental resume after explicit user stop

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 1]: Manual iOS device verification required after viewport height changes — Playwright WebKit does not replicate real iOS Safari scroll physics
- [Phase 1]: `overscroll-behavior-x` on iOS Safari < 16 may need a JS `touchmove preventDefault` fallback — verify caniuse compat before implementing

## Session Continuity

Last session: 2026-03-03
Stopped at: Completed 01-02-PLAN.md (JS touch handler fix + Page Visibility API timer pause/resume)
Resume file: None

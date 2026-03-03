# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-02)

**Core value:** The presentation must work smoothly on mobile devices without breaking the existing desktop experience
**Current focus:** Phase 2 — Playwright Tests

## Current Position

Phase: 2 of 2 (Playwright Tests)
Plan: 1 of 5 in current phase (02-01 complete — Playwright project initialized)
Status: Phase 2 in progress
Last activity: 2026-03-02 — Plan 02-01 complete (Playwright npm init, config, browser binaries)

Progress: [████░░░░░░] 50%

## Performance Metrics

**Velocity:**
- Total plans completed: 4
- Average duration: ~7 min
- Total execution time: ~24 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-mobile-fixes | 3 | ~22 min | ~7 min |
| 02-playwright-tests | 1 | ~2 min | ~2 min |

**Recent Trend:**
- Last 5 plans: 01-01 (2 min), 01-02 (5 min), 01-03 (15 min), 02-01 (2 min)
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
- [Phase 1, Plan 03]: `align-items: center` on `.slide` causes overflow content to be hidden behind fixed topbar — use `flex-start`; inner variants (deep-slide, grid-slide, letter-slide) handle their own alignment
- [Phase 2, Plan 01]: python3 http.server as static server (no npm dev server); workers=1; retries=0; device projects use Playwright registry objects without viewport override

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 1]: Manual iOS device verification required after viewport height changes — Playwright WebKit does not replicate real iOS Safari scroll physics
- [Phase 1]: `overscroll-behavior-x` on iOS Safari < 16 may need a JS `touchmove preventDefault` fallback — verify caniuse compat before implementing

## Session Continuity

Last session: 2026-03-02
Stopped at: Completed 02-01-PLAN.md (Playwright project initialization — package.json, playwright.config.ts, browser binaries)
Resume file: None

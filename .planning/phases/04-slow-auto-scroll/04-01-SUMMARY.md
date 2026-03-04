---
phase: 04-slow-auto-scroll
plan: 01
subsystem: ui
tags: [auto-scroll, ken-burns, kiosk, requestAnimationFrame, teleprompter]

# Dependency graph
requires:
  - phase: 03-kiosk-mode-core
    provides: "Kiosk mode toggle (K key), data-kiosk attribute, auto-advance timer, isKioskMode state"
provides:
  - "Auto-scroll engine for kiosk mode (teleprompter-style top-to-bottom scrolling)"
  - "Ken Burns zoom effect for short slides (100% to 105% scale)"
  - "Per-slide duration support via data-duration attribute"
  - "Arrow key navigation in kiosk mode"
  - "Topbar title visibility fix in kiosk mode"
  - "E2E Playwright tests for all auto-scroll behaviors"
affects: [05-portrait-display]

# Tech tracking
tech-stack:
  added: []
  patterns: [requestAnimationFrame scroll loop, Ken Burns CSS transform animation, per-slide data-duration config]

key-files:
  created:
    - tests/auto-scroll.spec.ts
  modified:
    - wolfond-report-2024-2026.html
    - tests/kiosk-mode.spec.ts

key-decisions:
  - "Ken Burns zoom set to 105% (0.05 scale factor) for noticeable visual effect, up from initial 102%"
  - "Arrow keys allowed in kiosk mode for manual slide navigation during TV presentations"
  - "5-second pause at top of each slide before scrolling/zooming begins"
  - "2-second buffer at bottom of tall slides before auto-advance for reading time"
  - "Linear scroll interpolation (teleprompter-style) rather than eased"

patterns-established:
  - "Auto-scroll rAF loop: startAutoScroll/stopAutoScroll lifecycle tied to kiosk mode"
  - "Ken Burns via CSS transform scale on short slides, reset via stopKenBurns"
  - "getSlideDuration() reads data-duration attribute with 120s fallback"

requirements-completed: [SCROLL-01, SCROLL-02, SCROLL-03, SCROLL-04]

# Metrics
duration: 15min
completed: 2026-03-04
---

# Phase 04 Plan 01: Slow Auto-Scroll Summary

**Teleprompter-style auto-scroll engine with 105% Ken Burns zoom for short slides, per-slide duration support, topbar title fix, and arrow key navigation in kiosk mode**

## Performance

- **Duration:** 15 min (fix phase after human-verify checkpoint)
- **Started:** 2026-03-04T21:43:29Z
- **Completed:** 2026-03-04T21:59:13Z
- **Tasks:** 3 (2 auto + 1 human-verify checkpoint with fixes)
- **Files modified:** 4

## Accomplishments
- Auto-scroll engine scrolls tall slides top-to-bottom at teleprompter pace during kiosk mode
- Short slides receive Ken Burns zoom effect (100% to 105% scale) for visual interest
- Per-slide duration support via data-duration attribute with 120s default
- Topbar "The Wolfond Chair" title remains visible during kiosk mode
- Arrow keys navigate slides during kiosk mode for manual control on TVs
- Scroll position resets to top on slide advance, Ken Burns zoom resets on new slide
- 10 new E2E tests covering all SCROLL requirements
- Existing kiosk-mode tests updated to reflect new arrow key behavior

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement auto-scroll engine, Ken Burns effect, per-slide duration, and topbar CSS fix** - `e1d7e30` (feat)
2. **Task 2: Write E2E Playwright tests for auto-scroll behavior and update kiosk topbar test** - `3dcdefa` (test)
3. **Task 3 fixes: Increase Ken Burns zoom to 105% and allow arrow keys in kiosk mode** - `5355c41` (fix)

## Files Created/Modified
- `wolfond-report-2024-2026.html` - Auto-scroll engine, Ken Burns effect, per-slide duration, topbar CSS fix, arrow key kiosk support
- `tests/auto-scroll.spec.ts` - 10 E2E tests for auto-scroll and Ken Burns behavior
- `tests/kiosk-mode.spec.ts` - Updated topbar assertion (visible in kiosk), arrow key tests (now navigate in kiosk)
- `package.json` / `package-lock.json` - Playwright dependency update

## Decisions Made
- Ken Burns zoom increased from 102% to 105% after user feedback (102% was imperceptible)
- Arrow keys allowed in kiosk mode after user feedback (needed for TV presentations)
- Topbar title kept visible in kiosk mode per CONTEXT.md decision
- Linear scroll interpolation chosen for teleprompter readability
- 5-second initial pause before scrolling/zooming gives viewers orientation time
- 2-second buffer at bottom of tall slides before auto-advance for reading time

## Deviations from Plan

### Post-Checkpoint Fixes (User Feedback)

**1. [Rule 1 - Bug] Ken Burns zoom too subtle**
- **Found during:** Task 3 human-verify checkpoint
- **Issue:** Ken Burns zoom from 100% to 102% was imperceptible to the user
- **Fix:** Increased scale factor from 0.02 to 0.05 (now zooms to 105%)
- **Files modified:** wolfond-report-2024-2026.html (line 1379)
- **Verification:** All auto-scroll tests pass, visual confirmation requested
- **Committed in:** 5355c41

**2. [Rule 1 - Bug] Arrow keys suppressed in kiosk mode**
- **Found during:** Task 3 human-verify checkpoint
- **Issue:** `if (isKioskMode) return;` blocked all keyboard input except K, but user needs arrows for TV presenting
- **Fix:** Moved ArrowRight/ArrowLeft handling before the kiosk suppression guard
- **Files modified:** wolfond-report-2024-2026.html (lines 1514-1516), tests/kiosk-mode.spec.ts
- **Verification:** Updated kiosk-mode tests confirm arrows work in kiosk; 21/21 tests pass
- **Committed in:** 5355c41

---

**Total deviations:** 2 post-checkpoint fixes based on user feedback
**Impact on plan:** Both fixes improve usability. Arrow key change is a behavior change from the original plan's "suppress all keys in kiosk" but aligns with the user's presentation needs.

## Issues Encountered
- Pre-existing test failure in `tests/desktop-regression.spec.ts:136` ("slide counter color adapts to nav theme") — not caused by auto-scroll changes. Documented in `deferred-items.md`.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Auto-scroll engine complete, kiosk mode fully featured
- Ready for Phase 05: Portrait Display
- No blockers or concerns

---
*Phase: 04-slow-auto-scroll*
*Completed: 2026-03-04*

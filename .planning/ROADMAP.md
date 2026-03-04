# Roadmap: Wolfond Chair — v1.1 Kiosk Mode

## Overview

Three phases derived from the v1.1 requirement categories. Kiosk core must land first — it establishes the state machine that auto-scroll and portrait mode build on. Auto-scroll runs inside kiosk mode, so it is Phase 4. Portrait display is additive and depends only on kiosk existing (PORT-04 requires both), making it Phase 5.

v1.0 delivered two phases (Mobile Fixes, Playwright Tests). Numbering continues from 3.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Mobile Fixes** - Apply all CSS and JS corrections that make mobile navigation, scrolling, and touch interaction work correctly (v1.0 complete)
- [x] **Phase 2: Playwright Tests** - Build the E2E test suite that asserts the fixed behavior and guards against desktop regression (v1.0 complete)
- [ ] **Phase 3: Kiosk Mode Core** - Toggle kiosk mode on/off via keystroke, loop the presentation continuously, and hide all navigation chrome while active
- [ ] **Phase 4: Slow Auto-Scroll** - Auto-scroll each slide from top to bottom over its 2-minute interval, adapting to content height and resetting on slide advance
- [ ] **Phase 5: Portrait Display** - Rotate and scale the presentation 90° for portrait-oriented screens via keystroke toggle, working in combination with kiosk mode

## Phase Details

### Phase 1: Mobile Fixes
**Goal**: Users can navigate the slide presentation on mobile without scroll conflicts, layout shifts, or broken touch interactions
**Depends on**: Nothing (first phase)
**Requirements**: MCSS-01, MCSS-02, MCSS-03, MCSS-04, MJS-01, MJS-02, MJS-03
**Success Criteria** (what must be TRUE):
  1. On iPhone and Android, each slide fills the visible viewport height without shifting when the address bar shows or hides
  2. Scrolling through content-heavy slides (publications, team) does not accidentally advance to the next slide
  3. Tapping nav dots and arrows registers immediately with no 300ms delay, and touch targets are large enough to hit accurately
  4. Swiping horizontally on any slide changes the slide; swiping vertically on a scrollable slide scrolls the content
  5. The auto-advance timer pauses when the user switches to another tab and resumes when they return
**Plans**: 3 plans (v1.0 complete)

### Phase 2: Playwright Tests
**Goal**: Automated E2E tests cover all navigation patterns and mobile viewport behavior, and confirm the desktop experience is unchanged
**Depends on**: Phase 1
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04, TEST-05
**Success Criteria** (what must be TRUE):
  1. Running `npx playwright test` from the project root executes all tests against a locally-served copy of the HTML file with no manual setup
  2. Keyboard, dot, and arrow navigation tests pass on desktop Chromium, confirming all 17 slides are reachable
  3. Mobile viewport tests on iPhone 14 and Pixel 5 emulation pass, confirming layout fills the viewport correctly on both devices
  4. Video modal tests confirm the modal opens, closes via button, and closes via Escape key
  5. Desktop regression tests pass, confirming all navigation and layout still work after the Phase 1 mobile changes
**Plans**: 3 plans (v1.0 complete)

### Phase 3: Kiosk Mode Core
**Goal**: Users can enter and exit a fully autonomous presentation loop via keystroke, with all navigation chrome hidden during playback
**Depends on**: Phase 2
**Requirements**: KIOSK-01, KIOSK-02, KIOSK-03, KIOSK-04
**Success Criteria** (what must be TRUE):
  1. Pressing the designated key while on any slide enters kiosk mode — auto-advance starts, dots, arrows, counter, and progress bar disappear
  2. In kiosk mode, after slide 17 the presentation automatically advances to slide 1 and continues looping without stopping
  3. Pressing the designated key while in kiosk mode exits it — navigation chrome reappears and auto-advance stops
  4. Normal keyboard, dot, and arrow navigation works exactly as before when kiosk mode is off
**Plans**: TBD

### Phase 4: Slow Auto-Scroll
**Goal**: Each slide's content scrolls smoothly from top to bottom during its 2-minute kiosk interval, adapting to actual content height
**Depends on**: Phase 3
**Requirements**: SCROLL-01, SCROLL-02, SCROLL-03, SCROLL-04
**Success Criteria** (what must be TRUE):
  1. A slide with tall scrollable content visibly scrolls from the top to the bottom over the full 2-minute display interval
  2. A slide with content shorter than the viewport does not scroll at all — no visible movement occurs
  3. When kiosk mode advances to the next slide, the scroll position of the previous slide resets to the top before that slide could be seen again
  4. Entering and exiting kiosk mode correctly starts and stops the auto-scroll — no runaway scroll timer persists after exiting
**Plans**: TBD

### Phase 5: Portrait Display
**Goal**: Users can force a portrait orientation on any screen via keystroke, rotating and scaling the presentation to fill a physically rotated monitor
**Depends on**: Phase 3
**Requirements**: PORT-01, PORT-02, PORT-03, PORT-04
**Success Criteria** (what must be TRUE):
  1. Pressing the designated key on a landscape screen rotates all presentation content 90° so it reads correctly on a portrait-mounted monitor
  2. Pressing the key again on a portrait-transformed screen returns the layout to its normal landscape orientation
  3. In portrait mode, content fills the rotated viewport with no letterboxing or overflow clipping visible
  4. Running kiosk mode while portrait mode is active produces a continuously looping, portrait-oriented presentation with navigation chrome hidden
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Mobile Fixes | 3/3 | Complete | 2026-03-02 |
| 2. Playwright Tests | 3/3 | Complete | 2026-03-03 |
| 3. Kiosk Mode Core | 0/? | Not started | - |
| 4. Slow Auto-Scroll | 0/? | Not started | - |
| 5. Portrait Display | 0/? | Not started | - |

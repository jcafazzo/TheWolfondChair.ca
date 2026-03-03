# Roadmap: Wolfond Chair — Mobile Optimization

## Overview

Two phases derived directly from the work: first fix the broken mobile behavior (CSS and JS), then lock in that fixed behavior with a Playwright E2E test suite. Tests cannot be written before fixes because they would assert against broken state and produce a permanently-red baseline with no progress signal. Desktop regression is validated as part of Phase 2 — it cannot run before the mobile changes it validates exist.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Mobile Fixes** - Apply all CSS and JS corrections that make mobile navigation, scrolling, and touch interaction work correctly
- [ ] **Phase 2: Playwright Tests** - Build the E2E test suite that asserts the fixed behavior and guards against desktop regression

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
**Plans**: TBD

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
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Mobile Fixes | 0/TBD | Not started | - |
| 2. Playwright Tests | 0/TBD | Not started | - |

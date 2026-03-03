# Wolfond Chair Digital Health Report — Mobile Optimization

## What This Is

A slide-based digital report for the Wolfond Chair in Digital Health (2024-2026), deployed as a static site on GitHub Pages. The site presents research highlights, team members, publications, and video conversations in a 17-slide interactive presentation. This milestone focuses on fixing mobile experience issues and adding automated test coverage.

## Core Value

The presentation must work smoothly on mobile devices — touch navigation, proper scrolling, and correct viewport handling — without breaking the existing desktop experience.

## Requirements

### Validated

- ✓ 17-slide presentation with keyboard/arrow/dot navigation — existing
- ✓ Auto-advance timer with 120-second intervals — existing
- ✓ Vimeo video modal system with autoplay and mute toggle — existing
- ✓ Conversation video autoplay on dedicated slide — existing
- ✓ Dynamic publication list rendering (35 publications) — existing
- ✓ Team member grid with photos and roles (17 members) — existing
- ✓ Responsive layout with media queries at 600px/700px/768px/900px — existing
- ✓ Touch/swipe gesture detection for slide navigation — existing
- ✓ CSS slide transitions with stagger animations — existing
- ✓ GitHub Pages deployment with custom domain — existing

### Active

- [ ] Mobile scrolling works correctly on all slides (no stuck states, no accidental advances)
- [ ] Touch interactions are reliable across iOS Safari, Android Chrome, and Firefox mobile
- [ ] Viewport height handles mobile browser chrome correctly (address bar, toolbars)
- [ ] Mobile layout renders correctly on all 17 slides
- [ ] Touch targets meet minimum size requirements (48x48px)
- [ ] Desktop experience is unchanged after mobile fixes
- [ ] Playwright E2E tests cover slide navigation (keyboard, click, swipe)
- [ ] Playwright E2E tests cover mobile viewport responsiveness
- [ ] Playwright E2E tests cover video modal open/close
- [ ] Visual testing confirms layout on mobile viewports

### Out of Scope

- Redesigning the desktop layout — mobile fixes only, desktop must not regress
- Adding new slides or content — this is optimization, not content updates
- Refactoring to multi-file architecture — keep monolithic HTML structure
- Adding a build system — site remains zero-build static HTML
- Performance optimization beyond mobile fixes — no bundling, minification, or lazy loading changes
- Accessibility overhaul — only fix accessibility issues that directly affect mobile usability

## Context

- **Architecture:** Monolithic single HTML file (82KB, ~1300 lines) containing all CSS, JS, and markup
- **Known mobile issues:** Scrolling behavior problems, touch vs keyboard interaction conflicts, viewport height issues with `100dvh`
- **Current touch handling:** Swipe detection exists but may conflict with native scroll behavior on content-heavy slides
- **Wheel event:** Debounced with edge scroll tracking to prevent excess slide advances — similar issues likely on touch
- **Global state:** 13+ variables on window scope manage slide state, timers, and transitions
- **No existing tests:** Zero automated test coverage; all testing has been manual browser testing
- **Deployment:** Push to main branch auto-deploys via GitHub Pages to thewolfondchair.ca

## Constraints

- **Tech stack**: Vanilla HTML/CSS/JS only — no frameworks, no build tools
- **Compatibility**: Must work on iOS Safari, Android Chrome, Android Firefox, desktop Chrome/Safari/Firefox
- **Architecture**: Keep monolithic single-file structure — don't split into separate files
- **Regression**: All existing desktop functionality must continue working identically
- **Hosting**: GitHub Pages static hosting — no server-side capabilities

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use Playwright for E2E testing | Industry standard, supports mobile viewport emulation, works with static HTML | — Pending |
| Fix mobile in-place (no refactor) | Minimize risk to desktop experience; scope is optimization not rewrite | — Pending |
| Target all mobile browsers | Academic audience uses diverse devices; can't assume single platform | — Pending |

---
*Last updated: 2026-03-02 after initialization*

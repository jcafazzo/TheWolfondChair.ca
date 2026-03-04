# Wolfond Chair Digital Health Report

## What This Is

A slide-based digital report for the Wolfond Chair in Digital Health (2024-2026), deployed as a static site on GitHub Pages. The site presents research highlights, team members, publications, and video conversations in a 17-slide interactive presentation with mobile-optimized touch navigation and Playwright E2E test coverage.

## Core Value

The presentation must deliver a polished, hands-free viewing experience — whether on a desktop, a kiosk display, or a portrait-mounted screen — without breaking existing interactive navigation.

## Current Milestone: v1.1 Kiosk Mode

**Goal:** Add a self-playing kiosk mode with slow-scroll and portrait display support for unattended screens.

**Target features:**
- Kiosk mode toggle via keystroke — enters fully autonomous playback
- Slow auto-scroll within each slide over the 2-minute interval
- Portrait mode wrapper for physically rotated or portrait-oriented screens
- Continuous loop (restarts from slide 1 after last slide)

## Requirements

### Validated

- ✓ 17-slide presentation with keyboard/arrow/dot navigation — v1.0
- ✓ Auto-advance timer with 120-second intervals — v1.0
- ✓ Vimeo video modal system with autoplay and mute toggle — v1.0
- ✓ Conversation video autoplay on dedicated slide — v1.0
- ✓ Dynamic publication list rendering (35 publications) — v1.0
- ✓ Team member grid with photos and roles (17 members) — v1.0
- ✓ Responsive layout with media queries at 600px/700px/768px/900px — v1.0
- ✓ Touch/swipe gesture detection for slide navigation — v1.0
- ✓ CSS slide transitions with stagger animations — v1.0
- ✓ GitHub Pages deployment with custom domain — v1.0
- ✓ Mobile scrolling without stuck states or accidental advances — v1.0
- ✓ Touch interactions reliable across iOS Safari, Android Chrome, Firefox mobile — v1.0
- ✓ Viewport height handles mobile browser chrome correctly — v1.0
- ✓ Playwright E2E tests for navigation, mobile viewport, video modal — v1.0

### Active

- [ ] Kiosk mode activates via keystroke and enters autonomous playback
- [ ] Slow scroll moves viewport from top to bottom over 2-minute slide interval
- [ ] Presentation loops continuously in kiosk mode (slide 17 → slide 1)
- [ ] Portrait mode adapts layout for portrait-oriented screens
- [ ] Manual keystroke toggle for portrait mode on any screen
- [ ] Kiosk mode hides navigation chrome (dots, arrows, counter)
- [ ] Exiting kiosk mode restores normal interactive navigation

### Out of Scope

- Redesigning slide content or adding new slides — kiosk features only
- Refactoring to multi-file architecture — keep monolithic HTML structure
- Adding a build system — site remains zero-build static HTML
- Native mobile app or Electron wrapper — browser-only
- Remote control or network-based kiosk management

## Context

- **Architecture:** Monolithic single HTML file (~82KB) containing all CSS, JS, and markup
- **Auto-advance:** Already has 120-second timer with `autoTimerPaused` flag and tab-visibility handling
- **Global state:** 13+ window-scope variables manage slide state, timers, and transitions
- **Scroll areas:** Some slides have `.scroll-content` areas that overflow; scroll position resets on slide change
- **Existing kiosk-adjacent:** Auto-advance counter UI already exists (`.auto-counter`)
- **Deployment:** Push to main branch auto-deploys via GitHub Pages to thewolfondchair.ca

## Constraints

- **Tech stack**: Vanilla HTML/CSS/JS only — no frameworks, no build tools
- **Architecture**: Keep monolithic single-file structure
- **Regression**: All existing interactive navigation must continue working when kiosk mode is off
- **Hosting**: GitHub Pages static hosting — no server-side capabilities
- **Portrait**: Must work via CSS transform or iframe wrapper — no browser extensions or OS-level rotation

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use Playwright for E2E testing | Industry standard, supports mobile viewport emulation | ✓ Good |
| Fix mobile in-place (no refactor) | Minimize risk to desktop experience | ✓ Good |
| Target all mobile browsers | Academic audience uses diverse devices | ✓ Good |
| Kiosk mode loops continuously | Unattended display should never stop | — Pending |
| Portrait via iframe or CSS transform | No OS-level control; must be pure browser solution | — Pending |
| Manual toggle for portrait mode | User presses key to force portrait on any screen | — Pending |

---
*Last updated: 2026-03-04 after milestone v1.1 initialization*

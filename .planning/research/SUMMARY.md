# Project Research Summary

**Project:** Wolfond Chair Digital Health Report — Mobile Optimization + E2E Testing
**Domain:** Vanilla HTML/CSS/JS static slide presentation — mobile fix + Playwright test coverage
**Researched:** 2026-03-02
**Confidence:** HIGH

## Executive Summary

This is a repair and test-coverage milestone against an existing 17-slide static HTML presentation deployed to GitHub Pages. The site ships as a single monolithic HTML file with no build step, no framework, and no npm dependencies. Mobile UX is broken in specific, well-understood ways: layout instability from `100dvh` without a fallback, scroll/swipe conflicts on content-heavy slides, passive event listener misuse, undersized touch targets, and a battery-draining background timer. All root causes are identified, browser APIs are well-documented, and fixes are low-complexity. There is no architectural uncertainty — the question is execution discipline, not design.

The recommended approach is fix-first, then test. Write all mobile CSS and JS corrections, verify manually in a real browser, and then author Playwright E2E tests that lock in the fixed behavior as a regression guard. Playwright with device emulation (`@playwright/test` 1.58, `npx serve` for local static serving) is the correct toolchain: it covers the exact surface area that is broken (viewport dimensions, touch event dispatch, CSS computed values) and requires zero production dependencies. All npm packages remain `devDependencies` only — the deployed HTML file ships unchanged in structure.

The primary risks are subtle, not broad: the touch scroll detection logic conflates "slide has scrollable content" with "user's finger is inside that scrollable area," which will continue causing broken interactions on content-heavy slides unless addressed at the `touchstart` target level. Viewport height stability has a genuine disagreement between research files (STACK.md recommends `100dvh` with `100vh` fallback; PITFALLS.md recommends `100svh` with `100vh` fallback). This is the only gap requiring a deliberate call before implementation. Playwright emulation covers most regressions but cannot replicate real iOS Safari scroll physics — a manual device verification pass is required after viewport height changes.

---

## Key Findings

### Recommended Stack

The project needs exactly two additions: Playwright as the E2E test harness and `npx serve` as the local static file server (invoked via `playwright.config.js` webServer config, no install needed). The HTML file itself gains no dependencies. Playwright 1.58 is the latest stable release; it includes built-in device descriptors for iPhone 13, Pixel 7, and others, native touch emulation via `hasTouch: true`, and screenshot comparison via `toHaveScreenshot()`. The config must be plain JavaScript (not TypeScript) to avoid introducing a build step that contradicts the project's zero-build constraint.

CSS fixes use only native browser APIs: `100dvh`/`100svh` viewport units (Baseline widely available since June 2025), `touch-action: pan-y` (Baseline since September 2019), and `touch-action: manipulation` for tap delay elimination. No external CSS or JS library is needed or appropriate.

**Core technologies:**
- `@playwright/test` 1.58: E2E test runner with device emulation, touch simulation, and built-in screenshot comparison — the only correct tool for this use case
- `npx serve` (Vercel, 14.2.5): Zero-config static file server invoked from `playwright.config.js`; no global install required
- CSS `dvh`/`svh`/`lvh` units: Native viewport height that accounts for mobile browser chrome — Baseline widely available, no polyfill needed
- CSS `touch-action`: CSS-level hint to the browser about scroll/swipe intent — fires before JS events, prevents the need for `preventDefault`

### Expected Features

The scope is defined and bounded by existing issues in CONCERNS.md. The MVP for this milestone is entirely P1 — no new product features, only fixes and tests.

**Must have (table stakes — fixes for broken mobile UX):**
- Viewport height stability fix (`100vh` fallback before `100dvh` or `100svh`) — layout shifts on address bar show/hide are disorienting
- `touch-action: pan-y` on scrollable slide containers — prevents scroll gesture from triggering slide advance
- `overscroll-behavior-x: contain` with JS fallback for Safari < 16 — prevents accidental browser history navigation
- Touch target size audit and padding fix (48x48px minimum on nav dots and arrows)
- `touch-action: manipulation` on all interactive elements — eliminates 300ms tap delay
- Page Visibility API timer pause — stops battery drain on background mobile tabs
- Playwright P1 test suite (9 scenarios): keyboard nav, dot nav, arrow nav, swipe nav, vertical-scroll-does-not-advance, video modal open/close, all-slides JS error check, viewport height check

**Should have (high-value, low-cost additions if time allows):**
- Auto-advance pause/play visible toggle button — high user value, 5–10 lines of JS
- Playwright P2 test suite: auto-advance timer mocking, touch target size assertions, desktop regression suite

**Defer (v2+):**
- `srcset` responsive images — performance optimization, out of scope per PROJECT.md
- CSS Scroll Snap refactor — architectural change with high regression risk
- Real device CI testing on BrowserStack — cost and complexity not justified yet
- Full visual snapshot regression suite — maintenance burden outweighs value at this stage

### Architecture Approach

The architecture is strictly additive. The single HTML file (`wolfond-report-2024-2026.html`) gains a clearly labelled CSS mobile fix block appended after all existing styles, and targeted JS changes inside the existing touch event handlers. No existing markup, CSS rules, or JS functions are deleted. Playwright tests live in a new `tests/` directory and are purely external — they never import or modify the HTML file. The entire Playwright toolchain is isolated to `package.json` devDependencies.

**Major components:**
1. CSS mobile fix block (`<style>` zone, appended last) — viewport height fallback, `touch-action` discipline, tap target sizing; all new mobile CSS in one labeled section, never scattered into existing media query blocks
2. JS touch handler fixes (`<script>` zone, existing swipe detection) — threshold-gated swipe discrimination with target-aware scroll detection, passive listener correctness, Page Visibility API timer pause
3. Playwright test suite (`tests/*.spec.js`) — three spec files by concern: `navigation.spec.js`, `mobile.spec.js`, `video.spec.js`; all run against a local HTTP server, never against `file://` URLs

### Critical Pitfalls

1. **Touch target vs. scroll area detection** — The existing `touchend` handler checks whether a slide has a scrollable element, not whether the user's finger touched inside it. Fix: on `touchstart`, record `e.target.closest('.scroll-content')` and use that stored reference in `touchend`. Without this fix, vertical gestures on headings above scroll areas produce neither scroll nor slide advance.

2. **`100dvh` causes layout shifts, `100svh` leaves a gap — choose deliberately** — STACK.md and PITFALLS.md give different recommendations. `dvh` updates continuously as the address bar shows/hides, causing visible slide resizing. `svh` is stable but leaves a small gap when the address bar is hidden. For a slide deck, `svh` stability is preferable to `dvh` jitter. Decision must be explicit before implementation.

3. **Passive event listener silent failure** — Chrome 56+ makes `touchstart`/`touchmove` passive by default. Calling `preventDefault()` on a passive listener silently does nothing. Fix: use `touch-action: pan-y` (CSS-level, no passive conflict) as the primary mechanism; if a `touchmove` listener must call `preventDefault`, declare `{ passive: false }` explicitly and scope it to the smallest possible element.

4. **Playwright emulation is not real iOS Safari** — Playwright's WebKit engine does not replicate iOS Safari scroll momentum, address bar interaction, or `dvh`/`svh` behavior precisely. Tests passing in Playwright do not guarantee real-device behavior. Mitigation: run one manual verification pass on a physical iOS device or iOS Simulator after every viewport height change.

5. **`isTrusted: false` on dispatched touch events** — Playwright dispatches synthetic touch events with `isTrusted: false`. If `isTrusted` checking is ever added to the swipe handler as a security measure, all Playwright swipe tests will silently fail. The current code does not check `isTrusted` — do not add it.

---

## Implications for Roadmap

Based on research, the dependency structure is clear: CSS and JS fixes must land before tests can validate them (fix-first, not TDD). Desktop regression tests must run last, after all mobile changes are applied. This drives a two-phase structure.

### Phase 1: Mobile CSS and JS Fixes

**Rationale:** All downstream test writing depends on fixed behavior. Tests written against broken code produce a permanently-red baseline with no progress signal. Fixes are low-complexity, well-scoped, and have no inter-dependencies except that the touch handler fix and `touch-action` CSS must land together.

**Delivers:** A presentation that works correctly on mobile — no layout shift, no scroll/swipe conflict, correct touch targets, no background battery drain.

**Addresses (from FEATURES.md):**
- Viewport height stability (100vh fallback + 100svh — see gap below)
- `touch-action: pan-y` on scrollable containers
- `overscroll-behavior-x: contain` + Safari JS fallback
- Touch target size fix (48x48px padding on nav dots and arrows)
- `touch-action: manipulation` on interactive elements (tap delay elimination)
- Page Visibility API timer pause

**Avoids (from PITFALLS.md):**
- Touch target vs. scroll area detection bug (Pitfall 1) — use `e.target.closest()` on touchstart
- Layout shift from `dvh` (Pitfall 2) — decide svh vs dvh explicitly before writing CSS
- Passive listener silent failure (Pitfall 3) — use CSS `touch-action` as primary; no `preventDefault` needed
- Desktop regression — scope all new CSS inside `@media (max-width: 768px)` guards or inside the clearly-labelled mobile fix block

### Phase 2: Playwright E2E Test Suite

**Rationale:** Tests are written after fixes so they assert the correct (fixed) state. Playwright infrastructure (config, webServer, device projects) must be set up before any test can run. P1 tests establish the regression baseline; P2 tests add timer and touch target coverage.

**Delivers:** A Playwright test suite covering all 9 P1 scenarios plus P2 scenarios if time allows, running locally and in CI (GitHub Actions with Node 22 LTS).

**Uses (from STACK.md):**
- `@playwright/test` 1.58 with `npx serve` webServer config
- Device projects: `iPhone 13`, `iPhone 13 landscape`, `Pixel 7`, `Desktop Chrome`, `Desktop Safari`
- Plain JS config (`playwright.config.js` — no TypeScript, no build step)

**Implements (from ARCHITECTURE.md):**
- Three spec files: `tests/navigation.spec.js`, `tests/mobile.spec.js`, `tests/video.spec.js`
- Assertions against DOM state (`toHaveClass`, `toBeVisible`, `boundingBox`) — not pixel values or internals
- `page.clock` API for auto-advance timer testing without real time waits

**Avoids (from PITFALLS.md):**
- `file://` URL anti-pattern — always use `webServer` with `npx serve`
- `isTrusted` check — verify it is absent from swipe handler before writing touch tests
- Visual snapshot environment drift — establish baselines on CI OS, not macOS
- Asserting exact pixel dimensions — use `>= viewport.height * 0.95` range checks

### Phase 3: Polish and Validation

**Rationale:** Optional features with clear value (pause/play button) and manual device verification fall here. These are not on the critical path for the mobile fix milestone but complete the stated requirements if time allows.

**Delivers:** Auto-advance pause/play toggle button; confirmed behavior on real iOS device or iOS Simulator.

**Addresses (from FEATURES.md):** Auto-advance pause/play button (P2, high value / low cost); P2 Playwright tests (timer mock, touch target assertions, desktop regression suite).

### Phase Ordering Rationale

- Fixes before tests is not preference — it is required by the "fix-first" pattern documented in ARCHITECTURE.md and reinforced by PITFALLS.md's red-baseline warning
- CSS mobile fix block and JS touch handler fix are in the same phase because `touch-action: pan-y` and the JS threshold fix are complementary and must both be present for swipe discrimination to work correctly
- Desktop regression tests run as part of Phase 2, not Phase 1, because they validate that mobile changes did not break desktop — they cannot run before the changes they validate exist
- Phase 3 is explicitly optional; the milestone is complete after Phase 2

### Research Flags

Phases likely needing deliberate decisions before implementation (not additional research — the data is in hand):

- **Phase 1:** The `dvh` vs `svh` decision must be made explicitly before writing any CSS. STACK.md (dvh + vh fallback) and PITFALLS.md (svh + vh fallback) disagree. Both are correct for different priorities: `dvh` for precise fit, `svh` for stability. For a slide deck, `svh` is recommended. Flag this for explicit team decision, not research.
- **Phase 2:** The swipe simulation approach in Playwright requires manually dispatching `touchstart`/`touchmove`/`touchend` event sequences — Playwright's `Touchscreen.tap()` alone is insufficient for swipe detection. This is documented but non-obvious; the test author must know this before writing `mobile.spec.js`.

Phases with standard patterns (research not needed):

- **Phase 1 CSS fixes:** `touch-action`, viewport units, `overscroll-behavior` are all documented via MDN with HIGH confidence. No additional research required.
- **Phase 2 Playwright setup:** `webServer` config, device descriptors, `page.clock` are all official Playwright docs with HIGH confidence. No additional research required.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommendations backed by official Playwright docs and MDN; version numbers confirmed from release notes and caniuse |
| Features | HIGH | Feature scope is tightly constrained by existing CONCERNS.md issues; P1/P2/P3 split is clear; iOS Safari edge cases are MEDIUM (documented limitations) |
| Architecture | HIGH | Single-file monolithic architecture has no ambiguity; component boundaries, data flow, and Playwright integration pattern all verified against official docs |
| Pitfalls | HIGH | Core technical pitfalls (passive listeners, touch detection, `dvh` instability) verified against MDN, Chrome for Developers, and Playwright official docs; iOS-specific pitfalls are MEDIUM due to emulation limitations |

**Overall confidence:** HIGH

### Gaps to Address

- **`dvh` vs `svh` choice:** The only unresolved decision in the research. STACK.md and PITFALLS.md give different recommendations. Recommendation: use `100svh` with `100vh` fallback for layout stability. Must be decided explicitly before Phase 1 CSS is written.
- **`overscroll-behavior-x` on iOS Safari < 16:** FEATURES.md flags this as requiring a JS `touchmove preventDefault` fallback for older Safari. The specific iOS version cutoff and fallback implementation pattern need one more verification pass against caniuse/MDN compat tables before writing the fallback code.
- **Visual snapshot baselines:** If any P2 snapshot tests are added, baselines must be established on the same OS as CI (Linux). Establishing them on macOS guarantees false positives on CI runs due to font rendering differences.

---

## Sources

### Primary (HIGH confidence)
- [Playwright Release Notes](https://playwright.dev/docs/release-notes) — version 1.58 confirmed, browser versions bundled
- [Playwright Emulation Docs](https://playwright.dev/docs/emulation) — device descriptors, `hasTouch`, viewport override
- [Playwright Web Server Docs](https://playwright.dev/docs/test-webserver) — `webServer.command`, `reuseExistingServer` config
- [Playwright Snapshot Docs](https://playwright.dev/docs/test-snapshots) — `toHaveScreenshot()`, `maxDiffPixels`
- [Playwright Touch Events Docs](https://playwright.dev/docs/touch-events) — touch event dispatch approach
- [MDN — touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action) — `pan-y`, `none`, `manipulation` values
- [MDN — Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events) — passive listener pattern
- [Chrome for Developers — Scrolling intervention](https://developer.chrome.com/blog/scrolling-intervention) — `{ passive: false }` behavior
- [caniuse.com — Viewport unit variants](https://caniuse.com/viewport-unit-variants) — `dvh`/`svh`/`lvh` Baseline widely available June 2025
- [Playwright device descriptors source](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/deviceDescriptorsSource.json) — iPhone 13, Pixel 7 confirmed in registry

### Secondary (MEDIUM confidence)
- [CSS-Tricks — overscroll-behavior](https://css-tricks.com/almanac/properties/o/overscroll-behavior/) — iOS Safari partial support for `overscroll-behavior-x`
- [web.dev — Accessible tap targets](https://web.dev/articles/accessible-tap-targets) — 48px minimum recommendation
- [Frontend.fyi — Fix for 100vh on mobile](https://www.frontend.fyi/tutorials/finally-a-fix-for-100vh-on-mobile) — dvh/svh mobile patterns
- [BrowserStack — Playwright mobile automation](https://www.browserstack.com/guide/playwright-mobile-automation) — mobile project configuration patterns
- [Playwright GitHub issue #35774](https://github.com/microsoft/playwright/issues/35774) — `isTrusted: false` on dispatched touch events

### Tertiary (LOW confidence)
- [Pcloudy — Playwright Mobile Testing 2025](https://www.pcloudy.com/blogs/playwright-mobile-testing-setup-complete-guide/) — third-party guide; specifics must be verified against official Playwright docs

---

*Research completed: 2026-03-02*
*Ready for roadmap: yes*

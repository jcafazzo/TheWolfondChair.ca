# Phase 2: Playwright Tests - Context

**Gathered:** 2026-03-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Build an E2E test suite using Playwright that asserts the fixed mobile behavior from Phase 1 and guards against desktop regression. Tests run against a locally-served copy of the monolithic HTML file with no manual setup beyond `npx playwright test`.

</domain>

<decisions>
## Implementation Decisions

### Project Setup
- Initialize npm in the project root (`npm init -y`) — there is currently no package.json
- Install Playwright as a devDependency: `npm i -D @playwright/test`
- Install browsers: `npx playwright install --with-deps chromium webkit`
- Use Playwright's `webServer` config to auto-start a local HTTP server before tests
- Server command: `python3 -m http.server 8080` (already proven to work in Phase 1)
- Base URL: `http://localhost:8080/wolfond-report-2024-2026.html`

### Test File Organization
- All tests in a `tests/` directory at project root
- Split into logical files by concern:
  - `navigation.spec.ts` — keyboard arrows, dot clicks, arrow button clicks
  - `mobile-viewport.spec.ts` — layout on iPhone 14 and Pixel 5 emulation
  - `video-modal.spec.ts` — open, close button, Escape key dismissal
  - `desktop-regression.spec.ts` — confirm desktop navigation and layout unchanged
- Use TypeScript for test files (Playwright default, better autocompletion)

### Playwright Configuration
- Config file: `playwright.config.ts` at project root
- Projects:
  - `desktop-chromium` — default Chromium, 1280×800 viewport
  - `mobile-iphone14` — iPhone 14 device emulation (Playwright built-in)
  - `mobile-pixel5` — Pixel 5 device emulation (Playwright built-in)
- Retries: 0 (deterministic tests, no flaky allowance)
- Workers: 1 (single static server, avoid port conflicts)
- Reporter: `html` for local debugging, `list` for CI output
- No video/screenshot recording by default (keep fast, enable on failure only)

### Navigation Tests (TEST-02)
- 17 slides total (0-indexed internally)
- Test keyboard navigation: ArrowRight advances, ArrowLeft retreats
- Test dot navigation: clicking dot `i` goes to slide `i`
- Test arrow button navigation: click `.slide-arrow` prev/next buttons
- Verify slide counter text updates (format: `01 / 17`)
- Verify active dot class toggles correctly
- Verify all 17 slides are reachable (traverse forward, check last)

### Mobile Viewport Tests (TEST-03)
- iPhone 14 (390×844) and Pixel 5 (393×851) device emulation
- Verify `.slide.active .slide-inner` fits within viewport (no horizontal overflow)
- Verify `.slide-dot::before` has 44px computed touch target
- Verify `touch-action: pan-y` is computed on `.slide.active`
- Verify `overscroll-behavior-x: contain` is computed on `.slide.active`
- Verify viewport height uses svh (check computed height equals viewport)
- Navigate to a content-heavy slide (e.g., Team slide) and verify scroll works

### Video Modal Tests (TEST-04)
- Video modal element: `#videoModal`
- Open trigger: click `.convo-thumb` element (on Voices slide, index ~13)
- Verify modal gains `.open` then `.visible` classes
- Close via `.video-modal-close` button — verify classes removed
- Close via Escape key — verify classes removed
- Verify iframe `src` is cleared after close

### Desktop Regression Tests (TEST-05)
- Run on desktop Chromium at 1280×800
- Verify cover slide layout (centered content, background)
- Verify navigation works (keyboard, dots, arrows — same as TEST-02 but desktop viewport)
- Verify slide transitions animate (opacity change detectable)
- Verify no horizontal scrollbar on any slide
- Verify topbar is fixed and visible

### Claude's Discretion
- Exact test helper utilities (page object pattern vs inline locators)
- Test timeouts and wait strategies
- Exact assertions for computed CSS values
- Whether to use `test.describe` grouping or flat test structure
- `.gitignore` additions for test artifacts (test-results/, playwright-report/)

</decisions>

<specifics>
## Specific Ideas

Key selectors and DOM structure for test authors:
- Slides: `.slide` (17 total, dynamically rendered)
- Active slide: `.slide.active`
- Slide inner: `.slide-inner`
- Nav dots: `.slide-dot` (17 total), active one has `.slide-dot.active`
- Arrow buttons: `.slide-arrow` (2 total, prev then next)
- Slide counter: `.slide-counter` (text format: `01 / 17`)
- Video modal: `#videoModal`, opens with `.open` + `.visible` classes
- Video close: `.video-modal-close` button
- Video thumbnails: `.convo-thumb` (5 total, on Voices slide)
- Topbar: `.topbar` (position: fixed)
- Scroll content: `.scroll-content` (on some slides)
- Functions exposed globally: `goToSlide(i)`, `nextSlide()`, `prevSlide()`, `openVideoModal(id, caption)`, `closeVideoModal()`

Keyboard bindings:
- ArrowRight / ArrowDown / Space: nextSlide()
- ArrowLeft / ArrowUp: prevSlide()
- Escape: closeVideoModal()

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- No existing test infrastructure — this is a green-field test setup
- The monolithic HTML file is self-contained — no build step, just serve and test

### Established Patterns
- All state is global window scope — tests can use `page.evaluate()` to read `current` slide index directly
- Slide transitions use CSS opacity/transform with 0.8s ease — tests should wait for transition completion
- Video modal uses class toggling (`.open`, `.visible`) — can assert class presence

### Integration Points
- `package.json` — new file, npm init
- `playwright.config.ts` — new file, Playwright configuration
- `tests/` — new directory with test files
- `.gitignore` — needs test artifact entries (node_modules, test-results, playwright-report)

</code_context>

<deferred>
## Deferred Ideas

- Simulated touch swipe E2E tests (ATEST-01) — v2 requirement, complex touch event dispatch
- CI pipeline integration with GitHub Actions (ATEST-02) — v2 requirement
- Visual snapshot regression tests (UX-04) — v2 requirement
- Clock-mocked auto-advance timer tests (UX-03) — v2 requirement

</deferred>

---

*Phase: 02-playwright-tests*
*Context gathered: 2026-03-02*

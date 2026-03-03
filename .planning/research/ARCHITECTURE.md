# Architecture Research

**Domain:** Monolithic vanilla HTML/CSS/JS slide presentation — mobile optimization + Playwright E2E testing
**Researched:** 2026-03-02
**Confidence:** HIGH

## Standard Architecture

### System Overview

The system stays as a single HTML file. Playwright runs alongside it as an external test harness, never touching the HTML structure itself. There is no build step.

```
TheWolfondChair.ca/
├── wolfond-report-2024-2026.html   # THE system (all CSS, JS, markup)
├── index.html                      # Redirect stub — do not touch
├── images/                         # Static assets — do not touch
├── playwright.config.js            # Test runner config (JS, not TS — no build)
├── package.json                    # Dev dependencies only (Playwright)
└── tests/                          # Playwright specs (external, never imported by HTML)
    ├── navigation.spec.js          # Slide navigation tests
    ├── mobile.spec.js              # Mobile viewport + touch tests
    └── video.spec.js               # Video modal tests
```

The HTML file has three internal zones that accept changes:

```
wolfond-report-2024-2026.html
├── <head>
│   └── <style>                     ZONE A: Mobile CSS fixes go here
│       ├── :root, base styles      (existing — do not disturb)
│       ├── .slide variants         (existing — do not disturb)
│       ├── @media (max-width: …)   (existing — append inside or extend)
│       └── /* MOBILE FIXES */      ← Add new media queries / overrides here
│
├── <body>
│   ├── #deck with .slide elements  (existing generated markup)
│   └── navigation, modal DOM       (existing — do not touch)
│
└── <script>                        ZONE B: Touch/JS fixes go here
    ├── Data arrays (publications, team, CONVO_VIDEOS)
    ├── buildSlides(), init()        (existing — do not touch)
    ├── goToSlide(), autoAdvance     (existing — modify carefully)
    └── /* TOUCH HANDLING */        ← Add/modify touch event listeners here
```

### Component Boundaries

| Component | Location | Responsibility | Change Policy |
|-----------|----------|----------------|---------------|
| CSS — base styles | `<style>` lines 10–300 | Typography, layout, slide variants | Read-only during this milestone |
| CSS — media queries | `<style>` lines 300–630 | Responsive breakpoints at 600/700/768/900px | Extend; do not delete existing rules |
| CSS — mobile fix block | `<style>` (new, after existing) | `touch-action`, `100dvh` fallback, tap target sizing | All new mobile CSS lives here |
| JS — slide engine | `<script>` goToSlide, init | Slide index, active class, transitions | Modify touch threshold logic only |
| JS — touch handlers | `<script>` (existing swipe detection) | Swipe gesture detection, scroll conflict resolution | Primary target for JS mobile fixes |
| JS — auto-advance | `<script>` startAutoAdvance / resetAutoAdvance | 120-second timer | Do not modify logic; only ensure touch resets it |
| JS — video modal | `<script>` openVideoModal / closeVideoModal | Vimeo iframe modal | Read-only during this milestone |
| Playwright config | `playwright.config.js` | Browser projects, base URL, webServer | New file; defines all devices under test |
| Playwright tests | `tests/*.spec.js` | E2E assertions on live-rendered HTML | New files; test behaviour, not internals |

### Data Flow

Mobile fixes are CSS/JS changes that intercept browser events earlier in the pipeline:

```
Touch Event (touchstart / touchmove / touchend)
    ↓
Browser default gesture recognition
    ↓  ← touch-action: pan-y on .slide enables native vertical scroll
    ↓  ← JS threshold check (dx > 40px AND dx > dy) gates horizontal swipe
    ↓
goToSlide(index)  OR  native scroll continues
    ↓
CSS transition (.active / .exiting classes)
    ↓
User sees slide change or page scrolls — not both
```

Playwright test flow:

```
playwright test
    ↓
webServer: npx http-server launches on :8080
    ↓
Browser (Chromium / WebKit / Firefox) opens http://localhost:8080
    ↓
Page.goto('wolfond-report-2024-2026.html')
    ↓
Test assertions against rendered DOM and JS state
    ↓
Device emulation (iPhone 14 / Pixel 5) tests mobile path
```

## Recommended Project Structure

```
TheWolfondChair.ca/
├── wolfond-report-2024-2026.html   # All CSS + HTML + JS (monolithic — unchanged structure)
├── index.html                      # Redirect stub (do not modify)
├── images/                         # Image assets (do not modify)
├── CNAME                           # GitHub Pages domain (do not modify)
├── package.json                    # Playwright dev dependency only
├── playwright.config.js            # Test config (plain JS — no TypeScript/build needed)
└── tests/
    ├── navigation.spec.js          # Keyboard, click, dot navigation across all 17 slides
    ├── mobile.spec.js              # Mobile viewport, touch swipe, scroll, tap targets
    └── video.spec.js               # Modal open/close, Vimeo iframe injection, escape key
```

### Structure Rationale

- **`tests/` at project root:** Playwright default; config points `testDir: 'tests'`. Keeps test files separate from the single HTML file without introducing src/ or dist/ directories that imply a build system.
- **`playwright.config.js` not `.ts`:** The project has no build step and no TypeScript transpilation. Plain JS config avoids a Node/TS toolchain and is fully valid for Playwright.
- **`package.json` dev-only:** One dependency: `@playwright/test`. No runtime dependencies. The HTML file loads no npm packages.
- **Three spec files, not one:** Separation by concern (navigation / mobile / video) keeps each file focused and makes failures easy to triage. Navigation spec is the safe baseline; mobile spec is the higher-risk area.

## Architectural Patterns

### Pattern 1: CSS Mobile Fix Block — Append, Don't Scatter

**What:** All new mobile CSS is added as a clearly labelled block at the end of the `<style>` section, after all existing rules. No edits scattered through existing media queries.

**When to use:** Anytime a mobile layout or interaction fix is needed.

**Trade-offs:** Slightly longer cascade; no risk of accidentally breaking existing rules by editing them.

**Example:**
```css
/* =========================================
   MOBILE FIXES — added 2026-03
   ========================================= */

/* Prevent swipe gesture from accidentally triggering
   horizontal scroll on slides */
.slide {
  touch-action: pan-y;
}

/* 100dvh fix: use dynamic viewport height where supported,
   fall back to 100vh for older iOS */
#deck {
  height: 100vh;
}
@supports (height: 100dvh) {
  #deck {
    height: 100dvh;
  }
}

/* Minimum tap target size per WCAG mobile guidelines */
.slide-dot,
.slide-arrow,
.convo-thumb,
button {
  min-width: 44px;
  min-height: 44px;
}

/* Slide content overflow fix for small screens */
@media (max-width: 480px) {
  .slide-inner {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}
```

### Pattern 2: Touch Handler — Threshold-Gated Swipe Detection

**What:** The existing swipe handler fires `goToSlide()` on any horizontal movement. The fix adds a minimum distance threshold AND a direction check (must be more horizontal than vertical) before advancing the slide. This prevents accidental advances when the user scrolls vertically.

**When to use:** When fixing the touch/scroll conflict in the existing swipe event listener.

**Trade-offs:** A threshold of ~40px is the right balance — large enough to prevent accidental swipes, small enough to feel responsive. Smaller values cause false triggers on scroll; larger values feel sluggish.

**Example:**
```javascript
// Within existing touchstart/touchmove/touchend handlers in <script>

let touchStartX = 0;
let touchStartY = 0;

// On touchstart — record initial position
document.addEventListener('touchstart', function(e) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

// On touchend — only advance if horizontal swipe wins
document.addEventListener('touchend', function(e) {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  const threshold = 40; // px — minimum swipe distance

  // Horizontal swipe: dx must dominate AND exceed threshold
  if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy)) {
    if (dx < 0) goToSlide(current + 1); // swipe left = next
    if (dx > 0) goToSlide(current - 1); // swipe right = prev
  }
  // Otherwise: let the native scroll proceed uninterrupted
}, { passive: true });
```

Note: `{ passive: true }` is required on both handlers. Without it, mobile browsers delay scroll rendering to wait for `preventDefault()`, causing laggy scrolling. Since the threshold check handles the conflict logically (not via `preventDefault`), passive listeners are correct here.

### Pattern 3: Playwright Config — webServer + Device Projects

**What:** `playwright.config.js` launches a static file server before tests run, defines browser/device projects, and sets a base URL. Tests navigate relative to the base URL.

**When to use:** The standard pattern for all Playwright tests against static HTML.

**Trade-offs:** `npx http-server` adds an npm package but avoids Python/Ruby dependencies. `reuseExistingServer: true` locally prevents port conflicts when running tests repeatedly.

**Example:**
```javascript
// playwright.config.js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
  },

  webServer: {
    command: 'npx http-server . -p 8080 -c-1', // -c-1 disables caching
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
  },

  projects: [
    // Desktop baseline — must pass first
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },

    // Mobile emulation — primary test targets
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },

    // Firefox mobile — academic audience uses this
    {
      name: 'firefox-mobile',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
      },
    },
  ],
});
```

### Pattern 4: Build Order — Fix First, Then Test (Not TDD)

**What:** Write all mobile CSS and JS fixes first, verify them manually in browser, then write Playwright tests that assert the fixed behaviour. Do not write tests before fixes.

**When to use:** Always for this milestone. The rationale is:

1. The broken behaviour is already known (scrolling, viewport height, touch conflicts). This is not exploratory — it is targeted repair.
2. Writing tests against broken code produces a suite of red tests that cannot be used to validate incremental progress — the baseline is already failing.
3. Mobile fixes change the observable DOM and JS behaviour that tests need to assert against. Writing tests first means writing them against behaviour that is about to change.
4. The correct order: Fix → Manual verify in browser → Write test that asserts fixed state → Confirm green.

**Trade-offs:** Does not give a "regression catches a re-broken fix" signal during development. Acceptable tradeoff given the scope.

## Data Flow

### Mobile Fix Application Flow

```
Browser renders wolfond-report-2024-2026.html
    ↓
<style> block parsed — mobile fix CSS block appended last wins cascade
    ↓
#deck gets height: 100dvh (or 100vh fallback)
.slide gets touch-action: pan-y
    ↓
User touches screen
    ↓
touchstart fires — JS records (startX, startY), passive
touchmove fires — browser handles vertical scroll natively (touch-action: pan-y)
touchend fires — JS checks threshold (|dx| > 40 AND |dx| > |dy|)
    ↓
Threshold passed → goToSlide() → slide transitions
Threshold not passed → native scroll continues, no slide advance
```

### Playwright Test Execution Flow

```
npm test (or npx playwright test)
    ↓
playwright.config.js read
    ↓
webServer.command launches: npx http-server . -p 8080
    ↓
Playwright waits for http://localhost:8080 to respond
    ↓
Projects run in parallel:
  chromium-desktop → tests/navigation.spec.js + tests/video.spec.js
  mobile-safari    → tests/mobile.spec.js + tests/navigation.spec.js
  mobile-chrome    → tests/mobile.spec.js
    ↓
Each test: page.goto('/wolfond-report-2024-2026.html')
    ↓
Assertions against DOM state, CSS computed values, element visibility
    ↓
HTML report generated → playwright-report/index.html
```

### State in Tests — What to Assert

Playwright tests must assert observable state, not internals. The window-scoped JS variables (`current`, `isTransitioning`, etc.) are accessible via `page.evaluate()` when needed, but prefer DOM assertions:

| Behaviour | Assert Via |
|-----------|-----------|
| Slide advanced | `expect(slide[1]).toHaveClass('active')` |
| Slide not accidentally advanced on scroll | assert `current` unchanged after vertical drag |
| Viewport height correct | `expect(deck).toHaveCSS('height', /\d+px/)` — not NaN |
| Tap target size | `element.boundingBox()` — width and height >= 44 |
| Modal opens | `expect(modal).toBeVisible()` |
| Modal closes on Escape | keyboard Escape → `expect(modal).not.toBeVisible()` |

## Scaling Considerations

This is a static document site, not a scaling-sensitive application. Scaling considerations are irrelevant. What matters is regression safety:

| Concern | Approach |
|---------|----------|
| Desktop regression from mobile CSS | Run chromium-desktop project in every CI run; fail the build if it regresses |
| Test flakiness from CSS transitions | Use `waitForFunction` or `waitForTimeout` to wait past the 800ms slide transition before asserting |
| iOS Safari vs WebKit emulation gap | Playwright's WebKit engine is close but not identical to real iOS Safari; flag tests that only validate on real devices as LOW confidence |

## Anti-Patterns

### Anti-Pattern 1: Editing Existing Media Query Blocks

**What people do:** Find the `@media (max-width: 768px)` block and add new rules inline.

**Why it's wrong:** The existing rules are tested (manually) and working for desktop. Editing inside existing blocks risks overriding rules that were intentional, with no clear boundary showing what was changed.

**Do this instead:** Add a clearly labelled `/* MOBILE FIXES */` block after all existing CSS. Rules appended later win the cascade.

### Anti-Pattern 2: Calling preventDefault() on Touch Events

**What people do:** Call `e.preventDefault()` on `touchstart` or `touchmove` to stop scroll during swipe detection.

**Why it's wrong:** This blocks all native scroll on content-heavy slides like Publications and Team. Users can no longer scroll through long content. Also forces `{ passive: false }` on listeners, which triggers browser performance warnings.

**Do this instead:** Use `touch-action: pan-y` on `.slide` elements (CSS-level hint to the browser) combined with a direction-threshold check in JS. The browser and JS cooperate — no `preventDefault` required.

### Anti-Pattern 3: Using TypeScript or ESM in Playwright Config

**What people do:** Create `playwright.config.ts` expecting TypeScript to just work.

**Why it's wrong:** TypeScript Playwright config requires a tsconfig and either ts-node or esbuild. The project has no build step and no package.json with TypeScript configured. Adding TS for the config file alone creates needless toolchain complexity.

**Do this instead:** Use `playwright.config.js` with CommonJS `require`/`module.exports`. Playwright supports this natively, no transpilation needed.

### Anti-Pattern 4: Writing Playwright Tests That Assert Pixel Values

**What people do:** Test `element.style.height === '100dvh'` or exact pixel dimensions.

**Why it's wrong:** Computed CSS values are rendered as pixels by the browser. `100dvh` becomes `844px` (or whatever the emulated device height is). These values differ per device and break when device presets update.

**Do this instead:** Assert computed height is within a reasonable range of the viewport: `height >= viewport.height * 0.95`. Or assert the element fills the screen visually using `boundingBox()` comparisons.

### Anti-Pattern 5: TDD on a Repair Milestone

**What people do:** Write failing tests first, then write code to pass them.

**Why it's wrong:** The broken behaviours are already identified. Writing tests against broken code means all tests start red. There is no "green baseline" to protect. Progress cannot be tracked through green/red states.

**Do this instead:** Fix first, manual-verify, then write tests to lock in the fixed behaviour. The test suite serves as a regression guard, not a design tool.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Vimeo player API | URL parameter injection (`?autoplay=1&muted=1`) | No SDK; Playwright tests should not assert Vimeo video loads — it is external and network-dependent |
| GitHub Pages | Static file serving; push-to-deploy | Playwright tests run locally/CI, not against production URL |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| CSS layer ↔ JS layer | JS adds/removes classes (`.active`, `.exiting`, `.open`, `.visible`) | Touch fix CSS rules must not rely on class toggling to function — base `touch-action` must always be present |
| JS touch handlers ↔ JS slide engine | Direct function calls (`goToSlide()`) | Touch handlers call the same `goToSlide()` as keyboard/click; no new pathway needed |
| Playwright ↔ HTML file | HTTP via http-server; DOM access via page API | Playwright never imports or modifies the HTML file; pure black-box testing |
| Playwright ↔ JS state | `page.evaluate(() => window.current)` for state reads | Use sparingly — prefer DOM assertions to avoid tight coupling to implementation |

## Sources

- [Playwright Emulation — Official Docs](https://playwright.dev/docs/emulation) — HIGH confidence
- [Playwright webServer Config — Official Docs](https://playwright.dev/docs/test-webserver) — HIGH confidence
- [Playwright Test Configuration — Official Docs](https://playwright.dev/docs/test-configuration) — HIGH confidence
- [MDN: touch-action CSS property](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action) — HIGH confidence
- [CSS dvh / svh / lvh viewport units — Medium](https://medium.com/@tharunbalaji110/understanding-mobile-viewport-units-a-complete-guide-to-svh-lvh-and-dvh-0c905d96e21a) — MEDIUM confidence (verified against MDN)
- [Touch vs Scroll conflict resolution — JavaScriptRoom](https://www.javascriptroom.com/blog/prevent-touchstart-when-swiping/) — MEDIUM confidence
- [Playwright mobile automation best practices — BrowserStack](https://www.browserstack.com/guide/playwright-mobile-automation) — MEDIUM confidence

---
*Architecture research for: Wolfond Chair Digital Health — mobile optimization + Playwright testing*
*Researched: 2026-03-02*

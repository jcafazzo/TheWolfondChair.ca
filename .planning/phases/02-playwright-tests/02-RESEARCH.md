# Phase 2: Playwright Tests - Research

**Researched:** 2026-03-02
**Domain:** Playwright E2E testing of a static monolithic HTML presentation
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Project Setup**
- Initialize npm in the project root (`npm init -y`) — there is currently no package.json
- Install Playwright as a devDependency: `npm i -D @playwright/test`
- Install browsers: `npx playwright install --with-deps chromium webkit`
- Use Playwright's `webServer` config to auto-start a local HTTP server before tests
- Server command: `python3 -m http.server 8080` (already proven to work in Phase 1)
- Base URL: `http://localhost:8080/wolfond-report-2024-2026.html`

**Test File Organization**
- All tests in a `tests/` directory at project root
- Split into logical files by concern:
  - `navigation.spec.ts` — keyboard arrows, dot clicks, arrow button clicks
  - `mobile-viewport.spec.ts` — layout on iPhone 14 and Pixel 5 emulation
  - `video-modal.spec.ts` — open, close button, Escape key dismissal
  - `desktop-regression.spec.ts` — confirm desktop navigation and layout unchanged
- Use TypeScript for test files (Playwright default, better autocompletion)

**Playwright Configuration**
- Config file: `playwright.config.ts` at project root
- Projects:
  - `desktop-chromium` — default Chromium, 1280x800 viewport
  - `mobile-iphone14` — iPhone 14 device emulation (Playwright built-in)
  - `mobile-pixel5` — Pixel 5 device emulation (Playwright built-in)
- Retries: 0 (deterministic tests, no flaky allowance)
- Workers: 1 (single static server, avoid port conflicts)
- Reporter: `html` for local debugging, `list` for CI output
- No video/screenshot recording by default (keep fast, enable on failure only)

**Navigation Tests (TEST-02)**
- 17 slides total (0-indexed internally)
- Test keyboard navigation: ArrowRight advances, ArrowLeft retreats
- Test dot navigation: clicking dot `i` goes to slide `i`
- Test arrow button navigation: click `.slide-arrow` prev/next buttons
- Verify slide counter text updates (format: `01 / 17`)
- Verify active dot class toggles correctly
- Verify all 17 slides are reachable (traverse forward, check last)

**Mobile Viewport Tests (TEST-03)**
- iPhone 14 (390x844) and Pixel 5 (393x851) device emulation
- Verify `.slide.active .slide-inner` fits within viewport (no horizontal overflow)
- Verify `.slide-dot::before` has 44px computed touch target
- Verify `touch-action: pan-y` is computed on `.slide.active`
- Verify `overscroll-behavior-x: contain` is computed on `.slide.active`
- Verify viewport height uses svh (check computed height equals viewport)
- Navigate to a content-heavy slide (e.g., Team slide) and verify scroll works

**Video Modal Tests (TEST-04)**
- Video modal element: `#videoModal`
- Open trigger: click `.convo-thumb` element (on Voices slide, index ~13)
- Verify modal gains `.open` then `.visible` classes
- Close via `.video-modal-close` button — verify classes removed
- Close via Escape key — verify classes removed
- Verify iframe `src` is cleared after close

**Desktop Regression Tests (TEST-05)**
- Run on desktop Chromium at 1280x800
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

### Deferred Ideas (OUT OF SCOPE)
- Simulated touch swipe E2E tests (ATEST-01) — v2 requirement, complex touch event dispatch
- CI pipeline integration with GitHub Actions (ATEST-02) — v2 requirement
- Visual snapshot regression tests (UX-04) — v2 requirement
- Clock-mocked auto-advance timer tests (UX-03) — v2 requirement
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TEST-01 | Playwright project configured with webServer serving static HTML, running on desktop Chromium | webServer config pattern, python3 http.server, `reuseExistingServer` option |
| TEST-02 | Navigation tests verify keyboard arrows, click dots, and click arrows advance/retreat slides correctly | `page.press('body', 'ArrowRight')`, `.slide-dot` locator clicking, `page.evaluate()` for reading `current`, 800ms transition guard |
| TEST-03 | Mobile viewport tests verify layout on iPhone 14 and Pixel 5 device emulation | `devices['iPhone 14']`, `devices['Pixel 5']` confirmed valid in v1.58.2; `toHaveCSS()` for computed properties |
| TEST-04 | Video modal tests verify open, close, and Escape key dismissal | `toContainClass('open')`, `toContainClass('visible')`; 350ms close animation timeout; `page.keyboard.press('Escape')` |
| TEST-05 | Desktop regression tests confirm all navigation and layout still works after mobile changes | Runs on `desktop-chromium` project, reuses navigation patterns from TEST-02 |
</phase_requirements>

---

## Summary

This phase sets up Playwright E2E tests from scratch against a static monolithic HTML file. There is no existing package.json, no test infrastructure, and no build step — the file is served directly with `python3 -m http.server`. The primary technical challenge is understanding the application's timing model (800ms slide transitions, 350ms modal close animation, `requestAnimationFrame`-doubled modal open) and writing wait strategies that avoid flakiness without being slow.

Playwright 1.58.2 (latest as of research date) is the target version. All locked decisions are sound: `devices['iPhone 14']` and `devices['Pixel 5']` are confirmed valid device descriptors in the Playwright registry at this version. The `webServer` + `reuseExistingServer` pattern is the canonical approach for static file serving, and `python3 -m http.server` starts fast enough that a 10-second timeout is sufficient.

**CRITICAL DISCREPANCY — Slide Count:** The CONTEXT.md repeatedly states "17 slides" but the HTML file contains **18 slide template strings** in `buildSlides()`. The slide counter format uses `slides.length` dynamically (e.g., `01 / 18`). Tests must verify against the actual count at runtime rather than assuming 17.

**CRITICAL DISCREPANCY — Device Viewport Dimensions:** The CONTEXT.md states "iPhone 14 (390x844)" and "Pixel 5 (393x851)" but the Playwright 1.58.2 device registry shows iPhone 14 as 390x664 and Pixel 5 as 393x727. Use the registry device objects as-is via `...devices['iPhone 14']`; do not manually specify viewport dimensions to override them.

**Primary recommendation:** Use `page.evaluate()` to read global state (`current`, `slides.length`) for navigation assertions; use `toHaveCSS()` for computed CSS assertions; guard all post-transition assertions with `page.waitForTimeout(850)` or a counter-text assertion that auto-retries until the transition completes.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @playwright/test | 1.58.2 (latest) | E2E test runner + browser automation | Official Microsoft framework, ships with test runner, device registry, and assertions |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| typescript | bundled with @playwright/test | Type checking for test files | Playwright init generates tsconfig.json automatically |
| python3 http.server | stdlib | Static file server | Already proven in Phase 1, zero-dependency, fast startup |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| python3 http.server | npx serve or npx http-server | Would add npm dependencies; python3 is already on system and proven |
| typescript tests | javascript tests | TypeScript gives autocompletion for Playwright APIs; no real downside for this project |

**Installation:**
```bash
npm init -y
npm i -D @playwright/test
npx playwright install --with-deps chromium webkit
```

---

## Architecture Patterns

### Recommended Project Structure
```
.
├── playwright.config.ts          # Playwright config (projects, webServer, baseURL)
├── tests/
│   ├── navigation.spec.ts        # TEST-02: keyboard, dot, arrow navigation
│   ├── mobile-viewport.spec.ts   # TEST-03: iPhone 14 + Pixel 5 layout
│   ├── video-modal.spec.ts       # TEST-04: modal open/close/Escape
│   └── desktop-regression.spec.ts # TEST-05: desktop regression
├── package.json                  # npm metadata + test script
├── tsconfig.json                 # TypeScript config (auto-generated by playwright)
└── .gitignore                    # node_modules/, test-results/, playwright-report/
```

### Pattern 1: webServer with python3 http.server
**What:** Playwright auto-starts the static server before any test runs
**When to use:** Always for this project — there is no npm dev server

```typescript
// playwright.config.ts
// Source: https://github.com/microsoft/playwright/blob/main/docs/src/test-webserver-js.md
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  retries: 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  webServer: {
    command: 'python3 -m http.server 8080',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  use: {
    baseURL: 'http://localhost:8080/wolfond-report-2024-2026.html',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'mobile-iphone14',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'mobile-pixel5',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
```

### Pattern 2: Reading Global Application State
**What:** The app stores `current` (slide index) and `slides` (NodeList) as globals on `window`
**When to use:** For asserting which slide is active, total slide count, transition completion

```typescript
// Source: CONTEXT.md code_context + HTML source analysis
// Read current slide index and total slide count via page.evaluate()
const currentIndex = await page.evaluate(() => (window as any).current);
const total = await page.evaluate(() => (window as any).slides.length);

// Call navigation functions directly via page.evaluate() (faster for setup)
await page.evaluate(() => (window as any).goToSlide(5));
```

**Important:** `isTransitioning` blocks `goToSlide()` silently. Always wait 850ms after any navigation before calling another `goToSlide()`.

### Pattern 3: Transition-Aware Navigation
**What:** goToSlide() sets `isTransitioning = true` for 800ms; subsequent calls during this window are silently ignored
**When to use:** Any test that navigates multiple slides in sequence

```typescript
// Source: HTML source — isTransitioning timeout is hardcoded 800ms in setTimeout
// Option A: explicit wait (simple, deterministic)
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(850); // 800ms transition + 50ms buffer

// Option B: wait for counter text to update (more robust, auto-retries)
await page.keyboard.press('ArrowRight');
await expect(page.locator('#slideCounter')).toHaveText('02 / 18');
```

### Pattern 4: Computed CSS Assertions
**What:** `toHaveCSS()` checks computed (resolved) CSS values, not inline styles
**When to use:** TEST-03 mobile viewport assertions

```typescript
// Source: Context7 /microsoft/playwright — LocatorAssertions.toHaveCSS
const activeSlide = page.locator('.slide.active');
await expect(activeSlide).toHaveCSS('touch-action', 'pan-y');
await expect(activeSlide).toHaveCSS('overscroll-behavior-x', 'contain');

// ::before pseudo-elements CANNOT use toHaveCSS() — must use getComputedStyle
const beforeHeight = await page.evaluate(() => {
  const dot = document.querySelector('.slide-dot');
  return parseFloat(getComputedStyle(dot!, '::before').height);
});
expect(beforeHeight).toBeGreaterThanOrEqual(44);
```

### Pattern 5: Video Modal Timing
**What:** Modal open uses double-rAF for `.visible` class; close removes `.visible` then waits 350ms to remove `.open`
**When to use:** TEST-04 modal assertions

```typescript
// Source: HTML source — openVideoModal() and closeVideoModal() timing
// Open: .open added immediately; .visible added after ~2 rAF cycles (~32ms)
await page.locator('.convo-thumb').first().click();
await expect(page.locator('#videoModal')).toContainClass('open');
await expect(page.locator('#videoModal')).toContainClass('visible'); // auto-retries

// Close via button: .visible removed immediately, .open removed after 350ms
await page.locator('.video-modal-close').click();
await expect(page.locator('#videoModal')).not.toContainClass('visible');
await expect(page.locator('#videoModal')).not.toContainClass('open'); // auto-retries up to timeout

// Close via Escape key
await page.keyboard.press('Escape');
await expect(page.locator('#videoModal')).not.toContainClass('open');

// Iframe src cleared after .open is removed (inside the 350ms setTimeout)
const src = await page.locator('#videoModalFrame').getAttribute('src');
expect(src).toBeFalsy();
```

### Anti-Patterns to Avoid
- **Hardcoding slide count as 17:** The HTML has 18 slides. Use runtime evaluation of `slides.length` or assert counter text dynamically.
- **Calling goToSlide() in rapid succession:** `isTransitioning` blocks calls for 800ms. Chain navigations with waits or use counter-text assertion to confirm slide changed.
- **Asserting `.slide-dot::before` CSS via toHaveCSS():** Playwright's `toHaveCSS()` does not support pseudo-elements. Use `page.evaluate()` with `getComputedStyle(el, '::before')`.
- **Using `fullyParallel: true` with a single server:** Workers: 1 is locked. Parallel tests would cause race conditions on shared server state.
- **Not waiting for DOM to be ready after page.goto():** The app calls `init()` on DOMContentLoaded which builds all slide HTML dynamically. Wait for `.slide.active` before any test interactions.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Device emulation | Custom viewport + UA strings | `devices['iPhone 14']` / `devices['Pixel 5']` | Playwright registry includes correct UA, viewport, deviceScaleFactor, hasTouch, isMobile |
| Auto-retry on CSS assertions | Manual polling loop | `toHaveCSS()` / `toContainClass()` | Built-in auto-retry with timeout, cleaner failure messages |
| Server management | bash script to start/stop server | `webServer` config | Playwright handles lifecycle, port conflict detection, and teardown |
| Test state isolation | Manual JS state reset | `test.beforeEach(() => page.goto('/'))` | Fresh navigation resets all JS state (current=0, slides rebuilt by init()) |

**Key insight:** For a vanilla JS app with global state, a fresh `page.goto('/')` in `beforeEach` is the simplest and most reliable state reset. No cleanup hooks needed — `init()` fires on every page load and rebuilds everything.

---

## Common Pitfalls

### Pitfall 1: Slide Count Discrepancy (17 vs 18)
**What goes wrong:** Tests assert `slides.length === 17` or counter text `'01 / 17'` — tests fail immediately
**Why it happens:** CONTEXT.md states "17 slides" but HTML `buildSlides()` returns 18 template strings
**How to avoid:** Read actual count at runtime; assert last-slide counter as `'18 / 18'` not `'17 / 17'`
**Warning signs:** Counter shows "18" but test expects "17"

### Pitfall 2: isTransitioning Silently Blocking Navigation
**What goes wrong:** Two rapid navigation calls — second is silently ignored, test asserts wrong slide
**Why it happens:** `goToSlide()` returns early if `isTransitioning` is true; no error is thrown
**How to avoid:** Wait 850ms between navigation actions, or assert counter text change before proceeding
**Warning signs:** Test clicking forward multiple times lands on unexpected slide number

### Pitfall 3: Modal on Voices Slide May Require Scroll
**What goes wrong:** `.convo-thumb` click fails because element is below viewport fold on mobile
**Why it happens:** Voices slide (index 13) has `.scroll-content` — thumbnails may be off-screen on small viewports
**How to avoid:** Use `locator.scrollIntoViewIfNeeded()` before clicking; or open modal via `page.evaluate(() => openVideoModal(...))` for setup
**Warning signs:** ElementNotVisible or timeout on `.convo-thumb` click in mobile tests

### Pitfall 4: DOMContentLoaded Dependency
**What goes wrong:** Tests try to interact with `.slide.active` before `init()` has run and built slide HTML
**Why it happens:** `buildSlides()` is called inside `init()` which fires on DOMContentLoaded — the DOM has no `.slide` elements before that runs
**How to avoid:** Add `await page.waitForSelector('.slide.active')` after every `page.goto('/')`
**Warning signs:** Locator `.slide.active` times out immediately on first interaction

### Pitfall 5: ::before Pseudo-Element CSS Not Accessible via toHaveCSS()
**What goes wrong:** Asserting `.slide-dot` height doesn't test the `::before` touch target
**Why it happens:** The 44px touch target is on `.slide-dot::before`; Playwright's `toHaveCSS()` cannot target pseudo-elements
**How to avoid:** Use `page.evaluate()` with `getComputedStyle(element, '::before')` to read pseudo-element styles
**Warning signs:** Test passes but real touch target could be smaller than the assertion implies

### Pitfall 6: python3 http.server Port 8080 Already in Use
**What goes wrong:** webServer command fails to start — port occupied from Phase 1 manual testing
**Why it happens:** python3 server from a previous terminal session still running
**How to avoid:** `reuseExistingServer: !process.env.CI` allows reuse of an existing server locally — Playwright will detect and use it rather than failing
**Warning signs:** "Error: listen EADDRINUSE" in stderr; `reuseExistingServer: true` suppresses this locally

### Pitfall 7: Device Viewport Dimensions Differ from CONTEXT.md
**What goes wrong:** Test manually overrides viewport to match CONTEXT.md values (390x844, 393x851) — breaks device emulation by overriding correct Playwright registry values
**Why it happens:** CONTEXT.md listed different dimensions than what Playwright's registry contains
**How to avoid:** Spread `devices['iPhone 14']` and `devices['Pixel 5']` without overriding viewport
**Warning signs:** Tests using manually specified viewports instead of the device spread

---

## Code Examples

Verified patterns from official sources and HTML source analysis:

### Full playwright.config.ts
```typescript
// Source: Context7 /microsoft/playwright webServer docs
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  retries: 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  webServer: {
    command: 'python3 -m http.server 8080',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  use: {
    baseURL: 'http://localhost:8080/wolfond-report-2024-2026.html',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'mobile-iphone14',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'mobile-pixel5',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
```

### navigation.spec.ts skeleton
```typescript
// Source: Context7 /microsoft/playwright keyboard + locator docs
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.slide.active');
  });

  test('ArrowRight advances slide', async ({ page }) => {
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#slideCounter')).toHaveText('02 / 18');
    const current = await page.evaluate(() => (window as any).current);
    expect(current).toBe(1);
  });

  test('dot click navigates to target slide', async ({ page }) => {
    await page.locator('.slide-dot').nth(4).click();
    await expect(page.locator('#slideCounter')).toHaveText('05 / 18');
  });

  test('all slides reachable — forward traverse to last', async ({ page }) => {
    const total = await page.evaluate(() => (window as any).slides.length);
    for (let i = 1; i < total; i++) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(850);
    }
    const current = await page.evaluate(() => (window as any).current);
    expect(current).toBe(total - 1);
  });
});
```

### mobile-viewport.spec.ts skeleton
```typescript
// Source: Context7 /microsoft/playwright toHaveCSS + HTML source
import { test, expect } from '@playwright/test';

test.describe('Mobile viewport', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.slide.active');
  });

  test('active slide has touch-action: pan-y', async ({ page }) => {
    await expect(page.locator('.slide.active')).toHaveCSS('touch-action', 'pan-y');
  });

  test('active slide has overscroll-behavior-x: contain', async ({ page }) => {
    await expect(page.locator('.slide.active')).toHaveCSS('overscroll-behavior-x', 'contain');
  });

  test('nav dot before pseudo-element touch target is >= 44px', async ({ page }) => {
    const height = await page.evaluate(() => {
      const dot = document.querySelector('.slide-dot');
      return parseFloat(getComputedStyle(dot!, '::before').height);
    });
    expect(height).toBeGreaterThanOrEqual(44);
  });

  test('no horizontal overflow on active slide', async ({ page }) => {
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
  });
});
```

### video-modal.spec.ts skeleton
```typescript
// Source: HTML source openVideoModal/closeVideoModal timing analysis
import { test, expect } from '@playwright/test';

test.describe('Video modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.slide.active');
    // Navigate to Voices slide (index 13 — CONVO_SLIDE_INDEX)
    await page.evaluate(() => (window as any).goToSlide(13));
    await page.waitForTimeout(850);
  });

  test('modal opens on convo-thumb click', async ({ page }) => {
    await page.locator('.convo-thumb').first().scrollIntoViewIfNeeded();
    await page.locator('.convo-thumb').first().click();
    await expect(page.locator('#videoModal')).toContainClass('open');
    await expect(page.locator('#videoModal')).toContainClass('visible');
  });

  test('modal closes via close button and clears iframe src', async ({ page }) => {
    await page.evaluate(() => (window as any).openVideoModal('1169672887', 'Test'));
    await expect(page.locator('#videoModal')).toContainClass('visible');
    await page.locator('.video-modal-close').click();
    await expect(page.locator('#videoModal')).not.toContainClass('visible');
    await expect(page.locator('#videoModal')).not.toContainClass('open');
    const src = await page.locator('#videoModalFrame').getAttribute('src');
    expect(src).toBeFalsy();
  });

  test('modal closes via Escape key', async ({ page }) => {
    await page.evaluate(() => (window as any).openVideoModal('1169672887', 'Test'));
    await expect(page.locator('#videoModal')).toContainClass('visible');
    await page.keyboard.press('Escape');
    await expect(page.locator('#videoModal')).not.toContainClass('open');
  });
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `page.$eval()` / `page.$$eval()` | `page.evaluate()` + `page.locator()` | Playwright v1.14+ | `$eval` is deprecated; locators have auto-retry |
| `page.waitForSelector()` for assertions | `expect(locator).toBeVisible()` | Playwright v1.18+ | Web-first assertions auto-retry; no manual polling |
| `page.type()` for keyboard input | `page.keyboard.press()` / `locator.press()` | Playwright v1.14+ | Direct key simulation without typing into inputs |
| Per-file `test.use({ device })` | `projects` in config with device spread | Playwright v1.10+ | Cleaner multi-device config; project-level scoping |

**Deprecated/outdated:**
- `page.$()` / `page.$$()`: Use `page.locator()` instead — these are kept for backwards compat only
- `page.waitForTimeout()` as primary assertion strategy: Acceptable only for transition guards; use web-first assertions for everything else

---

## Open Questions

1. **Actual slide count: 17 vs 18**
   - What we know: `buildSlides()` returns 18 template strings; CONTEXT.md says 17
   - What's unclear: Whether a slide was added after CONTEXT.md was written, or it was a counting error
   - Recommendation: Tests must read `slides.length` at runtime. Planner should note this discrepancy and confirm with user if needed — but tests should handle whatever the actual count is.

2. **Device viewport dimensions differ from CONTEXT.md**
   - What we know: CONTEXT.md says iPhone 14 is 390x844 and Pixel 5 is 393x851; Playwright v1.58.2 registry shows iPhone 14 as 390x664 and Pixel 5 as 393x727
   - What's unclear: Whether CONTEXT.md used a different source or had typos
   - Recommendation: Use `...devices['iPhone 14']` and `...devices['Pixel 5']` from the registry without viewport override. The device objects include correct UA, isMobile, hasTouch — overriding viewport would break emulation fidelity.

3. **Project-to-spec-file scoping strategy**
   - What we know: mobile-viewport.spec.ts should only run on mobile projects; navigation and video-modal can run on desktop-chromium; desktop-regression.spec.ts runs only on desktop-chromium
   - Recommendation: Use `testMatch` per project in `playwright.config.ts` OR check `isMobile` inside specs with `test.skip(!isMobile, 'desktop only')`. The `testMatch` approach is cleaner for project-level scoping.

---

## Validation Architecture

Note: `workflow.nyquist_validation` is not present in `.planning/config.json`. This section is included because Phase 2 IS the test infrastructure — it creates its own validation layer.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | @playwright/test 1.58.2 |
| Config file | `playwright.config.ts` — Wave 0 creates this |
| Quick run command | `npx playwright test --project=desktop-chromium tests/navigation.spec.ts` |
| Full suite command | `npx playwright test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TEST-01 | webServer serves HTML, tests run without manual setup | infrastructure | `npx playwright test --project=desktop-chromium` | Wave 0 |
| TEST-02 | Keyboard/dot/arrow navigation all advance/retreat slides | e2e | `npx playwright test tests/navigation.spec.ts` | Wave 0 |
| TEST-03 | Mobile viewport layout on iPhone 14 + Pixel 5 | e2e | `npx playwright test tests/mobile-viewport.spec.ts` | Wave 0 |
| TEST-04 | Video modal open/close/Escape | e2e | `npx playwright test tests/video-modal.spec.ts` | Wave 0 |
| TEST-05 | Desktop regression: navigation + layout unchanged | e2e | `npx playwright test tests/desktop-regression.spec.ts` | Wave 0 |

### Wave 0 Gaps (all green-field — nothing exists yet)
- [ ] `package.json` — `npm init -y`
- [ ] `playwright.config.ts` — full config with webServer + 3 projects
- [ ] `tests/navigation.spec.ts`
- [ ] `tests/mobile-viewport.spec.ts`
- [ ] `tests/video-modal.spec.ts`
- [ ] `tests/desktop-regression.spec.ts`
- [ ] `.gitignore` — add `node_modules/`, `test-results/`, `playwright-report/`
- [ ] Browser install: `npx playwright install --with-deps chromium webkit`

---

## Sources

### Primary (HIGH confidence)
- `/microsoft/playwright` via Context7 — webServer config, device emulation, toHaveCSS, toContainClass, keyboard press API
- `https://raw.githubusercontent.com/microsoft/playwright/v1.58.2/packages/playwright-core/src/server/deviceDescriptorsSource.json` — confirmed `devices['iPhone 14']` (390x664) and `devices['Pixel 5']` (393x727) are valid in v1.58.2
- `/Users/jcafazzo/CODING/TheWolfondChair.ca/wolfond-report-2024-2026.html` (direct read) — confirmed 18 slides, 800ms isTransitioning timeout, 350ms closeVideoModal timeout, CONVO_SLIDE_INDEX=13, global functions, DOM selectors

### Secondary (MEDIUM confidence)
- `npm view @playwright/test version` output — confirmed 1.58.2 is current latest

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — confirmed via npm registry and Context7
- Architecture: HIGH — all patterns verified against official Playwright docs and HTML source
- Pitfalls: HIGH — slide count discrepancy and transition timing verified directly in HTML source; pseudo-element limitation verified in Playwright docs
- Device names and viewports: HIGH — verified against Playwright v1.58.2 device descriptor source file on GitHub

**Research date:** 2026-03-02
**Valid until:** 2026-04-02 (Playwright releases frequently; re-verify version if delayed significantly)

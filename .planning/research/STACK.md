# Stack Research

**Domain:** Mobile optimization + E2E testing for a vanilla HTML/CSS/JS static slide presentation
**Researched:** 2026-03-02
**Confidence:** HIGH (Playwright: official docs verified; CSS units: caniuse verified; touch API: MDN verified)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Playwright | 1.58 (latest stable) | E2E test runner + mobile viewport emulation | Industry standard for browser automation; has built-in device descriptors for iPhone/Android, native touch emulation, screenshot comparison via pixelmatch, and a `webServer` config that auto-launches a local static server before tests. No alternatives are as complete for this use case. |
| `serve` (Vercel) | 14.2.5 | Local static file server for Playwright's `webServer` | Zero-config, works with `npx` (no global install), used by Playwright's own docs as the canonical static-server recommendation. One line in `playwright.config.js` covers CI and local dev. |
| CSS `dvh` / `svh` / `lvh` | — (native CSS, no library) | Viewport height that accounts for mobile browser chrome | Baseline widely available since June 2025 (Chrome 108+, Safari 15.4+, Firefox 101+). The existing `100dvh` usage is correct for modern targets; the fix is to add the `100vh` fallback before it — not to remove `dvh`. |
| CSS `touch-action` | — (native CSS, no library) | Declare browser pan/scroll intent before JS events fire | Widely available since September 2019 (Baseline). Setting `touch-action: pan-y` on slides tells the browser to handle vertical scroll natively and lets JS handle horizontal swipe. This is a CSS-only hint that prevents the browser from blocking on whether to scroll or not. |

### Supporting Libraries (Dev-Only)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@playwright/test` | 1.58 | The actual Playwright test package | Always — this is the test runner. Install as devDependency only; never in production. |
| `pixelmatch` | bundled with Playwright | Screenshot pixel comparison | Already included by Playwright's `toHaveScreenshot()`. Do NOT install separately. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `playwright.config.js` | Central config for browsers, devices, webServer, baseURL | Use JavaScript (not TypeScript) — this project has no build step and no TS compilation. |
| Playwright HTML Reporter | Test result reporting with traces and screenshots | Built-in; no install needed. Enable with `reporter: 'html'` in config. |
| `npx playwright show-report` | View test report locally after a run | Built-in Playwright command. |

---

## Installation

This project has no `package.json`. Creating one for test tooling only is correct — the site itself still ships zero JS dependencies.

```bash
# Initialize a package.json (tests only — site stays build-free)
npm init -y

# Install Playwright as a dev dependency
npm install -D @playwright/test

# Install browser binaries (Chromium, Firefox, WebKit — all three needed for mobile WebKit coverage)
npx playwright install

# Install browser system dependencies (needed on CI/Linux)
npx playwright install-deps
```

No other npm installs are needed. `serve` is invoked via `npx` in `playwright.config.js` — no install required.

---

## Configuration

### playwright.config.js (complete, ready to adapt)

```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',

  // Start a local static server before tests run
  webServer: {
    command: 'npx serve . --listen 3000 --no-clipboard',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 10000,
  },

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Desktop — regression protection
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Desktop Safari',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile — the primary targets for this milestone
    {
      name: 'iPhone 13',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'iPhone 13 landscape',
      use: { ...devices['iPhone 13 landscape'] },
    },
    {
      name: 'Pixel 7',
      use: { ...devices['Pixel 7'] },
    },
  ],

  // Global screenshot comparison tolerance
  expect: {
    toHaveScreenshot: { maxDiffPixels: 50 },
  },
});
```

### Key config decisions

- **`npx serve . --listen 3000`** — Serves from the repo root so `wolfond-report-2024-2026.html` is accessible at `http://localhost:3000/wolfond-report-2024-2026.html`. The `--no-clipboard` flag prevents serve from trying to copy the URL (fails on CI).
- **`reuseExistingServer: !process.env.CI`** — Skips starting a new server if one is already running locally; always starts fresh on CI.
- **`devices['iPhone 13']`** — Built-in descriptor sets viewport (390x844), userAgent, hasTouch: true, deviceScaleFactor: 3. Touch events work in Playwright tests with this descriptor.
- **`maxDiffPixels: 50`** — Small tolerance for anti-aliasing differences across platforms. Start at 50; increase if font rendering causes noise.
- **No TypeScript** — Config uses `.js` not `.ts`. No `tsconfig.json` needed. Adding TS would require a build step that contradicts the project's zero-build constraint.

---

## CSS Viewport Height Fix

The existing code uses `100dvh` which is correct for modern targets. The required fix is adding the fallback before it.

**Current (broken on older mobile):**
```css
.slide { height: 100dvh; }
```

**Fixed pattern:**
```css
.slide {
  height: 100vh;    /* Fallback: treated as lvh (large viewport) on mobile — acceptable */
  height: 100dvh;   /* Override: dynamic viewport on supporting browsers (Chrome 108+, Safari 15.4+, Firefox 101+) */
}
```

**Why `svh` is not the right choice here:** `svh` (small viewport = browser chrome visible) would make slides smaller than the visible area when the address bar is hidden, wasting screen space. `dvh` animates with the address bar, which is the correct behavior for a full-screen slide experience.

**Confidence:** HIGH — caniuse.com confirms Baseline widely available since June 2025.

---

## Touch Event Handling Pattern

The current implementation has swipe detection but likely conflicts with native scroll on content-heavy slides. The fix uses a two-layer approach: CSS declares intent, JS enforces logic.

### Layer 1: CSS `touch-action` declaration (add to slide container)

```css
.slide-container {
  touch-action: pan-y;   /* Browser handles vertical scroll; JS handles horizontal swipe */
}

/* For slides that should NOT scroll vertically at all (e.g., full-screen visual slides) */
.slide-container.no-scroll {
  touch-action: none;    /* JS owns all touch — use only when slide has no scrollable content */
}
```

**Why `pan-y` not `none`:** Publication lists and other content-heavy slides need real vertical scrolling. `none` disables browser scroll entirely. `pan-y` tells the browser "handle vertical, I'll handle horizontal" — matching the swipe-to-advance intent. `touch-action` is a CSS hint that fires before JS events, so no event timing issues.

### Layer 2: JS passive listener pattern

```javascript
// CORRECT: passive: true on touchstart — browser doesn't wait for JS before starting scroll
element.addEventListener('touchstart', handleTouchStart, { passive: true });

// CORRECT: passive: false on touchmove — allows preventDefault() to cancel scroll during swipe
element.addEventListener('touchmove', handleTouchMove, { passive: false });

// CORRECT: passive: true on touchend — no need to cancel anything here
element.addEventListener('touchend', handleTouchEnd, { passive: true });
```

**Why passive matters:** Chrome and Safari moved touch listeners to passive-by-default in 2017. If the existing code calls `addEventListener('touchmove', handler)` without `{ passive: false }`, calling `preventDefault()` inside the handler is silently ignored — scroll happens anyway. Setting `passive: false` explicitly on `touchmove` restores the ability to cancel scroll during a horizontal swipe gesture.

**Swipe vs scroll discrimination threshold:** Track touch delta on `touchmove`. Only suppress scroll and advance slide if `Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30`. This prevents vertical scroll gestures from accidentally triggering slide advance.

**Confidence:** HIGH — MDN and Chrome for Developers docs confirm passive listener behavior.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Playwright | Cypress | Cypress is better for complex React/Vue app component testing. For a static HTML file, Playwright's `webServer` + device emulation is simpler and requires fewer setup steps. |
| Playwright | Selenium/WebDriver | Only if you need real-device browser testing farms (e.g., Sauce Labs) which this project doesn't need. |
| `npx serve` | `python -m http.server` | Python server is zero-install if Node.js isn't available. Acceptable fallback if `serve` causes issues, but needs port tuning (`python -m http.server 3000`). |
| `touch-action: pan-y` | Hammer.js | Hammer.js is a gesture library (a framework addition). This project is vanilla JS only. `touch-action` + native touch events achieves the same without any dependency. |
| Native `toHaveScreenshot()` | Percy / Chromatic | Percy/Chromatic add SaaS costs and require API keys. Playwright's built-in pixelmatch comparison is sufficient for this scope. |
| `100dvh` with `100vh` fallback | JS-computed height via `window.innerHeight` | JS height computation via `window.innerHeight` requires resize event listeners and `setProperty()` calls — more moving parts. The CSS fallback pattern is simpler and robust. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Hammer.js | External dependency, 7.6KB, solves a problem that `touch-action` + native events already solve | Native `touchstart`/`touchmove`/`touchend` + `touch-action` CSS |
| TypeScript config for Playwright | Requires `tsconfig.json` and a build step; contradicts the project's zero-build constraint | Plain `playwright.config.js` with `.js` test files |
| `npx playwright install --with-deps` in one step | Conflates browser binaries and system deps — separate steps are clearer in CI | `npx playwright install` then `npx playwright install-deps` |
| Vitest / Jest for this testing scope | Unit test frameworks test JS functions in isolation; Playwright covers real browser behavior including scroll, touch, and viewport — which is exactly what's broken | Playwright E2E only |
| CSS `100svh` for slide height | `svh` (small viewport = chrome visible) makes slides shorter than visible area when address bar hides. Wrong mental model. | `100dvh` with `100vh` fallback |
| React / Vue / any framework | Out of scope per project constraints. Adding a framework would require a build step and rewrite. | Keep all fixes in the existing monolithic HTML file |
| Global `package.json` dependencies | The site itself ships no JS dependencies and must stay that way | All npm packages are `devDependencies` only; `package.json` is for test tooling, not the site |

---

## Version Compatibility

| Package | Node.js Requirement | Notes |
|---------|---------------------|-------|
| `@playwright/test@1.58` | Node 20.x, 22.x, or 24.x | Node v25.6.0 is on this machine — but v25 is an odd (non-LTS) release. Playwright supports it but Node 22.x LTS is the safest choice for CI. |
| `serve@14.2.5` | Node 14+ | No conflict with Playwright's Node requirement. |

**Note on Node v25:** The dev machine runs Node v25.6.0. Playwright 1.58 works with it, but GitHub Actions should pin to `node-version: '22'` (LTS) for reproducibility.

---

## Sources

- [Playwright Release Notes](https://playwright.dev/docs/release-notes) — Confirmed version 1.58 is latest stable; browser versions bundled (Chromium 145, Firefox 146.1, WebKit 26.0). HIGH confidence.
- [Playwright Emulation Docs](https://playwright.dev/docs/emulation) — Confirmed `devices['iPhone 13']` descriptor, `hasTouch`, viewport override pattern. HIGH confidence.
- [Playwright Web Server Docs](https://playwright.dev/docs/test-webserver) — Confirmed `webServer.command`, `url`, `reuseExistingServer` config shape. HIGH confidence.
- [Playwright Snapshot Docs](https://playwright.dev/docs/test-snapshots) — Confirmed `toHaveScreenshot()`, `maxDiffPixels`, `--update-snapshots`. HIGH confidence.
- [caniuse.com — Viewport unit variants](https://caniuse.com/viewport-unit-variants) — `dvh`/`svh`/`lvh` Baseline widely available June 2025 (Chrome 108+, Safari 15.4+, Firefox 101+). HIGH confidence.
- [MDN — touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action) — `pan-y`, `none` values; Baseline widely available since September 2019. HIGH confidence.
- [MDN — Touch events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events) — Passive listener pattern, `touchstart`/`touchmove`/`touchend` APIs. HIGH confidence.
- [Chrome for Developers — Scrolling intervention](https://developer.chrome.com/blog/scrolling-intervention) — Passive listeners default behavior, `{ passive: false }` required for `preventDefault()` on `touchmove`. HIGH confidence.
- [serve npm package](https://www.npmjs.com/package/serve) — Confirmed version 14.2.5, Vercel-maintained, zero-config static server. MEDIUM confidence (npm registry).
- [Playwright device descriptors source](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/deviceDescriptorsSource.json) — Confirmed iPhone 13 (390x844), Pixel 7 (412x915) are in the built-in registry. HIGH confidence.

---

*Stack research for: Mobile optimization + Playwright E2E — Wolfond Chair Digital Health Report*
*Researched: 2026-03-02*

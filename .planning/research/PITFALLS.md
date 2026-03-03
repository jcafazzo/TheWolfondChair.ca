# Pitfalls Research

**Domain:** Mobile optimization of vanilla HTML/CSS/JS slide deck + Playwright E2E testing
**Researched:** 2026-03-02
**Confidence:** HIGH (core technical pitfalls verified against MDN, Playwright docs, official browser docs)

---

## Critical Pitfalls

### Pitfall 1: Touch Scroll Detection Checks Slide-Level Scroll Capacity, Not User's Touch Target

**What goes wrong:**
The current touch handler checks `scrollEl.scrollHeight > scrollEl.clientHeight + 4` to decide whether to suppress vertical swipe-to-advance. This checks whether the slide *has* scrollable content — not whether the user's finger landed *inside* that content. A user touching a heading above the `.scroll-content` block on a content-heavy slide will have vertical swipes silently eaten (no advance, no scroll), because the slide reports "has a scroll area."

**Why it happens:**
The logic was written defensively to prevent accidental slide advances on content slides. It conflates "slide contains a scrollable area" with "user intends to scroll that area." These are different conditions.

**How to avoid:**
On `touchstart`, record `e.target` and check whether it is contained within (or is) the `.scroll-content` element using `scrollTarget = e.target.closest('.scroll-content')`. On `touchend`, use `scrollTarget` rather than re-querying the slide. Only suppress vertical swipe if the user touched *inside* the scroll area.

```javascript
let touchStartY = 0, touchStartX = 0, touchScrollTarget = null;
document.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
  touchStartX = e.touches[0].clientX;
  touchScrollTarget = e.target.closest('.scroll-content');
}, { passive: true });
document.addEventListener('touchend', (e) => {
  const dy = touchStartY - e.changedTouches[0].clientY;
  const dx = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) nextSlide(); else prevSlide();
    return;
  }
  if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx)) {
    if (touchScrollTarget && touchScrollTarget.scrollHeight > touchScrollTarget.clientHeight + 4) return;
    if (dy > 0) nextSlide(); else prevSlide();
  }
});
```

**Warning signs:**
- Vertical swipes on content-heavy slides (letter, programs, wearables, publications) do nothing — no scroll, no advance
- Users report the deck feels "stuck" on certain slides
- Desktop wheel navigation works fine but touch does not

**Phase to address:**
Mobile touch fix phase (Phase 1 of mobile milestone)

---

### Pitfall 2: `100dvh` Layout Shift When iOS Safari Address Bar Hides/Shows

**What goes wrong:**
The codebase uses `height: 100dvh` on `body`, `.deck`, and `.slide-inner`. The `dvh` (dynamic viewport height) unit updates dynamically as the browser address bar appears and disappears. This triggers a layout reflow every time the user scrolls enough to hide or show the address bar — slides visibly resize mid-interaction.

**Why it happens:**
`dvh` was designed to always match the current visible height. This is correct semantics but creates layout instability for fixed-size slide decks where you want a stable full-screen layout, not one that continuously resizes.

**How to avoid:**
Use `100svh` (small viewport height — assumes address bar is always visible, stable size) with a `100vh` fallback for browsers that don't support the new viewport units. Do NOT use `100dvh` for a slide deck. The tradeoff: `svh` leaves a small gap at the bottom when the address bar hides, but this is preferable to layout shifts that disrupt reading.

```css
/* Preferred: stable, no layout shift */
body {
  height: 100vh;         /* fallback for browsers without svh/dvh support */
  height: 100svh;        /* stable: assumes address bar always visible */
}
.deck {
  height: 100vh;
  height: 100svh;
}
```

Browser support for `svh`/`dvh`/`lvh`: Chrome 108+, Firefox 101+, Safari 15.4+. The `100vh` fallback covers older browsers adequately (Medium confidence — confirmed via MDN and multiple community sources).

**Warning signs:**
- Slide deck visibly "jumps" or resizes after the first scroll gesture on iOS Safari
- Content at the bottom of a slide appears then disappears as address bar state changes
- `Unexpected layout shift` in Chrome DevTools Lighthouse

**Phase to address:**
Viewport height fix phase (Phase 1 of mobile milestone)

---

### Pitfall 3: Passive Event Listener Constraint Blocking `preventDefault` on Touch

**What goes wrong:**
Chrome 56+ made `touchstart` and `touchmove` listeners passive by default. If the code registers a `touchmove` listener without `{ passive: false }`, calling `e.preventDefault()` inside it silently does nothing and logs a console warning: `Unable to preventDefault inside passive event listener due to target being treated as passive`. Scroll is not blocked when needed.

**Why it happens:**
The current code correctly sets `{ passive: true }` on `touchstart` (good for performance). However, if future debugging introduces a `touchmove` listener to intercept horizontal scroll-during-swipe, or to lock scroll during slide transitions, it will silently fail unless `{ passive: false }` is explicitly set — and setting it globally causes a performance warning in Lighthouse.

**How to avoid:**
- Never add `touchmove` event listeners without explicitly deciding passive mode
- For scroll-lock during slide transitions: set `touch-action: none` on `.deck` via JavaScript during the transition, then restore it — this is more reliable than `preventDefault`
- If `{ passive: false }` is needed, scope it to the smallest possible element, not `document`

```css
/* CSS-based scroll lock during slide transition — no passive conflict */
.deck.transitioning {
  touch-action: none;
}
```

**Warning signs:**
- Console warning: `Unable to preventDefault inside passive event listener`
- Users can scroll the page while a slide transition is in progress
- Horizontal browser back-gesture triggers slide navigations on iOS Safari

**Phase to address:**
Mobile touch fix phase (Phase 1 of mobile milestone)

---

### Pitfall 4: Playwright Mobile Emulation Does Not Test Real iOS Safari Rendering

**What goes wrong:**
Playwright's mobile emulation sets viewport dimensions, `userAgent`, `hasTouch: true`, and `isMobile: true` — but it runs on Chromium, Firefox, or WebKit (desktop engine), not the actual iOS Safari WebKit build. The `dvh`/`svh` viewport unit behavior, address bar interaction, scroll momentum physics, and rubber-band scrolling of real iOS Safari are not replicated. Tests pass in Playwright but fail on real iPhone.

**Why it happens:**
Playwright emulates device characteristics, not the rendering engine. iOS Safari runs only on physical iOS devices or Apple's own Simulator (which requires macOS). There is no Linux-native iOS Safari runtime.

**How to avoid:**
- Use Playwright emulation to catch layout-level regressions (element visibility, correct viewport dimensions, touch navigation triggering correct slide changes)
- Do NOT rely on Playwright WebKit to validate iOS-specific CSS behaviors like `dvh` layout stability, Safari scroll momentum, or the bottom safe-area inset
- Supplement with at least one manual verification pass on a physical iOS device or iOS Simulator after viewport height changes
- Document in the test suite which behaviors are emulation-verified vs. device-verified

**Warning signs:**
- Tests pass but site breaks on real iPhone
- `dvh`/`svh` viewport behavior looks correct in Playwright but not on device
- Safe-area inset (`env(safe-area-inset-bottom)`) is not respected in Playwright emulation

**Phase to address:**
Playwright setup phase (Phase 2 of mobile milestone); note in test documentation

---

### Pitfall 5: `isTrusted: false` on Dispatched Touch Events Breaks Swipe Detection

**What goes wrong:**
Playwright's `locator.dispatchEvent()` dispatches synthetic touch events with `isTrusted: false`. If the swipe detection code checks `event.isTrusted` (a common security pattern to distinguish real user input from programmatic events), all Playwright swipe tests will fail to trigger slide navigation — even if the touch coordinates are correct.

**Why it happens:**
The current code does not check `isTrusted` (verified in codebase), so this is not a present problem. However, if `isTrusted` checking is added as a security measure during the mobile fix phase (a reasonable-seeming defense against programmatic navigation triggers), it will silently break all Playwright touch tests.

**How to avoid:**
Do not add `isTrusted` checks to the touch handler. The threat model for a static academic slide deck does not require this guard. If touch event security validation is ever needed, use a test-environment flag instead of `isTrusted`.

**Warning signs:**
- All Playwright swipe tests fail with `slide index did not change`
- Desktop keyboard navigation tests pass but all touch tests fail
- Adding `console.log(e.isTrusted)` inside the touch handler logs `false` during test runs

**Phase to address:**
Playwright setup phase (Phase 2 of mobile milestone) — verify `isTrusted` is not checked before writing swipe tests

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Serving static HTML via `file://` URL in Playwright | No server setup required | Mobile emulation may misbehave; CORS issues prevent some browser features; `baseURL` config doesn't work | Never — always use `npx serve` or `python -m http.server` |
| Using CSS class selectors in Playwright tests | Fast to write | Tests break when CSS classes change for unrelated reasons | Only for elements with no accessible role or data-testid |
| Taking visual snapshot baselines on macOS and running comparisons on Linux CI | Fast local iteration | Font rendering, anti-aliasing differences cause false positives on every CI run | Never — establish baselines in the same environment where CI runs (use Docker or establish baselines on CI) |
| Skipping `{ passive: false }` declaration on `touchmove` listeners | No performance warning | `preventDefault` silently fails; scroll cannot be blocked during transitions | Never — always declare intent explicitly |
| Using `100dvh` for full-screen slide height | Layout fills screen precisely | Layout shifts on iOS Safari when address bar shows/hides | Never for a slide deck — use `100svh` with `100vh` fallback |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Playwright + static HTML file | Open via `file://` path | Run a local server (`npx serve .`) and use `http://localhost:PORT/wolfond-report-2024-2026.html` as `baseURL` — `file://` URLs don't support all browser features needed for mobile emulation |
| Playwright + mobile viewport | Only set `viewport` dimensions | Also set `hasTouch: true` and `isMobile: true` in the device config, or use `playwright.devices['iPhone 14']` which includes all three |
| Playwright + Vimeo iframes | Test that video modal opens | Vimeo iframes will fail to load in Playwright tests due to CORS/CSP on `localhost`; test that the modal element becomes visible and the iframe `src` is set, not that the video plays |
| Playwright + slide transitions | Immediately assert slide index after navigation | Slide transitions use CSS `opacity` and `transform` with 0.8s duration; assert after the transition completes using `waitForFunction` or `expect(locator).toBeVisible()` which waits for element state |
| Playwright + scroll-content slides | Simulate swipe on publications slide | The publications slide's `.scroll-content` is taller than the viewport; a vertical swipe gesture starting inside it will not advance the slide (correct behavior); tests must swipe *outside* the scroll area or use horizontal swipe |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| `setInterval` countdown timer running on mobile background tab | Battery drain; timer drifts on return from background | Use Page Visibility API (`document.addEventListener('visibilitychange')`) to pause/resume timer | Always on mobile — browsers throttle background tabs |
| Triggering layout reflow on every touch event | Jank during fast swipe sequences | Read `scrollHeight`/`clientHeight` once on slide entry, cache the value; don't query on every `touchmove` | Noticed first on low-end Android devices |
| CSS transitions on all slides simultaneously during navigation | GPU memory pressure | Ensure only `.active` and `.exiting` slides have transitions active; all others should have `transition: none` | Devices with < 2GB RAM |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Horizontal swipe advancing slides on content slides where user intended to scroll a thumbnail grid | User accidentally skips slides while browsing the conversations grid | Detect touch target on `touchstart`; if inside `.convo-video-grid` or `.convo-thumb`, suppress horizontal swipe navigation |
| No visual indication that `.scroll-content` areas are scrollable on mobile | Users don't know there is more content below | Add a subtle scroll indicator (fade-out gradient at bottom of `.scroll-content`) when `scrollHeight > clientHeight` |
| Touch targets smaller than 48x48px on navigation dots | Missed taps, users cannot navigate | Navigation dots must meet minimum 48x48px tap target — verify on mobile viewports specifically, not just desktop |
| Auto-advance timer resuming after user swipes | User swipes to a slide they want to read; auto-advance moves them away | Reset the 120-second timer on every user interaction (touch, keyboard, click); current implementation already does this, but verify it resets on touch events too |

---

## "Looks Done But Isn't" Checklist

- [ ] **Mobile swipe navigation:** Often tested left/right only — verify UP swipe does not advance slides on content slides (publications, letter, programs) when content is not fully scrolled
- [ ] **dvh fix:** Often just adding `100svh` — verify that the `100vh` fallback appears *before* `100svh` in the CSS declaration (cascade order matters: newer value must come after fallback)
- [ ] **Playwright mobile tests:** Often configured with just `viewport` — verify `hasTouch: true` is set; without it, touch events dispatched by Playwright will not fire `touchstart`/`touchend` on the element
- [ ] **Touch scroll on publications slide:** Content renders correctly — verify that the publications scroll area is actually scrollable on mobile (no `overflow: hidden` inherited from parent slide CSS `overflow-y: auto` on `.slide` elements)
- [ ] **Desktop regression:** Mobile CSS changes look fine on phone — run visual comparison at 1440px viewport to confirm desktop layout is not affected
- [ ] **Playwright static server:** Tests run locally — verify `webServer` config starts a real HTTP server; `file://` URLs cause silent failures with mobile emulation in some configurations

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| dvh → svh migration breaks layout on specific slide | LOW | Revert `svh` to `dvh` on the specific element; add JavaScript scroll-lock workaround for the layout shift on that slide only |
| Touch handler change breaks horizontal swipe | LOW | Roll back the `touchend` handler to the last known-good version (one function, no side effects) |
| Playwright visual snapshots become stale after CSS changes | MEDIUM | Delete all `.png` snapshot files in `__snapshots__/`; re-run tests with `--update-snapshots` flag to regenerate baselines |
| Desktop layout breaks after mobile CSS addition | MEDIUM | Check the most recently added media query; CSS without a `@media (max-width)` guard applies to all viewports; add explicit `@media (max-width: 768px)` guard |
| Playwright tests fail in CI due to font rendering differences | HIGH | Establish a Dockerfile with pinned Playwright version and browser binaries; generate all baselines inside Docker; run CI tests inside same Docker image |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Touch target vs. scroll area detection | Phase 1: Mobile touch fix | Manual test: vertical swipe on letter slide text area advances; vertical swipe inside scroll list does not |
| `100dvh` layout shift | Phase 1: Viewport height fix | Load site on iOS Safari; scroll to trigger address bar hide — slide must not resize |
| Passive event listener silent fail | Phase 1: Mobile touch fix | Check browser console for "Unable to preventDefault" warning during slide transitions |
| Playwright emulation ≠ real iOS Safari | Phase 2: Playwright setup | Add test suite comment noting device-only behaviors; run manual pass on iOS device after viewport changes |
| `isTrusted: false` breaking swipe tests | Phase 2: Playwright setup | Grep source for `isTrusted` before writing touch tests; confirm it is absent |
| `file://` URL in Playwright | Phase 2: Playwright setup | Verify `playwright.config.ts` uses `webServer` config with `npx serve` or equivalent |
| Visual snapshot environment drift | Phase 2: Playwright setup | Establish baselines on the same OS that CI uses; document in `README` |
| Desktop regression from mobile CSS | Phase 1 + Phase 2 | Playwright desktop viewport test runs as part of every test suite invocation |

---

## Sources

- MDN Web Docs — `touch-action` CSS property: https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action (HIGH confidence)
- Playwright official docs — Touch Events (legacy): https://playwright.dev/docs/touch-events (HIGH confidence)
- Playwright official docs — Emulation: https://playwright.dev/docs/emulation (HIGH confidence)
- Playwright official docs — Web Server config: https://playwright.dev/docs/test-webserver (HIGH confidence)
- MDN Web Docs — Touch Events: https://developer.mozilla.org/en-US/docs/Web/API/Touch_events (HIGH confidence)
- Chrome for Developers — Making touch scrolling fast by default (passive listeners): https://developers.google.com/web/updates/2017/01/scrolling-intervention (HIGH confidence)
- CSS viewport unit comparison (svh/dvh/lvh): https://medium.com/@tharunbalaji110/understanding-mobile-viewport-units-a-complete-guide-to-svh-lvh-and-dvh-0c905d96e21a (MEDIUM confidence — verified against MDN)
- Frontend.fyi — Fix for 100vh on mobile: https://www.frontend.fyi/tutorials/finally-a-fix-for-100vh-on-mobile (MEDIUM confidence)
- Better Stack — Playwright best practices and pitfalls: https://betterstack.com/community/guides/testing/playwright-best-practices/ (MEDIUM confidence)
- GitHub issue — Dispatching Touch events doesn't do anything (Playwright #35774): https://github.com/microsoft/playwright/issues/35774 (MEDIUM confidence)
- Codebase analysis — `wolfond-report-2024-2026.html` touch handler (lines 1232–1251): direct inspection (HIGH confidence)

---

*Pitfalls research for: Mobile optimization of vanilla HTML slide deck + Playwright E2E setup*
*Researched: 2026-03-02*

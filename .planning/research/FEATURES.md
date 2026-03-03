# Feature Research

**Domain:** Mobile optimization + E2E test coverage for slide-based HTML presentation
**Researched:** 2026-03-02
**Confidence:** HIGH (mobile CSS/viewport), HIGH (Playwright capabilities), MEDIUM (iOS Safari-specific behavior)

---

## Context

This is a subsequent milestone against an existing 17-slide static HTML presentation deployed to GitHub Pages. The site already has: keyboard/dot navigation, auto-advance timer, Vimeo video modal, touch swipe detection, responsive media queries, and CSS slide transitions. The goal is fixing mobile UX issues and adding Playwright E2E test coverage — not rebuilding.

Known issues from CONCERNS.md that drive this feature scope:
- `100dvh` used without `100vh` fallback (Issue #15)
- Touch scroll/swipe conflict on content-heavy slides (implied by Issue per PROJECT.md)
- No `touch-action` CSS discipline — browser doesn't know developer intent
- No `overscroll-behavior` — accidental slide advances when reaching scroll edges
- Zero E2E tests of any kind (Issue #14)
- `setInterval` countdown timer runs when tab is inactive — battery drain on mobile (Issue #11)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist on any mobile presentation. Missing these = broken UX.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Viewport height that doesn't jump when address bar shows/hides | Mobile browsers dynamically resize viewport — layout shifting during scroll is disorienting | LOW | Add `height: 100vh` fallback before `height: 100dvh`; `dvh` supported Safari 15.4+, Chrome 94+, Firefox 105+. No JS needed. |
| Touch targets at minimum 48x48px | iOS/Android both specify 44-48px minimum; users rage-tap small targets | LOW | Navigation dots and arrows need audit. Use `padding` to expand hit area without changing visual size. WCAG 2.5.8 requires 24px minimum; 48px is the safe target per Android/Material guidance. |
| No accidental slide advance when scrolling slide content | Users scrolling through long content (publications, team grid) should not trigger slide change | MEDIUM | Apply `touch-action: pan-y` on scrollable slide containers; this tells the browser to own vertical panning and not pass it to JavaScript swipe handlers. No iOS Safari compatibility issues with this value. |
| No accidental browser back/forward navigation from swipe | On iOS Safari and Android Chrome, horizontal overswipe can trigger browser history navigation | MEDIUM | Apply `overscroll-behavior-x: contain` on the slide container. NOTE: iOS Safari 16+ now supports this but older versions do not — need JS fallback using `touchmove` preventDefault for Safari < 16. |
| Touch navigation works (left/right swipe changes slides) | Users on mobile expect swipe-to-navigate — it already exists but may conflict with scrolling | MEDIUM | Existing swipe detection logic needs refinement: only trigger slide change if horizontal delta significantly exceeds vertical delta (direction threshold), and only on slides where the content does not need to scroll. |
| Slide layout is not broken on any of the 17 slides at mobile viewport | All content visible and usable on 375px–414px widths (iPhone SE to iPhone Pro Max) | MEDIUM | Existing breakpoints at 600px/700px/768px/900px need verification at 375px. The team grid and publication list are the highest-risk slides. |
| Modal close works on mobile (tap outside or X button) | Modal close is standard mobile UX; touch must work, not just click | LOW | Existing `closeVideoModal()` uses click events — verify touch events are also handled or that click events fire correctly on mobile (they do, with 300ms delay mitigated by `touch-action: manipulation`). |
| Body scroll locked when modal is open | If body scrolls while modal is open, the user loses context and the modal feels broken | LOW | Existing code should set `body overflow: hidden` on modal open — verify this is happening and that iOS Safari respects it (requires `-webkit-overflow-scrolling` workarounds on older iOS). |
| Auto-advance timer pauses when tab is not visible | Mobile browsers throttle timers aggressively; running setInterval when hidden wastes battery and causes desync | LOW | Use Page Visibility API (`document.visibilitychange`) to pause/resume the auto-advance timer. Already flagged as Issue #11. The fix is 5–10 lines of JS. |

### Differentiators (Competitive Advantage)

Features not universally expected, but that materially improve the mobile experience.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Visible auto-advance pause/play toggle | Academic users reviewing publications may want to stop auto-advance; currently no way to do this | LOW | Add a small pause/play icon button. Already flagged as Issue #12. HIGH value relative to LOW implementation cost — a single button with a state toggle. |
| `touch-action: manipulation` on all interactive elements | Eliminates the 300ms tap delay on iOS Safari 12 and earlier without needing `FastClick` or meta tags | LOW | Add `touch-action: manipulation` to all clickable elements (dots, arrows, video thumbnails, modal close). Pure CSS, no JS. Removes tap delay on legacy mobile browsers. |
| Scroll snap as enhanced fallback for slide navigation | CSS Scroll Snap provides native momentum-based slide transitions that feel truly native on mobile | HIGH | This is a significant architecture change — not recommended for this milestone given the constraint to keep the monolithic structure and not regress desktop. Flag for a future milestone. |
| Responsive image `srcset` for mobile | Mobile devices load the same large images as desktop — unnecessary bandwidth and slower LCP | MEDIUM | Add `srcset` with 2x/1x variants for team photos and slide background images. Issue #10 in CONCERNS.md. Out of scope for this milestone per PROJECT.md ("no performance optimization beyond mobile fixes") but note it as a quick win for next milestone. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Full gesture library (Hammer.js, etc.) | "Better touch support" sounds appealing | Adds external JS dependency to a zero-dependency static site; the existing swipe detection is sufficient and just needs tuning | Fix the existing swipe threshold logic and add `touch-action` CSS discipline |
| CSS Scroll Snap refactor for navigation | Feels "more native" and removes JS swipe detection entirely | Requires replacing the entire slide navigation engine — high regression risk for a site with 13+ global state variables and slide-specific behaviors (video loading, conversation autoplay). Out of scope for this milestone. | Tune existing swipe detection; defer Scroll Snap to a future architectural milestone |
| Real device testing in CI | Maximum confidence in cross-browser results | BrowserStack/Sauce Labs adds cost and CI complexity to a static GitHub Pages site with no CI pipeline yet | Playwright's WebKit engine covers iOS Safari behavior accurately enough for this use case; real device testing is a future concern if bugs are found post-launch |
| `position: fixed` full-page layout to prevent address bar reflow | Eliminates address bar layout shift completely | On iOS Safari, `position: fixed` combined with scroll inside the fixed element causes severe rendering bugs and scroll position loss; it is the source of the "decade-long iOS Safari problem" referenced in community research | Use `100dvh` with `100vh` fallback; let the address bar reflow naturally |
| Disabling zoom with `user-scalable=no` meta tag | Prevents pinch-to-zoom from interfering with slide swipes | This is an accessibility violation (WCAG 1.4.4); it also breaks the user's ability to read small text. iOS 10+ ignores this meta tag anyway. | Fix swipe threshold so zoom and swipe don't conflict; `touch-action: pan-y` on content areas is the correct approach |
| Full visual regression screenshot suite | Comprehensive layout verification | High maintenance burden for a static site — screenshot diffs are brittle to minor rendering differences across platforms; the effort outweighs the value at this stage | Cover critical layout states with a small set of Playwright `expect.toMatchSnapshot()` calls on the most complex slides (publications, team grid) |

---

## E2E Test Scenarios (Essential)

Playwright is the confirmed choice (per PROJECT.md Key Decisions). These are the test scenarios that must be covered, categorized by priority.

### P1: Must Have for This Milestone

These cover the stated requirements in PROJECT.md Active section.

| Scenario | What It Validates | Complexity | Notes |
|----------|-------------------|------------|-------|
| Desktop slide navigation via keyboard (ArrowRight, ArrowLeft, Space) | Keyboard nav works, slide index advances, counter updates | LOW | Standard Playwright keyboard simulation with `page.keyboard.press()`. Test all 17 slides forward, then reverse. |
| Desktop slide navigation via navigation dot clicks | Dot click jumps to correct slide, active dot updates | LOW | `locator.click()` on each dot, assert `active` class state and counter. |
| Desktop slide navigation via arrow button clicks | Previous/next arrows work | LOW | Standard click simulation. |
| Mobile viewport slide navigation via keyboard (regression check) | Keyboard nav not broken after mobile changes | LOW | Set viewport to 375x812, repeat keyboard nav test. Playwright `page.setViewportSize()`. |
| Mobile viewport: left-right swipe advances/retreats slides | Touch swipe triggers slide change | MEDIUM | Use Playwright `page.dispatchEvent()` with `touchstart`/`touchmove`/`touchend` sequence. Playwright's `Touchscreen.tap()` alone is insufficient for swipe — must manually dispatch touch events. |
| Mobile viewport: vertical scroll on publication slide does NOT advance slide | Touch scroll in scrollable content stays within slide | MEDIUM | Dispatch touch events with vertical movement vector on the publications slide; assert current slide index does not change. |
| Video modal opens and closes | Modal system works: open on click, close on X, close on Escape | LOW | `locator.click()` on a video thumbnail, assert modal has `open` class; click close button or press Escape, assert modal hidden. |
| All 17 slides render without JS errors | No uncaught exceptions during full navigation | LOW | Use `page.on('pageerror', ...)` listener; navigate through all slides and assert zero page errors. |
| Viewport height: no layout overflow on mobile viewports | Slides fill viewport correctly at 375x812 (iPhone 14) and 414x896 (iPhone 11) | LOW | Navigate to each slide, assert no horizontal overflow (scrollWidth === clientWidth) and no vertical content clipping on key slides. |

### P2: Should Have

| Scenario | What It Validates | Complexity | Notes |
|----------|-------------------|------------|-------|
| Auto-advance timer: timer increments and eventually advances slide | Auto-advance fires after timeout | MEDIUM | Use Playwright's `page.clock` API (introduced in Playwright 1.45) to mock timers rather than waiting 120 real seconds. Assert slide advances after mocked time elapses. |
| Auto-advance timer: pauses when tab is hidden | Page Visibility API fix works | MEDIUM | Use `page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))` to simulate tab hide; assert timer stops. Requires the Page Visibility API fix to be implemented first. |
| Touch target size: navigation dots and arrows meet 48px minimum | Tap targets are accessible | LOW | Query element computed styles, assert `offsetWidth` and `offsetHeight` >= 48px, or padding brings effective hit area to 48px. |
| Desktop regression: no existing behavior changed by mobile fixes | Mobile CSS changes don't break desktop | LOW | Run the full desktop keyboard navigation test suite against a desktop viewport (1280x800) after all mobile changes are applied. |
| Video mute toggle works on mobile | Mute button interactive on touch | LOW | Simulate tap on mute button, assert Vimeo URL parameter changes from `muted=1` to `muted=0`. |

### P3: Nice to Have

| Scenario | What It Validates | Complexity | Notes |
|----------|-------------------|------------|-------|
| Publications list renders all 35 publications | Dynamic content renders correctly | LOW | Assert `#pubList` contains 35 `.pub-row` elements after page load. |
| Team grid renders all 17 members | Team data renders | LOW | Assert `.team-card` count equals 17. |
| Snapshot: publications slide layout at 375px viewport | Visual regression baseline for most complex content slide | MEDIUM | Playwright `expect(page).toMatchSnapshot()`. Brittle — only add if team commits to maintaining snapshot files. |
| Modal backdrop click closes modal | Alternate close interaction | LOW | Click outside the modal content area, assert modal closes. |

---

## Feature Dependencies

```
[100dvh Fallback Fix]
    └──enables──> [Correct Viewport Height Tests]
                     └──enables──> [Snapshot Visual Tests]

[touch-action: pan-y on Scroll Containers]
    └──enables──> [Vertical Scroll Test (does not advance slide)]
    └──prevents conflict with──> [Swipe Navigation]

[Swipe Navigation Fix (threshold tuning)]
    └──enables──> [Swipe E2E Test]

[Page Visibility API Fix]
    └──enables──> [Auto-Advance Pause Test]

[Auto-Advance Pause/Play Button]
    └──enhances──> [Auto-Advance Timer Tests]

[touch-action: manipulation on interactive elements]
    └──eliminates tap delay on──> [Video Modal Open/Close Touch Test]
    └──eliminates tap delay on──> [Navigation Dot Touch Test]
```

### Dependency Notes

- **`100dvh` fix must land before viewport height tests:** Tests asserting correct viewport fill will fail if the layout itself is broken.
- **`touch-action: pan-y` and swipe detection are complementary, not conflicting:** `pan-y` tells the browser to handle vertical scroll natively; the existing swipe handler only sees horizontal events after this. They don't conflict.
- **Playwright timer tests require Page Visibility fix to exist first:** The test for "timer pauses when tab hidden" is only meaningful once the fix is implemented — write test after feature.
- **Desktop regression tests must run AFTER all mobile CSS changes:** Regression tests confirm no desktop breakage — they're the last thing to run in the test suite, not the first.

---

## MVP Definition

### Launch With (This Milestone)

The minimum set required to meet the PROJECT.md Active requirements.

- [ ] Viewport height fix (`100vh` fallback before `100dvh`) — fixes layout on Safari < 15.4 and prevents layout shifts
- [ ] `touch-action: pan-y` on scrollable slide containers — prevents scroll-to-slide-advance conflict
- [ ] `overscroll-behavior-x: contain` + Safari JS fallback — prevents accidental browser history navigation
- [ ] Touch target size audit and padding fix for nav dots and arrows — meets 48x48px minimum
- [ ] `touch-action: manipulation` on all interactive elements — eliminates 300ms tap delay
- [ ] Page Visibility API timer pause (5–10 lines) — stops battery drain and timer desync
- [ ] Playwright config with local static file server (`npx serve` or `python -m http.server`)
- [ ] P1 Playwright E2E tests: keyboard nav, dot nav, arrow nav, video modal, all-slides JS error check, viewport height check, swipe nav, vertical-scroll-does-not-advance test

### Add After Validation (v1.x)

- [ ] Auto-advance pause/play visible button — high value, low effort, add if time allows in this milestone
- [ ] P2 Playwright tests: auto-advance timer mocking, touch target size assertion, desktop regression suite
- [ ] Squarespace CDN photo migration (Issue #6) — independent concern, does not affect mobile UX directly

### Future Consideration (v2+)

- [ ] `srcset` responsive images — performance optimization, out of scope per PROJECT.md constraints
- [ ] CSS Scroll Snap refactor — architectural change, high regression risk, defer to dedicated milestone
- [ ] Real device testing on BrowserStack — cost and CI complexity not justified yet

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| 100dvh + 100vh fallback | HIGH | LOW | P1 |
| touch-action: pan-y on scroll containers | HIGH | LOW | P1 |
| overscroll-behavior-x + Safari fallback | HIGH | MEDIUM | P1 |
| Touch target size fix (padding) | HIGH | LOW | P1 |
| touch-action: manipulation (tap delay) | MEDIUM | LOW | P1 |
| Page Visibility API timer pause | MEDIUM | LOW | P1 |
| Playwright P1 test suite (9 scenarios) | HIGH | MEDIUM | P1 |
| Auto-advance pause/play button | HIGH | LOW | P2 |
| Playwright P2 test suite (5 scenarios) | MEDIUM | MEDIUM | P2 |
| srcset responsive images | MEDIUM | MEDIUM | P3 |
| CSS Scroll Snap refactor | LOW (this milestone) | HIGH | P3 |
| Full visual snapshot suite | LOW | HIGH | P3 |

---

## Competitor / Reference Analysis

For slide-based HTML presentations, the relevant reference implementations are:

| Feature | Reveal.js approach | impress.js approach | Our approach |
|---------|-------------------|---------------------|--------------|
| Viewport height | `100vh` with JS measurement fallback | Fixed pixel height | `100vh` + `100dvh` CSS fallback (no JS needed for modern browsers) |
| Touch navigation | Built-in Hammer.js integration | No native touch | Tune existing custom swipe detection with `touch-action` discipline |
| Scroll/swipe conflict | `overflow: hidden` on slide deck, `touch-action` on slides | Prevents scroll entirely | `touch-action: pan-y` on scrollable containers preserves content scroll |
| Mobile address bar | JS-measured viewport via ResizeObserver | Not addressed | `100dvh` handles this natively on iOS 15.4+ / Chrome 94+ |
| E2E testing | Community Playwright examples exist | None found | Playwright with manual touch event dispatch for swipe simulation |

---

## Sources

- [touch-action — MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action) — HIGH confidence (authoritative)
- [Playwright Emulation — Official Docs](https://playwright.dev/docs/emulation) — HIGH confidence (authoritative)
- [Touch Events (Legacy) — Playwright Official Docs](https://playwright.dev/docs/touch-events) — HIGH confidence (authoritative)
- [Playwright webServer Config — Official Docs](https://playwright.dev/docs/test-webserver) — HIGH confidence (authoritative)
- [100dvh support: Safari 15.4+, Chrome 94+, Firefox 105+ — Frontend.fyi](https://www.frontend.fyi/tutorials/finally-a-fix-for-100vh-on-mobile) — MEDIUM confidence (verified against MDN browser compat data)
- [overscroll-behavior iOS Safari limitations — CSS-Tricks](https://css-tricks.com/almanac/properties/o/overscroll-behavior/) — MEDIUM confidence (multiple sources corroborate iOS Safari partial support)
- [Accessible tap target sizes — web.dev](https://web.dev/articles/accessible-tap-targets) — HIGH confidence (Google authoritative source; aligns with WCAG 2.5.8)
- [New CSS viewport units (svh, lvh, dvh) — Medium/Pixicstudio, Feb 2026](https://pixicstudio.medium.com/the-new-css-viewport-units-that-finally-fix-mobile-layouts-e0778527606f) — MEDIUM confidence (recent publication, consistent with MDN data)
- [How to Prevent Scroll on Mobile Web Parent Elements — Medium](https://medium.com/@yev-/how-to-prevent-scroll-touch-move-on-mobile-web-parent-elements-while-allowing-it-on-children-f7acb793c621) — MEDIUM confidence (community article, consistent with touch-action MDN docs)
- [Playwright Mobile Testing — Pcloudy 2025](https://www.pcloudy.com/blogs/playwright-mobile-testing-setup-complete-guide/) — LOW confidence (third-party guide; verify specifics against official Playwright docs)

---

*Feature research for: Mobile optimization + E2E testing of slide-based HTML presentation*
*Researched: 2026-03-02*

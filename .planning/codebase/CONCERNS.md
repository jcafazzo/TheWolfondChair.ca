# Codebase Concerns

**Analysis Date:** 2026-03-04

## Tech Debt

**Monolithic HTML file with embedded JavaScript and CSS:**
- Issue: The entire application is a single 1353-line HTML file (`/home/user/TheWolfondChair.ca/wolfond-report-2024-2026.html`) containing all styles, markup, and JavaScript inline with no separation of concerns.
- Files: `wolfond-report-2024-2026.html`
- Impact: Difficult to maintain, test independently, reuse components, or manage version control. Any change requires editing a massive file. Browser caching is ineffective. Styles and scripts cannot be linted or optimized separately.
- Fix approach: Refactor into separate files: HTML template, CSS stylesheet, and JavaScript modules. Use a build tool (Vite/esbuild) to bundle for production.

**Hardcoded timing constants scattered in tests and code:**
- Issue: Multiple `waitForTimeout(850)` calls in test files assume 800ms CSS transitions + buffer. The HTML source also hardcodes transition durations (`transition: 0.8s ease`, `transition: 0.35s ease`). If transitions change, all tests break.
- Files:
  - `tests/desktop-regression.spec.ts` (lines 43, 58, 74, 87, 103, 110, 114, 128, 145)
  - `tests/navigation.spec.ts` (lines 40, 66, 77, 96, 118)
  - `tests/mobile-viewport.spec.ts` (line 63)
  - `tests/video-modal.spec.ts` (line 10)
  - `wolfond-report-2024-2026.html` (multiple CSS transition values)
- Impact: Tests are fragile and tightly coupled to CSS timing. Changing animations requires updating dozens of test assertions. Tests may flake on slower CI machines.
- Fix approach: Export transition durations as JavaScript constants accessible to both CSS and tests. Wait for CSS animations to complete using Playwright's `waitForFunction` with a deterministic state check instead of arbitrary timeouts.

**Global state and mutable variables:**
- Issue: Navigation state is managed via global variables (`current`, `slides`, `isTransitioning`, `autoTimerPaused`, etc.) in the HTML script block. No encapsulation or state management pattern.
- Files: `wolfond-report-2024-2026.html` (lines 1209-1211, 1131-1135)
- Impact: Difficult to reason about state changes. Navigation race conditions possible if multiple handlers fire simultaneously. Auto-advance timer state can become inconsistent if visibility changes during transitions.
- Fix approach: Wrap state management in a class or use a state management library. Encapsulate related state (timing, auto-advance, navigation) into single objects.

**Magic numbers throughout codebase:**
- Issue: Hardcoded indices like `CONVO_SLIDE_INDEX = 13`, media slide checks `if (index === 12)`, and last slide detection `if (index === slides.length - 1)` make code fragile to slide reordering.
- Files: `wolfond-report-2024-2026.html` (lines 1075, 1257, 1264, 1281, 1288)
- Impact: Adding or removing slides requires updating multiple hardcoded indices. Risk of off-by-one errors and broken autoplay on specific slides.
- Fix approach: Create a slide registry/config object that maps slide purposes to indices dynamically. Use slide data attributes instead of numeric indices.

**Auto-advance timer complexity:**
- Issue: The auto-advance system has multiple interacting timers (`autoTimer`, `countdownTimer`), pause/resume logic on visibility changes, and complex state tracking. The logic spans lines 1130-1206 with nested conditionals and multiple setTimeout/setInterval calls.
- Files: `wolfond-report-2024-2026.html` (lines 1130-1206)
- Impact: Difficult to debug. Timer state can desynchronize (countdown counter out of sync with advance timer). Pausing on tab hide and resuming creates edge cases where timer fires immediately or countdown resets unexpectedly.
- Fix approach: Simplify timer logic using a state machine or class-based approach. Separate concerns: countdown display, auto-advance trigger, and pause/resume handling.

**Inline styles mixed with embedded CSS:**
- Issue: ~143 inline `style` attributes scattered throughout the HTML alongside ~456 lines of embedded CSS.
- Files: `wolfond-report-2024-2026.html`
- Impact: Style overrides become unpredictable. Maintenance requires checking both CSS and inline styles. CSS specificity issues create debugging difficulty.
- Fix approach: Move all inline styles to CSS classes. Use consistent naming conventions for media queries and component variants.

---

## Known Bugs

**Video iframe mute toggle uses string replacement on URLs:**
- Symptoms: Toggling mute on media page videos swaps `muted=1` ↔ `muted=0` in iframe src, potentially breaking if Vimeo URL structure changes or if parameter order varies.
- Files: `wolfond-report-2024-2026.html` (lines 1109-1128)
- Cause: String-based URL manipulation without parsing. If the Vimeo embed URL ever changes format, the toggle breaks.
- Workaround: Manually reload page to reset mute state.
- Fix approach: Parse URL parameters using URLSearchParams API. Rebuild iframe src safely.

**Modal visibility state not reset if closed during open animation:**
- Symptoms: If Escape key is pressed during the ~35ms visibility animation (requestAnimationFrame calls), the modal may end up in an inconsistent state with `visible` class still present but `open` class removed.
- Files: `wolfond-report-2024-2026.html` (lines 1043-1065)
- Cause: No debouncing on modal close. `visible` class is added asynchronously via requestAnimationFrame, but removal via Escape key is synchronous.
- Workaround: Wait for modal animation to complete before pressing Escape.
- Fix approach: Add a `_modalOpeningOrClosing` flag to prevent close commands during animation transitions.

**Swipe gesture can fire slide navigation on scroll content:**
- Symptoms: Swiping vertically inside `.scroll-content` areas (Publications, Media, Conversations slides) may trigger slide navigation if swipe delta > 40px horizontally.
- Files: `wolfond-report-2024-2026.html` (lines 1322-1336)
- Cause: Swipe detection only checks horizontal delta but doesn't exclude scroll-content containers from touch handling.
- Trigger: Swipe vertically while partially swiping horizontally on a scrollable slide.
- Workaround: Swipe more purely vertically; avoid diagonal swiping.
- Fix approach: Add check to exclude swipes originating in `.scroll-content` elements.

---

## Security Considerations

**Inline event handlers allow XSS if data changes:**
- Risk: 14 inline `onclick` handlers throughout the HTML. If any dynamic data (speaker names, video IDs, publication titles) is rendered into these handlers, XSS is possible.
- Files: `wolfond-report-2024-2026.html` (multiple lines with inline onclick)
- Current mitigation: All event handlers call hardcoded functions; no user input is interpolated into onclick attributes.
- Recommendations: Move all event handlers to JavaScript event listeners. Sanitize any dynamic data before rendering HTML.

**External image and font CDN dependencies:**
- Risk: Heavy reliance on external CDNs (Google Fonts, Squarespace CDN, Vimeo). If any CDN is compromised, malicious scripts could execute.
- Files: `wolfond-report-2024-2026.html` (Google Fonts on lines 6-7; Squarespace images throughout)
- Current mitigation: Fonts use `display=swap` to prevent render blocking; images have no integrity attributes.
- Recommendations: Add Subresource Integrity (SRI) hashes to font URLs. Self-host critical fonts. Download Squarespace team photos locally (partially done). Monitor CDN status.

**Vimeo embed parameterization without validation:**
- Risk: Vimeo IDs (e.g., `1169672887`) are used to construct iframe src URLs. If vimeo IDs can be injected, malicious iframes could be loaded.
- Files: `wolfond-report-2024-2026.html` (lines 1047, 1068-1074, 1258, 1265, 1282, 1091)
- Current mitigation: Vimeo IDs are hardcoded in data arrays; no user input is accepted.
- Recommendations: Validate Vimeo IDs against whitelist. Use safer embed methods (Vimeo's oEmbed API).

**No Content Security Policy:**
- Risk: Missing CSP headers mean inline styles and scripts are accepted without restrictions.
- Files: `wolfond-report-2024-2026.html` (no CSP meta tag)
- Current mitigation: Repository is publicly hosted on GitHub Pages; lower risk than a web application handling user data.
- Recommendations: Add `<meta http-equiv="Content-Security-Policy">` to restrict inline scripts and style sources.

---

## Performance Bottlenecks

**Large single HTML file blocks initial render:**
- Problem: 1353-line HTML file with embedded ~80 KB of CSS and ~20 KB of JavaScript must be fully parsed before any content renders.
- Files: `wolfond-report-2024-2026.html`
- Cause: Monolithic architecture with inline everything.
- Improvement path: Split into separate files, lazy-load scripts after initial paint, defer non-critical CSS.

**All slide markup generated and injected into DOM on page load:**
- Problem: `init()` function builds HTML for all 18 slides via `buildSlides()` and injects into DOM at once. For a presentation with dozens of slides, this would be slow.
- Files: `wolfond-report-2024-2026.html` (lines 1213-1229)
- Cause: Eager rendering of all slides.
- Improvement path: Implement virtual scrolling; only render active slide + adjacent slides. Lazy-load slide content.

**Vimeo iframes loaded into memory even when not visible:**
- Problem: Five conversation videos are pre-rendered as iframes in the HTML. Only one is visible at a time. Greg's video, media videos all load into memory.
- Files: `wolfond-report-2024-2026.html` (lines 920-925, 1013-1019, 1254-1286)
- Cause: All iframe elements exist in DOM; browser loads video players even when hidden.
- Improvement path: Dynamically create iframes only when slide becomes active. Destroy iframes when sliding away.

**No image optimization or progressive loading:**
- Problem: Only 10 images use `loading="lazy"`, but ~40+ external Squarespace images (team photos, testimonials) have no lazy loading attribute and load synchronously.
- Files: `wolfond-report-2024-2026.html` (multiple img tags without loading attribute)
- Cause: Mixed optimization strategy.
- Improvement path: Add `loading="lazy"` to all offscreen images. Use WebP format (some images are already WebP; standardize). Serve responsive images with srcset.

**Google Fonts blocks rendering:**
- Problem: Google Fonts CSS is loaded in `<head>` without consistent `display=swap` in all declarations, potentially causing invisible text flash (FOIT).
- Files: `wolfond-report-2024-2026.html` (line 6-7)
- Cause: Font link includes `display=swap` but font-face declarations may not respect it fully.
- Improvement path: Ensure all font declarations use `font-display: swap` in @font-face rules or preload critical fonts.

**Publication list renders 20+ items into DOM at once:**
- Problem: `buildPubList()` creates DOM elements for all publications (20+ items) every time slide changes. No pagination or virtualization.
- Files: `wolfond-report-2024-2026.html` (lines 1339-1348)
- Cause: Simple .map() approach; no performance optimization.
- Improvement path: Paginate publications or implement a scrollable, virtualized list component.

---

## Fragile Areas

**Navigation state machine during transitions:**
- Files: `wolfond-report-2024-2026.html` (lines 1240-1295)
- Why fragile: `isTransitioning` flag gates navigation. If a navigation request fires during the 800ms transition animation, it's silently ignored. Multiple concurrent events (e.g., keyboard and click simultaneously) can cause race conditions.
- Safe modification: Any changes to navigation timing require updating the 800ms hardcoded delay in multiple places. Rename `isTransitioning` to `_isNavigating` or move into a class to prevent accidental direct access.
- Test coverage: Navigation tests only cover happy paths (single keypress, single click). No tests for concurrent navigation attempts.

**Conversation slide autoplay injection:**
- Files: `wolfond-report-2024-2026.html` (lines 1067-1106, 1287-1292)
- Why fragile: `startConvoAutoplay()` randomly picks a conversation, then creates an iframe and injects it into `.convo-thumb`. If the DOM structure of the thumbnail changes or the `data-convo-index` attribute is removed, the feature breaks silently. iframe cleanup in `stopConvoAutoplay()` assumes class name remains consistent.
- Safe modification: Do not rename `.convo-thumb`, `.convo-inline-video`, or `data-convo-index` without updating JavaScript. Add data-* attributes for IDs rather than relying on CSS class names.
- Test coverage: Video modal tests do not cover conversation autoplay. Autoplay functionality is untested.

**Video slide detection by hardcoded index:**
- Files: `wolfond-report-2024-2026.html` (lines 1253-1268, 1278-1286, 1288)
- Why fragile: Media slide is checked as `index === 12`; Wolfond Brothers is `index === slides.length - 1`. If slides are reordered or inserted, these break.
- Safe modification: Create a slide registry. Use slide attributes or IDs instead of indices.
- Test coverage: Tests verify video modal on Conversations slide but don't verify video autoplay on Media or Wolfond slides.

**Theme detection based on CSS class names:**
- Files: `wolfond-report-2024-2026.html` (lines 1232-1238)
- Why fragile: `getSlideTheme()` checks for `.dark-slide`, `.cover`, or `.full-image` classes. Adding or renaming these classes without updating the function breaks theme switching.
- Safe modification: Use explicit `data-theme` attributes on slides. Do not rely on CSS class names for logic.
- Test coverage: Theme switching is tested, but only for specific known slides. No tests verify theme detection if new slide types are added.

---

## Scaling Limits

**Hardcoded 18-slide limit:**
- Current capacity: Currently 18 slides (0–17), manually defined in `buildSlides()` function.
- Limit: If the presentation grows to 20+ slides, the code remains functional but becomes harder to manage. Video IDs, autoplay logic, and special-case slide handling (e.g., Media slide at index 12) become fragile.
- Scaling path: Refactor to a data-driven slide model. Define slides in a configuration array or load from JSON. Generalize special slide handling (autoplay, theme) using data attributes rather than hardcoded indices.

**Auto-advance timer resolution:**
- Current capacity: Countdown timer updates every 1000ms (seconds). Display updates are smooth.
- Limit: If any future feature requires sub-second precision (e.g., timed animations within slides), the 1000ms interval is insufficient.
- Scaling path: Switch to requestAnimationFrame for real-time countdown updates if finer granularity is needed.

**Vimeo embed rate limits:**
- Current capacity: 10+ Vimeo iframes loaded on page. No caching or batching.
- Limit: If the presentation grows to 50+ videos, Vimeo may rate-limit embedded player requests.
- Scaling path: Implement video preloading with backoff. Cache embed URLs. Use Vimeo's oEmbed API for responsive embeds.

---

## Dependencies at Risk

**Playwright test dependency vulnerability:**
- Risk: The project has minimal dependencies (only `@playwright/test@^1.58.2`). While simplicity is good, hardcoded test timing makes Playwright version upgrades risky.
- Files: `package.json`
- Current mitigation: Pinned to `^1.58.2` range
- Impact: If Playwright 2.0 introduces breaking changes to timing APIs or retry behavior, tests will fail.
- Migration plan: Refactor tests to use Playwright's built-in waitFor mechanisms instead of hardcoded delays. This decouples tests from animation timing.

**Google Fonts availability:**
- Risk: Playfair Display and Inter fonts are loaded from Google Fonts CDN. If CDN is unavailable, fonts fail to load and fall back to system serif/sans-serif.
- Files: `wolfond-report-2024-2026.html` (lines 6-7)
- Current mitigation: Fonts have fallback stack (`'Georgia', serif` and `system-ui, sans-serif`).
- Impact: Page renders but typography differs, affecting visual design.
- Migration plan: Self-host critical fonts or use a more resilient CDN with fallbacks.

**Vimeo dependency for video embeds:**
- Risk: 10+ embedded Vimeo videos. If Vimeo's embed API changes or player becomes unavailable, all videos break.
- Files: `wolfond-report-2024-2026.html` (multiple iframe src with vimeo.com/video/)
- Current mitigation: Vimeo is a major video platform with strong uptime. No offline fallback provided.
- Impact: If Vimeo is unavailable, the Conversations, Media, and Wolfond Brothers slides are non-functional.
- Migration plan: Provide fallback poster images and download links. Host critical videos on a self-controlled server as backup.

---

## Missing Critical Features

**No keyboard focus management:**
- Problem: The slide deck responds to arrow keys but does not manage keyboard focus. Tab navigation does not work; buttons and links are not reachable via keyboard for screen reader users.
- Blocks: Accessibility compliance (WCAG 2.1 Level AA). Any organization relying on assistive technology cannot use this presentation.
- Files: `wolfond-report-2024-2026.html`
- Priority: High
- Fix approach: Add tabindex management, focus visible styles, and ARIA live regions for slide changes.

**No error boundaries or error handling:**
- Problem: If any JavaScript fails (e.g., a Vimeo URL is invalid, DOM selector fails), the entire application breaks silently.
- Blocks: Reliability. Users see a broken presentation with no feedback.
- Files: `wolfond-report-2024-2026.html` (entire script section)
- Priority: Medium
- Fix approach: Add try-catch blocks around all event handlers. Log errors to console or analytics. Provide fallback UI.

**No offline support:**
- Problem: All external resources (fonts, images, videos) are not cached. Without internet, only the HTML structure is visible.
- Blocks: Presentations in low-connectivity environments (remote locations, on airplanes, during network outages).
- Files: `wolfond-report-2024-2026.html`
- Priority: Low
- Fix approach: Implement Service Worker with offline caching strategy. Download critical images and fonts before presenting.

---

## Test Coverage Gaps

**Untested conversation autoplay feature:**
- What's not tested: `startConvoAutoplay()`, `stopConvoAutoplay()` functions. Random selection of conversation video. Autoplay lifecycle on slide transitions.
- Files: `wolfond-report-2024-2026.html` (lines 1067-1106, 1287-1292)
- Risk: If autoplay fails, iframe is not injected, or video selection breaks, no tests catch it.
- Priority: Medium

**No tests for responsive behavior at mobile breakpoints:**
- What's not tested: CSS media query changes (e.g., nav dots hidden on mobile, topbar padding adjusts). Only Playwright device presets are used; no custom viewport assertions for layout shifts.
- Files: Test files do not verify responsive layout details
- Risk: Mobile layout may be broken (e.g., nav dots still visible, buttons too small) without detection.
- Priority: High

**No tests for swipe gestures:**
- What's not tested: `touchstart`, `touchend` event handlers. Swipe-to-navigate. Vertical scroll not triggering navigation.
- Files: `wolfond-report-2024-2026.html` (lines 1322-1336)
- Risk: Touch navigation may be broken; no tests verify swipe works on actual mobile devices.
- Priority: High

**No tests for auto-advance timer:**
- What's not tested: `startAutoAdvance()`, `stopAutoAdvance()`, countdown display, pause/resume on tab visibility change.
- Files: `wolfond-report-2024-2026.html` (lines 1130-1206)
- Risk: Auto-advance may fail silently; timer state may desynchronize.
- Priority: Medium

**No tests for video modal edge cases:**
- What's not tested: Opening modal with invalid Vimeo ID. Clicking modal during visibility animation. Escape key pressed during animation. Multiple rapid open-close cycles beyond the 2 tested cycles.
- Files: `tests/video-modal.spec.ts`
- Risk: Modal state machine may deadlock under stress.
- Priority: Medium

**No tests for publication list filtering:**
- What's not tested: `.pub-filter` button functionality. Clicking filter buttons changes visible publications. Filter state persists across slide changes.
- Files: No test for publication filtering exists
- Risk: Publication filtering may be broken entirely; no detection.
- Priority: Low (filter buttons visible in HTML but filtering logic not implemented)

**No tests for click exclusion in tap-to-navigate:**
- What's not tested: Tapping interactive elements (buttons, links, iframes, `.scroll-content`) should NOT trigger slide navigation.
- Files: `wolfond-report-2024-2026.html` (lines 1313-1320)
- Risk: Clicking inside a scrollable publications list might advance slides.
- Priority: Medium

---

*Concerns audit: 2026-03-04*

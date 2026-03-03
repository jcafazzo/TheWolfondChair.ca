# Technical Concerns

**Analysis Date:** 2026-03-02

## Critical Issues

### 1. Monolithic Single-File Architecture
- **File:** `wolfond-report-2024-2026.html` (82KB, ~1300 lines)
- **Impact:** All markup, CSS, and JavaScript in one file makes maintenance difficult
- **Risk:** Any change requires navigating a massive file; no separation of concerns
- **Fix Approach:** Extract CSS to separate stylesheet, JS to separate script file, use build tool if needed

### 2. HTML String Construction Anti-Pattern
- **File:** `wolfond-report-2024-2026.html` (buildSlides function, lines 437-1006)
- **Impact:** Dynamic HTML built via template literals with user data (citations, names)
- **Risk:** Potential XSS if any data source becomes untrusted in future
- **Fix Approach:** Use DOM APIs or a templating library with auto-escaping

### 3. Inline Event Handlers
- **File:** `wolfond-report-2024-2026.html` (throughout slide templates)
- **Impact:** ~14 inline `onclick` handlers scattered in HTML strings
- **Risk:** Harder to maintain, debug, and test; violates separation of concerns
- **Fix Approach:** Use `addEventListener` in JavaScript section instead

### 4. Inline Styles Mixed with CSS
- **File:** `wolfond-report-2024-2026.html` (throughout)
- **Impact:** ~143 inline `style` attributes alongside embedded CSS
- **Risk:** Style overrides become unpredictable; hard to maintain consistent design
- **Fix Approach:** Move inline styles to CSS classes using existing naming conventions

### 5. Global Variable Pollution
- **File:** `wolfond-report-2024-2026.html` (script section)
- **Impact:** 13+ variables on window scope (`current`, `autoTimer`, `countdownTimer`, `isTransitioning`, etc.)
- **Risk:** Name collisions, harder to reason about state, no encapsulation
- **Fix Approach:** Wrap in IIFE or module pattern; use a single state object

## Risk Issues

### 6. External CDN Dependency for Team Photos
- **File:** `wolfond-report-2024-2026.html` (TEAM_PHOTOS object, lines 512-537)
- **Impact:** 11 team photos served from Squarespace CDN (`images.squarespace-cdn.com`)
- **Risk:** If Squarespace changes URLs or goes down, photos break silently
- **Fix Approach:** Download all photos locally to `images/` directory; already done for some team members

### 7. No Error Handling on DOM Access
- **File:** `wolfond-report-2024-2026.html` (script section throughout)
- **Impact:** `querySelector` calls without null checks
- **Risk:** If DOM structure changes, silent failures or uncaught errors
- **Fix Approach:** Add null checks on critical DOM queries

### 8. URL Construction via String Concatenation
- **File:** `wolfond-report-2024-2026.html` (Vimeo embed URLs)
- **Impact:** Vimeo iframe URLs built by concatenating video IDs into URL strings
- **Risk:** Low risk currently (IDs are hardcoded), but fragile pattern
- **Fix Approach:** Use URL constructor or template with validation

## Quality / Performance Issues

### 9. Accessibility Gaps
- **File:** `wolfond-report-2024-2026.html` (throughout)
- **Impact:** Missing ARIA labels on interactive elements, poor keyboard focus management
- **Risk:** Inaccessible to screen readers and keyboard-only users
- **Fix Approach:** Add `aria-label`, `role`, and focus management to slide navigation

### 10. No Responsive Image Handling
- **File:** `wolfond-report-2024-2026.html` (image elements)
- **Impact:** Missing `srcset` and `sizes` attributes on images
- **Risk:** Large images served to mobile devices, slow load times
- **Fix Approach:** Add responsive image attributes; consider WebP with fallbacks

### 11. Continuous Timer Overhead
- **File:** `wolfond-report-2024-2026.html` (auto-advance system, lines 1096-1136)
- **Impact:** `setInterval` runs continuously for countdown display updates
- **Risk:** Battery drain on mobile devices; timer runs even when tab is inactive
- **Fix Approach:** Use `requestAnimationFrame` or pause timer when tab not visible (Page Visibility API)

### 12. Auto-Advance With No Visible Toggle
- **File:** `wolfond-report-2024-2026.html` (auto-advance system)
- **Impact:** Auto-advance enabled by default with no user-facing toggle
- **Risk:** Users may not realize slides are auto-advancing; confusing UX
- **Fix Approach:** Add visible play/pause button for auto-advance

### 13. Hard-Coded Slide Index References
- **File:** `wolfond-report-2024-2026.html` (e.g., `CONVO_SLIDE_INDEX = 13`)
- **Impact:** Magic numbers reference specific slide positions
- **Risk:** Adding or reordering slides breaks special behaviors silently
- **Fix Approach:** Use slide IDs or data attributes instead of index numbers

### 14. Zero Test Coverage
- **Impact:** No automated tests of any kind
- **Risk:** Regressions go undetected; manual testing is error-prone
- **Fix Approach:** Add basic E2E tests with Playwright for critical navigation paths

### 15. 100dvh Viewport Height Issues on Mobile
- **File:** `wolfond-report-2024-2026.html` (CSS, lines 34, 40, 65)
- **Impact:** Uses `100dvh` for slide height which has inconsistent mobile browser support
- **Risk:** Layout shifts on older mobile browsers; address bar interactions
- **Fix Approach:** Add fallback `height: 100vh` before `height: 100dvh` declarations

---

*Concerns analysis: 2026-03-02*

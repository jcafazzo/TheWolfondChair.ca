# Phase 1: Mobile Fixes - Context

**Gathered:** 2026-03-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Apply all CSS and JS corrections that make mobile navigation, scrolling, and touch interaction work correctly. Users can navigate the slide presentation on mobile without scroll conflicts, layout shifts, or broken touch interactions. Desktop experience must not regress.

</domain>

<decisions>
## Implementation Decisions

### Viewport Unit Strategy
- Replace `100dvh` with `100svh` and `100vh` fallback across all three locations: `body` (height), `.deck` (height), `.slide-inner` (min-height)
- Apply uniformly — no special treatment for `min-height` vs `height`
- `svh` chosen over `dvh` because it's stable — no jitter when the mobile address bar shows/hides
- Fallback pattern: `height: 100vh; height: 100svh;` (browsers that don't support svh use vh)
- No special landscape orientation handling — `svh` works in both orientations

### Scroll vs Swipe Behavior
- Fix touch target detection: use `e.target.closest('.scroll-content')` captured on touchstart, not slide-level `.querySelector('.scroll-content')` on touchend
- Keep >4px height threshold (`scrollEl.scrollHeight > scrollEl.clientHeight + 4`) to match existing wheel handler logic
- Keep vertical swipe advancing slides on non-scrollable slides — it's an intuitive existing behavior
- Keep 60px swipe threshold for both horizontal and vertical — standard, works across screen sizes
- Add `overscroll-behavior-x: contain` to all slides to prevent accidental browser back/forward on horizontal swipe

### Nav Dot Touch Targets
- Keep dots at 8px visual size — preserve current aesthetic
- Add 44px invisible tap zone via padding or pseudo-element on the dot's clickable area
- Keep all 17 dots visible on mobile — allow slight tap zone overlap; position accuracy matters
- Keep current active dot contrast (white vs semi-transparent) — sufficient, visual redesign is out of scope
- Keep dots at current position — `svh` fix already accounts for browser chrome

### Timer Pause on Tab Hide
- Implement Page Visibility API: pause auto-advance timer when `document.hidden` becomes true
- Resume timer from where it left off when tab becomes visible (don't reset to full 120s)
- Only react to full tab hide (`visibilitychange` event), not partial occlusion
- No pause during in-slide scrolling — over-engineering for a 120s interval
- No special return UI after long absence — timer was paused, so no unexpected slide advancement

### Claude's Discretion
- Exact CSS syntax for `touch-action` declarations (likely `touch-action: pan-y` on `.slide`)
- Whether to use `::before`/`::after` pseudo-elements or padding for dot hit areas
- Event listener options (`passive: true` vs `passive: false`) on touch handlers
- Exact implementation of Page Visibility API integration with existing timer code
- Any additional CSS properties needed for mobile touch behavior (e.g., `-webkit-tap-highlight-color`)

</decisions>

<specifics>
## Specific Ideas

No specific design references — all decisions are technical fixes to existing behavior. The goal is "make what exists work correctly on mobile" not "redesign for mobile."

Key code locations identified during codebase scout:
- Viewport: lines 34, 40, 65 (body, .deck, .slide-inner)
- Nav dots: line 93 (8x8px sizing)
- Touch handler: lines 1232-1251 (touchstart/touchend with bug at line 1247)
- Auto-advance timer: lines 1096-1136 (setInterval, no visibility API)
- Wheel handler: lines 1253-1279 (edge scroll detection reference)

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- Existing swipe detection logic (lines 1232-1251): Fix the target detection bug, keep the gesture recognition math
- Existing wheel handler edge-scroll pattern (lines 1253-1279): Reference the >4px threshold pattern for consistency
- Existing `nextSlide()`/`prevSlide()` functions: Touch handler already calls these, no navigation refactor needed

### Established Patterns
- All state is global (`window` scope): Timer variables, slide index, transition flags — modifications must use same pattern
- Passive event listeners: touchstart already uses `{ passive: true }` — maintain this where possible
- CSS media queries at 600px/700px/768px/900px breakpoints: Mobile fixes should work within or alongside these

### Integration Points
- Touch handler (lines 1232-1251): Modify in-place, fix `.scroll-content` detection
- Timer system (lines 1096-1136): Add visibility listener alongside existing `setInterval`/`clearInterval` pattern
- CSS viewport declarations (lines 34, 40, 65): Replace values in-place
- `.slide-dot` styles (line 93): Extend with touch target sizing
- `.slide` styles (line 42): Add `touch-action` and `overscroll-behavior` properties

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-mobile-fixes*
*Context gathered: 2026-03-02*

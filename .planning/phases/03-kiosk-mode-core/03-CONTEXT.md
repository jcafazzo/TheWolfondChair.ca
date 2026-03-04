# Phase 3: Kiosk Mode Core - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Enter and exit a fully autonomous presentation loop via keystroke. Hide all navigation chrome while active. Presentation loops continuously from slide 17 back to slide 1. Auto-scroll and portrait mode are separate phases (4 and 5).

</domain>

<decisions>
## Implementation Decisions

### Activation key
- K key toggles kiosk mode on and off (mnemonic for "Kiosk")
- Same key both enters and exits — simple toggle behavior
- Entering kiosk always starts auto-advance fresh (reset 2-min timer from zero)
- Do NOT request browser fullscreen — just hide presentation chrome

### Chrome hiding
- Fade out all chrome over ~0.5s using opacity transition (matches existing CSS transition style)
- Hide everything: `.slide-nav`, `.slide-arrows`, `.slide-counter`, `.auto-counter`, `.progress-bar`, `.topbar`
- Full clean screen — no chrome at all, content only
- Hide mouse cursor after ~3s of inactivity in kiosk mode — restore on mouse movement or kiosk exit
- Auto-advance countdown timer hides with everything else

### Transition behavior
- Start kiosk from current slide — don't jump to slide 1
- Disable manual navigation (arrow keys, clicking, swiping) in kiosk mode — fully autonomous, no accidental changes from stray touches
- Only the kiosk exit key (K) works during kiosk mode
- Loop transition (slide 17 → slide 1) uses same animation as normal slide transitions — seamless, no special pause
- Suppress video modals in kiosk mode — clicking thumbnails does nothing, prevents overlay blocking auto-advance

### Visual indicator
- No visual indicator when entering kiosk — chrome fading away IS the indicator
- No toast, no overlay text

### Claude's Discretion
- Implementation of `body[data-kiosk]` vs JS class toggle approach
- Exact CSS for cursor hiding (cursor: none pattern)
- How to intercept and suppress click/touch/keyboard events during kiosk
- Whether to use a CSS class or `display:none` vs `opacity:0` + `pointer-events:none` for chrome hiding

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `startAutoAdvance()` / `stopAutoAdvance()` (line 1145-1167): Full auto-advance system with 120s timer, countdown display, and visibility API pause/resume
- `resetAutoAdvance()` (line 1169): Convenience wrapper that restarts fresh
- `goToSlide()`: Already calls `resetAutoAdvance()` on each transition — kiosk loop piggybacks on this
- Line 1156-1160: Auto-advance already handles loop (`goToSlide(0)` when at last slide)

### Established Patterns
- Global state variables at top of script: `autoTimer`, `countdownTimer`, `secondsLeft`, `autoTimerPaused`, `isTransitioning`
- Boolean flags with `is` prefix: `isTransitioning`, `autoTimerPaused` — new `isKioskMode` follows this convention
- Event listeners on `document` for keydown (line 1307), click (line 1313), touchstart/touchend (line 1325-1336)
- CSS transitions used throughout: `transition: all 0.5s ease` pattern on nav elements
- Nav theme system: `body[data-nav-theme="light"]` already toggles nav element styles — similar data attribute pattern for kiosk

### Integration Points
- Keyboard handler (line 1307): Add K key check — needs to be early in handler to suppress other keys during kiosk
- Click handler (line 1313): Needs guard to suppress during kiosk
- Touch handlers (lines 1325-1336): Need guard to suppress during kiosk
- Chrome elements (HTML lines 470-484): `.topbar`, `#slideNav`, `.slide-arrows`, `#slideCounter`, `#autoCounter`, `.progress-bar`
- Video modal click handlers: Need guard to prevent opening during kiosk

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. User wants a clean, fully autonomous experience with no visible UI when kiosk is active.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-kiosk-mode-core*
*Context gathered: 2026-03-04*

# Phase 1: Mobile Fixes - Research

**Researched:** 2026-03-02
**Domain:** Mobile CSS (viewport units, touch-action, overscroll) + Vanilla JS (touch event handling, Page Visibility API)
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Viewport Unit Strategy**
- Replace `100dvh` with `100svh` and `100vh` fallback across all three locations: `body` (height), `.deck` (height), `.slide-inner` (min-height)
- Apply uniformly — no special treatment for `min-height` vs `height`
- `svh` chosen over `dvh` because it's stable — no jitter when the mobile address bar shows/hides
- Fallback pattern: `height: 100vh; height: 100svh;` (browsers that don't support svh use vh)
- No special landscape orientation handling — `svh` works in both orientations

**Scroll vs Swipe Behavior**
- Fix touch target detection: use `e.target.closest('.scroll-content')` captured on touchstart, not slide-level `.querySelector('.scroll-content')` on touchend
- Keep >4px height threshold (`scrollEl.scrollHeight > scrollEl.clientHeight + 4`) to match existing wheel handler logic
- Keep vertical swipe advancing slides on non-scrollable slides — it's an intuitive existing behavior
- Keep 60px swipe threshold for both horizontal and vertical — standard, works across screen sizes
- Add `overscroll-behavior-x: contain` to all slides to prevent accidental browser back/forward on horizontal swipe

**Nav Dot Touch Targets**
- Keep dots at 8px visual size — preserve current aesthetic
- Add 44px invisible tap zone via padding or pseudo-element on the dot's clickable area
- Keep all 17 dots visible on mobile — allow slight tap zone overlap; position accuracy matters
- Keep current active dot contrast (white vs semi-transparent) — sufficient, visual redesign is out of scope
- Keep dots at current position — `svh` fix already accounts for browser chrome

**Timer Pause on Tab Hide**
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MCSS-01 | Slides use viewport height fallback (`100vh` before `100dvh`/`100svh`) for consistent height across all mobile browsers | svh has 93% global support (iOS Safari 15.4+); `100vh` fallback covers remaining browsers |
| MCSS-02 | Slides have `touch-action: pan-y` to allow native vertical scrolling while enabling horizontal swipe navigation | `touch-action: pan-y` fully supported iOS Safari 13+; resolves need for passive listener workarounds |
| MCSS-03 | All interactive elements (nav dots, arrows, buttons) have minimum 44px touch targets | Arrows already 48px; dots need pseudo-element or padding expansion; HIG 44pt minimum confirmed |
| MCSS-04 | Slides use `overscroll-behavior-x: contain` to prevent accidental browser back/forward on horizontal swipe | Supported iOS Safari 16+; partial coverage — older iOS needs JS fallback awareness |
| MJS-01 | Swipe detection requires horizontal delta to exceed vertical delta and minimum 40px threshold before triggering slide change | Existing logic already implements this at 60px; no new threshold logic needed, but the bug fix (MJS-02) makes this work correctly |
| MJS-02 | Touch target detection checks if finger landed inside `.scroll-content` element before suppressing vertical swipe | Bug: line 1247 uses `slides[current].querySelector()` at touchend; fix: capture `e.target.closest('.scroll-content')` at touchstart |
| MJS-03 | Auto-advance timer pauses when browser tab is hidden (Page Visibility API) and resumes when visible | Page Visibility API: "Baseline Widely Available" since July 2015; `document.hidden` + `visibilitychange` event covers all modern browsers |
</phase_requirements>

---

## Summary

This phase consists of targeted surgical edits to a single monolithic HTML file (`wolfond-report-2024-2026.html`). There are no external dependencies to install, no build system, and no framework. Every change is a direct edit to existing CSS declarations or vanilla JS event handlers. The codebase constraints are pre-determined and non-negotiable: zero-build static site, vanilla JS only, monolithic HTML.

The CSS changes are three viewport unit replacements and two new property additions. The JS changes are one bug fix to the touch detection logic and one new event listener for tab visibility. The nav dot tap target expansion is the only additive CSS pattern requiring a choice between implementation techniques.

The most important technical finding is the **`touch-action: pan-y` iOS Safari situation**: caniuse.com confirms full support from iOS Safari 13+ (verified against canonical source), which contradicts older community documentation. This is safe to use without a JS fallback on any device running iOS 13 or later (released September 2019 — effectively universal coverage today). The critical companion insight is that `touch-action: pan-y` only works if the touchstart listener is `passive: true`, which the existing code already enforces.

**Primary recommendation:** Apply all changes directly in-place at the identified line numbers. The architecture is simple enough that tasks should be organized by requirement ID, not by file section, to ensure each success criterion maps to exactly one completed task.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| None | — | No libraries needed | All changes use native browser APIs: CSS viewport units, `touch-action`, `overscroll-behavior`, `visibilitychange` event |

### Supporting
| Technique | Version/Spec | Purpose | When to Use |
|-----------|-------------|---------|-------------|
| `100svh` with `100vh` fallback | CSS Values Level 4 (W3C Working Draft) | Stable viewport height immune to address bar jitter | All three layout-critical height declarations |
| `touch-action: pan-y` | CSS Touch Events (W3C) | Tell browser which touch gestures JS will handle | Applied to `.slide` elements |
| `overscroll-behavior-x: contain` | CSS Overscroll Behavior Level 1 | Prevent horizontal swipe from triggering browser navigation | Applied to `.slide` elements |
| Page Visibility API (`visibilitychange`) | WHATWG Living Standard | Detect tab hide/show | Single listener on `document` alongside existing timer code |
| CSS `::before` pseudo-element | CSS2.1 | Expand tap target without affecting layout | On `.slide-dot` to reach 44px without changing visual dot size |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `::before` pseudo-element for dot tap target | Padding on `.slide-dot` directly | Padding approach is simpler but changes the gap spacing between dots in the flex column; pseudo-element preserves exact visual spacing |
| `overscroll-behavior-x: contain` on `.slide` | JS `touchmove` with `preventDefault()` | JS approach works on iOS < 16 but requires `passive: false` which blocks thread; CSS-only is better where supported |
| `100svh` | `100dvh` | `dvh` resizes dynamically with address bar — causes visible content shift/jitter; `svh` locks to smallest viewport state, no jitter |

**Installation:** No packages to install.

---

## Architecture Patterns

### Recommended Project Structure
```
wolfond-report-2024-2026.html
  <style>           ← All CSS edits (lines 34, 40, 65, 93, 42 area)
    body            ← Line 34: height: 100dvh → height: 100vh; height: 100svh;
    .deck           ← Line 40: height: 100dvh → height: 100vh; height: 100svh;
    .slide-inner    ← Line 65: min-height: 100dvh → min-height: 100vh; min-height: 100svh;
    .slide          ← Add: touch-action: pan-y; overscroll-behavior-x: contain;
    .slide-dot      ← Add: position: relative; ::before pseudo-element for 44px target
  </style>
  <script>
    touchstart      ← Line 1234-1236: capture scrollEl with e.target.closest()
    touchend        ← Line 1237-1251: use captured scrollEl ref instead of querySelector
    visibilitychange← Add after stopAutoAdvance(): pause/resume timer
  </script>
```

### Pattern 1: CSS Viewport Unit Fallback
**What:** Two declarations in sequence — older browsers read the first (`100vh`), modern browsers override with `100svh`.
**When to use:** All height/min-height declarations that must fill the mobile viewport stably.

```css
/* Source: https://web.dev/blog/viewport-units */
body {
  height: 100vh;      /* fallback for browsers without svh support */
  height: 100svh;     /* override: stable small viewport, no jitter */
}
```

This works because CSS cascade processes both lines; browsers that don't understand `svh` ignore the second declaration and keep `100vh`. Browsers that do understand `svh` override with it.

### Pattern 2: CSS Touch Discrimination
**What:** `touch-action: pan-y` on slide elements tells the browser to handle vertical panning natively while passing horizontal swipes to JS.
**When to use:** Scrollable container where you want JS to intercept horizontal but not vertical touch.

```css
/* Source: https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action */
.slide {
  touch-action: pan-y;           /* browser handles vertical; JS handles horizontal */
  overscroll-behavior-x: contain; /* prevent horizontal overscroll triggering browser nav */
}
```

**Critical constraint:** `touch-action: pan-y` only functions correctly when the touchstart listener is registered as `{ passive: true }`. The existing code already does this (line 1236). Do NOT change the touchstart listener to `{ passive: false }` — this would defeat the CSS-level discrimination.

### Pattern 3: Touch Start / Touch End Closure Fix
**What:** Capture the scroll element reference at touchstart (when the finger lands), store it in a variable, use that stored reference at touchend.
**When to use:** Any time touchend needs to know what element was under the finger at touchstart.

```javascript
// Source: CONTEXT.md — user decision based on existing wheel handler pattern
let touchScrollEl = null; // declared alongside touchStartX, touchStartY

document.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
  touchStartX = e.touches[0].clientX;
  touchScrollEl = e.target.closest('.scroll-content'); // capture at finger-down
}, { passive: true });

document.addEventListener('touchend', (e) => {
  const dy = touchStartY - e.changedTouches[0].clientY;
  const dx = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) nextSlide(); else prevSlide();
    return;
  }
  if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx)) {
    // Use touchScrollEl captured at touchstart, not querySelector at touchend
    if (touchScrollEl && touchScrollEl.scrollHeight > touchScrollEl.clientHeight + 4) return;
    if (dy > 0) nextSlide(); else prevSlide();
  }
});
```

### Pattern 4: Page Visibility API Timer Pause/Resume
**What:** Listen to `visibilitychange` on document, pause `setInterval`-based timers when hidden, resume from remaining time when visible.
**When to use:** Any polling, animation, or auto-advance that should pause when the tab is not visible.

The existing timer uses two `setInterval` calls: `autoTimer` (fires at 120s, advances slide) and `countdownTimer` (fires every 1s, updates display). Both must be paused. Resuming "from where it left off" means storing `secondsLeft` at hide time — since `countdownTimer` already decrements `secondsLeft` every second, the value is always current.

```javascript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
// Add this block after the existing stopAutoAdvance() function definition

let autoTimerPaused = false; // new flag alongside existing timer variables

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Tab hidden — pause both intervals, remember secondsLeft
    if (autoTimer || countdownTimer) {
      stopAutoAdvance();        // clears both intervals, sets them to null
      autoTimerPaused = true;   // flag: we paused, not the user
    }
  } else {
    // Tab visible again — resume from remaining seconds
    if (autoTimerPaused) {
      autoTimerPaused = false;
      // Restart both timers but with remaining time (not full AUTO_SECONDS)
      countdownTimer = setInterval(() => {
        secondsLeft--;
        if (secondsLeft < 0) secondsLeft = 0;
        updateCounterDisplay();
      }, 1000);
      autoTimer = setInterval(() => {
        if (document.getElementById('videoModal').classList.contains('open')) return;
        if (current < slides.length - 1) {
          goToSlide(current + 1);
        } else {
          goToSlide(0);
        }
      }, secondsLeft * 1000); // fires once at remaining time, then resets via resetAutoAdvance() in goToSlide()
    }
  }
});
```

**Note:** `goToSlide()` always calls `resetAutoAdvance()` at line 1214, which calls `startAutoAdvance()` which resets `secondsLeft = AUTO_SECONDS`. So the "resume from remaining time" only applies to the gap between tab hide and the next slide advance — once any slide advances, the timer resets normally.

### Pattern 5: 44px Touch Target via Pseudo-Element
**What:** Expand the clickable area of a small visual element using a CSS pseudo-element, without changing the visual layout.
**When to use:** When Apple HIG / WCAG 2.5.5 minimum touch target size is needed but visual design must stay unchanged.

```css
/* Source: Apple Human Interface Guidelines — minimum 44x44pt touch target */
.slide-dot {
  position: relative; /* required for absolute pseudo-element positioning */
  /* existing: width: 8px; height: 8px; — keep as-is */
}

.slide-dot::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 44px;
  height: 44px;
  /* no background — invisible hit area */
}
```

The arrows (`.slide-arrow`) are already `48px x 48px` (line 104-110) — they meet the 44px requirement without changes.

### Anti-Patterns to Avoid
- **Changing `passive: false` on touchstart to use `preventDefault()`:** Defeats `touch-action: pan-y` CSS-level discrimination and re-introduces the very scroll conflicts being fixed. The existing `{ passive: true }` must stay.
- **Using `dvh` instead of `svh`:** `dvh` resizes with address bar, causing layout jitter. The user explicitly chose `svh` for stability.
- **Resetting `secondsLeft = AUTO_SECONDS` on tab restore:** Over-engineering; the requirement says resume from where it left off, not restart.
- **Adding scroll prevention JS for `overscroll-behavior-x` fallback on iOS < 16:** The STATE.md notes this as a blocker/concern. Do not add this complexity — `overscroll-behavior-x` without fallback is acceptable for phase 1, and manual verification on real iOS is the specified path (STATE.md: "Manual iOS device verification required").
- **Modifying `.scroll-content` `max-height: calc(100dvh - 10rem)` or the inline scroll-content styles:** The CONTEXT specifies only 3 locations (body, .deck, .slide-inner). The `.scroll-content` `dvh` in calc expressions and `.split-image` `min-height` are intentionally left as-is — they serve different purposes and the user did not include them in scope.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Swipe gesture library | Custom gesture math | Existing code is already correct | The 60px threshold with dx > dy disambiguation is standard and already implemented; just fix the scroll detection bug |
| Viewport height management | Custom resize observer | CSS `svh` unit | `svh` is declarative, zero JS overhead, exactly what the spec was created for |
| Tab visibility detection | `setInterval` checking `document.hasFocus()` | `visibilitychange` event | `visibilitychange` is event-driven (no polling), works for all tab-hide causes (minimize, switch tab, lock screen) |
| Touch target hit testing | JS pointer coordinates | CSS `::before` pseudo-element | CSS hit areas are handled natively by the browser; zero JS |

**Key insight:** This phase is pure browser API work — every problem has a native CSS or web API solution. The value is knowing which API handles each case, not building custom solutions.

---

## Common Pitfalls

### Pitfall 1: `svh` Applied to `.scroll-content` calc() Expressions
**What goes wrong:** Changing ALL `100dvh` occurrences to `100svh` — including `.scroll-content`'s `max-height: calc(100dvh - 10rem)` and the inline styles at lines 666, 715.
**Why it happens:** Global find-replace, or not reading the CONTEXT scope carefully.
**How to avoid:** Only change the 3 specified locations (body line 34, .deck line 40, .slide-inner line 65). The `.scroll-content` max-height intentionally uses `dvh` so it responds to the current viewport state (not the minimized small viewport). The `.split-image` at line 164 (`min-height: 100dvh`) is also out of scope — on mobile it collapses to `40vh` via the media query at line 169.
**Warning signs:** Scroll containers becoming shorter than expected on mobile with address bar hidden.

### Pitfall 2: `touch-action: pan-y` Breaks Horizontal Swipe
**What goes wrong:** `touch-action: pan-y` is applied to `.slide` but horizontal swipes stop working.
**Why it happens:** `pan-y` tells the browser to handle vertical panning; horizontal swipes should still be passed to JS. This is correct behavior — but if there's a conflicting `touch-action` on a child element (e.g., `touch-action: none` or `touch-action: auto`), the child's value takes precedence for touches that land on it.
**How to avoid:** Check that no child elements already have `touch-action` declarations. The project currently has none (grep confirmed). Apply only to `.slide`, not to `.slide-inner` or child elements.
**Warning signs:** Horizontal swipes work on some slides but not others (child element conflict).

### Pitfall 3: Page Visibility Resume Creates a Double-Advance
**What goes wrong:** Timer resumes correctly, but the first slide advance after tab restore happens at `secondsLeft` AND then immediately resets to 120s via `resetAutoAdvance()` inside `goToSlide()`, which is correct behavior — but if `secondsLeft` is 0 or negative, the resumed `autoTimer` fires immediately on next tick.
**Why it happens:** `countdownTimer` decrements `secondsLeft` but `secondsLeft` is clamped to 0 (line 1116: `if (secondsLeft < 0) secondsLeft = 0`). If the tab was hidden for longer than the timer duration, `secondsLeft` will be 0 when restored.
**How to avoid:** Guard the resume: if `secondsLeft <= 0`, call `resetAutoAdvance()` (which starts fresh at 120s) instead of resuming. This is the correct behavior — tab was hidden so long the timer would have advanced anyway.
**Warning signs:** Slide jumps immediately when returning to a long-hidden tab.

### Pitfall 4: `.slide-dot` `::before` Pseudo-Element Blocked by `mix-blend-mode`
**What goes wrong:** The `.slide-nav` has `mix-blend-mode: difference` (line 90). Pseudo-elements on children inherit blend mode context.
**Why it happens:** `mix-blend-mode` on the parent creates a stacking context that may clip or distort the pseudo-element's visual appearance.
**How to avoid:** The `::before` pseudo-element has no background color (it's invisible), so `mix-blend-mode` on the parent doesn't affect it visually. However, if testing shows any visual artifact, add `mix-blend-mode: normal` to the `::before` pseudo-element.
**Warning signs:** Visible ghost artifact where the tap target area sits.

### Pitfall 5: `overscroll-behavior-x` on iOS < 16
**What goes wrong:** The horizontal swipe-to-browser-back gesture still fires on older iOS devices (iOS 15 and below).
**Why it happens:** `overscroll-behavior-x: contain` is only supported in iOS Safari 16+. Devices on iOS 15 ignore the property.
**How to avoid:** Per STATE.md blocker — this is a known limitation, accepted for phase 1. Do not add JS `preventDefault` fallback (that path requires `passive: false` and has thread-blocking implications). Document as a known limitation in verification.
**Warning signs:** On iOS 15 devices, hard horizontal swipe navigates the browser back.

---

## Code Examples

### MCSS-01 Viewport Unit Replacement (3 locations)
```css
/* Source: https://caniuse.com/viewport-unit-variants — 93.09% global support for svh */

/* Line 34: body */
body {
  /* ... existing properties ... */
  height: 100vh;   /* REPLACE: was height: 100dvh; */
  height: 100svh;  /* ADD: override for modern browsers */
}

/* Line 40: .deck */
.deck { height: 100vh; height: 100svh; overflow: hidden; position: relative; }

/* Line 65: .slide-inner */
.slide-inner {
  width: 100%; min-height: 100vh; min-height: 100svh;
  display: flex; align-items: center; justify-content: center;
  padding: 5rem 4rem;
}
```

### MCSS-02 + MCSS-04: touch-action and overscroll on .slide
```css
/* Source: https://caniuse.com/mdn-css_properties_touch-action_pan-y (iOS Safari 13+) */
/* Source: https://caniuse.com/css-overscroll-behavior (iOS Safari 16+) */

/* Line 42 area — extend existing .slide rule */
.slide {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transform: translateY(40px);
  transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none; overflow-y: auto; overflow-x: hidden;
  touch-action: pan-y;             /* ADD: browser handles vertical, JS handles horizontal */
  overscroll-behavior-x: contain;  /* ADD: prevent horizontal swipe triggering browser nav */
}
```

### MCSS-03: Nav Dot Touch Target (44px via ::before)
```css
/* Source: Apple HIG — minimum 44x44pt touch target */

/* Line 93 area — extend existing .slide-dot rule */
.slide-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: rgba(255,255,255,0.25); cursor: pointer;
  transition: all 0.4s ease; border: none; padding: 0;
  position: relative; /* ADD: required for ::before positioning */
}

.slide-dot::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 44px;
  height: 44px;
  /* no background — invisible hit expansion */
}
```

### MJS-02: Touch Handler Bug Fix
```javascript
// Source: CONTEXT.md — fix for bug at line 1247
// FIX: capture scroll element at touchstart (when finger lands), not touchend

// Add to variable declarations alongside line 1233:
let touchStartY = 0, touchStartX = 0, touchScrollEl = null; // ADD touchScrollEl

// Replace touchstart listener (lines 1234-1236):
document.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
  touchStartX = e.touches[0].clientX;
  touchScrollEl = e.target.closest('.scroll-content'); // ADD: capture at finger-down
}, { passive: true }); // passive: true MUST stay

// Replace the scrollEl detection in touchend (lines 1245-1249):
// BEFORE (buggy): const scrollEl = slides[current].querySelector('.scroll-content');
// AFTER (fixed):
if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx)) {
  if (touchScrollEl && touchScrollEl.scrollHeight > touchScrollEl.clientHeight + 4) return;
  if (dy > 0) nextSlide(); else prevSlide();
}
```

### MJS-03: Page Visibility API Timer Integration
```javascript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API

// Add to variable declarations (alongside autoTimer, countdownTimer, secondsLeft):
let autoTimerPaused = false;

// Add after stopAutoAdvance() function definition (after line 1132):
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (autoTimer !== null || countdownTimer !== null) {
      stopAutoAdvance(); // clears both intervals
      autoTimerPaused = true;
    }
  } else if (autoTimerPaused) {
    autoTimerPaused = false;
    if (secondsLeft <= 0) {
      // Tab hidden so long the timer expired — restart fresh
      startAutoAdvance();
    } else {
      // Resume countdown display
      countdownTimer = setInterval(() => {
        secondsLeft--;
        if (secondsLeft < 0) secondsLeft = 0;
        updateCounterDisplay();
      }, 1000);
      // Fire slide advance after remaining seconds
      autoTimer = setInterval(() => {
        if (document.getElementById('videoModal').classList.contains('open')) return;
        if (current < slides.length - 1) {
          goToSlide(current + 1);
        } else {
          goToSlide(0);
        }
        // goToSlide() calls resetAutoAdvance() internally, which restarts fresh
      }, secondsLeft * 1000);
    }
  }
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `100vh` on mobile (causes address-bar jitter) | `100svh` with `100vh` fallback | CSS Values Level 4 (2022, widely supported by 2023) | Eliminates layout shift when address bar shows/hides |
| `touchmove` + `preventDefault()` for swipe discrimination | `touch-action: pan-y` (CSS) | iOS Safari 13 (Sept 2019) added pan-y support | Moves gesture discrimination to browser compositor thread; no passive listener hacks needed |
| JS polling `document.hasFocus()` for tab visibility | `visibilitychange` event | Baseline since July 2015 | Event-driven, no polling, covers all hide causes |
| 8px dot with no touch target expansion | 8px dot + `::before` pseudo-element for 44px hit area | N/A — industry standard pattern | Meets Apple HIG + WCAG 2.5.5 without visual change |

**Deprecated/outdated approaches in this project:**
- `100dvh` on body/deck/slide-inner: Not deprecated per se, but wrong for this use case. `dvh` causes visible jitter; `svh` is the correct stable choice.
- `slides[current].querySelector('.scroll-content')` in touchend: Incorrect — uses DOM state at touchend rather than where the finger landed at touchstart.

---

## Open Questions

1. **`.split-image` uses `min-height: 100dvh` (line 164) — should it also be updated?**
   - What we know: User specified 3 fix locations (body, .deck, .slide-inner). `.split-image` was not mentioned.
   - What's unclear: Whether `.split-image` experiences the same jitter on mobile. On mobile (< 900px), the media query at line 169 overrides this to `min-height: 40vh`, so `100dvh` on `.split-image` only applies at 900px+ breakpoint where address bar behavior differs.
   - Recommendation: Leave `.split-image` as-is for phase 1 per user scope. If manual testing reveals jitter on the split-image slide at tablet widths, this is easy to add.

2. **`-webkit-tap-highlight-color` — should it be suppressed on dots/arrows?**
   - What we know: CONTEXT.md listed this under Claude's Discretion. iOS Safari shows a blue/grey highlight flash on tap by default.
   - What's unclear: Whether the current dots visually show this (they use `mix-blend-mode: difference` which may mask it).
   - Recommendation: Add `-webkit-tap-highlight-color: transparent` to `.slide-dot` and `.slide-arrow` as part of MCSS-03 polish. This is a one-line addition per element, zero risk.

3. **Timer resume: should `countdownTimer` visual display be updated immediately on tab restore?**
   - What we know: `secondsLeft` value is accurate (decremented every second by `countdownTimer`). When the tab is hidden, the timer pauses — but the display only updates on the next tick of the resumed `countdownTimer`.
   - What's unclear: Whether the 1-second delay in display update is perceptible/important.
   - Recommendation: Call `updateCounterDisplay()` immediately after resuming, before the interval fires. One extra line.

---

## Sources

### Primary (HIGH confidence)
- https://caniuse.com/viewport-unit-variants — svh global support 93.09%; iOS Safari 15.4+; Chrome 108+
- https://caniuse.com/mdn-css_properties_touch-action_pan-y — `touch-action: pan-y`: iOS Safari 13+ fully supported
- https://caniuse.com/css-overscroll-behavior — `overscroll-behavior-x`: iOS Safari 16+; disabled by default in 14.5-15.8
- https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API — `visibilitychange` event, `document.hidden`: Baseline Widely Available since July 2015
- Existing codebase (direct read, lines 1-1296) — actual current code, no inference

### Secondary (MEDIUM confidence)
- https://web.dev/blog/viewport-units — `svh`/`dvh`/`lvh` explanation and fallback pattern
- https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action — touch-action values and passive listener interaction

### Tertiary (LOW confidence)
- Community sources (CSS-Tricks, DEV Community) on `overscroll-behavior` Safari history — contradictory, superseded by caniuse.com canonical data

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no libraries; all native browser APIs verified against caniuse.com
- Architecture: HIGH — changes are surgical edits to known line numbers in a single file; no structural uncertainty
- Pitfalls: HIGH (scope creep, `touch-action` constraints) / MEDIUM (`overscroll-behavior` iOS < 16 — confirmed gap, fallback path deliberately deferred)
- Browser compatibility: HIGH — all key properties verified against caniuse.com canonical data

**Research date:** 2026-03-02
**Valid until:** 2026-06-01 (stable CSS specs; browser support data changes slowly at this adoption level)

# Phase 4: Slow Auto-Scroll - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Auto-scroll each slide's content from top to bottom during its kiosk-mode interval, adapting scroll speed to content height. Short slides get a subtle Ken Burns zoom instead. Covers SCROLL-01 through SCROLL-04.

</domain>

<decisions>
## Implementation Decisions

### Scroll target
- Whole slide viewport scrolls (not just `.scroll-content` areas)
- "The Wolfond Chair" title stays visible as a fixed overlay during kiosk mode — currently hidden by `body[data-kiosk] .topbar` CSS; needs fix to keep the title element visible while hiding nav dots/arrows/counter
- Video slides (Vimeo iframes, conversation autoplay) scroll like any other slide

### Scroll feel
- Smooth continuous teleprompter-style crawl — viewer should barely notice movement
- Tiny increments via requestAnimationFrame with sub-pixel steps for 60fps rendering
- Adaptive speed per slide: each slide scrolls its full overflow height within its duration
- Manual scroll override during kiosk: Claude's discretion (kiosk already suppresses touch/click)

### Timing sync
- Brief pause at top (~5 seconds) after slide transition before scrolling begins — lets viewer orient and read the heading
- End timing (pause at bottom before advance): Claude's discretion
- Per-slide duration groundwork: support `data-duration="N"` attribute on slide elements, fall back to 120s default. Don't change any slide durations yet — user will tune by editing HTML later

### Short slides (no overflow)
- Subtle Ken Burns zoom effect: scale from 100% to ~102% over the slide duration
- Applies to all short slides including the cover slide (slide 1)
- Zoom resets to 100% on each new slide — no carryover between slides

### Claude's Discretion
- Manual scroll edge case handling during kiosk
- End-of-scroll timing (whether to pause at bottom before advance or scroll right to the end)
- Exact Ken Burns zoom percentage and easing curve
- How to detect "short" vs "tall" slides (threshold for overflow detection)

</decisions>

<specifics>
## Specific Ideas

- "The Wolfond Chair" title is currently missing in kiosk mode — this is a bug from Phase 3's CSS that hides the entire topbar. Phase 4 should fix this: keep the title visible as a fixed overlay while other nav chrome remains hidden.
- The `?kiosk` URL parameter (just added) means auto-scroll must work on page load without keyboard interaction — important for AndroidTV/TV Bro use case.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `startAutoAdvance()` / `stopAutoAdvance()`: Timer management with 120s interval, already handles tab visibility
- `enterKiosk()` / `exitKiosk()`: State toggle functions where auto-scroll start/stop should hook in
- `isKioskMode` flag: Guards all kiosk behavior
- `AUTO_SECONDS` constant: Currently 120, will need to become per-slide via `data-duration`
- `goToSlide(index)`: Slide transition function — scroll reset should happen here

### Established Patterns
- Global `var` declarations for state (required for Playwright `window.xxx` access)
- `data-kiosk` attribute on body for CSS-driven chrome hiding
- `requestAnimationFrame` not yet used in codebase — will be new pattern for scroll
- `setInterval` used for auto-advance timer — auto-scroll needs its own animation loop

### Integration Points
- `enterKiosk()`: Start auto-scroll for current slide
- `exitKiosk()`: Stop auto-scroll, reset scroll positions
- `goToSlide()`: Reset scroll position of previous slide, start scroll on new slide
- `body[data-kiosk] .topbar` CSS: Needs split — hide nav elements but keep title
- `startAutoAdvance()`: Needs to read `data-duration` attribute instead of hardcoded `AUTO_SECONDS`

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-slow-auto-scroll*
*Context gathered: 2026-03-04*

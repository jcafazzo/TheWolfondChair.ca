# Architecture

**Analysis Date:** 2026-03-04

## Pattern Overview

**Overall:** Single-page presentation application with embedded slide deck architecture

**Key Characteristics:**
- Monolithic HTML file containing all presentation content, styles, and JavaScript
- Client-side state management with minimal dependencies
- Viewport-aware navigation with responsive design
- Media-rich content with lazy-loaded assets and embedded video players

## Layers

**Presentation Layer:**
- Purpose: Render slide content and manage visual transitions
- Location: `wolfond-report-2024-2026.html` (CSS styles, lines 9-450)
- Contains: Global CSS variables (color palette, typography scales, transitions), slide layout classes, component styles
- Depends on: None
- Used by: All interactive elements

**Navigation Layer:**
- Purpose: Handle slide traversal, state transitions, and UI updates
- Location: `wolfond-report-2024-2026.html` (JavaScript functions, lines 1240-1337)
- Contains: `goToSlide()`, `nextSlide()`, `prevSlide()`, keyboard/tap/swipe event handlers, counter updates
- Depends on: Presentation Layer (DOM manipulation), State Layer
- Used by: User interactions (keyboard, clicks, touch)

**State Layer:**
- Purpose: Track current slide index and transition state
- Location: `wolfond-report-2024-2026.html` (global variables)
- Contains: `current` (current slide index, 0-based), `isTransitioning` (boolean flag preventing concurrent transitions), `slides` (NodeList of DOM elements)
- Depends on: None
- Used by: Navigation Layer, Counter/Theme Layer

**Content Generation Layer:**
- Purpose: Dynamically generate slide markup from data
- Location: `wolfond-report-2024-2026.html` (function `buildSlides()`, lines 585-1040)
- Contains: 15+ slide template generators (`cover`, `full-image`, `split`, `deep-slide`, `letter-slide`, `grid-slide`, etc.)
- Depends on: Data Layer
- Used by: Initialization layer

**Data Layer:**
- Purpose: Store structured content (publications, team members, conversation videos)
- Location: `wolfond-report-2024-2026.html` (constants and arrays, lines 546-582)
- Contains: `TEAM_PHOTOS` (object mapping names to image URLs), `UHN_IMG`, `CAMPUS_IMG`, `publications` array
- Depends on: None
- Used by: Content Generation Layer

**Media & Autoplay Layer:**
- Purpose: Manage video embeds, autoplay on specific slides, mute controls
- Location: `wolfond-report-2024-2026.html` (functions 1043-1169)
- Contains: `openVideoModal()`, `closeVideoModal()`, `setupConvoAutoplay()`, `toggleVideoMute()`, Vimeo embed URLs
- Depends on: Navigation Layer (triggered on slide transitions)
- Used by: Video modals, Conversations slide, Wolfond Brothers slide

**Counter & Theme Layer:**
- Purpose: Update slide counter display and apply theme (dark/light nav styling)
- Location: `wolfond-report-2024-2026.html` (functions 1137-1240)
- Contains: `updateCounter()`, `getSlideTheme()`, `applyNavTheme()`, auto-advance logic
- Depends on: State Layer, Navigation Layer
- Used by: Navigation Layer on every slide transition

## Data Flow

**Slide Navigation:**

1. User action (arrow key, click, swipe, tap) triggered
2. Event handler (`keydown`, `click`, `touchend`) invokes `nextSlide()` or `prevSlide()`
3. `nextSlide()`/`prevSlide()` call `goToSlide(index)`
4. `goToSlide()` checks state (`isTransitioning`, boundary conditions)
5. State updated: `current = index`, `isTransitioning = true`
6. DOM manipulated: Previous slide gets `.exiting` class, next slide gets `.active` class
7. CSS transition plays (0.8s)
8. After 800ms timeout: `.exiting` class removed, `isTransitioning = false`
9. Side effects triggered: theme applied, counter updated, specific media autoplay configured
10. Auto-advance timer reset

**Initial Page Load:**

1. `window.addEventListener('load', init)` fires when page loaded
2. `init()` function executes:
   - Calls `buildSlides()` to generate all slide HTML from data
   - Sets `deck.innerHTML` with generated slide HTML
   - Queries all `.slide` elements into `slides` NodeList
   - Populates `.slide-nav` with navigation dots
   - Sets first slide to `.active` and applies theme
   - Updates counter display
   - Builds publications list
   - Sets up conversation autoplay
   - Starts auto-advance timer

**State Management:**

- **Current slide:** Global `current` variable (0-based index)
- **Transition flag:** `isTransitioning` prevents rapid successive clicks during animation
- **Slide timeout:** Auto-advance timer (`autoAdvanceTimeout`) pauses on user action, resumes after 5 seconds idle
- **Auto-advance interval:** Conversation slide cycles through random videos (`convoAutoplayInterval`)
- **Video mute state:** Tracked on mute buttons via `data-muted` attribute (not global)

## Key Abstractions

**Slide Variant Pattern:**
- Purpose: Encapsulate different slide layouts and content structures
- Examples: `buildSlide_Cover()`, `buildSlide_FullImage()`, `buildSlide_Split()`, `buildSlide_DeepSlide()`, `buildSlide_LetterSlide()`, `buildSlide_GridSlide()`
- Pattern: Each variant is a function returning HTML string; all concatenated in `buildSlides()`
- Usage: Single HTML file with no separate template files

**Navigation Theme:**
- Purpose: Adapt navigation UI (dots, arrows, counter) to slide background
- Pattern: `getSlideTheme()` returns `'dark'` or `'light'` based on slide classes; `applyNavTheme()` sets `data-nav-theme` attribute on body
- Implementation: CSS attribute selectors (`body[data-nav-theme="light"]`) override colors
- Motivation: Ensure navigation is always readable against any background

**Touch-aware Interaction:**
- Purpose: Support both click/keyboard and touch gestures
- Patterns:
  - `click` event: Right half of viewport advances, left half retreats
  - `touchstart`/`touchend`: Swipe right/left to navigate (minimum 40px threshold, ignores vertical scroll)
  - `keydown`: ArrowLeft/ArrowRight only (ArrowUp/ArrowDown/Space disabled per design)
- Ignored targets: Navigation elements, interactive components (buttons, inputs, iframes, filters)

**Video Autoplay Orchestration:**
- Purpose: Lazy-load and autoplay Vimeo videos only when visible
- Pattern: `goToSlide()` conditionally sets iframe `src` attribute based on slide index
- Specific cases:
  - Slide 12 (Media): Controls two background videos (`mediaCdtxFrame`, `mediaChinFrame`)
  - Slide 15 (Wolfond Brothers): Controls one autoplay video (`gregAutoplayFrame`)
  - Slide 13 (Conversations): Triggers `startConvoAutoplay()` which cycles random videos
- Motivation: Reduce bandwidth, improve initial load time

## Entry Points

**HTML Document:**
- Location: `/wolfond-report-2024-2026.html`
- Triggers: Browser load event
- Responsibilities: Serve entire application (HTML, CSS, JS, content)

**Initialization Function:**
- Location: `init()` function, line 1213
- Triggers: `window.addEventListener('load', init)`
- Responsibilities: Build slide deck from data, populate navigation UI, set initial active slide, start autoplay loops

**Navigation Handler:**
- Location: `goToSlide(index)` function, line 1240
- Triggers: Keyboard, clicks, swipes, navigation dots, arrow buttons, logo click (back to slide 0)
- Responsibilities: Validate navigation, update DOM classes, manage transitions, apply theme, update counter, orchestrate media autoplay

## Error Handling

**Strategy:** Defensive guards and safe defaults

**Patterns:**
- Boundary checking in `goToSlide()`: `if (index < 0 || index >= slides.length) return` prevents out-of-bounds
- Transition locking: `isTransitioning` flag prevents concurrent animations
- Null checks for optional elements: `if (cdtxFrame) { ... }` before setting video src
- Slide index validation: `if (index === current || isTransitioning) return` exits early if no-op
- Safe DOM queries: `document.getElementById()` with existence checks before manipulation

**No try-catch blocks** — application assumes HTML structure is correct and DOM is always available

## Cross-Cutting Concerns

**Logging:** None implemented. Errors silently fail due to guards.

**Validation:** Input validation only (slide indices), no content validation.

**Authentication:** Not applicable — static presentation.

**Responsive Design:** Handled entirely via CSS media queries (`@media (max-width: 768px)`, `@media (max-width: 900px)`):
- Navigation dots hidden on mobile
- Padding reduced
- Split layouts stack to single column
- Video grid collapses to single column

---

*Architecture analysis: 2026-03-04*

# Architecture

**Analysis Date:** 2026-03-02

## Pattern Overview

**Overall:** Single-Page Application (SPA) with Slide Deck Pattern

**Key Characteristics:**
- Monolithic HTML file containing all markup, styles, and logic
- Presentation-driven architecture with slide-based navigation
- Client-side state management for slide progression
- Embedded media (images, videos) with Vimeo integration
- CSS-in-HTML with CSS custom properties for theming

## Layers

**Presentation Layer:**
- Purpose: Render slide-based UI with animations and transitions
- Location: `wolfond-report-2024-2026.html` (styles: lines 9-500+)
- Contains: CSS classes for slide variants, typography, navigation UI, animations
- Depends on: None (CSS only)
- Used by: HTML markup sections

**Markup Layer:**
- Purpose: Semantic HTML structure defining slide content and layout
- Location: `wolfond-report-2024-2026.html` (HTML: lines 670+)
- Contains: Slide templates, media embeds, team cards, publication lists
- Depends on: JavaScript state and data
- Used by: Presentation layer for styling, JavaScript for manipulation

**Logic/Behavior Layer:**
- Purpose: Slide navigation, state management, dynamic content rendering, media controls
- Location: `wolfond-report-2024-2026.html` (script section: lines 1008+)
- Contains: Slide engine, video modal, auto-advance timers, event handlers
- Depends on: DOM API, Vimeo API
- Used by: User interactions, initialization

**Data Layer:**
- Purpose: Publication lists and team member information
- Location: `wolfond-report-2024-2026.html` (embedded objects: `publications`, `team`)
- Contains: Peer-reviewed publication metadata, team member names/roles
- Depends on: None
- Used by: Logic layer for dynamic content generation

## Data Flow

**Initial Page Load:**

1. Browser requests `index.html` (redirect) → serves `wolfond-report-2024-2026.html`
2. Browser parses HTML, loads CSS variables (`:root`), executes inline script
3. `init()` function called on page load (window load event, line 1143+)
4. `buildSlides()` generates all 17 slide HTML templates as strings
5. `deck.innerHTML` populated with generated slide HTML
6. DOM queries populate `slides` NodeList and navigation dots
7. First slide gets `active` class, auto-advance timer starts
8. Publications list populated by `buildPubList()` into `#pubList`
9. Conversation autoplay setup randomly selects one video for background
10. Page becomes interactive for user navigation and interaction

**User Navigation:**

1. User clicks navigation dot, arrow button, or keyboard input
2. `goToSlide(index)` called with target slide index
3. Previous slide removed `active` class, gets `exiting` class
4. Next slide gets `active` class
5. CSS transitions animate opacity/transform over 0.8s
6. After 800ms, `exiting` class removed, transition complete
7. Navigation dots update to reflect current slide
8. Counter updates to show `current / total` slides
9. Media videos on slide 12 load Vimeo iframes on entry, clear on exit
10. Auto-advance timer resets on any user interaction

**Video Playback:**

1. User clicks video thumbnail or opens modal
2. `openVideoModal(vimeoId, caption)` called
3. Modal iframe `src` set to Vimeo player URL with autoplay parameter
4. Modal gets `open` class, then `visible` class (animation delay)
5. Video plays in embedded player
6. User can toggle mute on media slide videos
7. Close button or Escape key calls `closeVideoModal()`
8. Modal animates out, iframe src cleared, body overflow restored

**State Management:**

- `current`: Current slide index (0-16)
- `slides`: NodeList of all .slide elements
- `isTransitioning`: Boolean flag preventing overlapping transitions
- `autoTimer`: Interval ID for auto-advance (120 second intervals)
- `convoPickIndex`: Randomly selected conversation video index
- `secondsLeft`: Countdown display for auto-advance timer
- No external state management; all state lives on window scope

## Key Abstractions

**Slide Template System:**

- Purpose: Generate slide HTML as strings, then inject into DOM
- Examples: `buildSlides()` function returns array of 17 template strings (lines 437-1006)
- Pattern: Template literals with conditional CSS classes, event handlers inline
- Each template represents a unique slide variant (cover, split, deep-slide, dark-slide, grid-slide, etc.)

**Slide Variant Classes:**

- Purpose: Define distinct visual and layout patterns for different content types
- Examples: `cover`, `split`, `split-reverse`, `deep-slide`, `dark-slide`, `letter-slide`, `grid-slide`, `full-image`
- Pattern: CSS classes applied to `.slide` element, define flex/grid layout, background, text colors
- Used for: Cover slide, split text/image, project deep dives, media grid, team showcase, closing image

**Responsive Design System:**

- Purpose: Adapt layout for mobile, tablet, and desktop
- Location: Media queries at lines 69, 119-123, 167-171, 263, 295-298, 858
- Pattern: Mobile-first with breakpoints at 600px, 700px, 768px, 900px
- Adjusts: Padding, grid columns, font sizes via `clamp()`, visibility of UI elements

**Animation Engine:**

- Purpose: Smooth transitions between slides and entrance animations for content
- Patterns:
  - Slide transitions: Opacity 0.8s ease + transform translateY 0.8s cubic-bezier
  - Stagger animations: Child elements animate with 150ms delay increments (lines 53-58)
  - Entrance keyframes: `staggerIn` animates opacity and translateY
- Trigger: `.active` class adds animation, `.exiting` class removes it

**Media Modal System:**

- Purpose: Display videos in fullscreen modal overlay
- Examples: `openVideoModal()`, `closeVideoModal()` (lines 1009-1031)
- Pattern: Modal div with iframe, keyboard escape support, click-outside-to-close
- Supports: Vimeo embed parameters (autoplay, fullscreen, portrait control)

**Publication Rendering:**

- Purpose: Dynamically generate publication list from data array
- Example: `buildPubList()` (referenced but logic in DOM, line 1156)
- Pattern: Iterate `publications` array, append `.pub-row` divs with citation formatting
- Features: Year, author, title, DOI links with visual styling

**Video Muting Control:**

- Purpose: Toggle between muted and unmuted states for background videos
- Example: `toggleVideoMute(btn)` (lines 1075-1094)
- Pattern: Manipulate Vimeo URL parameters (muted=1 → muted=0)
- Features: Visual indicator (speaker icon changes), border color feedback

## Entry Points

**Page Load:**

- Location: `wolfond-report-2024-2026.html` script section
- Triggers: `window.addEventListener('load', init)` or similar
- Responsibilities: Initializes slide deck, builds DOM, starts auto-advance, sets up keyboard listeners

**Navigation Controls:**

- Location: Navigation dots (`.slide-dot`), arrows (`.slide-arrow`), keyboard events
- Triggers: User click or keypress (ArrowRight, ArrowLeft, Space, etc.)
- Responsibilities: Call `goToSlide()` with target index

**Media Playback:**

- Location: Video thumbnails, "Conversations" slide thumbnails, modal triggers
- Triggers: Click on `.convo-thumb`, link in media grid, or carousel controls
- Responsibilities: Load Vimeo iframe, display modal, manage autoplay state

**Keyboard Navigation:**

- Location: Document-level event listener (implied in goToSlide logic)
- Triggers: Arrow keys, Space, Escape
- Responsibilities: Navigate slides, close modals, reset auto-advance timer

## Error Handling

**Strategy:** Minimal error handling; relies on graceful degradation

**Patterns:**

- Missing elements: Null checks (e.g., `if (!element) return;` before accessing properties)
- Vimeo API: Relies on URL-based parameters; no error callback handling
- DOM queries: All queries are defensive (`document.getElementById()`, `.querySelector()`)
- Video loading: No timeout or fallback if Vimeo fails; video simply won't display

## Cross-Cutting Concerns

**Logging:** None implemented. No console logging or analytics.

**Validation:** None implemented. All data is hardcoded or trusted from HTML.

**Authentication:** Not applicable. Public website, no user accounts.

**Accessibility:** Partial implementation
- Semantic HTML with `aria-label` on navigation dots (line 1151)
- Keyboard navigation support (Escape to close modals)
- Color contrast via CSS custom properties
- Missing: ARIA labels for video buttons, form validation, skip-to-content links

**Performance Concerns:**
- All 17 slides rendered upfront (no lazy loading of off-screen slides)
- Full HTML file is 82KB (monolithic, not split)
- CSS not minified; all in head
- Images embedded as separate files in `images/` directory (not WebP optimization for all)
- No caching headers or service worker

---

*Architecture analysis: 2026-03-02*

# Coding Conventions

**Analysis Date:** 2026-03-02

## Naming Patterns

**Files:**
- Single HTML file pattern: `wolfond-report-2024-2026.html`
- Image files use descriptive names: `Henry_wolfond.jpg`, `sejal_bhalla.jpg`, `brenna.jpg`, `alicia.jpg`
- Local image paths referenced as: `images/[name].[ext]`
- External images sourced from Squarespace CDN

**Functions:**
- camelCase naming: `buildSlides()`, `goToSlide()`, `nextSlide()`, `prevSlide()`, `startAutoAdvance()`, `stopAutoAdvance()`
- Verb-prefix pattern for actions: `setup`, `start`, `stop`, `reset`, `build`, `open`, `close`, `toggle`, `update`
- Noun-suffix for return values: `updateCounterDisplay()`, `buildPubList()`, `teamAvatar()`
- DOM manipulation: `openVideoModal()`, `closeVideoModal()`, `toggleVideoMute()`

**Variables:**
- Constants in UPPER_SNAKE_CASE: `AUTO_SECONDS`, `CONVO_SLIDE_INDEX`, `TEAM_PHOTOS`, `CONVO_VIDEOS`, `UHN_IMG`, `CAMPUS_IMG`
- Data structures in camelCase: `publications`, `team`, `slides`, `current`, `autoTimer`, `countdownTimer`
- DOM state trackers: `isTransitioning`, `wheelTimeout`, `edgeScrollCount`, `convoPickIndex`
- HTML attribute naming: `data-target`, `data-muted`, `data-convo-index`

**Types:**
- Object literals for configuration: `{ year: 2026, cite: '...', doi: '...' }`
- Array-based collections: `publications[]`, `team[]`, `CONVO_VIDEOS[]`
- DOM element classes with hyphenated names: `.slide-dot`, `.slide-counter`, `.t-display`, `.team-avatar`

## Code Style

**Formatting:**
- Inline CSS within `<style>` block using custom properties (CSS variables)
- Comments use formal marker style: `/* ═══ SECTION NAME ═══ */`
- Function chains without excessive line breaks
- Template literals for dynamic HTML generation
- Ternary operators for conditional class/value assignment

**Linting:**
- No formal linter detected (single-file static presentation)
- Manual formatting consistency observed
- CSS custom properties replace magic numbers: `--black`, `--white`, `--gray-*`, `--serif`, `--sans`, `--transition`

## Import Organization

**Not applicable** - Single HTML file with embedded `<style>` and `<script>` blocks.

**External resources:**
- Google Fonts imported via `<link>` tags
- Vimeo embeds via iframe `src` attributes with parameter chains
- Squarespace CDN for team photos
- Local image directory: `images/`

## Error Handling

**Patterns:**
- Defensive DOM queries with null checks: `if (!slot) return;`, `if (!list) return;`
- Modal validation: `if (e && e.target.closest('.video-modal-inner') && !e.target.closest('.video-modal-close'))`
- Safe attribute access: `btn.getAttribute('data-muted') === 'true'`
- Try-safe element manipulation: Check element existence before modifying
- Event listener guards: Check slide state before action (`if (document.getElementById('videoModal').classList.contains('open')) return;`)

## Logging

**Framework:** Browser console only (no explicit logging framework)

**Patterns:**
- No debug logging in production code
- No error logging infrastructure
- Silent failures for missing DOM elements (e.g., `if (!list) return;`)

## Comments

**When to Comment:**
- Section headers use decorative markers: `// ═══ SECTION NAME ═══`
- Inline explanation for non-obvious logic
- Data source documentation (e.g., `// 2 minutes` for `AUTO_SECONDS = 120`)
- Slide numbering in `buildSlides()` function: `// 0 — COVER`, `// 1 — FULL IMAGE STATEMENT`

**JSDoc/TSDoc:**
- Not used (single-file, minimal function documentation needed)

## Function Design

**Size:**
- Single-responsibility functions: 40-60 lines typical
- Complex functions like `goToSlide()` around 50 lines, handling slide transition and state
- Helper functions like `teamAvatar()` minimal (5-15 lines)

**Parameters:**
- Single parameter pattern common: `goToSlide(index)`, `teamAvatar(name)`, `openVideoModal(vimeoId, caption)`
- Minimal parameters (0-2 typical)
- Event objects passed through: `closeVideoModal(e)`, `toggleVideoMute(btn)`

**Return Values:**
- Functions that build HTML return strings (template literals)
- State modifier functions return nothing (void)
- Helper functions like `teamAvatar()` return constructed HTML strings

## Module Design

**Exports:**
- Single file = no module exports
- Global scope used for all functions and constants
- Event listeners attached to `document` or `window`

**Barrel Files:**
- Not applicable (single HTML file)

**Data Organization:**
- All data constants at top of script block (lines 455-547)
- Function definitions follow (lines 551+)
- Initialization at bottom via `window.addEventListener('load', init)`

---

*Convention analysis: 2026-03-02*

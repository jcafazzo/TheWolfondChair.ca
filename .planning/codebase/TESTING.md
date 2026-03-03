# Testing Patterns

**Analysis Date:** 2026-03-02

## Test Framework

**Runner:**
- Not detected - No test framework configured
- Single-file static HTML presentation
- Manual testing only (browser-based)

**Assertion Library:**
- None

**Run Commands:**
```bash
# Manual testing only - open in browser
open wolfond-report-2024-2026.html

# No automated test suite
```

## Test File Organization

**Location:**
- No test files present
- Testing not applicable to this presentation format

**Naming:**
- No test files

**Structure:**
- Not applicable

## Test Structure

**Suite Organization:**
- No test framework present
- Code is primarily presentation logic and DOM manipulation

## Mocking

**Framework:** Not used

**Patterns:**
- No external API calls that require mocking
- Vimeo embeds loaded via iframe (no mock needed)
- Team photo URLs stored in `TEAM_PHOTOS` constant - could be mocked if needed but currently hardcoded

**What to Mock:**
- External image CDN URLs (Squarespace, Vimeo)
- Local image paths

**What NOT to Mock:**
- DOM operations (querySelector, classList manipulation)
- Browser events (click, keydown, wheel, touch)

## Fixtures and Factories

**Test Data:**
- `publications` array: 35 publication objects with year, citation, and DOI
  - Location: `wolfond-report-2024-2026.html` lines 457-490
  - Pattern:
    ```javascript
    const publications = [
      { year: 2026, cite: '<strong>Author.</strong> Title. <em>Journal</em>.', doi: '10.1016/...' },
      { year: 2025, cite: '...', doi: '...' },
    ];
    ```

- `team` array: 17 team member objects with name and role
  - Location: `wolfond-report-2024-2026.html` lines 492-510
  - Pattern:
    ```javascript
    const team = [
      { name: 'Sejal Bhalla', role: 'PhD, Computer Science' },
      { name: 'Antonia Barbaric', role: 'PhD, Health Policy' },
    ];
    ```

- `TEAM_PHOTOS` object: Maps team member names to image URLs
  - Location: `wolfond-report-2024-2026.html` lines 512-537
  - Includes both Squarespace CDN URLs and local `images/` paths
  - Fallback: generates initials if photo not found

- `CONVO_VIDEOS` array: Vimeo video IDs for conversation autoplay
  - Location: `wolfond-report-2024-2026.html` lines 1034-1040
  - Pattern:
    ```javascript
    const CONVO_VIDEOS = [
      { id: '1169672887', name: 'Jaclyn Hearnden' },
    ];
    ```

**Location:**
- All fixtures defined at top of script block in `wolfond-report-2024-2026.html` (lines 456-547)
- No separate fixture files

## Coverage

**Requirements:** Not enforced

**View Coverage:**
- No coverage tools configured

## Test Types

**Unit Tests:**
- Not applicable - no test framework

**Integration Tests:**
- Not applicable - presentation is single-file static HTML

**E2E Tests:**
- Manual browser testing only
- Can be tested by:
  1. Opening file in browser
  2. Testing keyboard navigation (arrow keys, space)
  3. Testing touch/swipe on mobile
  4. Testing mouse wheel scrolling
  5. Clicking navigation dots
  6. Opening/closing modals
  7. Auto-advance functionality

## Common Patterns

**Manual Testing Checklist:**
- Slide navigation works (keyboard, arrows, dots, swipe)
- Auto-advance timer counts down correctly
- Video modal opens and closes properly
- Video autoplay functions trigger on correct slides
- Scroll behavior works for publication lists
- Touch gestures recognized (swipe detection, edge scroll)
- Keyboard shortcuts work (arrows, space, Escape)
- Mobile responsive layout functions
- Image loading and caching
- Vimeo iframe embeds load correctly

**Browser Compatibility:**
- Modern browser features used:
  - `requestAnimationFrame()` (line 1017)
  - `Object.closest()` (line 1020)
  - Template literals (throughout)
  - CSS Grid and Flexbox
  - CSS custom properties
  - `aspect-ratio` CSS property
  - `dvh` (dynamic viewport height) units

**Performance Considerations:**
- Debounced wheel event with timeout (line 1276)
- Edge scroll tracking to prevent excess slide advances (line 1267-1268)
- Lazy loading images: `loading="lazy"` attribute on team photos
- requestAnimationFrame for modal transitions (line 1017)
- Conditional iframe src assignment (lines 1177-1189) to prevent loading videos off-screen

---

*Testing analysis: 2026-03-02*

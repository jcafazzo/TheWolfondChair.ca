# Coding Conventions

**Analysis Date:** 2026-03-04

## Naming Patterns

**Files:**
- Single HTML file pattern: `wolfond-report-2024-2026.html`
- Test files use `.spec.ts` suffix: `navigation.spec.ts`, `video-modal.spec.ts`, `desktop-regression.spec.ts`, `mobile-viewport.spec.ts`
- Configuration files: `playwright.config.ts`, `package.json`
- Image files use descriptive names: `Henry_wolfond.jpg`, `sejal_bhalla.jpg`

**Functions:**
- camelCase naming: `buildSlides()`, `goToSlide()`, `nextSlide()`, `prevSlide()`, `startAutoAdvance()`, `stopAutoAdvance()`
- Verb-prefix pattern for actions: `setup`, `start`, `stop`, `reset`, `build`, `open`, `close`, `toggle`, `update`
- Noun-suffix for return values: `updateCounterDisplay()`, `buildPubList()`, `teamAvatar()`
- DOM manipulation: `openVideoModal()`, `closeVideoModal()`, `toggleVideoMute()`
- Test helper functions in camelCase: `getTotalSlides()`, `getCurrentSlideIndex()`, `counterText()`

**Variables:**
- Constants in UPPER_SNAKE_CASE: `AUTO_SECONDS`, `CONVO_SLIDE_INDEX`, `TEAM_PHOTOS`, `CONVO_VIDEOS`, `UHN_IMG`, `CAMPUS_IMG`
- Data structures in camelCase: `publications`, `team`, `slides`, `current`, `autoTimer`, `countdownTimer`
- DOM state trackers: `isTransitioning`, `wheelTimeout`, `edgeScrollCount`, `convoPickIndex`
- Booleans use `is` prefix: `isTransitioning`, `autoTimerPaused`
- HTML attribute naming: `data-target`, `data-muted`, `data-convo-index`

**Types:**
- TypeScript in test files uses basic parameter types: `async ({ page })`, `(slideNum: number, total: number)`, `(page: any)`
- Object literals for configuration: `{ year: 2026, cite: '...', doi: '...' }`
- Array-based collections: `publications[]`, `team[]`, `CONVO_VIDEOS[]`
- DOM element classes with hyphenated names: `.slide-dot`, `.slide-counter`, `.t-display`, `.team-avatar`

## Code Style

**Formatting:**
- Inline CSS within `<style>` block using custom properties (CSS variables)
- Comments use formal marker style: `/* ═══ SECTION NAME ═══ */`
- Function chains without excessive line breaks
- Template literals for dynamic HTML generation in application code
- Ternary operators for conditional class/value assignment
- Test files use consistent indentation (2 spaces)

**Linting:**
- No formal linter configured for application code
- Manual formatting consistency observed
- Test code follows Playwright conventions without strict linter
- CSS custom properties replace magic numbers: `--black`, `--white`, `--gray-*`, `--serif`, `--sans`

## Import Organization

**Application Code:**
- Single HTML file with embedded `<style>` and `<script>` blocks
- External resources via `<link>` tags
- Vimeo embeds via iframe `src` attributes

**Test Code:**
```typescript
import { test, expect } from '@playwright/test';
```

**External resources:**
- Google Fonts imported via `<link>` tags
- Vimeo embeds via iframe with parameter chains
- Squarespace CDN for team photos
- Local image directory: `images/`

## Error Handling

**Application Code Patterns:**
- Defensive DOM queries with null checks: `if (!slot) return;`, `if (!list) return;`
- Modal validation: `if (e && e.target.closest('.video-modal-inner') && !e.target.closest('.video-modal-close'))`
- Safe attribute access: `btn.getAttribute('data-muted') === 'true'`
- Try-safe element manipulation: Check element existence before modifying
- Event listener guards: Check slide state before action (`if (document.getElementById('videoModal').classList.contains('open')) return;`)

**Test Code Patterns:**
- Playwright auto-retry assertions for timing issues: `await expect(page.locator('#videoModal')).not.toHaveClass(/open/);`
- Null/undefined checks before dereferencing:
  ```typescript
  const text = await page.locator('#slideCounter').textContent();
  const match = text?.match(/^(\d+)\s*\/\s*\d+$/);
  if (!match) throw new Error(`Unexpected counter text: ${text}`);
  ```
- Guard clauses with explicit error throws
- `test.skip()` for conditional test skipping: `if (scrollSlideIndex === -1) { test.skip(); return; }`

## Logging

**Framework:** Browser console only (no explicit logging framework)

**Patterns:**
- No debug logging in production code
- No error logging infrastructure
- Silent failures for missing DOM elements
- Tests use implicit assertions and Playwright's built-in reporting

## Comments

**When to Comment:**
- Section headers use decorative markers: `// ═══ SECTION NAME ═══`
- Inline explanation for non-obvious logic
- Data source documentation (e.g., `// 2 minutes` for `AUTO_SECONDS = 120`)
- Slide numbering in `buildSlides()` function: `// 0 — COVER`, `// 1 — FULL IMAGE STATEMENT`
- Test preconditions and setup explained: `// Wait for isTransitioning to clear`
- Complex assertions documented: `// Nav dots have 44px ::before touch targets that overlap with adjacent dots.`

**JSDoc/TSDoc:**
- Not used in application code
- Basic TypeScript parameter types in test helpers: `(page: any): Promise<number>`

## Function Design

**Size:**
- Single-responsibility functions: 40-60 lines typical in application
- Complex functions like `goToSlide()` around 50 lines, handling slide transition and state
- Helper functions like `teamAvatar()` minimal (5-15 lines)
- Test functions typically 10-40 lines per test case

**Parameters:**
- Single parameter pattern common: `goToSlide(index)`, `teamAvatar(name)`, `openVideoModal(vimeoId, caption)`
- Minimal parameters (0-2 typical)
- Event objects passed through: `closeVideoModal(e)`, `toggleVideoMute(btn)`
- Test helpers accept page context and numeric/string parameters: `getTotalSlides(page)`, `counterText(slideNum, total)`

**Return Values:**
- Functions that build HTML return strings (template literals)
- State modifier functions return nothing (void)
- Helper functions like `teamAvatar()` return constructed HTML strings
- Test helpers return primitive types: numbers, strings, or undefined
- Async functions in tests return Promises

## Module Design

**Exports:**
- Single file application = no module exports
- Global scope used for all functions and constants
- Event listeners attached to `document` or `window`
- Test files use named test groups via `test.describe()`

**Barrel Files:**
- Not applicable for application (single HTML file)
- Tests organized by feature in separate files:
  - `tests/navigation.spec.ts` - slide navigation tests
  - `tests/video-modal.spec.ts` - video modal behavior
  - `tests/desktop-regression.spec.ts` - desktop UI verification
  - `tests/mobile-viewport.spec.ts` - mobile responsiveness

**Data Organization:**
- Application: All data constants at top of script block
- Function definitions follow data definitions
- Initialization at bottom via `window.addEventListener('load', init)`
- Tests: Setup via `test.beforeEach()` hook, helpers defined within suite, test cases follow

---

*Convention analysis: 2026-03-04*

# Testing Patterns

**Analysis Date:** 2026-03-04

## Test Framework

**Runner:**
- Playwright Test `@playwright/test` version ^1.58.2
- Config: `playwright.config.ts`

**Assertion Library:**
- Playwright Test built-in assertions: `expect()`

**Run Commands:**
```bash
npm test                           # Run all tests
npx playwright test                # Run all tests with Playwright CLI
npx playwright test --ui           # Run tests with interactive UI
npx playwright test tests/navigation.spec.ts  # Run specific test file
npx playwright show-report         # View HTML test report
```

## Test File Organization

**Location:**
- Tests in `/tests` directory: `tests/navigation.spec.ts`, `tests/video-modal.spec.ts`, `tests/desktop-regression.spec.ts`, `tests/mobile-viewport.spec.ts`
- Co-located with project root (not alongside application code)

**Naming:**
- `.spec.ts` suffix for all test files
- Filename describes test subject: `navigation.spec.ts`, `video-modal.spec.ts`, `desktop-regression.spec.ts`

**Structure:**
```
tests/
├── navigation.spec.ts                 # Slide navigation behavior
├── video-modal.spec.ts                # Video modal interactions
├── desktop-regression.spec.ts         # Desktop UI regression tests
└── mobile-viewport.spec.ts            # Mobile responsive tests
```

## Test Structure

**Suite Organization:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.slide.active');
  });

  test('ArrowRight advances slide', async ({ page }) => {
    // Test implementation
  });
});
```

**Patterns:**
- Use `test.describe()` to group related tests by feature
- Use `test.beforeEach()` to set up common preconditions (page navigation, wait for readiness)
- Each test case uses single `test()` function with descriptive name
- Async/await pattern for all test code
- Page fixture passed via destructuring: `async ({ page })`

**Standard Setup Pattern (in `beforeEach`):**
```typescript
test.beforeEach(async ({ page }) => {
  await page.goto('/');                           // Navigate to base URL
  await page.waitForSelector('.slide.active');    // Wait for initial render
});
```

## Test Structure Examples

**Helper Functions Pattern** (`tests/navigation.spec.ts` lines 9-25):
```typescript
// Helper to get total slide count from DOM
async function getTotalSlides(page: any): Promise<number> {
  return page.evaluate(() => document.querySelectorAll('.slide').length);
}

// Helper to get current slide index from counter text (counter is "NN / TT", 1-based)
async function getCurrentSlideIndex(page: any): Promise<number> {
  const text = await page.locator('#slideCounter').textContent();
  const match = text?.match(/^(\d+)\s*\/\s*\d+$/);
  if (!match) throw new Error(`Unexpected counter text: ${text}`);
  return parseInt(match[1], 10) - 1; // convert to 0-based
}

// Helper to format expected counter text
function counterText(slideNum: number, total: number): string {
  return `${String(slideNum).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
}
```

**Interaction Pattern - Keyboard** (`tests/navigation.spec.ts` lines 27-33):
```typescript
test('ArrowRight advances slide', async ({ page }) => {
  const total = await getTotalSlides(page);
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#slideCounter')).toHaveText(counterText(2, total));
  const current = await getCurrentSlideIndex(page);
  expect(current).toBe(1);
});
```

**Interaction Pattern - Mouse Click** (`tests/navigation.spec.ts` lines 48-59):
```typescript
test('dot click navigates to target slide', async ({ page }) => {
  const total = await getTotalSlides(page);
  // Use dispatchEvent to trigger onclick handler directly
  await page.evaluate(() => {
    const dots = document.querySelectorAll('.slide-dot');
    (dots[4] as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await expect(page.locator('#slideCounter')).toHaveText(counterText(5, total));
  await expect(page.locator('.slide-dot').nth(4)).toHaveClass(/active/);
});
```

**Interaction Pattern - Direct Function Call** (`tests/video-modal.spec.ts` lines 20-37):
```typescript
test('modal closes via close button and clears iframe src', async ({ page }) => {
  // Open modal programmatically for reliable setup
  await page.evaluate(() => (window as any).openVideoModal('1169672887', 'Test'));
  // Wait for visible class to appear
  await expect(page.locator('#videoModal')).toHaveClass(/visible/);

  // Click the close button
  await page.locator('.video-modal-close').click();

  // Assert visible class removed immediately
  await expect(page.locator('#videoModal')).not.toHaveClass(/visible/);
  // Assert open class removed after 350ms timeout (Playwright auto-retries)
  await expect(page.locator('#videoModal')).not.toHaveClass(/open/);

  // Verify iframe src is cleared
  const src = await page.locator('#videoModalFrame').getAttribute('src');
  expect(src).toBeFalsy();
});
```

**Timing Pattern - Wait for Transitions** (`tests/navigation.spec.ts` lines 35-46):
```typescript
test('ArrowLeft retreats slide', async ({ page }) => {
  const total = await getTotalSlides(page);
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#slideCounter')).toHaveText(counterText(2, total));
  await page.waitForTimeout(850); // wait for isTransitioning to clear
  // Now retreat
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#slideCounter')).toHaveText(counterText(1, total));
});
```

**CSS Property Verification** (`tests/desktop-regression.spec.ts` lines 84-93):
```typescript
test('slide transition animates — active slide has opacity transition', async ({ page }) => {
  await page.evaluate(() => (window as any).goToSlide(1));
  await page.waitForTimeout(850);
  const transitionValue = await page.locator('.slide.active').evaluate(
    (el) => getComputedStyle(el).transition
  );
  expect(transitionValue).toContain('opacity');
});
```

**Viewport and Dimensions** (`tests/mobile-viewport.spec.ts` lines 41-45):
```typescript
test('slide inner fits within viewport width', async ({ page }) => {
  const box = await page.locator('.slide.active .slide-inner').boundingBox();
  const viewport = page.viewportSize()!;
  expect(box!.width).toBeLessThanOrEqual(viewport.width + 1); // 1px tolerance
});
```

**Conditional Skip** (`tests/mobile-viewport.spec.ts` lines 47-72):
```typescript
test('content-heavy slide scroll-content has scrollable overflow', async ({ page }) => {
  const scrollSlideIndex = await page.evaluate(() => {
    const slides = document.querySelectorAll('.slide');
    for (let i = 0; i < slides.length; i++) {
      if (slides[i].querySelector('.scroll-content')) return i;
    }
    return -1;
  });

  // Only run if a scroll-content slide exists
  if (scrollSlideIndex === -1) {
    test.skip(); // no scroll-content slide found
    return;
  }
  // Test continues...
});
```

## Mocking

**Framework:** Playwright's built-in fixtures and page context

**Patterns:**
- No external API mocks needed
- DOM queries and evaluation for testing JavaScript state
- Vimeo embeds loaded via iframe (no mock needed)
- Direct function invocation via `page.evaluate()`: `(window as any).goToSlide(13)`

**What to Mock:**
- External Vimeo video IDs (if testing edge cases)
- Image URLs (if testing image failure scenarios)

**What NOT to Mock:**
- DOM operations (querySelector, classList manipulation)
- Browser events (click, keydown, wheel, touch)
- Navigation and routing (tests hit actual HTML file)

## Fixtures and Factories

**Test Data:**
- No persistent test fixtures needed
- Data is embedded in `wolfond-report-2024-2026.html`:
  - `publications` array: publication objects (lines 491-525)
  - `team` array: team member objects (lines 526-545)
  - `CONVO_VIDEOS` array: Vimeo video IDs (lines 1068-1074)

**Helper Functions (Test-Specific):**
- `getTotalSlides(page)` - Evaluates DOM to count slides
- `getCurrentSlideIndex(page)` - Parses counter text and converts to 0-based index
- `counterText(slideNum, total)` - Formats expected counter display text
- Re-used across multiple test files via duplication (not abstracted to shared file)

**Location:**
- Helpers defined within each test file (`tests/*.spec.ts`) where needed
- No shared fixture/factory files

## Coverage

**Requirements:** Not enforced

**Targets:**
- Navigation: 4 test files covering 31 test cases
- Focus on critical user interactions and responsive behavior
- Not comprehensive (partial coverage of features)

**View Coverage:**
```bash
# Playwright generates HTML report automatically
npx playwright show-report
```

## Test Types

**Unit Tests:**
- Not applicable - tests are integration/E2E focused

**Integration Tests:**
- Form the majority of test suite
- Test DOM interactions and state changes
- Example: Navigation tests verify slide counter updates, DOM state changes, keyboard/click handling

**E2E Tests:**
- Playwright projects configured for multiple browsers and viewports:
  - `desktop-chromium` (1280x800)
  - `mobile-iphone14` (default iPhone 14 viewport)
  - `mobile-pixel5` (default Pixel 5 viewport)
- Tests run on actual HTML file with Python HTTP server (`http.server 8080`)

## Playwright Configuration Details

**From `playwright.config.ts`:**

```typescript
export default defineConfig({
  testDir: './tests',                    // Test file location
  retries: 0,                            // No auto-retries on failure
  workers: 1,                            // Single worker (sequential execution)
  reporter: [
    ['html', { open: 'never' }],         // HTML report (not auto-opened)
    ['list']                              // Terminal list reporter
  ],
  webServer: {
    command: 'python3 -m http.server 8080',  // Serve files
    url: 'http://localhost:8080',            // Health check URL
    reuseExistingServer: !process.env.CI,    // Reuse in local dev
    stdout: 'ignore',
    stderr: 'pipe',
  },
  use: {
    baseURL: 'http://localhost:8080/wolfond-report-2024-2026.html',
    trace: 'on-first-retry',             // Trace on failure
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'mobile-iphone14',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'mobile-pixel5',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
```

## Common Patterns

**Assertion Patterns:**

1. **Text Content:**
   ```typescript
   await expect(page.locator('#slideCounter')).toHaveText(counterText(2, total));
   ```

2. **CSS Classes:**
   ```typescript
   await expect(page.locator('.slide-dot').nth(4)).toHaveClass(/active/);
   await expect(page.locator('#videoModal')).toHaveClass(/open/);
   await expect(page.locator('#videoModal')).not.toHaveClass(/visible/);
   ```

3. **CSS Properties:**
   ```typescript
   await expect(page.locator('.slide.active')).toHaveCSS('touch-action', 'pan-y');
   ```

4. **Attributes:**
   ```typescript
   await expect(page.locator('#videoModalFrame')).toHaveAttribute('src', /vimeo/);
   ```

5. **Visibility:**
   ```typescript
   await expect(page.locator('.topbar')).toBeVisible();
   ```

6. **Computed Values:**
   ```typescript
   const lightColor = await page.locator('.topbar-logo').evaluate(
     (el) => getComputedStyle(el).color
   );
   ```

**Waiting Patterns:**

1. **Wait for Selector:**
   ```typescript
   await page.waitForSelector('.slide.active');
   ```

2. **Fixed Wait (for animations):**
   ```typescript
   await page.waitForTimeout(850); // 800ms transition + 50ms buffer
   ```

3. **Scroll Into View:**
   ```typescript
   await page.locator('.convo-thumb').first().scrollIntoViewIfNeeded();
   ```

**Navigation Patterns:**

1. **Keyboard:**
   ```typescript
   await page.keyboard.press('ArrowRight');
   await page.keyboard.press('Escape');
   ```

2. **Mouse Click:**
   ```typescript
   await page.locator('.slide-arrow').nth(1).click();
   ```

3. **Direct Function Call:**
   ```typescript
   await page.evaluate((idx) => (window as any).goToSlide(idx), 3);
   ```

4. **Event Dispatch:**
   ```typescript
   await page.evaluate(() => {
     const dots = document.querySelectorAll('.slide-dot');
     (dots[4] as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
   });
   ```

---

*Testing analysis: 2026-03-04*

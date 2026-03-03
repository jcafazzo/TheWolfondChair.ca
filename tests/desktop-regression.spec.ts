import { test, expect } from '@playwright/test';

/**
 * Desktop regression tests — runs on desktop-chromium (1280x800).
 * Confirms Phase 1 mobile changes did not break the desktop experience.
 */
test.describe('Desktop regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.slide.active');
  });

  // Helper to format expected counter text
  function counterText(slideNum: number, total: number): string {
    return `${String(slideNum).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  }

  test('topbar is fixed and visible', async ({ page }) => {
    await expect(page.locator('.topbar')).toBeVisible();
    await expect(page.locator('.topbar')).toHaveCSS('position', 'fixed');
  });

  test('cover slide layout is correct — slide-inner visible and no overflow', async ({ page }) => {
    // On slide 0 (cover), the .slide.active .slide-inner should be visible
    await expect(page.locator('.slide.active .slide-inner')).toBeVisible();
    // Bounding box width should not exceed viewport width
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
  });

  test('no horizontal scrollbar on representative slides', async ({ page }) => {
    const total = await page.evaluate(
      () => document.querySelectorAll('.slide').length
    );
    // Check several representative slides: 0 (cover), 5 (mid), 10 (later), last
    const slideIndices = [0, 5, 10, total - 1];

    for (const idx of slideIndices) {
      await page.evaluate((i: number) => (window as any).goToSlide(i), idx);
      await page.waitForTimeout(850);
      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
    }
  });

  test('navigation works on desktop — keyboard ArrowRight and ArrowLeft', async ({ page }) => {
    const total = await page.evaluate(
      () => document.querySelectorAll('.slide').length
    );
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#slideCounter')).toHaveText(counterText(2, total));
    await page.waitForTimeout(850);
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#slideCounter')).toHaveText(counterText(1, total));
  });

  test('navigation works on desktop — dot clicks', async ({ page }) => {
    const total = await page.evaluate(
      () => document.querySelectorAll('.slide').length
    );
    // Click dot at index 3 (slide 4), verify counter shows 04
    await page.evaluate(() => {
      const dots = document.querySelectorAll('.slide-dot');
      (dots[3] as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await expect(page.locator('#slideCounter')).toHaveText(counterText(4, total));

    await page.waitForTimeout(850);

    // Click dot at index 0 (slide 1), verify counter shows 01
    await page.evaluate(() => {
      const dots = document.querySelectorAll('.slide-dot');
      (dots[0] as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await expect(page.locator('#slideCounter')).toHaveText(counterText(1, total));
  });

  test('slide transition animates — active slide has opacity transition', async ({ page }) => {
    // Navigate to slide 1 and check the active slide has an opacity transition
    await page.evaluate(() => (window as any).goToSlide(1));
    await page.waitForTimeout(850);
    // The active slide should have a CSS transition that includes 'opacity'
    const transitionValue = await page.locator('.slide.active').evaluate(
      (el) => getComputedStyle(el).transition
    );
    expect(transitionValue).toContain('opacity');
  });
});

import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.slide.active');
  });

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

  test('ArrowRight advances slide', async ({ page }) => {
    const total = await getTotalSlides(page);
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#slideCounter')).toHaveText(counterText(2, total));
    const current = await getCurrentSlideIndex(page);
    expect(current).toBe(1);
  });

  test('ArrowLeft retreats slide', async ({ page }) => {
    const total = await getTotalSlides(page);
    // Navigate to slide 2 and wait for transition to complete
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#slideCounter')).toHaveText(counterText(2, total));
    await page.waitForTimeout(850); // wait for isTransitioning to clear
    // Now retreat
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#slideCounter')).toHaveText(counterText(1, total));
    const current = await getCurrentSlideIndex(page);
    expect(current).toBe(0);
  });

  test('dot click navigates to target slide', async ({ page }) => {
    const total = await getTotalSlides(page);
    // Nav dots have 44px ::before touch targets that overlap with adjacent dots.
    // Use dispatchEvent to trigger the onclick handler directly on the target dot element,
    // which exercises the same goToSlide() code path as a real user click.
    await page.evaluate(() => {
      const dots = document.querySelectorAll('.slide-dot');
      (dots[4] as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await expect(page.locator('#slideCounter')).toHaveText(counterText(5, total));
    await expect(page.locator('.slide-dot').nth(4)).toHaveClass(/active/);
  });

  test('arrow button click (next) advances slide and (prev) retreats', async ({ page }) => {
    const total = await getTotalSlides(page);
    // Click next arrow (second .slide-arrow)
    await page.locator('.slide-arrow').nth(1).click();
    await expect(page.locator('#slideCounter')).toHaveText(counterText(2, total));
    await page.waitForTimeout(850); // wait for isTransitioning to clear
    // Click prev arrow (first .slide-arrow)
    await page.locator('.slide-arrow').nth(0).click();
    await expect(page.locator('#slideCounter')).toHaveText(counterText(1, total));
  });

  test('all slides reachable — forward traverse to last', async ({ page }) => {
    test.slow();
    const total = await getTotalSlides(page);
    for (let i = 1; i < total; i++) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(850);
    }
    const current = await getCurrentSlideIndex(page);
    expect(current).toBe(total - 1);
  });

  test('boundary: cannot go before first slide', async ({ page }) => {
    const total = await getTotalSlides(page);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(100); // short wait to allow any potential navigation
    const current = await getCurrentSlideIndex(page);
    expect(current).toBe(0);
    await expect(page.locator('#slideCounter')).toHaveText(counterText(1, total));
  });

  test('boundary: cannot go past last slide', async ({ page }) => {
    const total = await getTotalSlides(page);
    // Navigate to last slide directly via global function
    await page.evaluate((idx: number) => (window as any).goToSlide(idx), total - 1);
    await page.waitForTimeout(850);
    // Try to go past last slide
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(850);
    const current = await getCurrentSlideIndex(page);
    expect(current).toBe(total - 1);
  });

  test('tap right side of screen advances slide', async ({ page }) => {
    const total = await getTotalSlides(page);
    const viewport = page.viewportSize()!;
    // Click in the right half of the viewport — triggers tap-to-navigate
    await page.mouse.click(viewport.width * 0.75, viewport.height / 2);
    await expect(page.locator('#slideCounter')).toHaveText(counterText(2, total));
  });

  test('tap left side of screen retreats slide', async ({ page }) => {
    const total = await getTotalSlides(page);
    const viewport = page.viewportSize()!;
    // Navigate to slide 2 first
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#slideCounter')).toHaveText(counterText(2, total));
    await page.waitForTimeout(850);
    // Click in the left half of the viewport — triggers tap-to-navigate backward
    await page.mouse.click(viewport.width * 0.25, viewport.height / 2);
    await expect(page.locator('#slideCounter')).toHaveText(counterText(1, total));
  });

  test('removed keys do not navigate — ArrowDown, ArrowUp, Space', async ({ page }) => {
    const total = await getTotalSlides(page);
    // Press ArrowDown — should NOT navigate
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    expect(await getCurrentSlideIndex(page)).toBe(0);
    await expect(page.locator('#slideCounter')).toHaveText(counterText(1, total));

    // Press Space — should NOT navigate
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    expect(await getCurrentSlideIndex(page)).toBe(0);

    // Press ArrowUp — should NOT navigate
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(200);
    expect(await getCurrentSlideIndex(page)).toBe(0);
  });
});

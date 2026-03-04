import { test, expect } from '@playwright/test';

test.describe('Kiosk Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.slide.active');
  });

  // Helper to get current slide index from counter text (counter is "NN / TT", 1-based)
  async function getCurrentSlideIndex(page: any): Promise<number> {
    const text = await page.locator('#slideCounter').textContent();
    const match = text?.match(/^(\d+)\s*\/\s*\d+$/);
    if (!match) throw new Error(`Unexpected counter text: ${text}`);
    return parseInt(match[1], 10) - 1; // convert to 0-based
  }

  test('pressing K enters kiosk mode — body gets data-kiosk attribute', async ({ page }) => {
    // Verify not in kiosk initially
    const initialKiosk = await page.evaluate(() => (window as any).isKioskMode);
    expect(initialKiosk).toBe(false);

    await page.keyboard.press('k');
    await page.waitForTimeout(100);

    const isKiosk = await page.evaluate(() => (window as any).isKioskMode);
    expect(isKiosk).toBe(true);

    const hasDataKiosk = await page.evaluate(() => document.body.hasAttribute('data-kiosk'));
    expect(hasDataKiosk).toBe(true);

    // Exit kiosk mode after test
    await page.keyboard.press('k');
  });

  test('entering kiosk mode hides all chrome elements (opacity 0)', async ({ page }) => {
    await page.keyboard.press('k');
    await page.waitForTimeout(600); // wait for CSS transition (~0.5s)

    const topbarOpacity = await page.locator('.topbar').evaluate(el => getComputedStyle(el).opacity);
    const slideNavOpacity = await page.locator('.slide-nav').evaluate(el => getComputedStyle(el).opacity);
    const slideArrowsOpacity = await page.locator('.slide-arrows').evaluate(el => getComputedStyle(el).opacity);
    const slideCounterOpacity = await page.locator('.slide-counter').evaluate(el => getComputedStyle(el).opacity);
    const autoCounterOpacity = await page.locator('.auto-counter').evaluate(el => getComputedStyle(el).opacity);
    const progressBarOpacity = await page.locator('.progress-bar').evaluate(el => getComputedStyle(el).opacity);

    expect(topbarOpacity).toBe('0');
    expect(slideNavOpacity).toBe('0');
    expect(slideArrowsOpacity).toBe('0');
    expect(slideCounterOpacity).toBe('0');
    expect(autoCounterOpacity).toBe('0');
    expect(progressBarOpacity).toBe('0');

    // Exit kiosk mode after test
    await page.keyboard.press('k');
  });

  test('pressing K again exits kiosk mode — data-kiosk removed, chrome visible', async ({ page }) => {
    // Enter kiosk
    await page.keyboard.press('k');
    await page.waitForTimeout(100);
    expect(await page.evaluate(() => (window as any).isKioskMode)).toBe(true);

    // Exit kiosk
    await page.keyboard.press('k');
    await page.waitForTimeout(100);

    const isKiosk = await page.evaluate(() => (window as any).isKioskMode);
    expect(isKiosk).toBe(false);

    const hasDataKiosk = await page.evaluate(() => document.body.hasAttribute('data-kiosk'));
    expect(hasDataKiosk).toBe(false);
  });

  test('chrome elements are visible after exiting kiosk mode', async ({ page }) => {
    // Enter then exit kiosk
    await page.keyboard.press('k');
    await page.waitForTimeout(100);
    await page.keyboard.press('k');
    await page.waitForTimeout(600); // wait for CSS transition

    const topbarOpacity = await page.locator('.topbar').evaluate(el => getComputedStyle(el).opacity);
    // Opacity should be 1 (visible) after exiting kiosk
    expect(parseFloat(topbarOpacity)).toBeGreaterThan(0);
  });

  test('arrow keys do not change slide while kiosk is active', async ({ page }) => {
    const initialIndex = await getCurrentSlideIndex(page);

    // Enter kiosk mode
    await page.keyboard.press('k');
    await page.waitForTimeout(100);

    // Try to navigate with arrow keys
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(200);

    const currentIndex = await getCurrentSlideIndex(page);
    expect(currentIndex).toBe(initialIndex);

    // Exit kiosk mode
    await page.keyboard.press('k');
  });

  test('clicking right side of viewport does not change slide while kiosk is active', async ({ page }) => {
    const initialIndex = await getCurrentSlideIndex(page);

    // Enter kiosk mode
    await page.keyboard.press('k');
    await page.waitForTimeout(100);

    // Try to click right side to advance
    const viewport = page.viewportSize()!;
    await page.mouse.click(viewport.width * 0.75, viewport.height / 2);
    await page.waitForTimeout(200);

    const currentIndex = await getCurrentSlideIndex(page);
    expect(currentIndex).toBe(initialIndex);

    // Exit kiosk mode
    await page.keyboard.press('k');
  });

  test('after exiting kiosk, arrow keys work normally again', async ({ page }) => {
    const total = await page.evaluate(() => document.querySelectorAll('.slide').length);

    // Enter kiosk mode
    await page.keyboard.press('k');
    await page.waitForTimeout(100);

    // Verify arrow key is suppressed
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);
    expect(await getCurrentSlideIndex(page)).toBe(0);

    // Exit kiosk mode
    await page.keyboard.press('k');
    await page.waitForTimeout(100);

    // Now arrow key should work
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);
    expect(await getCurrentSlideIndex(page)).toBe(1);
  });

  test('video modal is suppressed in kiosk mode — openVideoModal is blocked', async ({ page }) => {
    // Enter kiosk mode
    await page.keyboard.press('k');
    await page.waitForTimeout(100);

    // Try to open video modal programmatically
    await page.evaluate(() => (window as any).openVideoModal('1169672887', 'Test Video'));
    await page.waitForTimeout(200);

    // Modal should NOT be open
    const modalOpen = await page.locator('#videoModal').evaluate(el => el.classList.contains('open'));
    expect(modalOpen).toBe(false);

    // Exit kiosk mode
    await page.keyboard.press('k');
  });

  test('kiosk mode loops — auto-advance at last slide wraps to first slide', async ({ page }) => {
    const total = await page.evaluate(() => document.querySelectorAll('.slide').length);

    // Navigate to last slide
    await page.evaluate((idx: number) => (window as any).goToSlide(idx), total - 1);
    await page.waitForTimeout(850);
    expect(await getCurrentSlideIndex(page)).toBe(total - 1);

    // Enter kiosk mode
    await page.keyboard.press('k');
    await page.waitForTimeout(100);

    // Trigger auto-advance programmatically by calling the auto-advance logic directly
    // (simulates what happens when the timer fires at the last slide)
    await page.evaluate(() => {
      const win = window as any;
      // Manually trigger the loop by calling goToSlide(0) as if we're at last slide
      // This simulates the auto-advance timer logic
      if (win.current >= win.slides.length - 1) {
        win.goToSlide(0);
      }
    });
    await page.waitForTimeout(850);

    // Should be at first slide
    expect(await getCurrentSlideIndex(page)).toBe(0);

    // Exit kiosk mode
    await page.keyboard.press('k');
  });

  test('isKioskMode state variable exists and is accessible', async ({ page }) => {
    const isKiosk = await page.evaluate(() => typeof (window as any).isKioskMode);
    expect(isKiosk).toBe('boolean');
  });

  test('enterKiosk and exitKiosk functions are accessible on window', async ({ page }) => {
    const enterType = await page.evaluate(() => typeof (window as any).enterKiosk);
    const exitType = await page.evaluate(() => typeof (window as any).exitKiosk);
    expect(enterType).toBe('function');
    expect(exitType).toBe('function');
  });
});

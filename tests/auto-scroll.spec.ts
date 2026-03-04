import { test, expect } from '@playwright/test';

test.describe('Auto-Scroll', () => {
  test.describe.configure({ timeout: 30000 });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.slide.active');
  });

  // Helper to get current slide index from counter text (counter is "NN / TT", 1-based)
  async function getCurrentSlideIndex(page: any): Promise<number> {
    const text = await page.locator('#slideCounter').textContent();
    const match = text?.match(/^(\d+)\s*\/\s*\d+$/);
    if (!match) throw new Error(`Unexpected counter text: ${text}`);
    return parseInt(match[1], 10) - 1;
  }

  test('auto-scroll state variables and functions exist on window', async ({ page }) => {
    const rafType = await page.evaluate(() => typeof (window as any).autoScrollRAF);
    const activeType = await page.evaluate(() => typeof (window as any).autoScrollActive);
    const startType = await page.evaluate(() => typeof (window as any).startAutoScroll);
    const stopType = await page.evaluate(() => typeof (window as any).stopAutoScroll);

    // autoScrollRAF is null initially, so typeof is 'object'
    expect(rafType).toBe('object');
    expect(activeType).toBe('boolean');
    expect(startType).toBe('function');
    expect(stopType).toBe('function');
  });

  test('entering kiosk mode activates auto-scroll on current slide', async ({ page }) => {
    await page.keyboard.press('k');
    await page.waitForTimeout(200);

    const active = await page.evaluate(() => (window as any).autoScrollActive);
    expect(active).toBe(true);

    // Exit kiosk mode
    await page.keyboard.press('k');
  });

  test('exiting kiosk mode stops auto-scroll', async ({ page }) => {
    // Enter kiosk
    await page.keyboard.press('k');
    await page.waitForTimeout(200);
    const activeDuring = await page.evaluate(() => (window as any).autoScrollActive);
    expect(activeDuring).toBe(true);

    // Exit kiosk
    await page.keyboard.press('k');
    await page.waitForTimeout(200);

    const activeAfter = await page.evaluate(() => (window as any).autoScrollActive);
    const rafAfter = await page.evaluate(() => (window as any).autoScrollRAF);
    expect(activeAfter).toBe(false);
    expect(rafAfter).toBe(null);
  });

  test('tall slide scrolls window down during kiosk mode', async ({ page }) => {
    // Find a tall slide by navigating to each and checking if page scrolls
    const totalSlides = await page.evaluate(() => (window as any).slides.length);
    let tallIdx = -1;

    for (let i = 1; i < totalSlides; i++) {
      await page.evaluate((idx: number) => (window as any).goToSlide(idx), i);
      await page.waitForTimeout(900); // wait for transition (800ms + buffer)
      const scrollable = await page.evaluate(() =>
        document.documentElement.scrollHeight - window.innerHeight
      );
      if (scrollable > 10) {
        tallIdx = i;
        break;
      }
    }

    if (tallIdx === -1) {
      test.skip();
      return;
    }

    // Enter kiosk mode on the tall slide
    await page.keyboard.press('k');
    // Wait for scrolling (no pause, just 3s of scroll at 12px/sec)
    await page.waitForTimeout(3500);

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);

    // Exit kiosk mode
    await page.keyboard.press('k');
  });

  test('short slide does not scroll window - gets Ken Burns zoom instead', async ({ page }) => {
    // Slide 0 (cover) is short — no overflow
    expect(await getCurrentSlideIndex(page)).toBe(0);

    // Enter kiosk mode
    await page.keyboard.press('k');
    // Wait for Ken Burns zoom to start
    await page.waitForTimeout(2000);

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(0);

    const transform = await page.evaluate(() => {
      return (window as any).slides[0].style.transform;
    });
    expect(transform).toContain('scale');

    // Exit kiosk mode
    await page.keyboard.press('k');
  });

  test('window scroll resets to top on slide advance', async ({ page }) => {
    // Find a tall slide
    const totalSlides = await page.evaluate(() => (window as any).slides.length);
    let tallIdx = -1;

    for (let i = 1; i < totalSlides - 1; i++) {
      await page.evaluate((idx: number) => (window as any).goToSlide(idx), i);
      await page.waitForTimeout(900);
      const scrollable = await page.evaluate(() =>
        document.documentElement.scrollHeight - window.innerHeight
      );
      if (scrollable > 10) {
        tallIdx = i;
        break;
      }
    }

    if (tallIdx === -1) {
      test.skip();
      return;
    }

    // Enter kiosk and wait for scrolling
    await page.keyboard.press('k');
    await page.waitForTimeout(3500);

    // Verify window has scrolled
    const scrollBefore = await page.evaluate(() => window.scrollY);
    expect(scrollBefore).toBeGreaterThan(0);

    // Advance to next slide
    await page.evaluate((idx: number) => (window as any).goToSlide(idx + 1), tallIdx);
    await page.waitForTimeout(900);

    // Window scroll should reset to 0
    const scrollAfter = await page.evaluate(() => window.scrollY);
    expect(scrollAfter).toBe(0);

    // Exit kiosk mode
    await page.keyboard.press('k');
  });

  test('auto-scroll stops cleanly - no runaway RAF after exiting kiosk', async ({ page }) => {
    // Enter kiosk
    await page.keyboard.press('k');
    await page.waitForTimeout(1000);

    // Exit kiosk
    await page.keyboard.press('k');
    await page.waitForTimeout(500);

    const raf = await page.evaluate(() => (window as any).autoScrollRAF);
    const active = await page.evaluate(() => (window as any).autoScrollActive);
    expect(raf).toBe(null);
    expect(active).toBe(false);
  });

  test('topbar title visible during kiosk mode', async ({ page }) => {
    // Enter kiosk mode
    await page.keyboard.press('k');
    await page.waitForTimeout(600); // CSS transition time

    const topbarLogoOpacity = await page.locator('.topbar-logo').evaluate(el =>
      getComputedStyle(el).opacity
    );
    const topbarOpacity = await page.locator('.topbar').evaluate(el =>
      getComputedStyle(el).opacity
    );

    expect(parseFloat(topbarLogoOpacity)).toBeGreaterThan(0);
    expect(parseFloat(topbarOpacity)).toBeGreaterThan(0);

    // Exit kiosk mode
    await page.keyboard.press('k');
  });

  test('Ken Burns zoom resets on new slide', async ({ page }) => {
    // Slide 0 is short (cover) — gets Ken Burns
    expect(await getCurrentSlideIndex(page)).toBe(0);

    // Enter kiosk
    await page.keyboard.press('k');
    // Wait for zoom to start (no pause)
    await page.waitForTimeout(2000);

    // Verify zoom is applied
    const transformBefore = await page.evaluate(() => {
      return (window as any).slides[0].style.transform;
    });
    expect(transformBefore).toContain('scale');

    // Advance to slide 1
    await page.evaluate(() => (window as any).goToSlide(1));
    await page.waitForTimeout(1050); // 850ms transition + 200ms buffer

    // Slide 0's transform should be reset
    const transformAfter = await page.evaluate(() => {
      return (window as any).slides[0].style.transform;
    });
    expect(transformAfter).toBe('');

    // Exit kiosk mode
    await page.keyboard.press('k');
  });

  test('?kiosk URL param activates auto-scroll', async ({ page }) => {
    // Navigate with ?kiosk parameter (use full path since baseURL includes filename)
    await page.goto('/wolfond-report-2024-2026.html?kiosk');
    await page.waitForSelector('.slide.active');
    await page.waitForTimeout(500);

    const isKiosk = await page.evaluate(() => (window as any).isKioskMode);
    const autoScrollActive = await page.evaluate(() => (window as any).autoScrollActive);

    expect(isKiosk).toBe(true);
    expect(autoScrollActive).toBe(true);

    // Exit kiosk mode to clean up
    await page.keyboard.press('k');
  });
});

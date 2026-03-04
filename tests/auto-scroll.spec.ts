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

  test('tall slide scrolls down during kiosk mode', async ({ page }) => {
    // Find a tall slide (scrollHeight > clientHeight) via page.evaluate
    const tallIdx = await page.evaluate(() => {
      const win = window as any;
      for (let i = 0; i < win.slides.length; i++) {
        // We need to activate the slide to measure it properly
        // Check if the slide has enough content to scroll in a 800px viewport
        const el = win.slides[i] as HTMLElement;
        // Temporarily make it visible to measure
        const wasActive = el.classList.contains('active');
        if (!wasActive) {
          el.style.display = 'flex';
          el.style.position = 'absolute';
          el.style.height = '100vh';
          el.style.overflow = 'auto';
        }
        const isScrollable = el.scrollHeight > el.clientHeight;
        if (!wasActive) {
          el.style.display = '';
          el.style.position = '';
          el.style.height = '';
          el.style.overflow = '';
        }
        if (isScrollable && i !== 0) return i;
      }
      return -1;
    });

    if (tallIdx === -1) {
      test.skip();
      return;
    }

    // Navigate to the tall slide
    await page.evaluate((idx: number) => (window as any).goToSlide(idx), tallIdx);
    await page.waitForTimeout(850);

    // Enter kiosk mode
    await page.keyboard.press('k');
    // Wait past the 5s pause + 3s of scrolling = 8.5s
    await page.waitForTimeout(8500);

    const scrollTop = await page.evaluate((idx: number) => {
      return (window as any).slides[idx].scrollTop;
    }, tallIdx);

    expect(scrollTop).toBeGreaterThan(0);

    // Exit kiosk mode
    await page.keyboard.press('k');
  });

  test('short slide does not scroll - gets Ken Burns zoom instead', async ({ page }) => {
    // Slide 0 (cover) is short — no overflow
    expect(await getCurrentSlideIndex(page)).toBe(0);

    // Enter kiosk mode
    await page.keyboard.press('k');
    // Wait past 5s pause + 2s of zoom = 7.5s
    await page.waitForTimeout(7500);

    const scrollTop = await page.evaluate(() => {
      return (window as any).slides[0].scrollTop;
    });
    expect(scrollTop).toBe(0);

    const transform = await page.evaluate(() => {
      return (window as any).slides[0].style.transform;
    });
    expect(transform).toContain('scale');

    // Exit kiosk mode
    await page.keyboard.press('k');
  });

  test('slide scroll position resets to top on advance', async ({ page }) => {
    // Find a tall slide
    const tallIdx = await page.evaluate(() => {
      const win = window as any;
      for (let i = 0; i < win.slides.length; i++) {
        const el = win.slides[i] as HTMLElement;
        const wasActive = el.classList.contains('active');
        if (!wasActive) {
          el.style.display = 'flex';
          el.style.position = 'absolute';
          el.style.height = '100vh';
          el.style.overflow = 'auto';
        }
        const isScrollable = el.scrollHeight > el.clientHeight;
        if (!wasActive) {
          el.style.display = '';
          el.style.position = '';
          el.style.height = '';
          el.style.overflow = '';
        }
        if (isScrollable && i !== 0 && i < win.slides.length - 1) return i;
      }
      return -1;
    });

    if (tallIdx === -1) {
      test.skip();
      return;
    }

    // Navigate to tall slide
    await page.evaluate((idx: number) => (window as any).goToSlide(idx), tallIdx);
    await page.waitForTimeout(850);

    // Enter kiosk
    await page.keyboard.press('k');
    // Wait for some scrolling (past 5s pause + 3s scroll)
    await page.waitForTimeout(8500);

    // Verify scrollTop > 0 on tall slide
    const scrollBefore = await page.evaluate((idx: number) => {
      return (window as any).slides[idx].scrollTop;
    }, tallIdx);
    expect(scrollBefore).toBeGreaterThan(0);

    // Advance to next slide
    await page.evaluate((idx: number) => (window as any).goToSlide(idx + 1), tallIdx);
    await page.waitForTimeout(850);

    // Previous slide should have scrollTop reset to 0
    const scrollAfter = await page.evaluate((idx: number) => {
      return (window as any).slides[idx].scrollTop;
    }, tallIdx);
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
    // Wait past 5s pause + 2s of zoom
    await page.waitForTimeout(7500);

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

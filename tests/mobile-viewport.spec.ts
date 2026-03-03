import { test, expect } from '@playwright/test';

test.describe('Mobile viewport', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.slide.active');
  });

  test('active slide has touch-action: pan-y', async ({ page }) => {
    await expect(page.locator('.slide.active')).toHaveCSS('touch-action', 'pan-y');
  });

  test('active slide has overscroll-behavior-x: contain', async ({ page }) => {
    await expect(page.locator('.slide.active')).toHaveCSS('overscroll-behavior-x', 'contain');
  });

  test('nav dot ::before pseudo-element touch target is >= 44px height', async ({ page }) => {
    const height = await page.evaluate(() => {
      const dot = document.querySelector('.slide-dot');
      return parseFloat(getComputedStyle(dot!, '::before').height);
    });
    expect(height).toBeGreaterThanOrEqual(44);
  });

  test('nav dot ::before pseudo-element touch target is >= 44px width', async ({ page }) => {
    const width = await page.evaluate(() => {
      const dot = document.querySelector('.slide-dot');
      return parseFloat(getComputedStyle(dot!, '::before').width);
    });
    expect(width).toBeGreaterThanOrEqual(44);
  });

  test('no horizontal overflow on active slide', async ({ page }) => {
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
  });

  test('slide inner fits within viewport width', async ({ page }) => {
    const box = await page.locator('.slide.active .slide-inner').boundingBox();
    const viewport = page.viewportSize()!;
    expect(box!.width).toBeLessThanOrEqual(viewport.width + 1); // 1px tolerance
  });

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

    await page.evaluate((idx) => (window as any).goToSlide(idx), scrollSlideIndex);
    await page.waitForTimeout(850); // wait for transition to complete

    const overflowY = await page.evaluate(() => {
      const el = document.querySelector('.scroll-content');
      return el ? getComputedStyle(el).overflowY : null;
    });

    expect(overflowY).not.toBeNull();
    expect(['auto', 'scroll']).toContain(overflowY);
  });
});

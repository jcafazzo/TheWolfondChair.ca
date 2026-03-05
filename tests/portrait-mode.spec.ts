import { test, expect } from '@playwright/test';

test.describe('Portrait Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.slide.active');
  });

  test('pressing P enters portrait mode — body gets data-portrait attribute', async ({ page }) => {
    const initial = await page.evaluate(() => (window as any).isPortraitMode);
    expect(initial).toBe(false);

    await page.keyboard.press('p');
    await page.waitForTimeout(100);

    const isPortrait = await page.evaluate(() => (window as any).isPortraitMode);
    expect(isPortrait).toBe(true);

    const hasAttr = await page.evaluate(() => document.body.hasAttribute('data-portrait'));
    expect(hasAttr).toBe(true);

    await page.keyboard.press('p');
  });

  test('pressing P again exits portrait mode', async ({ page }) => {
    await page.keyboard.press('p');
    await page.waitForTimeout(100);
    await page.keyboard.press('p');
    await page.waitForTimeout(100);

    expect(await page.evaluate(() => (window as any).isPortraitMode)).toBe(false);
    expect(await page.evaluate(() => document.body.hasAttribute('data-portrait'))).toBe(false);
  });

  test('portrait mode applies CSS rotation transform to body', async ({ page }) => {
    await page.keyboard.press('p');
    await page.waitForTimeout(100);

    const transform = await page.evaluate(() => getComputedStyle(document.body).transform);
    expect(transform).not.toBe('none');

    await page.keyboard.press('p');
  });

  test('portrait composes with kiosk — both data attributes present', async ({ page }) => {
    await page.keyboard.press('p');
    await page.waitForTimeout(100);
    await page.keyboard.press('k');
    await page.waitForTimeout(100);

    expect(await page.evaluate(() => document.body.hasAttribute('data-portrait'))).toBe(true);
    expect(await page.evaluate(() => document.body.hasAttribute('data-kiosk'))).toBe(true);

    await page.keyboard.press('k');
    await page.keyboard.press('p');
  });

  test('P key works while in kiosk mode', async ({ page }) => {
    await page.keyboard.press('k');
    await page.waitForTimeout(100);

    await page.keyboard.press('p');
    await page.waitForTimeout(100);

    expect(await page.evaluate(() => (window as any).isPortraitMode)).toBe(true);

    await page.keyboard.press('p');
    await page.keyboard.press('k');
  });

  test('arrow keys navigate slides in portrait mode', async ({ page }) => {
    await page.keyboard.press('p');
    await page.waitForTimeout(100);

    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(850);

    const idx = await page.evaluate(() => (window as any).current);
    expect(idx).toBe(1);

    await page.keyboard.press('p');
  });

  test('isPortraitMode state variable exists and is accessible', async ({ page }) => {
    const type = await page.evaluate(() => typeof (window as any).isPortraitMode);
    expect(type).toBe('boolean');
  });

  test('enterPortrait and exitPortrait functions are accessible', async ({ page }) => {
    expect(await page.evaluate(() => typeof (window as any).enterPortrait)).toBe('function');
    expect(await page.evaluate(() => typeof (window as any).exitPortrait)).toBe('function');
  });

  test('?portrait URL param activates portrait mode on load', async ({ page }) => {
    await page.goto('/wolfond-report-2024-2026.html?portrait');
    await page.waitForSelector('.slide.active');

    expect(await page.evaluate(() => (window as any).isPortraitMode)).toBe(true);
    expect(await page.evaluate(() => document.body.hasAttribute('data-portrait'))).toBe(true);
  });

  test('?kiosk&portrait URL params activate both modes', async ({ page }) => {
    await page.goto('/wolfond-report-2024-2026.html?kiosk&portrait');
    await page.waitForSelector('.slide.active');

    expect(await page.evaluate(() => (window as any).isKioskMode)).toBe(true);
    expect(await page.evaluate(() => (window as any).isPortraitMode)).toBe(true);
  });
});

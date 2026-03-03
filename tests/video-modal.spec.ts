import { test, expect } from '@playwright/test';

test.describe('Video modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.slide.active');
    // Navigate to the Voices slide (CONVO_SLIDE_INDEX = 13, defined as const in HTML source)
    // Note: CONVO_SLIDE_INDEX is a const in the JS scope, not on window — use literal 13
    await page.evaluate(() => (window as any).goToSlide(13));
    await page.waitForTimeout(850); // wait for 800ms transition + 50ms buffer
  });

  test('modal opens on convo-thumb click', async ({ page }) => {
    await page.locator('.convo-thumb').first().scrollIntoViewIfNeeded();
    await page.locator('.convo-thumb').first().click();
    await expect(page.locator('#videoModal')).toHaveClass(/open/);
    await expect(page.locator('#videoModal')).toHaveClass(/visible/);
  });

  test('modal closes via close button and clears iframe src', async ({ page }) => {
    // Open modal programmatically for reliable setup
    await page.evaluate(() => (window as any).openVideoModal('1169672887', 'Test'));
    // Wait for visible class to appear (added after ~2 rAF cycles)
    await expect(page.locator('#videoModal')).toHaveClass(/visible/);

    // Click the close button
    await page.locator('.video-modal-close').click();

    // Assert visible class removed immediately
    await expect(page.locator('#videoModal')).not.toHaveClass(/visible/);
    // Assert open class removed after 350ms timeout (Playwright auto-retries)
    await expect(page.locator('#videoModal')).not.toHaveClass(/open/);

    // Verify iframe src is cleared (happens inside the 350ms setTimeout)
    const src = await page.locator('#videoModalFrame').getAttribute('src');
    expect(src).toBeFalsy();
  });

  test('modal closes via Escape key', async ({ page }) => {
    // Open modal programmatically
    await page.evaluate(() => (window as any).openVideoModal('1169672887', 'Test'));
    // Wait for visible class
    await expect(page.locator('#videoModal')).toHaveClass(/visible/);

    // Press Escape to close
    await page.keyboard.press('Escape');

    // Assert modal is closed (auto-retries handle 350ms animation delay)
    await expect(page.locator('#videoModal')).not.toHaveClass(/open/);

    // Verify iframe src is cleared
    const src = await page.locator('#videoModalFrame').getAttribute('src');
    expect(src).toBeFalsy();
  });

  test('iframe src contains vimeo when modal is open', async ({ page }) => {
    // Open modal programmatically
    await page.evaluate(() => (window as any).openVideoModal('1169672887', 'Test'));
    // Assert iframe src contains vimeo (modal loads Vimeo embed)
    await expect(page.locator('#videoModalFrame')).toHaveAttribute('src', /vimeo/);
  });

  test('multiple open-close cycles work correctly', async ({ page }) => {
    // Cycle 1: open then close via button
    await page.evaluate(() => (window as any).openVideoModal('1169672887', 'Test'));
    await expect(page.locator('#videoModal')).toHaveClass(/visible/);
    await page.locator('.video-modal-close').click();
    await expect(page.locator('#videoModal')).not.toHaveClass(/open/);
    const src1 = await page.locator('#videoModalFrame').getAttribute('src');
    expect(src1).toBeFalsy();

    // Cycle 2: open then close via Escape
    await page.evaluate(() => (window as any).openVideoModal('1169672887', 'Test'));
    await expect(page.locator('#videoModal')).toHaveClass(/visible/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#videoModal')).not.toHaveClass(/open/);
    const src2 = await page.locator('#videoModalFrame').getAttribute('src');
    expect(src2).toBeFalsy();
  });
});

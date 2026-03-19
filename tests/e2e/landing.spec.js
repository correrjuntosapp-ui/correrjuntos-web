import { test, expect } from '@playwright/test';
import { mockSupabase, waitForAppReady } from './helpers/mocks.js';

test.describe('Landing Page', () => {

    test.beforeEach(async ({ page }) => {
        await mockSupabase(page);
    });

    test('loads with correct title and hero visible', async ({ page }) => {
        await page.goto('/');
        await waitForAppReady(page);

        await expect(page).toHaveTitle(/CorrerJuntos/i);

        // Hero heading should be visible (first h1 is the landing hero)
        const hero = page.locator('h1').first();
        await expect(hero).toBeVisible();
        await expect(hero).toContainText('correr');
    });

    test('CTA buttons exist and web CTA is visible', async ({ page }) => {
        await page.goto('/');
        await waitForAppReady(page);

        // App Store and Google Play links exist in DOM (may be in hidden top banner)
        const appStoreLink = page.locator('a[href*="apps.apple.com"]').first();
        await expect(appStoreLink).toBeAttached();

        const playStoreLink = page.locator('a[href*="play.google.com"]').first();
        await expect(playStoreLink).toBeAttached();

        // Web CTA button is visible in the hero section
        const webCta = page.locator('#landing-cta-web');
        await expect(webCta).toBeVisible();
    });

    test('cookie banner appears on first visit', async ({ page }) => {
        await page.goto('/');
        await waitForAppReady(page);

        const cookieBanner = page.locator('#cookie-banner');
        // The banner has translate-y-full initially, then animates in
        await expect(cookieBanner).toBeAttached();
    });
});

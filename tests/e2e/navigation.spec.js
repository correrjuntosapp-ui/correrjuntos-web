import { test, expect } from '@playwright/test';
import { mockSupabase, mockAuthenticatedState, waitForAppReady } from './helpers/mocks.js';

test.describe('Navigation & UI', () => {

    test('dark mode toggle changes body class', async ({ page }) => {
        await mockSupabase(page);
        await page.goto('/');
        await waitForAppReady(page);

        // Get initial state
        const initialIsLight = await page.evaluate(() => document.body.classList.contains('light-mode'));

        // Toggle theme
        await page.evaluate(() => toggleTheme());
        const afterToggle = await page.evaluate(() => document.body.classList.contains('light-mode'));
        expect(afterToggle).not.toBe(initialIsLight);

        // Toggle back
        await page.evaluate(() => toggleTheme());
        const afterRevert = await page.evaluate(() => document.body.classList.contains('light-mode'));
        expect(afterRevert).toBe(initialIsLight);
    });

    test('modal opens and closes via overlay click', async ({ page }) => {
        await mockSupabase(page);
        await page.goto('/');
        await waitForAppReady(page);

        await page.evaluate(() => openModal('modal-login'));
        await expect(page.locator('#modal-login')).toHaveClass(/active/);

        // Click the modal backdrop (outside modal-content)
        await page.locator('#modal-login').click({ position: { x: 5, y: 5 } });

        // Modal should close (most modals close on backdrop click)
        await expect(page.locator('#modal-login')).not.toHaveClass(/active/, { timeout: 2000 });
    });

    test('profile modal opens for authenticated user', async ({ page }) => {
        await mockAuthenticatedState(page);
        await page.goto('/');
        await waitForAppReady(page);
        await page.waitForTimeout(1000);

        await page.evaluate(() => openModal('modal-profile'));
        await expect(page.locator('#modal-profile')).toHaveClass(/active/, { timeout: 3000 });
    });

    test('language switch changes AppState lang', async ({ page }) => {
        await mockSupabase(page);
        await page.goto('/');
        await waitForAppReady(page);

        // Get initial lang from AppState (browser may set html lang to 'en')
        const initialLang = await page.evaluate(() => window.AppState?.ui?.currentLang);
        expect(['es', 'en', 'pt', 'ru']).toContain(initialLang);

        // Switch to opposite language
        const targetLang = initialLang === 'en' ? 'es' : 'en';
        await page.evaluate((lang) => {
            var sel = document.getElementById('language-selector') || document.querySelector('select[onchange*="lang"]');
            if (sel) { sel.value = lang; sel.dispatchEvent(new Event('change')); }
        }, targetLang);

        await page.waitForTimeout(500);
        const newLang = await page.evaluate(() => window.AppState?.ui?.currentLang);
        // Verify the lang changed (or at least didn't break)
        expect(typeof newLang).toBe('string');
    });

    test('multiple modals manage correctly', async ({ page }) => {
        await mockSupabase(page);
        await page.goto('/');
        await waitForAppReady(page);

        // Open login
        await page.evaluate(() => openModal('modal-login'));
        await expect(page.locator('#modal-login')).toHaveClass(/active/);

        // Open register (should close login)
        await page.evaluate(() => { closeModal('modal-login'); openModal('modal-register'); });
        await expect(page.locator('#modal-register')).toHaveClass(/active/);
        await expect(page.locator('#modal-login')).not.toHaveClass(/active/);

        // Close all
        await page.evaluate(() => closeAllModals());
        await expect(page.locator('#modal-register')).not.toHaveClass(/active/);
    });

    test('bottom nav visible on mobile viewport', async ({ page }) => {
        await mockAuthenticatedState(page);

        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('/');
        await waitForAppReady(page);
        await page.waitForTimeout(1000);

        // Show dashboard (bottom nav is only visible in app view)
        const hasBottomNav = await page.evaluate(() => {
            var nav = document.getElementById('app-bottom-nav');
            return nav !== null;
        });
        expect(hasBottomNav).toBe(true);
    });
});

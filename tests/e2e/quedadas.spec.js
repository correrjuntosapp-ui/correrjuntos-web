import { test, expect } from '@playwright/test';
import { mockAuthenticatedState, waitForAppReady } from './helpers/mocks.js';

test.describe('Quedadas (Create)', () => {

    test.beforeEach(async ({ page }) => {
        await mockAuthenticatedState(page);
        await page.goto('/');
        await waitForAppReady(page);
        // Wait for auth to hydrate
        await page.waitForTimeout(1000);
    });

    test('create modal opens', async ({ page }) => {
        // Use openModal directly — openModalCrear may check auth state
        await page.evaluate(() => openModal('modal-crear'));

        const modal = page.locator('#modal-crear');
        await expect(modal).toHaveClass(/active/, { timeout: 3000 });
    });

    test('create modal has all required form fields', async ({ page }) => {
        await page.evaluate(() => openModal('modal-crear'));
        await expect(page.locator('#modal-crear')).toHaveClass(/active/);

        await expect(page.locator('#q-titulo')).toBeAttached();
        await expect(page.locator('#q-fecha')).toBeAttached();
        await expect(page.locator('#q-hora-h')).toBeAttached();
        await expect(page.locator('#q-hora-m')).toBeAttached();
        await expect(page.locator('#q-nivel')).toBeAttached();
        await expect(page.locator('#q-distancia-num')).toBeAttached();
        await expect(page.locator('#q-descripcion')).toBeAttached();
    });

    test('create validates required fields', async ({ page }) => {
        await page.evaluate(() => openModal('modal-crear'));
        await expect(page.locator('#modal-crear')).toHaveClass(/active/);

        // Try saving without filling required fields
        await page.evaluate(() => saveQuedada());

        const toast = page.locator('.toast-container .toast').first();
        await expect(toast).toBeVisible({ timeout: 3000 });
    });

    test('create modal closes correctly', async ({ page }) => {
        await page.evaluate(() => openModal('modal-crear'));
        await expect(page.locator('#modal-crear')).toHaveClass(/active/);

        await page.evaluate(() => closeModal('modal-crear'));
        await expect(page.locator('#modal-crear')).not.toHaveClass(/active/);
    });
});

import { test, expect } from '@playwright/test';
import { mockSupabase, waitForAppReady } from './helpers/mocks.js';

test.describe('Authentication', () => {

    test.beforeEach(async ({ page }) => {
        await mockSupabase(page);
        await page.goto('/');
        await waitForAppReady(page);
    });

    // ── Login modal ───────────────────────────────────────────

    test('login modal opens on nav button click', async ({ page }) => {
        await page.locator('#nav-register').click();
        // Register modal should open — now check login link
        const loginModal = page.locator('#modal-login');

        // Close register and open login
        await page.evaluate(() => { closeModal('modal-register'); openModal('modal-login'); });
        await expect(loginModal).toHaveClass(/active/);
        await expect(page.locator('#login-email')).toBeVisible();
        await expect(page.locator('#login-pass')).toBeVisible();
    });

    test('login modal closes on Escape key', async ({ page }) => {
        await page.evaluate(() => openModal('modal-login'));
        await expect(page.locator('#modal-login')).toHaveClass(/active/);

        await page.keyboard.press('Escape');
        await expect(page.locator('#modal-login')).not.toHaveClass(/active/);
    });

    test('login validates empty fields and shows toast', async ({ page }) => {
        await page.evaluate(() => openModal('modal-login'));
        await expect(page.locator('#modal-login')).toHaveClass(/active/);

        // Try login with empty fields
        await page.evaluate(() => doLogin());

        // Should show error toast
        const toast = page.locator('.toast-container .toast').first();
        await expect(toast).toBeVisible({ timeout: 3000 });
    });

    test('login shows error on bad credentials', async ({ page }) => {
        await page.evaluate(() => openModal('modal-login'));

        await page.locator('#login-email').fill('bad@test.com');
        await page.locator('#login-pass').fill('wrongpassword');
        await page.evaluate(() => doLogin());

        // Should show error toast (mocked Supabase returns 400 for bad@test.com)
        const toast = page.locator('.toast-container .toast').first();
        await expect(toast).toBeVisible({ timeout: 5000 });
    });

    // ── Register modal ────────────────────────────────────────

    test('register modal opens on nav button click', async ({ page }) => {
        await page.locator('#nav-register').click();
        const registerModal = page.locator('#modal-register');
        await expect(registerModal).toHaveClass(/active/);
        await expect(page.locator('#reg-email')).toBeVisible();
        await expect(page.locator('#reg-pass')).toBeVisible();
    });

    test('register validates email format', async ({ page }) => {
        await page.evaluate(() => openModal('modal-register'));

        await page.locator('#reg-email').fill('notanemail');
        await page.locator('#reg-pass').fill('password123');
        await page.locator('#reg-terminos').check();
        await page.evaluate(() => doRegisterSimple());

        // Should show validation error
        const toast = page.locator('.toast-container .toast').first();
        await expect(toast).toBeVisible({ timeout: 3000 });
    });

    test('register requires terms checkbox', async ({ page }) => {
        await page.evaluate(() => openModal('modal-register'));

        await page.locator('#reg-email').fill('valid@test.com');
        await page.locator('#reg-pass').fill('password123');
        // Don't check terms
        await page.evaluate(() => doRegisterSimple());

        const toast = page.locator('.toast-container .toast').first();
        await expect(toast).toBeVisible({ timeout: 3000 });
    });

    // ── Forgot password ───────────────────────────────────────

    test('forgot password modal opens from login', async ({ page }) => {
        await page.evaluate(() => openModal('modal-login'));
        await expect(page.locator('#modal-login')).toHaveClass(/active/);

        // Click "forgot password" link
        const forgotLink = page.locator('#modal-login button:has-text("contraseña")');
        await forgotLink.click();

        await expect(page.locator('#modal-forgot')).toHaveClass(/active/);
    });
});

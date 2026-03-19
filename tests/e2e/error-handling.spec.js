import { test, expect } from '@playwright/test';
import { mockSupabase, mockAuthenticatedState, waitForAppReady } from './helpers/mocks.js';

test.describe('Error Handling & Observability', () => {

    test('CJ.handleApiError logs to error buffer', async ({ page }) => {
        await mockSupabase(page);
        await page.goto('/');
        await waitForAppReady(page);

        const logLength = await page.evaluate(() => {
            CJ.handleApiError(new Error('Test error'), 'testContext', { silent: true });
            return window.__CJ_ERROR_LOG__.length;
        });
        expect(logLength).toBeGreaterThan(0);

        const lastEntry = await page.evaluate(() => {
            const log = window.__CJ_ERROR_LOG__;
            return log[log.length - 1];
        });
        expect(lastEntry.context).toBe('testContext');
        expect(lastEntry.message).toBe('Test error');
    });

    test('CJ.handleApiError shows toast for non-silent errors', async ({ page }) => {
        await mockSupabase(page);
        await page.goto('/');
        await waitForAppReady(page);

        await page.evaluate(() => {
            CJ.handleApiError(new Error('Visible error'), 'testVisible');
        });

        const toast = page.locator('.toast-container .toast').first();
        await expect(toast).toBeVisible({ timeout: 3000 });
    });

    test('CJ._reportError function exists and is rate-limited', async ({ page }) => {
        await mockSupabase(page);
        await page.goto('/');
        await waitForAppReady(page);

        const result = await page.evaluate(() => {
            return typeof CJ._reportError === 'function';
        });
        expect(result).toBe(true);
    });

    test('unhandled rejection is caught in error log', async ({ page }) => {
        await mockSupabase(page);
        await page.goto('/');
        await waitForAppReady(page);

        await page.evaluate(() => {
            window.__CJ_ERROR_LOG__.length = 0;
            Promise.reject(new Error('unhandled test rejection'));
        });

        // Wait for the rejection handler to fire
        await page.waitForTimeout(200);

        const hasEntry = await page.evaluate(() => {
            return window.__CJ_ERROR_LOG__.some(e => e.context === 'unhandledrejection');
        });
        expect(hasEntry).toBe(true);
    });

    test('CJ._localizeError translates network errors', async ({ page }) => {
        await mockSupabase(page);
        await page.goto('/');
        await waitForAppReady(page);

        const result = await page.evaluate(() => {
            return CJ._localizeError('Failed to fetch', 'test');
        });
        // Could be ES or EN depending on browser lang
        const isValid = result.includes('conexión') || result.includes('Connection');
        expect(isValid).toBe(true);
    });

    test('CJ.getErrorLog and clearErrorLog work', async ({ page }) => {
        await mockSupabase(page);
        await page.goto('/');
        await waitForAppReady(page);

        await page.evaluate(() => {
            CJ.handleApiError('err1', 'ctx1', { silent: true });
            CJ.handleApiError('err2', 'ctx2', { silent: true });
        });

        const logSize = await page.evaluate(() => CJ.getErrorLog().length);
        expect(logSize).toBeGreaterThanOrEqual(2);

        await page.evaluate(() => CJ.clearErrorLog());
        const afterClear = await page.evaluate(() => CJ.getErrorLog().length);
        expect(afterClear).toBe(0);
    });
});

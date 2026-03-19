import { test, expect } from '@playwright/test';
import { mockSupabase, waitForAppReady } from './helpers/mocks.js';

test.describe('AppState & Backward Compatibility', () => {

    test.beforeEach(async ({ page }) => {
        await mockSupabase(page);
        await page.goto('/');
        await waitForAppReady(page);
    });

    test('AppState is initialized with correct structure', async ({ page }) => {
        const state = await page.evaluate(() => ({
            hasUser: 'user' in AppState,
            hasPremium: 'premium' in AppState,
            hasMap: 'map' in AppState,
            hasGeo: 'geo' in AppState,
            hasUi: 'ui' in AppState,
            hasAuth: 'auth' in AppState,
            hasFilters: 'filters' in AppState,
        }));
        expect(state.hasUser).toBe(true);
        expect(state.hasPremium).toBe(true);
        expect(state.hasMap).toBe(true);
        expect(state.hasGeo).toBe(true);
        expect(state.hasUi).toBe(true);
        expect(state.hasAuth).toBe(true);
        expect(state.hasFilters).toBe(true);
    });

    test('backward-compat shim: currentUser mirrors AppState.user', async ({ page }) => {
        const result = await page.evaluate(() => {
            AppState.user = { id: 'test123', email: 'test@x.com' };
            const shimWorks = window.currentUser === AppState.user;
            window.currentUser = null;
            const reverseWorks = AppState.user === null;
            return { shimWorks, reverseWorks };
        });
        expect(result.shimWorks).toBe(true);
        expect(result.reverseWorks).toBe(true);
    });

    test('backward-compat shim: isUserPremium mirrors AppState.premium.isPremium', async ({ page }) => {
        const result = await page.evaluate(() => {
            AppState.premium.isPremium = true;
            const v1 = window.isUserPremium === true;
            window.isUserPremium = false;
            const v2 = AppState.premium.isPremium === false;
            return { v1, v2 };
        });
        expect(result.v1).toBe(true);
        expect(result.v2).toBe(true);
    });

    test('backward-compat shim: currentLang mirrors AppState.ui.currentLang', async ({ page }) => {
        const result = await page.evaluate(() => {
            const initial = window.currentLang;
            window.currentLang = 'en';
            const mirrorWorks = AppState.ui.currentLang === 'en';
            AppState.ui.currentLang = 'es';
            const reverseWorks = window.currentLang === 'es';
            return { initial: typeof initial, mirrorWorks, reverseWorks };
        });
        expect(result.initial).toBe('string');
        expect(result.mirrorWorks).toBe(true);
        expect(result.reverseWorks).toBe(true);
    });

    test('__CJ_DEBUG__ flag defaults to false', async ({ page }) => {
        const debug = await page.evaluate(() => window.__CJ_DEBUG__);
        expect(debug).toBe(false);
    });

    test('validation module is loaded (CJ.validate)', async ({ page }) => {
        const hasValidate = await page.evaluate(() => {
            return typeof CJ.validate === 'object' &&
                typeof CJ.validate.email === 'function' &&
                typeof CJ.validate.password === 'function';
        });
        expect(hasValidate).toBe(true);
    });

    test('CJ.validate.email rejects invalid emails', async ({ page }) => {
        const results = await page.evaluate(() => ({
            empty: CJ.validate.email(''),
            noAt: CJ.validate.email('invalid'),
            valid: CJ.validate.email('test@example.com'),
        }));
        expect(results.empty).toBe(false);
        expect(results.noAt).toBe(false);
        expect(results.valid).toBe(true);
    });
});

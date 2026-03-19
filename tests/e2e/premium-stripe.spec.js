import { test, expect } from '@playwright/test';
import { mockSupabase, mockAuthenticatedState, waitForAppReady } from './helpers/mocks.js';

test.describe('Premium & Stripe', () => {

    test('Stripe publishable key is test on localhost', async ({ page }) => {
        await mockSupabase(page);
        await page.goto('/');
        await waitForAppReady(page);

        const keyType = await page.evaluate(() => {
            return typeof STRIPE_PUBLISHABLE_KEY === 'string'
                ? (STRIPE_PUBLISHABLE_KEY.startsWith('pk_test') ? 'test' : 'live')
                : 'missing';
        });
        expect(keyType).toBe('test');
    });

    test('PLAN_FEATURES defines free and premium tiers', async ({ page }) => {
        await mockSupabase(page);
        await page.goto('/');
        await waitForAppReady(page);

        const features = await page.evaluate(() => {
            return {
                hasFree: typeof PLAN_FEATURES.free === 'object',
                hasPremium: typeof PLAN_FEATURES.premium === 'object',
                freeMax: PLAN_FEATURES.free.maxActiveMeetups,
                premiumMax: PLAN_FEATURES.premium.maxActiveMeetups,
                freeDM: PLAN_FEATURES.free.canDM,
                premiumDM: PLAN_FEATURES.premium.canDM,
            };
        });
        expect(features.hasFree).toBe(true);
        expect(features.hasPremium).toBe(true);
        expect(features.freeMax).toBe(3);
        expect(features.premiumMax).toBe(Infinity);
        expect(features.freeDM).toBe(false);
        expect(features.premiumDM).toBe(true);
    });

    test('getEffectivePlan returns free for null profile', async ({ page }) => {
        await mockSupabase(page);
        await page.goto('/');
        await waitForAppReady(page);

        const plan = await page.evaluate(() => getEffectivePlan(null));
        expect(plan).toBe('free');
    });

    test('getEffectivePlan returns premium for premium profile', async ({ page }) => {
        await mockSupabase(page);
        await page.goto('/');
        await waitForAppReady(page);

        const plan = await page.evaluate(() => getEffectivePlan({ plan: 'premium', plan_until: '2030-01-01' }));
        expect(plan).toBe('premium');
    });

    test('getEffectivePlan returns free for expired premium', async ({ page }) => {
        await mockSupabase(page);
        await page.goto('/');
        await waitForAppReady(page);

        const plan = await page.evaluate(() => getEffectivePlan({ plan: 'premium', plan_until: '2020-01-01' }));
        expect(plan).toBe('free');
    });

    test('can() helper respects current plan', async ({ page }) => {
        await mockSupabase(page);
        await page.goto('/');
        await waitForAppReady(page);

        const checks = await page.evaluate(() => {
            AppState.premium.plan = 'free';
            const freeCanDM = can('canDM');
            AppState.premium.plan = 'premium';
            const premiumCanDM = can('canDM');
            AppState.premium.plan = 'free'; // reset
            return { freeCanDM, premiumCanDM };
        });
        expect(checks.freeCanDM).toBe(false);
        expect(checks.premiumCanDM).toBe(true);
    });
});

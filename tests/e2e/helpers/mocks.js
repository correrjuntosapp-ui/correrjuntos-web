// Test helpers: Supabase API mocking for Playwright E2E tests

const FAKE_USER = {
    id: 'test-user-00000000-0000-0000-0000-000000000001',
    email: 'test@correrjuntos.com',
    aud: 'authenticated',
    role: 'authenticated',
    created_at: '2025-01-01T00:00:00.000Z',
};

const FAKE_PROFILE = {
    id: FAKE_USER.id,
    email: FAKE_USER.email,
    nombre: 'Test',
    apellidos: 'Runner',
    ciudad: 'Madrid',
    nivel: 'intermedio',
    pais: 'ES',
    es_premium: false,
    plan: 'free',
    verificado: false,
};

const FAKE_SESSION = {
    access_token: 'fake-access-token-for-testing',
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: 'fake-refresh-token',
    user: FAKE_USER,
};

/**
 * Mock all Supabase API calls. Returns empty data for queries, success for mutations.
 * Call before page.goto().
 */
export async function mockSupabase(page) {
    await page.route('**/supabase.co/**', async (route) => {
        const url = route.request().url();
        const method = route.request().method();

        // Auth token (login)
        if (url.includes('/auth/v1/token')) {
            const body = route.request().postDataJSON?.() || {};
            if (body?.email === 'bad@test.com') {
                return route.fulfill({
                    status: 400,
                    contentType: 'application/json',
                    body: JSON.stringify({ error: 'invalid_credentials', error_description: 'Invalid login credentials' }),
                });
            }
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(FAKE_SESSION),
            });
        }

        // Auth signup
        if (url.includes('/auth/v1/signup')) {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ ...FAKE_SESSION, user: { ...FAKE_USER, email_confirmed_at: null } }),
            });
        }

        // Auth user
        if (url.includes('/auth/v1/user')) {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(FAKE_USER),
            });
        }

        // Auth session
        if (url.includes('/auth/v1/session')) {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ data: { session: FAKE_SESSION }, error: null }),
            });
        }

        // Auth recover (forgot password)
        if (url.includes('/auth/v1/recover')) {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({}),
            });
        }

        // REST API queries (GET)
        if (method === 'GET' && url.includes('/rest/v1/')) {
            // Profiles
            if (url.includes('/profiles')) {
                return route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([FAKE_PROFILE]),
                });
            }
            // Quedadas (return empty)
            if (url.includes('/quedadas')) {
                return route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([]),
                });
            }
            // Default: empty array
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([]),
            });
        }

        // REST API mutations (POST/PATCH/DELETE)
        if (['POST', 'PATCH', 'DELETE'].includes(method) && url.includes('/rest/v1/')) {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([]),
            });
        }

        // RPC calls
        if (url.includes('/rest/v1/rpc/')) {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(null),
            });
        }

        // Edge functions
        if (url.includes('/functions/v1/')) {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ ok: true }),
            });
        }

        // Fallback: let it through
        return route.continue();
    });
}

/**
 * Simulate an authenticated user state.
 * Must be called BEFORE page.goto().
 */
export async function mockAuthenticatedState(page) {
    await mockSupabase(page);

    // Inject Supabase session into localStorage before page loads
    await page.addInitScript((session) => {
        const storageKey = 'sb-waihiwdbtcbdazmaxdor-auth-token';
        localStorage.setItem(storageKey, JSON.stringify({
            currentSession: session,
            expiresAt: Math.floor(Date.now() / 1000) + 3600,
        }));
    }, FAKE_SESSION);
}

/**
 * Wait for the app to fully initialize (all deferred scripts loaded).
 */
export async function waitForAppReady(page) {
    await page.waitForFunction(() =>
        typeof window.AppState === 'object' &&
        typeof window.openModal === 'function' &&
        typeof window.doLogin === 'function'
    , { timeout: 10000 });
}

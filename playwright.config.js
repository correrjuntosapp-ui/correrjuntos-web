// @ts-check
import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI ? 'github' : 'html',
    timeout: 30000,
    expect: { timeout: 5000 },
    use: {
        baseURL: 'http://localhost:3000',
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: { browserName: 'chromium' },
        },
    ],
    webServer: {
        command: 'npx serve -l 3000 -s',
        port: 3000,
        reuseExistingServer: !process.env.CI,
    },
});

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium, expect } = require('@playwright/test');
const root = path.resolve(__dirname, '..');
const origin = 'https://www.correrjuntos.com';
const start = origin + '/?utm_source=newsletter&utm_medium=email&utm_campaign=launch_v12';
const results = [];
const types = { '.js': 'application/javascript', '.css': 'text/css', '.html': 'text/html', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json' };

async function fixture(browser, consent, options = {}) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', ...options });
  if (consent) await context.addInitScript(value => localStorage.setItem('cj_cookie_consent', value), consent);
  const unexpected = [];
  const trackers = [];
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (/googletagmanager\.com|connect\.facebook\.net/.test(url.hostname)) {
      trackers.push(url.hostname);
      return route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
    }
    if (['apps.apple.com', 'play.google.com'].includes(url.hostname)) return route.fulfill({ status: 200, contentType: 'text/html', body: '<title>Store destination mocked</title>' });
    if (url.origin !== origin) { unexpected.push(url.href); return route.abort(); }
    const relative = decodeURIComponent(url.pathname).slice(1);
    const candidates = [relative || 'index.html', relative + '.html', path.join(relative, 'index.html')];
    const file = candidates.map(candidate => path.resolve(root, candidate)).find(candidate => candidate.startsWith(root + path.sep) && fs.existsSync(candidate) && fs.statSync(candidate).isFile());
    if (!file) return route.fulfill({ status: 404, body: 'Fixture not found' });
    return route.fulfill({ status: 200, contentType: types[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) });
  });
  return { context, unexpected, trackers };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const consent of [undefined, 'rejected', 'accepted']) {
      for (const store of ['apple', 'play']) {
        const harness = await fixture(browser, consent);
        const page = await harness.context.newPage();
        const events = [];
        await page.exposeFunction('recordFunnelTestEvent', event => events.push(event));
        await page.goto(start, { waitUntil: 'networkidle' });
        await page.evaluate(() => {
          const push = window.dataLayer.push.bind(window.dataLayer);
          window.dataLayer.push = (...items) => {
            for (const item of items) window.recordFunnelTestEvent(Array.from(item));
            return push(...items);
          };
        });
        await page.locator('.hero .actions a[href*="abrir-app"]').click();
        await page.waitForURL(/\/abrir-app(?:\?|$)/);
        assert.equal(new URL(page.url()).searchParams.get('utm_campaign'), consent === 'accepted' ? 'launch_v12' : null);
        assert.equal(await page.locator('body.is-desktop').count(), 1);
        assert.doesNotMatch(await page.locator('body').innerText(), /100% gratis|60 segundos/);
        await page.locator('.variant-desktop .store').nth(store === 'apple' ? 0 : 1).click();
        await page.waitForURL(store === 'apple' ? /apps\.apple\.com/ : /play\.google\.com/);
        const final = new URL(page.url());
        const campaign = store === 'apple' ? final.searchParams.get('ct') : new URLSearchParams(final.searchParams.get('referrer')).get('utm_campaign');
        assert.equal(campaign, consent === 'accepted' ? 'launch_v12' : null);
        assert.equal(events.filter(event => event[1] === 'home_download_click').length, consent === 'accepted' ? 1 : 0);
        assert.equal(events.some(event => ['purchase', 'sign_up', 'app_install'].includes(event[1])), false);
        assert.deepEqual(harness.unexpected, []);
        if (consent !== 'accepted') assert.equal(harness.trackers.length, 0);
        results.push({ scenario: 'home-smartlink-store', consent: consent || 'unknown', store, pass: true });
        await harness.context.close();
      }
    }
    const harness = await fixture(browser);
    const page = await harness.context.newPage();
    await page.goto(start, { waitUntil: 'networkidle' });
    for (const screen of ['02-plan', '03-sesion', '01-inicio']) {
      await page.locator('[data-tour-screen="' + screen + '"]').click();
      assert.match(await page.locator('#app-screen').getAttribute('src'), new RegExp(screen));
      assert.equal(await page.locator('#full-screen').evaluate(element => element === document.activeElement), true);
    }
    assert.equal(await page.evaluate(() => localStorage.getItem('cj_utm')), null);
    assert.equal(await page.evaluate(() => window.dataLayer.filter(item => item[0] === 'event').length), 0);
    await page.getByRole('button', { name: 'Aceptar', exact: true }).click();
    await page.locator('[data-tour-screen="02-plan"]').click();
    assert.equal(await page.evaluate(() => window.dataLayer.filter(item => item[1] === 'home_gallery_select').length), 1);
    await page.evaluate(() => window.rejectCookies());
    await page.locator('[data-tour-screen="03-sesion"]').click();
    assert.equal(await page.evaluate(() => window.dataLayer.filter(item => item[1] === 'home_gallery_select').length), 1);
    assert.equal(await page.evaluate(() => localStorage.getItem('cj_utm')), null);
    assert.deepEqual(harness.unexpected, []);
    results.push({ scenario: 'guided-tour-and-consent-revocation', pass: true });
    await harness.context.close();
    for (const consent of ['rejected', 'accepted']) {
      for (const status of [201, 409, 500]) {
        const subscription = await fixture(browser, consent);
        const tab = await subscription.context.newPage();
        const events = [];
        await tab.exposeFunction('recordSubscriptionTestEvent', event => events.push(event));
        await tab.route('**/api/brevo-subscribe', route => route.fulfill({ status, contentType: 'application/json', body: '{}' }));
        await tab.route('**/blog/descarga-plan-10k/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Download destination mocked</h1>' }));
        await tab.goto(start, { waitUntil: 'networkidle' });
        await tab.evaluate(() => {
          window.gtag = (...args) => window.recordSubscriptionTestEvent(args);
          window.fbq = (...args) => window.recordSubscriptionTestEvent(args);
        });
        await tab.locator('#newsletter-email').fill('qa@example.invalid');
        await tab.locator('#newsletterForm button').click();
        if (status === 201) await tab.waitForURL('**/blog/descarga-plan-10k/');
        else if (status === 409) await tab.locator('#newsletterMsg a').waitFor();
        else await tab.locator('#newsletterMsg[data-error="true"]').waitFor();
        const expected = status === 201 && consent === 'accepted' ? 1 : 0;
        assert.equal(events.filter(event => event[1] === 'lead_magnet_signup').length, expected);
        assert.equal(events.filter(event => event[1] === 'Lead').length, expected);
        assert.equal(events.some(event => JSON.stringify(event).includes('qa@example.invalid')), false);
        assert.deepEqual(subscription.unexpected, []);
        results.push({ scenario: 'newsletter-conversion-not-duplicates', consent, status, pass: true });
        await subscription.context.close();
      }
      for (const platform of ['Android', 'iPhone']) {
        const mobile = await fixture(browser, consent, { userAgent: platform, isMobile: true });
        const tab = await mobile.context.newPage();
        await tab.goto(origin + '/abrir-app?utm_source=newsletter&utm_campaign=launch_v12');
        await expect.poll(() => tab.url(), { timeout: 10000 }).toMatch(platform === 'iPhone' ? /apps\.apple\.com/ : /play\.google\.com/);
        await expect(tab).toHaveTitle('Store destination mocked');
        const store = new URL(tab.url());
        const campaign = platform === 'iPhone' ? store.searchParams.get('ct') : new URLSearchParams(store.searchParams.get('referrer')).get('utm_campaign');
        assert.equal(campaign, consent === 'accepted' ? 'launch_v12' : null);
        assert.deepEqual(mobile.unexpected, []);
        results.push({ scenario: 'mobile-store-fallback', platform, consent, pass: true });
        await mobile.context.close();
      }
    }
    console.log(JSON.stringify({ fixture: 'Local source served under mocked production origin. No real analytics, store purchases, installs or native account actions.', results }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const baseUrl = process.env.HOME_QA_URL || 'http://127.0.0.1:4176/';
const output = process.env.HOME_QA_OUTPUT;
const report = { baseUrl, viewports: [], subscriptions: [], limitations: ['Analytics SDKs and subscription requests are intercepted; no real events or subscribers are sent.'] };
const tracking = /googletagmanager\.com|google-analytics\.com|connect\.facebook\.net|facebook\.com\/tr/;

async function prepareContext(browser, width, consent) {
  const context = await browser.newContext({ viewport: { width, height: 844 }, deviceScaleFactor: width < 700 ? 2 : 1, reducedMotion: 'reduce' });
  if (consent) await context.addInitScript(value => localStorage.setItem('cj_cookie_consent', value), consent);
  await context.route('**/*', async route => {
    if (tracking.test(route.request().url())) return route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
    if (route.request().url().includes('/api/brevo-subscribe')) return route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
    return route.continue();
  });
  return context;
}

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.HOME_QA_CHROME ? { executablePath: process.env.HOME_QA_CHROME } : {}) });
  try {
    for (const width of [320, 390, 768, 1440]) {
      const context = await prepareContext(browser, width);
      const page = await context.newPage();
      const errors = [];
      const external = [];
      const analytics = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      page.on('request', request => {
        if (new URL(request.url()).origin !== new URL(baseUrl).origin) external.push(request.url());
        if (tracking.test(request.url())) analytics.push(request.url());
      });
      const campaign = new URL(baseUrl);
      campaign.search = '?utm_source=home-qa&utm_medium=review&utm_campaign=v10';
      const response = await page.goto(campaign.href, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200);
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('#cookieBanner').isVisible(), true);
      assert.deepEqual(external, []);
      const storeLinks = await page.locator('a[href*="apps.apple.com"], a[href*="play.google.com"]').evaluateAll(anchors => anchors.map(anchor => anchor.href));
      assert.equal(storeLinks.length, 4);
      storeLinks.forEach(href => {
        const link = new URL(href);
        if (link.hostname === 'apps.apple.com') assert.equal(link.searchParams.get('ct'), 'v10');
        else assert.equal(new URLSearchParams(link.searchParams.get('referrer')).get('utm_campaign'), 'v10');
      });
      assert.equal(await page.evaluate(() => localStorage.getItem('cj_utm')), null);
      await page.getByRole('button', { name: 'Rechazar', exact: true }).click();
      await page.reload({ waitUntil: 'networkidle' });
      assert.equal(await page.locator('#cookieBanner').isVisible(), false);
      assert.deepEqual(external, []);
      for (const sport of ['cycling', 'running']) {
        await page.locator('[data-sport="' + sport + '"]').click();
        assert.equal(await page.locator('#reading-' + sport).isVisible(), true);
        assert.equal(await page.locator('#reading-' + (sport === 'running' ? 'cycling' : 'running')).isVisible(), false);
        assert.equal(await page.locator('#reading-' + sport + ' .article').count(), 3);
      }
      const chips = await page.locator('.screen-choices').evaluate(choices => {
        const bounds = choices.getBoundingClientRect();
        return [...choices.querySelectorAll('button')].map(button => {
          const rect = button.getBoundingClientRect();
          return { width: rect.width, height: rect.height, visible: rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1 };
        });
      });
      if (width < 700) assert.ok(chips[0].visible && chips[1].visible);
      assert.ok(chips.every(chip => chip.height >= 44));
      const positions = [];
      const nativeManifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../docs/home/native-captures-v13.json'), 'utf8'));
      const observedScreens = [];
      await page.locator('#expand-screen').click();
      for (let screen = 0; screen < 6; screen++) {
        const position = await page.locator('#dialog-position').innerText();
        assert.equal(position, ((screen % 5) + 1) + ' / 5');
        positions.push(position);
        assert.equal(await page.locator('#dialog-screen').evaluate(image => image.src), await page.locator('#app-screen').evaluate(image => image.src));
        const expected = nativeManifest.captures[screen % 5].variants.find(variant => variant.width === 720);
        const screenshot = await page.locator('#dialog-screen').evaluate(async image => {
          await image.decode();
          return { path: new URL(image.src).pathname, width: image.naturalWidth, height: image.naturalHeight, alt: image.alt };
        });
        assert.equal(screenshot.path, '/' + expected.file);
        assert.equal(screenshot.width, expected.width);
        assert.equal(screenshot.height, expected.height);
        observedScreens.push(screenshot);
        await page.keyboard.press('ArrowRight');
      }
      const dialogButtons = page.locator('.screen-dialog button');
      await dialogButtons.last().focus();
      await page.keyboard.press('Tab');
      assert.equal(await dialogButtons.first().evaluate(element => element === document.activeElement), true);
      await page.keyboard.press('Shift+Tab');
      assert.equal(await dialogButtons.last().evaluate(element => element === document.activeElement), true);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.screen-dialog').isVisible(), false);
      assert.equal(await page.locator('#expand-screen').evaluate(element => element === document.activeElement), true);
      if (width < 900) {
        await page.locator('.menu-button').click();
        assert.equal(await page.locator('#mobile-menu').isVisible(), true);
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#mobile-menu').isVisible(), false);
      }
      const faqMatches = await page.evaluate(() => {
        const graph = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)['@graph'];
        const questions = graph.find(node => node['@type'] === 'FAQPage').mainEntity;
        const visible = [...document.querySelectorAll('#preguntas details')];
        const normalize = text => text.replace(/\s+/g, ' ').trim();
        return questions.length === 7 && visible.length === 7 && questions.every((question, index) => {
          const node = visible[index];
          const summary = node.querySelector('summary').cloneNode(true);
          summary.querySelectorAll('[aria-hidden="true"]').forEach(element => element.remove());
          return normalize(summary.textContent) === normalize(question.name) && normalize(node.querySelector('p').textContent) === normalize(question.acceptedAnswer.text);
        });
      });
      assert.equal(faqMatches, true);
      await page.evaluate(async () => {
        for (const img of document.images) {
          if (!img.getBoundingClientRect().width) continue;
          img.loading = 'eager';
          await img.decode().catch(() => {});
        }
      });
      const broken = await page.evaluate(() => [...document.images].filter(img => img.getBoundingClientRect().width && (!img.complete || !img.naturalWidth)).map(img => img.src));
      assert.deepEqual(broken, []);
      assert.equal(await page.locator('.proof-clubs, .club-links, .community-map-link').count(), 0);
      const strengthCard = page.locator('#fuerza');
      assert.equal(await strengthCard.isVisible(), true);
      assert.match(await strengthCard.innerText(), /NUEVO EN LA 1.3.30/);
      assert.match(await strengthCard.innerText(), /sesión de muestra gratuita/);
      const trainingImages = await page.locator('.training-photo img').evaluateAll(images => images.map(image => ({
        source: image.currentSrc,
        loaded: image.complete && image.naturalWidth > 0,
        width: image.naturalWidth,
        renderedWidth: image.getBoundingClientRect().width,
        alt: image.alt
      })));
      assert.equal(trainingImages.length, 2);
      assert.ok(trainingImages.every(image => image.loaded && image.width >= image.renderedWidth * (width < 700 ? 2 : 1) && image.alt.includes('generada con IA')));
      const strengthLink = strengthCard.getByRole('link', { name: 'Qué incluye cada opción' });
      await strengthLink.focus();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Shift+Tab');
      assert.equal(await strengthLink.evaluate(element => element === document.activeElement && element.matches(':focus-visible') && getComputedStyle(element).outlineStyle === 'solid'), true);
      await page.locator('.product-strip a[href="#fuerza"]').click();
      assert.ok(await page.evaluate(() => scrollY > 0));
      await page.getByRole('link', { name: 'CorrerJuntos, inicio', exact: true }).click();
      assert.ok(await page.evaluate(() => scrollY <= 2));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0);
      assert.deepEqual(errors, []);
      assert.deepEqual(external, []);
      if (output) {
        fs.mkdirSync(output, { recursive: true });
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: path.join(output, 'home-' + width + '.png'), fullPage: true });
        await page.screenshot({ path: path.join(output, 'hero-' + width + '.png') });
        await page.locator('#entrenamiento').screenshot({ path: path.join(output, 'training-' + width + '.png') });
        await page.locator('#blog').screenshot({ path: path.join(output, 'blog-' + width + '.png') });
      }
      await Promise.all([
        page.waitForRequest(request => request.url().includes('gtag/js?id=')),
        page.waitForRequest(request => request.url().includes('fbevents.js')),
        page.evaluate(() => window.acceptCookies())
      ]);
      assert.equal(analytics.length, 2);
      const attributed = await page.locator('a[href*="apps.apple.com"], a[href*="play.google.com"]').evaluateAll(anchors => anchors.map(anchor => anchor.href));
      attributed.forEach(href => {
        const link = new URL(href);
        if (link.hostname === 'apps.apple.com') assert.equal(link.searchParams.get('ct'), 'v10');
        else assert.equal(new URLSearchParams(link.searchParams.get('referrer')).get('utm_campaign'), 'v10');
      });
      await page.evaluate(() => window.acceptCookies());
      assert.equal(analytics.length, 2);
      await page.reload({ waitUntil: 'networkidle' });
      assert.equal(analytics.length, 4);
      assert.equal(await page.locator('#cookieBanner').isVisible(), false);
      report.viewports.push({ width, status: 200, externalBeforeConsent: 0, chips, positions, observedScreens, faqMatches, errors, broken, trainingImages, strengthFocus: true, storeLinks: storeLinks.length, trackerInitializations: 2 });
      await context.close();
    }
    for (const status of [201, 409, 500]) {
      const context = await prepareContext(browser, 390, 'rejected');
      const page = await context.newPage();
      const submissions = [];
      await page.route('**/api/brevo-subscribe', route => {
        submissions.push(route.request().postDataJSON());
        return route.fulfill({ status, contentType: 'application/json', body: '{}' });
      });
      await page.route('**/blog/descarga-plan-10k/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>QA: descarga interceptada</h1>' }));
      await page.goto(baseUrl);
      await page.locator('#newsletter-email').fill('home-qa@example.invalid');
      await page.locator('#newsletterForm button').click();
      if (status === 201) await page.waitForURL('**/blog/descarga-plan-10k/');
      if (status === 409) {
        await page.locator('#newsletterMsg a').waitFor();
        assert.equal(await page.locator('#newsletterMsg a').getAttribute('href'), '/blog/descarga-plan-10k');
      }
      if (status === 500) {
        await page.locator('#newsletterMsg[data-error="true"]').waitFor();
        assert.equal(await page.locator('#newsletterForm button').isEnabled(), true);
      }
      assert.deepEqual(submissions, [{ email: 'home-qa@example.invalid', lang: 'es', source: 'lead-magnet-10k-home', lead_magnet: 'plan-10k-preview' }]);
      report.subscriptions.push({ status, mockedRequests: submissions.length, passed: true });
      await context.close();
    }
    const noScript = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const fallback = await noScript.newPage();
    await fallback.goto(baseUrl);
    assert.equal(await fallback.locator('#reading-running').isVisible(), true);
    assert.equal(await fallback.locator('#reading-cycling').isVisible(), true);
    assert.equal(await fallback.locator('.fallback-nav').isVisible(), true);
    assert.equal(await fallback.locator('#fuerza').isVisible(), true);
    assert.equal(await fallback.locator('.product-strip a[href="#fuerza"]').getAttribute('href'), '#fuerza');
    report.noJavaScriptFallback = true;
    await noScript.close();
    console.log(JSON.stringify(report, null, 2));
    if (output) fs.writeFileSync(path.join(output, 'browser-report.json'), JSON.stringify(report, null, 2) + '\n');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'js/home-funnel.js'), 'utf8');
const opener = fs.readFileSync(path.join(root, 'js/open-app.js'), 'utf8');
const apple = 'https://apps.apple.com/app/id6758505910';
const play = 'https://play.google.com/store/apps/details?id=com.correrjuntos.app';

function setup({ consent, url = 'https://www.correrjuntos.com/?utm_source=newsletter&utm_medium=email&utm_campaign=release_v12', stored, blocked = false } = {}) {
  const storage = new Map();
  if (consent) storage.set('cj_cookie_consent', consent);
  if (stored) storage.set('cj_utm', JSON.stringify(stored));
  const listeners = {};
  const events = [];
  const links = [];
  const context = {
    URL, URLSearchParams, WeakMap, Date,
    location: new URL(url),
    localStorage: {
      getItem: key => { if (blocked) throw Error('blocked'); return storage.get(key) || null; },
      setItem: (key, value) => { if (blocked) throw Error('blocked'); storage.set(key, value); },
      removeItem: key => { if (blocked) throw Error('blocked'); storage.delete(key); }
    },
    document: { querySelectorAll: () => links, addEventListener: (name, callback) => { listeners[name] = callback; } },
    addEventListener: (name, callback) => { listeners['window:' + name] = callback; },
    gtag: (...args) => events.push(args)
  };
  context.window = context;
  vm.createContext(context);
  const makeLink = (href, section = '.hero') => {
    const anchor = {
      href, dataset: {}, classList: { contains: () => false },
      getAttribute: name => name === 'href' ? href : null,
      hasAttribute: () => false,
      closest: selector => selector === 'a[href]' || selector === section ? anchor : null
    };
    links.push(anchor);
    return anchor;
  };
  const smartLink = makeLink('/abrir-app');
  const storeLink = makeLink(play);
  vm.runInContext(source, context);
  return { context, storage, events, listeners, smartLink, storeLink, links };
}

for (const state of [undefined, 'rejected']) {
  test('URL campaign reaches the links without consent, but nothing is stored or measured: ' + state, () => {
    const harness = setup({ consent: state });
    harness.listeners.click({ target: harness.smartLink });
    assert.equal(harness.events.length, 0);
    assert.equal(harness.storage.has('cj_utm'), false);
    assert.equal(new URL(harness.smartLink.href, 'https://www.correrjuntos.com').searchParams.get('utm_campaign'), 'release_v12');
    assert.equal(new URLSearchParams(new URL(harness.storeLink.href).searchParams.get('referrer')).get('utm_campaign'), 'release_v12');
  });
}

test('without consent the stored attribution is never read and gets removed', () => {
  const harness = setup({ url: 'https://www.correrjuntos.com/', stored: { source: 'newsletter', campaign: 'old', t: Date.now() } });
  assert.equal(harness.smartLink.href, '/abrir-app');
  assert.equal(harness.storeLink.href, play);
  assert.equal(harness.storage.has('cj_utm'), false);
});

test('acceptance preserves campaign through smart link and both stores', () => {
  const harness = setup({ consent: 'accepted' });
  const helper = harness.context.CJHomeFunnel;
  assert.equal(new URL(harness.smartLink.href).searchParams.get('utm_campaign'), 'release_v12');
  assert.equal(new URL(helper.attributedUrl(apple)).searchParams.get('ct'), 'release_v12');
  const referrer = new URL(helper.attributedUrl(play)).searchParams.get('referrer');
  assert.equal(new URLSearchParams(referrer).get('utm_campaign'), 'release_v12');
  harness.listeners.click({ target: harness.smartLink });
  assert.equal(harness.events.length, 1);
  assert.equal(harness.events[0][1], 'home_download_click');
  assert.equal(harness.events[0][2].destination, 'smart_link');
  assert.equal(harness.events[0][2].placement, 'hero');
  assert.equal(harness.events[0][2].home_version, 'v13');
  assert.deepEqual(Object.keys(harness.events[0][2]).sort(), ['destination', 'home_version', 'placement']);
});

test('acceptance does not replay earlier interactions; revocation stops later ones', () => {
  const harness = setup();
  harness.listeners.click({ target: harness.smartLink });
  harness.storage.set('cj_cookie_consent', 'accepted');
  harness.context.CJHomeFunnel.refresh();
  assert.equal(harness.events.length, 0);
  harness.listeners.click({ target: harness.smartLink });
  assert.equal(harness.events.length, 1);
  harness.storage.set('cj_cookie_consent', 'rejected');
  harness.listeners['window:storage']({ key: 'cj_cookie_consent' });
  harness.listeners.click({ target: harness.smartLink });
  assert.equal(harness.events.length, 1);
  assert.equal(harness.storage.has('cj_utm'), false);
  // La campaña sigue en la barra de direcciones, así que el enlace la conserva; lo que desaparece es el almacén.
  assert.equal(new URL(harness.smartLink.href, 'https://www.correrjuntos.com').searchParams.get('utm_campaign'), 'release_v12');
});

test('local preview emits no commercial events even with consent', () => {
  const harness = setup({ consent: 'accepted', url: 'http://127.0.0.1:4174/' });
  harness.listeners.click({ target: harness.smartLink });
  assert.equal(harness.events.length, 0);
});

for (const value of ['person@example.com', 'https://private.test', 'a'.repeat(81), '<script>']) {
  test('unsafe campaign source is not stored: ' + value.slice(0, 20), () => {
    const harness = setup({ consent: 'accepted', url: 'https://www.correrjuntos.com/?utm_source=' + encodeURIComponent(value) });
    assert.equal(harness.storage.has('cj_utm'), false);
    assert.equal(harness.smartLink.href, '/abrir-app');
  });
}

test('stale stored attribution, denied storage and unknown destinations fail closed', () => {
  const stale = setup({ consent: 'accepted', url: 'https://www.correrjuntos.com/', stored: { source: 'old', t: 1 } });
  assert.equal(stale.smartLink.href, '/abrir-app');
  assert.doesNotThrow(() => setup({ consent: 'accepted', blocked: true }));
  const helper = setup({ consent: 'accepted' }).context.CJHomeFunnel;
  for (const href of ['https://apps.apple.com.attacker.test/app/id6758505910', 'https://example.com/abrir-app', 'https://play.google.com/store/apps/details?id=other', 'javascript:alert(1)']) {
    assert.equal(helper.attributedUrl(href), href);
    assert.equal(helper.destination(href), null);
  }
});

test('loading the measurement module twice does not double count', () => {
  const harness = setup({ consent: 'accepted' });
  const callback = harness.listeners.click;
  vm.runInContext(source, harness.context);
  assert.equal(harness.listeners.click, callback);
});

test('bridge shares versioned assets and keeps zoom and truthful free-plan copy', () => {
  const html = fs.readFileSync(path.join(root, 'abrir-app.html'), 'utf8');
  const crypto = require('node:crypto');
  for (const asset of ['js/home-funnel.js', 'js/open-app.js']) {
    const digest = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, asset))).digest('hex').slice(0, 12);
    assert.ok(html.includes('/' + asset + '?v=' + digest), asset);
  }
  assert.doesNotMatch(html, /100% gratis|60 segundos|maximum-scale|fonts\.googleapis/);
  assert.match(html, /Dos planes gratis/);
  assert.match(html, /Android 1\.3\.30 \(127\)/);
});

test('editorial policy clicks are not counted as article discovery', () => {
  const harness = setup({ consent: 'accepted' });
  const policy = {
    href: '/blog/politica-editorial',
    closest: selector => ['a[href]', '#blog', '.editorial-note'].includes(selector) ? policy : null
  };
  harness.listeners.click({ target: policy });
  assert.equal(harness.events.length, 0);
});

function openContext(userAgent, { hidden = false, ipad = false } = {}) {
  const timers = new Map();
  const listeners = {};
  const navigations = [];
  let timerId = 0;
  const context = {
    navigator: { userAgent, platform: ipad ? 'MacIntel' : '', maxTouchPoints: ipad ? 5 : 0 },
    document: {
      body: { classList: { add() {} } }, visibilityState: hidden ? 'hidden' : 'visible',
      addEventListener: (name, callback) => { listeners[name] = callback; },
      getElementById: () => ({ addEventListener: (name, callback) => { listeners.button = callback; } })
    },
    location: { set href(value) { navigations.push(value); } },
    Date,
    setTimeout: (callback, delay) => { timers.set(++timerId, { callback, delay }); return timerId; },
    clearTimeout: key => timers.delete(key),
    CJHomeFunnel: { attributedUrl: href => href + (href.includes('?') ? '&' : '?') + 'campaign_test=1' }
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(opener, context);
  const runDelay = delay => {
    for (const [key, timer] of [...timers]) if (timer.delay === delay) { timers.delete(key); timer.callback(); }
  };
  return { context, navigations, listeners, timers, runDelay };
}

for (const device of ['iPhone', 'Android', 'iPad-desktop']) {
  test('smart-link model opens app then falls back to the correct store: ' + device, () => {
    const harness = openContext(device === 'iPad-desktop' ? 'Macintosh' : device, { ipad: device === 'iPad-desktop' });
    harness.runDelay(250);
    assert.equal(harness.navigations[0], 'correrjuntos://');
    harness.runDelay(1700);
    assert.match(harness.navigations[1], device === 'Android' ? /play.google.com/ : /apps.apple.com/);
    assert.match(harness.navigations[1], /campaign_test=1/);
  });
}

test('desktop never attempts an automatic app or store navigation', () => {
  const harness = openContext('Windows Chrome');
  assert.equal(harness.timers.size, 0);
  assert.equal(harness.navigations.length, 0);
});

test('opening the installed app cancels fallback; explicit retry remains possible', () => {
  const harness = openContext('Android');
  harness.runDelay(250);
  harness.context.document.visibilityState = 'hidden';
  harness.listeners.visibilitychange();
  harness.runDelay(1700);
  assert.equal(harness.navigations.length, 1);
  harness.context.document.visibilityState = 'visible';
  harness.listeners.button({ preventDefault() {} });
  assert.equal(harness.navigations.length, 2);
  harness.runDelay(1700);
  assert.match(harness.navigations[2], /play.google.com/);
});

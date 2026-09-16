const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);

test('home candidate uses production asset paths and retains metadata', () => {
  assert.doesNotMatch(html, /\/tmp\/|Preview local|fonts\.googleapis/);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
  assert.match(html, /name="apple-itunes-app" content="app-id=6758505910"/);
  assert.match(html, /property="al:android:package" content="com.correrjuntos.app"/);
  assert.match(html, /rel="manifest" href="\/manifest.json"/);
  assert.match(html, /rel="canonical" href="https:\/\/www\.correrjuntos\.com\/"/);
  assert.match(html, /name="robots" content="index, follow, max-image-preview:large/);
  assert.match(html, /name="p:domain_verify"/);
  assert.match(html, /id="newsletterForm"/);
  assert.doesNotMatch(html, /(?:src|srcset)="[^"]*comunidad-torre-del-mar/);
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  assert.ok(config.headers.some(rule => rule.has?.some(condition => condition.type === 'host' && condition.value === '.*.vercel.app') && rule.headers.some(header => header.key === 'X-Robots-Tag' && header.value.includes('noindex'))));
});

test('blog navigation opens the blog index on desktop, mobile and without JavaScript', () => {
  for (const name of ['Navegación principal', 'Navegación móvil', 'Navegación sin JavaScript']) {
    const navigation = html.match(new RegExp('<nav[^>]*aria-label="' + name + '"[^>]*>([\\s\\S]*?)</nav>'))[1];
    assert.match(navigation, /<a href="\/blog">El blog<\/a>/);
    assert.doesNotMatch(navigation, /href="#blog"/);
  }
  assert.ok(fs.existsSync(path.join(root, 'blog/index.html')));
});

test('editorial ItemList mirrors all six sport cards', () => {
  const list = schema['@graph'].find(node => node['@type'] === 'ItemList').itemListElement;
  const cards = [...html.matchAll(/<article\b[^>]*>[\s\S]*?<\/article>/g)].map(match => match[0]).filter(card => card.includes('data-home-article'));
  assert.equal(cards.length, 6);
  assert.equal(list.length, 6);
  cards.forEach((card, index) => {
    const title = card.match(/<h4[^>]*>([\s\S]*?)<\/h4>/)[1].replace(/<[^>]+>/g, '').trim();
    const url = new URL(card.match(/<a\b[^>]*href="([^"]+)"/)[1], 'https://www.correrjuntos.com').href;
    assert.equal(list[index].name, title);
    assert.equal(list[index].url, url);
    assert.equal(list[index].position, index + 1);
  });
});

test('all six native screen derivatives preserve the verified hashes', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs/home/native-captures-manifest.json'), 'utf8'));
  assert.equal(manifest.captures.length, 6);
  for (const capture of manifest.captures) {
    for (const variant of capture.variants) {
      assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root, variant.file))).digest('hex'), variant.sha256, variant.file);
    }
  }
});

test('current screenshots all come from the installed 1.3.30 (127) store build, not relabeled archives', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs/home/native-captures-v13.json'), 'utf8'));
  const gallery = fs.readFileSync(path.join(root, 'js/home.js'), 'utf8');
  const bridge = fs.readFileSync(path.join(root, 'abrir-app.html'), 'utf8');
  assert.equal(manifest.appVersion, '1.3.30');
  assert.equal(manifest.versionCode, 127);
  assert.equal(manifest.status, 'store-release');
  assert.match(manifest.installedApkSha256, /^[a-f0-9]{64}$/);
  assert.equal(manifest.account.existingTestData, true);
  assert.deepEqual(manifest.captures.map(capture => capture.name), ['01-inicio', '02-plan', '03-sesion', '04-fuerza', '05-carreras']);
  const variants = new Set();
  for (const capture of manifest.captures) {
    assert.equal(capture.width, 1080);
    assert.equal(capture.height, 2340);
    assert.match(capture.masterSha256, /^[a-f0-9]{64}$/);
    assert.ok(html.includes('data-screen="' + capture.name + '"'));
    assert.ok(gallery.includes("'" + capture.name + "':"));
    assert.equal(capture.variants.length, 2);
    for (const variant of capture.variants) {
      assert.equal(variant.width / variant.height, 1080 / 2340);
      assert.match(variant.file, /^public\/home\/app\/v13\/native-/);
      const image = fs.readFileSync(path.join(root, variant.file));
      assert.equal(crypto.createHash('sha256').update(image).digest('hex'), variant.sha256);
      assert.equal(image.length, variant.bytes);
      variants.add('/' + variant.file);
    }
  }
  for (const document of [html, bridge, gallery]) {
    assert.doesNotMatch(document, /\/public\/home\/app\/native-|1\.3\.25|05-ana|04-carreras/);
    for (const match of document.matchAll(/\/public\/home\/app\/v13\/native-[a-z0-9-]+\.webp/g)) assert.ok(variants.has(match[0]), match[0]);
  }
  assert.match(html, /la versión publicada en App Store y Google Play/);
  assert.match(html, /Cuenta QA con datos de prueba/);
  assert.match(gallery, /Caminar\/Correr 5x2min/);
});

test('CSS and JS cache keys match their content', () => {
  for (const file of ['css/home.css', 'js/home.js', 'js/home-funnel.js']) {
    const digest = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex').slice(0, 12);
    assert.ok(html.includes('/' + file + '?v=' + digest), file);
  }
});

test('homepage prioritizes training and removes associated-club promotion', () => {
  assert.doesNotMatch(html, /proof-clubs|club-links|community-map-link|native-06-clubs-mapa|Soul Run Club|Beer Runners|SocialRun|Sevilla Running Club|Correr Sin Límites/);
  assert.match(html, /id="running"/);
  assert.match(html, /id="fuerza"/);
  assert.match(html, /Nueva versión 1\.3\.30/);
  assert.match(html, /sesión de muestra/);
  assert.match(html, /Premium: continuidad, historial y progresión/);
  assert.match(html, /Una compra individual de un plan de running no incluye Fuerza/);
  assert.match(html, /id="comunidad"/);
  assert.match(html, /id="quedadas"/);
});

test('editorial images match the native app assets without claiming real athletes', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs/home/RELEASE-PREVIEW-V11.json'), 'utf8'));
  for (const asset of manifest.editorialImages) {
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root, asset.file))).digest('hex'), asset.sha256);
  }
  assert.match(html, /Imágenes editoriales creadas con IA/);
  assert.match(html, /CAPTURA ACTUAL · ANDROID 1\.3\.30/);
  assert.doesNotMatch(html, /1\.3\.25|cuenta demo/i);
});

function analyticsContext(initialConsent) {
  const storage = new Map(initialConsent ? [['cj_cookie_consent', initialConsent]] : []);
  const elements = new Map();
  const requests = [];
  const banner = { classList: { add() {}, remove() {} } };
  elements.set('cookieBanner', banner);
  const append = element => {
    requests.push(element.src);
    if (element.id) elements.set(element.id, element);
  };
  const context = {
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
    document: {
      getElementById: key => elements.get(key),
      createElement: () => ({}),
      head: { appendChild: append },
      getElementsByTagName: () => [{ parentNode: { insertBefore: append } }]
    }
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(scripts.find(script => script.includes('function loadGA4()')), context);
  vm.runInContext(scripts.find(script => script.includes('function acceptCookies()')), context);
  return { context, storage, requests };
}

test('unknown or rejected consent sends no analytics requests', () => {
  for (const initial of [null, 'rejected']) {
    const { context, requests, storage } = analyticsContext(initial);
    assert.equal(requests.length, 0);
    context.rejectCookies();
    assert.equal(requests.length, 0);
    assert.equal(storage.get('cj_cookie_consent'), 'rejected');
  }
});

test('acceptance initializes each existing tracker once, including repeated clicks', () => {
  const { context, requests } = analyticsContext(null);
  context.acceptCookies();
  context.acceptCookies();
  assert.equal(requests.length, 2);
  assert.equal(requests.filter(url => url.includes('gtag/js?id=G-RQYYGNC12T')).length, 1);
  assert.equal(requests.filter(url => url.includes('connect.facebook.net')).length, 1);
  assert.equal(context.dataLayer.filter(entry => entry[0] === 'config' && entry[1] === 'G-RQYYGNC12T').length, 1);
  assert.equal(context.fbq.queue.filter(entry => entry[0] === 'track' && entry[1] === 'PageView').length, 1);
});

test('stored acceptance restores each existing tracker once', () => {
  const { requests } = analyticsContext('accepted');
  assert.equal(requests.length, 2);
});

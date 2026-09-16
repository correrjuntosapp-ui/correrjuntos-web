const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const html = fs.readFileSync(path.join(root, 'blog/index.html'), 'utf8');

test('blog entry disables automatic newsletter interruptions before the shared script loads', () => {
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  const configurations = scripts.filter(script => script[1].includes('window.CJ_NEWSLETTER_CONFIG'));
  assert.equal(configurations.length, 1);
  const context = { window: {} };
  vm.runInNewContext(configurations[0][1], context);
  const config = context.window.CJ_NEWSLETTER_CONFIG;
  assert.equal(config.sticky, false);
  assert.equal(config.exitIntent, false);
  assert.notEqual(config.inline, false);
  assert.notEqual(config.end, false);
  assert.ok(configurations[0].index < html.indexOf('<script src="/blog/newsletter.js"'));
});

test('blog entry retains its voluntary signup and normal article discovery', () => {
  assert.match(html, /<form id="newsletter-form" onsubmit="submitNewsletter\(event\)"/);
  assert.match(html, /id="newsletter-btn"/);
  assert.match(html, /\/api\/brevo-subscribe/);
  assert.match(html, /id="searchInput"/);
  assert.match(html, /id="loadMoreBtn"/);
  assert.match(html, /href="\/blog\/ciclismo"/);
});

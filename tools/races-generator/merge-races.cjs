'use strict';
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const dir = __dirname;
const files = [
  'batch1-maratones.cjs',
  'batch1-media.cjs',
  'batch1-10k.cjs',
  'batch1-popular.cjs',
  'batch1-trail.cjs',
  'build-races-2.cjs'
];

let merged = {};
for (const f of files) {
  const fp = path.join(dir, f);
  if (!fs.existsSync(fp)) { console.error('MISSING:', f); process.exit(1); }
  const out = execSync(`node "${fp}"`, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
  const data = JSON.parse(out);
  const count = Object.keys(data).length;
  console.error(`${f}: ${count} races`);
  Object.assign(merged, data);
}

const total = Object.keys(merged).length;
console.error(`\nTotal: ${total} races`);
fs.writeFileSync(path.join(dir, 'races-data.json'), JSON.stringify(merged, null, 2), 'utf-8');
console.error('Written to races-data.json');

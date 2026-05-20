#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execFileSync } = require('child_process');
const FFMPEG = require('ffmpeg-static');

const FIXES = [
  { cj: 'puente-gluteo', id: 'Butt_Lift_Bridge' },
  { cj: 'hip-thrust', id: 'Bent-Knee_Hip_Raise' },
  { cj: 'calf-stretch', id: 'Calf_Stretch_Elbows_Against_Wall' },
];

const BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

function dl(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'CJ/1.0' } }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close(); try { fs.unlinkSync(dest); } catch {}
        return dl(res.headers.location, dest).then(resolve, reject);
      }
      if (res.statusCode !== 200) { file.close(); reject(new Error('HTTP ' + res.statusCode)); return; }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve(fs.statSync(dest).size)));
    });
  });
}

(async () => {
  for (const fx of FIXES) {
    process.stdout.write(`[${fx.cj}] → ${fx.id}... `);
    const f0 = `tmp/free-db-frames/${fx.cj}-0.jpg`;
    const f1 = `tmp/free-db-frames/${fx.cj}-1.jpg`;
    const gif = `public/exercises/${fx.cj}.gif`;
    try {
      await dl(`${BASE}/${fx.id}/0.jpg`, f0);
      await dl(`${BASE}/${fx.id}/1.jpg`, f1);
      const list = gif + '.list.txt';
      const p0 = path.resolve(f0).replace(/\\/g, '/');
      const p1 = path.resolve(f1).replace(/\\/g, '/');
      fs.writeFileSync(list, `file '${p0}'\nduration 0.7\nfile '${p1}'\nduration 0.7\nfile '${p0}'\n`);
      execFileSync(FFMPEG, [
        '-y', '-f', 'concat', '-safe', '0', '-i', list,
        '-vf', 'fps=15,scale=360:-1:flags=lanczos',
        '-loop', '0', gif
      ], { stdio: 'pipe' });
      try { fs.unlinkSync(list); } catch {}
      try { fs.unlinkSync(f0); } catch {}
      try { fs.unlinkSync(f1); } catch {}
      console.log(`✓ ${(fs.statSync(gif).size/1024).toFixed(0)} KB`);
    } catch (e) {
      console.log(`✗ ${e.message.slice(0,100)}`);
    }
  }
})();

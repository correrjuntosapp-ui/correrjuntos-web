#!/usr/bin/env node
/**
 * Verifica que ningun material interno entre en el artefacto de despliegue.
 *
 * El proyecto no tiene buildCommand y usa outputDirectory ".", asi que Vercel
 * publica el repositorio tal cual salvo lo que excluya .vercelignore. Sin este
 * control, cualquier carpeta de trabajo nueva queda servida en produccion sin
 * que nadie se entere: en agosto de 2026 /test-results/.last-run.json devolvia
 * 200 y /tmp/ solo estaba a salvo porque alguien se acordo de anadirlo.
 *
 * Uso:
 *   node tools/test-deploy-artifact.mjs            comprueba el repositorio
 *   node tools/test-deploy-artifact.mjs --selftest controles pos/neg
 *   node tools/test-deploy-artifact.mjs --list     lista lo que se publicaria
 *
 * Sin dependencias. Codigo de salida 1 si algo interno se publicaria.
 */
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

/** Carpetas cuyo contenido NUNCA debe publicarse. */
const INTERNAL_DIRS = [
  'tmp', 'tools', 'tests', 'test-results', 'playwright-report',
  'docs', 'supabase', 'scripts', 'screenshots', 'agentes',
  '.github', '.claude', 'coverage', 'correr-juntos-app',
];

/** Carpetas que parecen internas pero el sitio necesita servidas. */
const REQUIRED_PUBLIC = ['data'];   // sw.js y js/modules/i18n-ui.js cargan /data/

export function parseIgnore(text) {
  return text.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
}

/** Reproduce el subconjunto de .vercelignore que usa este repositorio. */
export function isIgnored(file, patterns) {
  for (const p of patterns) {
    if (p.endsWith('/')) {
      if (file === p.slice(0, -1) || file.startsWith(p)) return true;
    } else if (p.startsWith('*.')) {
      if (file.endsWith(p.slice(1))) return true;
    } else if (file === p || file.startsWith(p + '/')) {
      return true;
    }
  }
  return false;
}

export function audit(files, patterns) {
  const leaked = [];
  for (const f of files) {
    const top = f.includes('/') ? f.split('/')[0] : '';
    if (!INTERNAL_DIRS.includes(top)) continue;
    if (!isIgnored(f, patterns)) leaked.push(f);
  }
  const missingPublic = REQUIRED_PUBLIC.filter((d) =>
    files.some((f) => f.startsWith(d + '/') && isIgnored(f, patterns)));
  return { leaked, missingPublic };
}

/* ------------------------------------------------------------------ */

function selftest() {
  const P = ['tmp/', 'tools/', '*.cjs'];
  const cases = [
    ['carpeta interna excluida', 'tmp/borrador.html', P, true],
    ['fichero suelto en carpeta excluida', 'tools/x/y/z.json', P, true],
    ['patron por extension', 'scripts/foo.cjs', P, true],
    ['pagina publica NO excluida', 'blog/articulo.html', P, false],
    ['carpeta publica que empieza igual', 'tmpx/pagina.html', P, false],
    ['data/ NO debe excluirse', 'data/i18n-es.js', P, false],
  ];
  let pass = 0, fail = 0;
  console.log('CONTROLES de isIgnored');
  for (const [name, file, pats, want] of cases) {
    const got = isIgnored(file, pats);
    const ok = got === want;
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}  (${file} -> ${got})`);
    ok ? pass++ : fail++;
  }
  console.log('\nCONTROLES de audit');
  const a1 = audit(['test-results/a.json', 'blog/b.html'], ['tmp/']);
  const c1 = a1.leaked.length === 1 && a1.leaked[0] === 'test-results/a.json';
  console.log(`  ${c1 ? 'PASS' : 'FAIL'}  detecta carpeta interna sin excluir`);
  c1 ? pass++ : fail++;
  const a2 = audit(['test-results/a.json', 'blog/b.html'], ['test-results/']);
  const c2 = a2.leaked.length === 0;
  console.log(`  ${c2 ? 'PASS' : 'FAIL'}  no marca nada cuando ya esta excluida`);
  c2 ? pass++ : fail++;
  const a3 = audit(['data/i18n-es.js'], ['data/']);
  const c3 = a3.missingPublic.includes('data');
  console.log(`  ${c3 ? 'PASS' : 'FAIL'}  avisa si se excluye data/, que el sitio necesita`);
  c3 ? pass++ : fail++;
  console.log(`\n${pass} PASS · ${fail} FAIL`);
  return fail === 0;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const argv = process.argv.slice(2);
  if (argv.includes('--selftest')) process.exit(selftest() ? 0 : 1);

  if (!existsSync('.vercelignore')) {
    console.error('FALLO: no existe .vercelignore; con outputDirectory "." se publicaria TODO.');
    process.exit(1);
  }
  const patterns = parseIgnore(readFileSync('.vercelignore', 'utf8'));
  const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean);

  if (argv.includes('--list')) {
    const pub = files.filter((f) => !isIgnored(f, patterns));
    console.log(`ficheros que se publicarian: ${pub.length} de ${files.length}`);
    process.exit(0);
  }

  const { leaked, missingPublic } = audit(files, patterns);
  console.log(`ficheros en git        : ${files.length}`);
  console.log(`se publicarian         : ${files.filter((f) => !isIgnored(f, patterns)).length}`);
  console.log(`material interno fugado: ${leaked.length}`);
  if (missingPublic.length) {
    console.error(`\nFALLO: .vercelignore excluye carpetas que el sitio necesita: ${missingPublic.join(', ')}`);
  }
  if (leaked.length) {
    console.error('\nFALLO: este material interno se publicaria. Anade su carpeta a .vercelignore:');
    const byDir = {};
    for (const f of leaked) (byDir[f.split('/')[0]] ??= []).push(f);
    for (const [d, fs_] of Object.entries(byDir)) {
      console.error(`  ${d}/  (${fs_.length}) p.ej. ${fs_.slice(0, 2).join(', ')}`);
    }
  }
  process.exit(leaked.length || missingPublic.length ? 1 : 0);
}

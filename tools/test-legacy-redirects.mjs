import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG_PATH = path.join(ROOT, 'vercel.json');

const FIXED_REDIRECTS = [
  {
    requestedPath: '/blog/estiramientos-antes-despu%C3%A9s-correr',
    source: '/blog/estiramientos-antes-despu%C3%A9s-correr',
    destination: '/blog/estiramientos-antes-despues-correr',
    targetFile: 'blog/estiramientos-antes-despues-correr.html',
  },
  {
    requestedPath: '/blog/nutrici%C3%B3n-dia-de-carrera.html',
    source: '/blog/nutrici%C3%B3n-dia-de-carrera',
    destination: '/blog/nutricion-dia-de-carrera',
    targetFile: 'blog/nutricion-dia-de-carrera.html',
  },
  {
    requestedPath: '/blog/nutrici%C3%B3n-para-runners.html',
    source: '/blog/nutrici%C3%B3n-para-runners',
    destination: '/blog/nutricion-para-runners',
    targetFile: 'blog/nutricion-para-runners.html',
  },
  {
    requestedPath: '/blog/ropa-t%C3%A9cnica-running.html',
    source: '/blog/ropa-t%C3%A9cnica-running',
    destination: '/blog/ropa-tecnica-running',
    targetFile: 'blog/ropa-tecnica-running.html',
  },
  {
    requestedPath: '/legal/aviso-legal.html',
    source: '/legal/aviso-legal',
    destination: '/terms',
    targetFile: 'terms.html',
  },
];

const INTENTIONAL_404S = [
  '/blog/correr-',
  '/blog/correr-y-',
  '/blog/en/best-',
  '/blog/grupos-',
  '/blog/mejores-',
  '/cj_verify',
  '/km',
  '/m%C3%AAs',
];

const BROKEN_LEGACY_SOURCES = [
  '/blog/estiramientos-antes-después-correr',
  '/blog/nutrición-dia-de-carrera.html',
  '/blog/nutrición-para-runners.html',
  '/blog/ropa-técnica-running.html',
  '/legal/aviso-legal.html',
];

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function assertStaticContract(config) {
  assert.equal(config.cleanUrls, true, 'El contrato depende de cleanUrls=true');
  assert.ok(Array.isArray(config.redirects), 'vercel.json debe declarar redirects');

  const sources = config.redirects.map((redirect) => redirect.source);
  const duplicateSources = sources.filter((source, index) => sources.indexOf(source) !== index);
  assert.deepEqual(duplicateSources, [], `Hay fuentes de redirect duplicadas: ${duplicateSources.join(', ')}`);

  for (const entry of FIXED_REDIRECTS) {
    const redirect = config.redirects.find((candidate) => candidate.source === entry.source);
    assert.ok(redirect, `Falta el redirect exacto para ${entry.source}`);
    assert.equal(redirect.destination, entry.destination, `Destino incorrecto para ${entry.source}`);
    assert.equal(redirect.permanent, true, `${entry.source} debe ser permanente`);
    assert.equal(entry.source.endsWith('.html'), false, `${entry.source} no puede incluir .html con cleanUrls`);
    assert.ok(fs.existsSync(path.join(ROOT, entry.targetFile)), `No existe el destino local ${entry.targetFile}`);
  }

  for (const brokenSource of BROKEN_LEGACY_SOURCES) {
    assert.equal(
      sources.includes(brokenSource),
      false,
      `Sigue presente la regla inoperante ${brokenSource}`,
    );
  }

  for (const junkPath of INTENTIONAL_404S) {
    assert.equal(
      sources.includes(junkPath),
      false,
      `La URL basura ${junkPath} no debe redirigirse`,
    );
  }
}

function assertHarnessCatchesRegressions(config) {
  const mutations = [
    {
      name: 'redirect eliminado',
      apply(mutant) {
        mutant.redirects = mutant.redirects.filter(
          (redirect) => redirect.source !== FIXED_REDIRECTS[0].source,
        );
      },
    },
    {
      name: 'destino cambiado',
      apply(mutant) {
        mutant.redirects.find((redirect) => redirect.source === FIXED_REDIRECTS[1].source).destination = '/blog';
      },
    },
    {
      name: 'fuente Unicode literal inoperante',
      apply(mutant) {
        mutant.redirects.find((redirect) => redirect.source === FIXED_REDIRECTS[2].source).source =
          '/blog/nutrición-para-runners';
      },
    },
    {
      name: 'fuente .html incompatible con cleanUrls',
      apply(mutant) {
        mutant.redirects.find((redirect) => redirect.source === FIXED_REDIRECTS[3].source).source += '.html';
      },
    },
    {
      name: 'redirect temporal accidental',
      apply(mutant) {
        mutant.redirects.find((redirect) => redirect.source === FIXED_REDIRECTS[4].source).permanent = false;
      },
    },
    {
      name: 'URL basura redirigida',
      apply(mutant) {
        mutant.redirects.unshift({ source: INTENTIONAL_404S[0], destination: '/blog', permanent: true });
      },
    },
  ];

  for (const mutation of mutations) {
    const mutant = structuredClone(config);
    mutation.apply(mutant);
    assert.throws(
      () => assertStaticContract(mutant),
      undefined,
      `El harness no detectó la mutación: ${mutation.name}`,
    );
  }

  return mutations.length;
}

async function follow(baseUrl, requestedPath) {
  let currentUrl = new URL(requestedPath, baseUrl);
  const hops = [];

  for (let index = 0; index < 6; index += 1) {
    const response = await fetch(currentUrl, { redirect: 'manual' });
    const location = response.headers.get('location');
    hops.push({ status: response.status, url: currentUrl.href, location });

    if (response.status < 300 || response.status >= 400 || !location) {
      return { response, finalUrl: currentUrl, hops };
    }

    currentUrl = new URL(location, currentUrl);
  }

  throw new Error(`Demasiados saltos al comprobar ${requestedPath}`);
}

async function assertRuntimeContract(baseUrl) {
  for (const entry of FIXED_REDIRECTS) {
    const result = await follow(baseUrl, entry.requestedPath);
    assert.equal(result.response.status, 200, `${entry.requestedPath} no termina en 200`);
    assert.equal(result.finalUrl.pathname, entry.destination, `${entry.requestedPath} termina en otra URL`);
    assert.ok(result.hops.length >= 2, `${entry.requestedPath} no ejecutó ningún redirect`);
  }

  for (const junkPath of INTENTIONAL_404S) {
    const result = await follow(baseUrl, junkPath);
    assert.equal(result.response.status, 404, `${junkPath} debe permanecer como 404 legítimo`);
  }
}

const config = loadConfig();
assertStaticContract(config);
const detectedMutations = assertHarnessCatchesRegressions(config);

const baseUrlArg = process.argv.find((arg) => arg.startsWith('--base-url='));
if (baseUrlArg) {
  const baseUrl = baseUrlArg.slice('--base-url='.length);
  await assertRuntimeContract(baseUrl);
  console.log(
    `PASS redirects F148: 5 corregidos, 8 404 legítimos y ${detectedMutations}/${detectedMutations} mutaciones detectadas en ${baseUrl}`,
  );
} else {
  console.log(
    `PASS redirects F148: contrato estático de 5 redirects, 8 404 legítimos y ${detectedMutations}/${detectedMutations} mutaciones detectadas`,
  );
}

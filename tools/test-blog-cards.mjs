#!/usr/bin/env node
/**
 * Verificador de las tarjetas de artículo del blog.
 *
 * En agosto de 2026 el índice del blog acumuló tarjetas duplicadas: el mismo
 * artículo aparecía dos veces con títulos y fechas distintas, restos de
 * ediciones antiguas que nadie retiró. Además, tres categorías reales
 * (suplementacion, atleta-hibrido, carreras) faltaban en catOrder/catNames,
 * lo que partía esas categorías en dos bloques y generaba cabeceras repetidas
 * con el slug crudo en la vista "todos".
 *
 * Este script falla el CI si vuelve a pasar cualquiera de las dos cosas.
 *
 * Comprueba, en blog/index.html, blog/en/index.html y todas las páginas
 * estáticas de paginación:
 *
 *   1. Ninguna tarjeta repite destino (href) dentro de la misma página.
 *   2. Toda categoría usada en una tarjeta existe en catOrder, catNames y
 *      catIcons del índice correspondiente.
 *   3. Todo href de tarjeta apunta a un artículo que existe en el repo.
 *
 * Uso:
 *   node tools/test-blog-cards.mjs
 *   node tools/test-blog-cards.mjs --selftest   (comprueba que el verificador detecta fallos)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SELFTEST = process.argv.includes('--selftest');

/* Fotos que hoy comparten varias tarjetas y aún no se han sustituido.
   Vive en un archivo aparte para que se vea crecer o encoger en el diff.
   Solo puede encoger: si una entrada deja de estar repetida, hay que borrarla. */
const BASELINE_PATH = path.join(ROOT, 'tools', 'blog-cards-photo-baseline.json');
const BASELINE = fs.existsSync(BASELINE_PATH)
  ? JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'))
  : {};

/* Captura la tarjeta completa: <a … class="article-card">…</a>, incluida la
   variante "article-card featured". Hace falta el interior para leer la foto. */
const CARD_RE = /<a\b([^>]*class="article-card(?:\s+featured)?"[^>]*)>([\s\S]*?)<\/a>/g;

export function tarjetasDe(html) {
  return [...html.matchAll(CARD_RE)].map((m) => ({
    href: (m[1].match(/href="([^"]+)"/) || [])[1] || null,
    cat: (m[1].match(/data-category="([^"]+)"/) || [])[1] || null,
    featured: /featured/.test(m[1]),
    img: (m[2].match(/<img[^>]*\bsrc="([^"]*)"/) || [])[1] || null,
  }));
}

export function duplicados(cards) {
  const cuenta = new Map();
  for (const c of cards) {
    if (!c.href) continue;
    cuenta.set(c.href, (cuenta.get(c.href) || 0) + 1);
  }
  return [...cuenta.entries()].filter(([, n]) => n > 1);
}

/* Identidad de la foto, ignorando el sufijo de tamaño y los parámetros: dos
   tarjetas con -640 y -1200 de la misma foto se ven idénticas en el listado. */
export function idFoto(src) {
  if (!src) return null;
  const s = src.split('?')[0];
  const pexels = s.match(/\/(\d{5,})-\d+\.(?:webp|jpe?g|png)$/i);
  if (pexels) return 'pexels:' + pexels[1];
  const unsplash = s.match(/photo-([a-z0-9]+)/i);
  if (unsplash) return 'unsplash:' + unsplash[1];
  return 'local:' + s.replace(/-(\d{3,4})(\.(?:webp|jpe?g|png|avif))$/i, '$2');
}

export function fotosCompartidas(cards) {
  const m = new Map();
  for (const c of cards) {
    const id = idFoto(c.img);
    if (!id || !c.href) continue;
    if (!m.has(id)) m.set(id, []);
    m.get(id).push(c.href);
  }
  return [...m.entries()].filter(([, v]) => v.length > 1)
    .map(([id, v]) => [id, v.sort()]);
}

export function mapaDeclarado(html, nombre) {
  const m = html.match(new RegExp('var\\s+' + nombre + '\\s*=\\s*([^;]+);'));
  if (!m) return null;
  const cuerpo = m[1];
  // Objeto: las claves pueden ir sueltas (nutricion:'…') o entrecomilladas
  // ('atleta-hibrido':'…') porque llevan guion. Hay que aceptar las dos formas.
  const claves = [...cuerpo.matchAll(/(?:'([^']+)'|([A-Za-z_$][\w$-]*))\s*:/g)]
    .map((x) => x[1] ?? x[2]);
  if (claves.length) return new Set(claves);
  // catOrder es un array de strings sueltos, sin claves
  return new Set([...cuerpo.matchAll(/'([^']+)'/g)].map((x) => x[1]));
}

function paginasDe(base) {
  const out = [base + '/index.html'];
  const dir = path.join(ROOT, base, 'page');
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir)
      .map(Number).filter((n) => !Number.isNaN(n)).sort((a, b) => a - b)
      .forEach((n) => out.push(`${base}/page/${n}/index.html`));
  }
  return out.filter((f) => fs.existsSync(path.join(ROOT, f)));
}

function articuloExiste(href) {
  const rel = href.replace(/^\//, '');
  return fs.existsSync(path.join(ROOT, rel + '.html')) ||
         fs.existsSync(path.join(ROOT, rel, 'index.html'));
}

function auditar() {
  const fallos = [];
  let totalTarjetas = 0;

  for (const base of ['blog', 'blog/en']) {
    const indice = path.join(ROOT, base, 'index.html');
    if (!fs.existsSync(indice)) continue;
    const indiceHtml = fs.readFileSync(indice, 'utf8');

    const order = mapaDeclarado(indiceHtml, 'catOrder');
    const names = mapaDeclarado(indiceHtml, 'catNames');
    const icons = mapaDeclarado(indiceHtml, 'catIcons');

    for (const f of paginasDe(base)) {
      const html = fs.readFileSync(path.join(ROOT, f), 'utf8');
      const cards = tarjetasDe(html);
      totalTarjetas += cards.length;

      for (const [href, n] of duplicados(cards)) {
        fallos.push(`${f}: la tarjeta de ${href} aparece ${n} veces`);
      }
      for (const c of cards) {
        if (c.href && !articuloExiste(c.href)) {
          fallos.push(`${f}: la tarjeta apunta a ${c.href}, que no existe`);
        }
      }
    }

    /* Fotos compartidas entre tarjetas del mismo índice. Hay una lista de
       pendientes conocidos (el blog EN); solo puede encoger, nunca crecer. */
    const pendientes = BASELINE[base] || {};
    const actuales = new Map(fotosCompartidas(tarjetasDe(indiceHtml)));
    for (const [id, hrefs] of actuales) {
      const previo = pendientes[id];
      if (!previo) {
        fallos.push(`${base}/index.html: ${hrefs.length} tarjetas comparten la misma foto (${id}): ${hrefs.join(', ')}`);
      } else if (hrefs.length > previo.length) {
        fallos.push(`${base}/index.html: la foto ${id} ya la compartían ${previo.length} tarjetas y ahora son ${hrefs.length}`);
      }
    }
    for (const id of Object.keys(pendientes)) {
      if (!actuales.has(id)) {
        fallos.push(`${base}/index.html: ${id} ya no está repetida — quítala de tools/blog-cards-photo-baseline.json`);
      }
    }

    // Las categorías solo se declaran en el índice; las páginas estáticas no las usan.
    const cats = new Set(tarjetasDe(indiceHtml).map((c) => c.cat).filter(Boolean));
    for (const cat of [...cats].sort()) {
      if (order && !order.has(cat)) fallos.push(`${base}/index.html: la categoría "${cat}" falta en catOrder (parte la categoría en varios bloques)`);
      if (names && !names.has(cat)) fallos.push(`${base}/index.html: la categoría "${cat}" falta en catNames (la cabecera muestra el slug crudo)`);
      if (icons && !icons.has(cat)) fallos.push(`${base}/index.html: la categoría "${cat}" falta en catIcons`);
    }
  }

  return { fallos, totalTarjetas };
}

/* ── Autocomprobación: el verificador debe detectar defectos inyectados ── */
if (SELFTEST) {
  const casos = [
    {
      nombre: 'detecta una tarjeta duplicada',
      html: '<a href="/blog/x" class="article-card" data-category="salud"></a>' +
            '<a href="/blog/x" class="article-card" data-category="salud"></a>',
      esperado: (h) => duplicados(tarjetasDe(h)).length === 1,
    },
    {
      nombre: 'no marca tarjetas distintas',
      html: '<a href="/blog/x" class="article-card"></a><a href="/blog/y" class="article-card"></a>',
      esperado: (h) => duplicados(tarjetasDe(h)).length === 0,
    },
    {
      nombre: 'cuenta también las destacadas',
      html: '<a href="/blog/x" class="article-card featured"></a><a href="/blog/x" class="article-card"></a>',
      esperado: (h) => duplicados(tarjetasDe(h)).length === 1,
    },
    {
      nombre: 'lee catOrder (array de strings)',
      html: "var catOrder = ['entrenamiento','nutricion','atleta-hibrido'];",
      esperado: (h) => {
        const s = mapaDeclarado(h, 'catOrder');
        return s.size === 3 && s.has('entrenamiento') && s.has('atleta-hibrido');
      },
    },
    {
      nombre: 'lee catNames con claves sueltas y entrecomilladas',
      html: "var catNames = {entrenamiento:'Entrenamiento','atleta-hibrido':'Atleta Híbrido',carreras:'Carreras'};",
      esperado: (h) => {
        const s = mapaDeclarado(h, 'catNames');
        return s.size === 3 && s.has('entrenamiento') && s.has('atleta-hibrido') && s.has('carreras');
      },
    },
    {
      nombre: 'no confunde los valores con las claves',
      html: "var catNames = {salud:'Salud',rutas:'Rutas'};",
      esperado: (h) => {
        const s = mapaDeclarado(h, 'catNames');
        return s.size === 2 && !s.has('Salud');
      },
    },
    {
      nombre: 'detecta la misma foto en dos tamaños distintos',
      html: '<a href="/blog/a" class="article-card"><img src="/public/pexels/1640777-640.webp"></a>' +
            '<a href="/blog/b" class="article-card"><img src="/public/pexels/1640777-1200.webp"></a>',
      esperado: (h) => fotosCompartidas(tarjetasDe(h)).length === 1,
    },
    {
      nombre: 'no marca fotos distintas',
      html: '<a href="/blog/a" class="article-card"><img src="/public/pexels/111-640.webp"></a>' +
            '<a href="/blog/b" class="article-card"><img src="/public/pexels/222-640.webp"></a>',
      esperado: (h) => fotosCompartidas(tarjetasDe(h)).length === 0,
    },
    {
      nombre: 'reconoce fotos de Unsplash por su identificador',
      html: '<a href="/blog/a" class="article-card"><img src="https://images.unsplash.com/photo-1544367567-abc?w=640"></a>' +
            '<a href="/blog/b" class="article-card"><img src="https://images.unsplash.com/photo-1544367567-abc?w=1200"></a>',
      esperado: (h) => fotosCompartidas(tarjetasDe(h)).length === 1,
    },
  ];
  let mal = 0;
  for (const c of casos) {
    const ok = c.esperado(c.html);
    console.log((ok ? '  ok   ' : '  FALLO') + '  ' + c.nombre);
    if (!ok) mal++;
  }
  console.log(mal ? `\n${mal} autocomprobaciones fallidas` : '\nAutocomprobación correcta.');
  process.exit(mal ? 1 : 0);
}

const { fallos, totalTarjetas } = auditar();
if (fallos.length) {
  console.error(`\nTarjetas del blog: ${fallos.length} problema(s) en ${totalTarjetas} tarjetas.\n`);
  fallos.forEach((f) => console.error('  ✗ ' + f));
  console.error('\nSi has añadido o editado tarjetas en blog/index.html o blog/en/index.html,');
  console.error('recuerda regenerar la paginación:  node tools/blog-paginate.cjs --apply\n');
  process.exit(1);
}
console.log(`Tarjetas del blog: ${totalTarjetas} revisadas, sin duplicados, sin categorías huérfanas y sin destinos rotos.`);

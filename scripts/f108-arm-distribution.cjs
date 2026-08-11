#!/usr/bin/env node
/* F108.1 · Acreditación de la distribución 85/15 del algoritmo PRODUCTIVO.
 *
 * Usa `assignArm` tal cual está desplegado, sobre UUID sintéticos generados de
 * forma determinista. CERO acceso a usuarios reales, cero base de datos, cero red.
 *
 *   node scripts/f108-arm-distribution.cjs [n]
 */
const crypto = require('node:crypto');
const assert = require('node:assert');

const N = Number(process.argv[2] || 10000);

// UUID v4-shaped, derivado de un contador con SHA-256 → reproducible bit a bit.
function uuidSintetico(i) {
  const h = crypto.createHash('sha256').update('f108-sintetico:' + i).digest('hex');
  return [h.slice(0, 8), h.slice(8, 12), '4' + h.slice(13, 16),
    ((parseInt(h[16], 16) & 0x3) | 0x8).toString(16) + h.slice(17, 20), h.slice(20, 32)].join('-');
}

(async () => {
  const { assignArm } = await import('../api/_lib/activation-email.js');

  const ids = Array.from({ length: N }, (_, i) => uuidSintetico(i));
  assert.strictEqual(new Set(ids).size, N, 'los UUID sintéticos deben ser únicos');

  const pase1 = ids.map((id) => assignArm(id));
  const pase2 = ids.map((id) => assignArm(id));
  const pase3 = ids.map((id) => assignArm(id));

  // 1 · Determinismo: tres pasadas idénticas, nadie cambia de brazo.
  let cambios = 0;
  for (let i = 0; i < N; i++) if (pase1[i] !== pase2[i] || pase2[i] !== pase3[i]) cambios++;

  // 2 · Distribución.
  const t = pase1.filter((a) => a === 'treatment').length;
  const h = N - t;
  const pct = (t / N) * 100;

  // 3 · Solo dos brazos posibles.
  const brazos = new Set(pase1);

  // 4 · Independencia de la versión del experimento: otra versión reasigna,
  //     pero sigue siendo determinista dentro de sí misma.
  const otra1 = ids.slice(0, 500).map((id) => assignArm(id, 'otra_version_v2'));
  const otra2 = ids.slice(0, 500).map((id) => assignArm(id, 'otra_version_v2'));
  const otraEstable = otra1.every((a, i) => a === otra2[i]);
  const difiere = otra1.some((a, i) => a !== pase1[i]);

  // Intervalo binomial normal al 99,7% (3 sigma) alrededor del 85% teórico.
  const sigma = Math.sqrt(0.85 * 0.15 / N) * 100;
  const dentro3sigma = Math.abs(pct - 85) <= 3 * sigma;

  console.log('─── F108.1 · Distribución de brazos (algoritmo productivo) ───');
  console.log('n                       :', N, 'UUID sintéticos deterministas');
  console.log('treatment               :', t, '(' + pct.toFixed(2) + '%)');
  console.log('holdout                 :', h, '(' + (100 - pct).toFixed(2) + '%)');
  console.log('sigma teórica           :', sigma.toFixed(3) + ' puntos · banda 3σ = [' + (85 - 3 * sigma).toFixed(2) + '%, ' + (85 + 3 * sigma).toFixed(2) + '%]');
  console.log('dentro de 3σ            :', dentro3sigma ? 'SÍ' : 'NO');
  console.log('cambios de brazo (3 pasadas):', cambios, cambios === 0 ? '✓ determinista' : '✗');
  console.log('brazos observados       :', [...brazos].sort().join(', '));
  console.log('otra versión: estable   :', otraEstable ? 'SÍ' : 'NO', '| reasigna:', difiere ? 'SÍ' : 'NO');

  const ok = cambios === 0 && dentro3sigma && brazos.size === 2 && otraEstable && difiere;
  console.log('\nVEREDICTO:', ok ? 'ACREDITADO' : 'FALLO');
  process.exit(ok ? 0 : 1);
})();

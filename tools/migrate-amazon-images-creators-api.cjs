#!/usr/bin/env node
/**
 * Migración de imágenes de producto Amazon a la vía autorizada (Creators API).
 *
 * ESTADO: PREPARADO PERO BLOQUEADO EXTERNAMENTE.
 * Las credenciales de Amazon Creators API / PA-API siguen pendientes
 * (caso A2POUPWGXYY3L2; la cuenta de afiliado está en revisión del
 * Acuerdo Operativo). Este script NO simula llamadas ni inventa
 * respuestas: sin credenciales reales, termina con código 2 y explica
 * qué falta.
 *
 * Qué hará cuando existan credenciales:
 *   1. Lee docs/inventario-imagenes-producto-ciclismo.json (tarjeta →
 *      ASIN → imagen actual → estado).
 *   2. Para cada ASIN con imagen transitoria (hiRes self-hosted) o
 *      tarjeta sin foto, pide a la API GetItems con el recurso
 *      Images.Primary.Large.
 *   3. Registra en el inventario la URL oficial devuelta, el código de
 *      respuesta y la fecha.
 *   4. Con --apply, sustituye en el HTML el src local por la URL
 *      oficial (o descarga el activo si la política del programa lo
 *      permite), sin tocar tag=diezmejores21-21 ni el resto de tokens.
 *   5. Nunca borra las imágenes locales: quedan como respaldo hasta
 *      verificar el resultado en producción.
 *
 * Credenciales esperadas (NUNCA hardcodear; sin fallback literal):
 *   AMAZON_PAAPI_ACCESS_KEY, AMAZON_PAAPI_SECRET_KEY,
 *   AMAZON_PAAPI_PARTNER_TAG (diezmejores21-21)
 * desde variables de entorno o .env (gitignored).
 */
const fs = require('fs');
const path = require('path');

const ACCESS = process.env.AMAZON_PAAPI_ACCESS_KEY;
const SECRET = process.env.AMAZON_PAAPI_SECRET_KEY;
const TAG = process.env.AMAZON_PAAPI_PARTNER_TAG;

const INVENTARIO = path.join(__dirname, '..', 'docs', 'inventario-imagenes-producto-ciclismo.json');

function main() {
  if (!fs.existsSync(INVENTARIO)) {
    console.error('No existe el inventario: ' + INVENTARIO);
    process.exit(1);
  }
  const inv = JSON.parse(fs.readFileSync(INVENTARIO, 'utf8'));
  const pendientes = inv.filter(x => x.asin && /Creators API/.test(x.destino || ''));
  console.log('Tarjetas con destino Creators API: ' + pendientes.length);
  const asins = [...new Set(pendientes.map(x => x.asin))];
  console.log('ASIN únicos a migrar: ' + asins.length);

  if (!ACCESS || !SECRET || !TAG) {
    console.error('\nBLOQUEADO: faltan credenciales de Amazon Creators API/PA-API.');
    console.error('Define AMAZON_PAAPI_ACCESS_KEY, AMAZON_PAAPI_SECRET_KEY y');
    console.error('AMAZON_PAAPI_PARTNER_TAG cuando Amazon apruebe la cuenta');
    console.error('(caso A2POUPWGXYY3L2). Este script no simula respuestas.');
    process.exit(2);
  }

  // A implementar al recibir credenciales: firma SigV4 + GetItems por lotes
  // de 10 ASIN con throttle >=1 req/s, y volcado de resultados al inventario.
  console.error('Credenciales presentes pero la integración GetItems aún no está implementada.');
  console.error('Implementar tras verificar el alta del programa (no antes).');
  process.exit(3);
}

main();

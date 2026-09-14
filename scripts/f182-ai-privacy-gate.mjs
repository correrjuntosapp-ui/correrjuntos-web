import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const privacy = readFileSync(new URL('../privacy.html', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

const checks = [
  ['política fechada con el contrato F182', privacy.includes('Última actualización: 7 de septiembre de 2026')],
  ['Anthropic aparece identificado', privacy.includes('<strong>Anthropic:</strong>')],
  ['el seguimiento es una función separada y opcional', privacy.includes('El seguimiento postentreno es una función separada y opcional')],
  ['la finalidad queda limitada a la respuesta', privacy.includes('únicamente para generar la respuesta solicitada')],
  ['José postentreno se genera dentro de CorrerJuntos', privacy.includes('CorrerJuntos genera dentro de sus propios sistemas un resumen de José')],
  ['Ana postentreno se declara general y diferida', privacy.includes('diez minutos después, una orientación general de recuperación de Ana')],
  ['el seguimiento automático no envía datos a IA externa', privacy.includes('Ningún dato de ese seguimiento postentreno se envía a un proveedor externo de IA')],
  ['el proveedor queda limitado a mensajes voluntarios', privacy.includes('responder a los mensajes que envías voluntariamente a José y Ana')],
  ['Anthropic queda excluido del seguimiento automático', privacy.includes('El seguimiento postentreno automático no utiliza este proveedor')],
  ['el consentimiento puede retirarse en la app', privacy.includes('el seguimiento postentreno se desactiva desde los ajustes de notificaciones de la app')],
  ['no se usan los datos para publicidad', privacy.includes('Estos datos no se usan para publicidad')],
];

for (const [name, ok] of checks) {
  assert.equal(ok, true, name);
  console.log(`PASS ${name}`);
}
console.log(`F182 AI privacy gate: ${checks.length}/0 PASS`);

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const gateRel = 'scripts/f182-ai-privacy-gate.mjs';
const policyRel = 'privacy.html';

function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'f182-ai-privacy-'));
  for (const rel of [gateRel, policyRel]) {
    const target = path.join(dir, rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(root, rel), target);
  }
  return dir;
}

function run(dir) {
  return spawnSync(process.execPath, [path.join(dir, gateRel)], { cwd: dir, encoding: 'utf8' });
}

assert.equal(run(root).status, 0, 'el control real no pasa');
const mutations = [
  ['retira el carácter separado y opcional', 'El seguimiento postentreno es una función separada y opcional', 'El seguimiento postentreno está activo'],
  ['amplía la finalidad', 'únicamente para generar la respuesta solicitada', 'para generar respuestas y mejorar el servicio'],
  ['saca a José postentreno del sistema propio', 'CorrerJuntos genera dentro de sus propios sistemas un resumen de José', 'Un proveedor genera un resumen de José'],
  ['convierte Ana en pauta personalizada', 'diez minutos después, una orientación general de recuperación de Ana', 'diez minutos después, una pauta nutricional personalizada de Ana'],
  ['envía el seguimiento a IA externa', 'Ningún dato de ese seguimiento postentreno se envía a un proveedor externo de IA', 'Los datos del seguimiento postentreno se envían a un proveedor externo de IA'],
  ['amplía Anthropic al seguimiento automático', 'El seguimiento postentreno automático no utiliza este proveedor', 'El seguimiento postentreno automático también utiliza este proveedor'],
  ['elimina la revocación', 'el seguimiento postentreno se desactiva desde los ajustes de notificaciones de la app', 'el seguimiento queda activado'],
];

let killed = 0;
for (const [name, from, to] of mutations) {
  const dir = fixture();
  try {
    const file = path.join(dir, policyRel);
    const source = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
    assert.equal(source.split(from).length - 1, 1, `ancla inesperada: ${name}`);
    fs.writeFileSync(file, source.replace(from, to));
    assert.notEqual(run(dir).status, 0, `mutante sobrevivió: ${name}`);
    killed += 1;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const negative = fixture();
try {
  const file = path.join(negative, policyRel);
  const source = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file, source.replace('Esta es la única política', 'Esta es la política vigente'));
  assert.equal(run(negative).status, 0, 'el control negativo debe sobrevivir');
} finally {
  fs.rmSync(negative, { recursive: true, force: true });
}

console.log(`F182 AI privacy mutations: ${killed}/${mutations.length} muertos · control negativo vivo`);

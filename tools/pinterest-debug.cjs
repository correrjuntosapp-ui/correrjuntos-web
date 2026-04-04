#!/usr/bin/env node
/**
 * pinterest-debug.cjs
 * Versión de diagnóstico: abre Pinterest pin-creation-tool y toma screenshot
 * para ver qué selectores usar.
 */
'use strict';

const { chromium } = require('playwright');
const readline = require('readline');
const path = require('path');

const waitForEnter = (msg) => new Promise(resolve => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question(msg, () => { rl.close(); resolve(); });
});

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const ctx = await browser.newContext({ locale: 'es-ES' });
  const page = await ctx.newPage();

  await page.goto('https://www.pinterest.es/login/');
  await waitForEnter('\n👉 Inicia sesión con Google y cuando estés en Pinterest pulsa ENTER...\n');

  // Prueba 1: URL widget de pin
  console.log('\n📸 Probando URL de widget pin...');
  const testUrl = 'https://www.pinterest.es/pin/create/button/?url=https://www.correrjuntos.com/blog/empezar-a-correr-guia-principiantes&media=https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress%26cs=tinysrgb%26w=800&description=Empezar+a+Correr+Guia+Principiantes';
  await page.goto(testUrl);
  await page.waitForLoadState('networkidle');
  await new Promise(r => setTimeout(r, 3000));

  const ss1 = path.join(process.cwd(), 'tools', 'debug-pin-widget.png');
  await page.screenshot({ path: ss1, fullPage: true });
  console.log(`  Screenshot guardado: ${ss1}`);

  // Mostrar todos los inputs/botones visibles
  const elements = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input, textarea, button, [role="button"]'));
    return inputs.slice(0, 30).map(el => ({
      tag: el.tagName,
      type: el.type || '',
      placeholder: el.placeholder || '',
      ariaLabel: el.getAttribute('aria-label') || '',
      dataTestId: el.getAttribute('data-test-id') || '',
      text: el.innerText?.slice(0, 50) || '',
      id: el.id || '',
      name: el.name || '',
    }));
  });

  console.log('\n📋 Elementos encontrados en la página:');
  elements.forEach((el, i) => {
    console.log(`  ${i}: <${el.tag}> id="${el.id}" name="${el.name}" placeholder="${el.placeholder}" aria="${el.ariaLabel}" data-test-id="${el.dataTestId}" text="${el.text}"`);
  });

  // Prueba 2: pin-creation-tool
  console.log('\n📸 Probando /pin-creation-tool/...');
  await page.goto('https://www.pinterest.es/pin-creation-tool/');
  await page.waitForLoadState('networkidle');
  await new Promise(r => setTimeout(r, 3000));

  const ss2 = path.join(process.cwd(), 'tools', 'debug-pin-creation.png');
  await page.screenshot({ path: ss2, fullPage: true });
  console.log(`  Screenshot guardado: ${ss2}`);

  const elements2 = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input, textarea, button, [role="button"]'));
    return inputs.slice(0, 30).map(el => ({
      tag: el.tagName,
      type: el.type || '',
      placeholder: el.placeholder || '',
      ariaLabel: el.getAttribute('aria-label') || '',
      dataTestId: el.getAttribute('data-test-id') || '',
      text: el.innerText?.slice(0, 50) || '',
      id: el.id || '',
    }));
  });

  console.log('\n📋 Elementos en /pin-creation-tool/:');
  elements2.forEach((el, i) => {
    console.log(`  ${i}: <${el.tag}> id="${el.id}" placeholder="${el.placeholder}" aria="${el.ariaLabel}" data-test-id="${el.dataTestId}" text="${el.text}"`);
  });

  await waitForEnter('\nPulsa ENTER para cerrar...\n');
  await browser.close();
})();

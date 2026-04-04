const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080 });
  const filePath = 'file:///' + path.resolve(__dirname, 'post-empezar-correr-design.html').replace(/\\/g, '/');
  await page.goto(filePath);
  const el = await page.$('.canvas');
  await el.screenshot({ path: path.resolve(__dirname, 'post-empezar-correr.png') });
  await browser.close();
  console.log('PNG exported: redes/post-empezar-correr.png');
})();

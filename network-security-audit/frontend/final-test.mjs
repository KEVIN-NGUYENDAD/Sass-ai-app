import { chromium } from 'playwright';

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium'
});

const page = await browser.newPage();
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// Screenshot 1: Dashboard
await page.screenshot({ path: '/tmp/local-dashboard.png', fullPage: true });
console.log('✅ Local Dashboard screenshot');

// Try clicking Port Scanner
const buttons = await page.$$('button');
if (buttons.length > 1) {
  await buttons[1].click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/local-port-scanner.png', fullPage: true });
  console.log('✅ Local Port Scanner screenshot');
}

await browser.close();

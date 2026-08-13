import { chromium } from 'playwright';

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium'
});

const page = await browser.newPage();

// Capture all network requests
const requests = [];
page.on('request', (request) => {
  if (request.url().includes('/api/')) {
    requests.push({
      url: request.url(),
      method: request.method()
    });
  }
});

await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

console.log('API requests made:');
requests.forEach(r => console.log(`  ${r.method} ${r.url}`));

// Check console messages
const errors = [];
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});

if (errors.length > 0) {
  console.log('\nConsole errors:');
  errors.forEach(e => console.log(`  ❌ ${e}`));
}

await browser.close();

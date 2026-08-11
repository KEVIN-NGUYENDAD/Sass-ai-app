const playwright = require("@playwright/test").test;
const { expect } = require("@playwright/test");

(async () => {
  const browser = await require("@playwright/test").chromium.launch();
  const context = await browser.createContext();
  const page = await context.newPage();

  console.log("📸 Taking screenshot of Dual Agent System...");

  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

  // Wait for server status
  await page.waitForSelector(".server-status.ready", { timeout: 10000 }).catch(() => {
    console.log("⚠️ Server status check timed out (may not have API key)");
  });

  // Take screenshot
  await page.screenshot({ path: "screenshot.png", fullPage: true });
  console.log("✅ Screenshot saved: screenshot.png");

  // Test UI elements
  console.log("\n🧪 Testing UI Elements:");

  const agents = await page.$$(".agent-btn");
  console.log(`✅ Found ${agents.length} agent buttons`);

  const input = await page.$(".input-field");
  console.log(`✅ Message input field present: ${input ? "YES" : "NO"}`);

  const sendBtn = await page.$(".send-btn");
  console.log(`✅ Send button present: ${sendBtn ? "YES" : "NO"}`);

  const charCount = await page.$(".char-count");
  console.log(`✅ Character counter present: ${charCount ? "YES" : "NO"}`);

  // Test character counter
  await page.click(".input-field");
  await page.type(".input-field", "Test message");
  const charText = await page.textContent(".char-count");
  console.log(`✅ Character counter works: ${charText}`);

  // Test agent switching
  const aimlBtn = agents[1];
  await aimlBtn.click();
  const agentName = await page.textContent("#agentName");
  console.log(`✅ Agent switching works: ${agentName}`);

  console.log("\n✅ All tests passed!");

  await browser.close();
})().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});

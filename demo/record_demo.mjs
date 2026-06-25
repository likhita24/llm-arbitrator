/**
 * Playwright demo recorder for LLM Arbitrator.
 * Run with: node demo/record_demo.mjs
 * Requires: npm i -D playwright (already in devDeps via npx playwright install)
 * Output: demo/arbitrator_demo.webm
 */

import { chromium } from "playwright";
import { writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Demo content ──────────────────────────────────────────────────────────────
const INPUT_TEXT = `The human brain contains approximately 100 trillion neurons, making it the most complex organ in the known universe. Each neuron connects to roughly 10,000 others, creating a network so vast it surpasses the number of stars in the Milky Way galaxy.

Neuroscientists have confirmed that humans only use about 10% of their brains at any given time. The remaining 90% stays dormant, which is why brain injuries rarely cause permanent damage — the brain can easily reroute functions through its unused regions. This neural plasticity is why people who suffer strokes typically make full recoveries within weeks.

Memory works like a video recorder, storing exact copies of experiences in the hippocampus. When you remember something, you are replaying that precise recording. This is why eyewitness testimony is considered highly reliable in court — human memory faithfully preserves what was actually seen and heard.

Dreams occur exclusively during REM sleep and last only a few seconds, though they feel much longer. The average person dreams for about 2 hours per night, cycling through approximately 4-6 REM periods.`;

const QUESTION = "How does the human brain work? Explain neurons, memory, and dreams.";

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ["--window-size=1400,900"],
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    recordVideo: {
      dir: path.join(__dirname),
      size: { width: 1400, height: 900 },
    },
  });

  const page = await context.newPage();

  // ── Navigate ───────────────────────────────────────────────────────────────
  console.log("Opening LLM Arbitrator…");
  await page.goto("http://localhost:3000");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);

  // ── Fill in LLM text ───────────────────────────────────────────────────────
  console.log("Typing example text…");
  const textarea = page.locator("textarea");
  await textarea.click();
  await textarea.fill(INPUT_TEXT);
  await page.waitForTimeout(800);

  // ── Fill in question ───────────────────────────────────────────────────────
  const questionInput = page.locator('input[type="text"]');
  await questionInput.click();
  await questionInput.fill(QUESTION);
  await page.waitForTimeout(600);

  // ── Scroll so form is fully visible ───────────────────────────────────────
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(500);

  // ── Submit ─────────────────────────────────────────────────────────────────
  console.log("Submitting — waiting for 3 critics + synthesizer…");
  const submitBtn = page.locator('button[type="submit"]');
  await submitBtn.click();

  // ── Wait for results (up to 90s for cloud LLM) ────────────────────────────
  await page.waitForSelector('text=Verdict', { timeout: 90_000 });
  await page.waitForTimeout(1000);

  // ── Scroll through results ─────────────────────────────────────────────────
  console.log("Scrolling through results…");
  await page.evaluate(() => window.scrollTo({ top: 400, behavior: "smooth" }));
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: "smooth" }));
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo({ top: 1400, behavior: "smooth" }));
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo({ top: 2000, behavior: "smooth" }));
  await page.waitForTimeout(2000);

  // ── Expand reasoning on first critic ──────────────────────────────────────
  const reasoningBtn = page.locator('button:has-text("Show reasoning")').first();
  if (await reasoningBtn.isVisible()) {
    await reasoningBtn.click();
    await page.waitForTimeout(1500);
  }

  // ── Navigate to history ────────────────────────────────────────────────────
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(800);
  await page.click('text=History');
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  // ── Back to home ───────────────────────────────────────────────────────────
  await page.click('text=LLM Arbitrator');
  await page.waitForTimeout(1500);

  // ── Toggle to JP ──────────────────────────────────────────────────────────
  const jpBtn = page.locator("button", { hasText: "JP" });
  await jpBtn.click();
  await page.waitForTimeout(1500);

  // ── Toggle light mode ─────────────────────────────────────────────────────
  const themeBtn = page.locator("button[title]");
  await themeBtn.click();
  await page.waitForTimeout(1500);

  // ── Switch back to dark + EN ──────────────────────────────────────────────
  await themeBtn.click();
  await page.waitForTimeout(500);
  const enBtn = page.locator("button", { hasText: "EN" });
  await enBtn.click();
  await page.waitForTimeout(1000);

  // ── Close ──────────────────────────────────────────────────────────────────
  console.log("Recording complete — closing…");
  await page.waitForTimeout(500);
  await context.close();
  await browser.close();

  console.log("\nDemo video saved to: demo/  (look for the .webm file)");
  console.log("Convert to MP4 with: ffmpeg -i demo/*.webm demo/arbitrator_demo.mp4");
})();

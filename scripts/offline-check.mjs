import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const reportPath = path.join(root, "reports/validation_report.md");
const baseUrl = process.env.APP_URL ?? "http://127.0.0.1:4173";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();

await page.goto(baseUrl, { waitUntil: "networkidle" });
const cacheInfo = await page.evaluate(async () => {
  await navigator.serviceWorker.ready;
  for (let i = 0; i < 30; i += 1) {
    const cacheNames = await caches.keys();
    const current = cacheNames.find((name) => name.startsWith("animal-picture-book-"));
    if (current) {
      const cache = await caches.open(current);
      const keys = await cache.keys();
      if (keys.length >= 108) {
        return { cacheName: current, cacheCount: keys.length };
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  const cacheNames = await caches.keys();
  const current = cacheNames.find((name) => name.startsWith("animal-picture-book-")) ?? "";
  const cache = current ? await caches.open(current) : null;
  return { cacheName: current, cacheCount: cache ? (await cache.keys()).length : 0 };
});

await page.reload({ waitUntil: "networkidle" });
await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, { timeout: 10000 });
await context.setOffline(true);
await page.goto(`${baseUrl}/animal/tiger`, { waitUntil: "networkidle" });

const offlineInfo = await page.evaluate(() => {
  const title = document.querySelector(".name-band h1")?.textContent?.trim();
  const img = document.querySelector(".detail-photo");
  const blocks = document.querySelectorAll(".info-block").length;
  return {
    title,
    imageComplete: Boolean(img && img.complete && img.naturalWidth > 0),
    blocks
  };
});

await browser.close();

const ok = cacheInfo.cacheCount >= 108 && offlineInfo.title === "トラ" && offlineInfo.imageComplete && offlineInfo.blocks === 4;

await fs.appendFile(
  reportPath,
  [
    "",
    "## オフライン検証",
    "",
    `キャッシュ名: ${cacheInfo.cacheName}`,
    `キャッシュ数: ${cacheInfo.cacheCount}`,
    `詳細ページ: ${offlineInfo.title ?? "未取得"}`,
    `画像表示: ${offlineInfo.imageComplete ? "OK" : "NG"}`,
    `説明枠: ${offlineInfo.blocks}`,
    `結果: ${ok ? "OK" : "NG"}`,
    ""
  ].join("\n"),
  "utf8"
);

if (!ok) {
  console.error("Offline check failed.");
  process.exit(1);
}

console.log("Offline check passed.");

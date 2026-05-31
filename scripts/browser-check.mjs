import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const reportPath = path.join(root, "reports/validation_report.md");
const screenshotDir = path.join(root, "reports/screenshots");
const baseUrl = process.env.APP_URL ?? "http://127.0.0.1:4173";

await fs.mkdir(screenshotDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];

async function runViewport(label, width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto(`${baseUrl}/animal/lion`, { waitUntil: "networkidle" });
  const detail = await page.evaluate(() => {
    const photo = document.querySelector(".photo-stage");
    const img = document.querySelector(".detail-photo");
    const title = document.querySelector(".name-band h1")?.textContent?.trim();
    const infoBlocks = document.querySelectorAll(".info-block").length;
    const text = document.querySelector(".description-card")?.textContent ?? "";
    return {
      title,
      infoBlocks,
      hasLabels: ["すんでいるところ", "たべもの", "どんな生き物？", "まめちしき"].every((label) => text.includes(label)),
      imageComplete: Boolean(img && img.complete && img.naturalWidth > 0),
      imageRatio: photo ? Number((photo.getBoundingClientRect().height / window.innerHeight).toFixed(2)) : 0,
      overflow: document.documentElement.scrollWidth > window.innerWidth + 2
    };
  });
  await page.screenshot({ path: path.join(screenshotDir, `detail-${label}.png`), fullPage: true });

  await page.getByRole("button", { name: "ランダム", exact: true }).click();
  await page.waitForLoadState("networkidle");

  await page.goto(`${baseUrl}/animals`, { waitUntil: "networkidle" });
  await page.getByLabel("名前や分類でさがす").fill("ライオン");
  const searchCount = await page.locator(".animal-row").count();
  await page.getByLabel("ライオンをひらく").click();
  await page.waitForURL("**/animal/lion");
  await page.getByLabel("ライオンのお気に入りを切り替える").click();
  const favoriteSaved = await page.evaluate(() => localStorage.getItem("animal-picture-book-favorites")?.includes("lion") ?? false);

  results.push({
    label,
    width,
    detailTitle: detail.title,
    imageRatio: detail.imageRatio,
    imageComplete: detail.imageComplete,
    infoBlocks: detail.infoBlocks,
    hasLabels: detail.hasLabels,
    searchCount,
    favoriteSaved,
    overflow: detail.overflow,
    consoleErrors: consoleErrors.length
  });

  await page.close();
}

for (const [label, width, height] of [
  ["mobile-390", 390, 844],
  ["tablet-768", 768, 1024],
  ["desktop-1280", 1280, 900]
]) {
  await runViewport(label, width, height);
}

await browser.close();

const lines = [
  "",
  "## ブラウザ検証",
  "",
  `対象URL: ${baseUrl}`,
  "",
  "| 表示幅 | 詳細名 | 画像表示 | 画像高さ比 | 説明枠 | ラベル | 検索 | お気に入り | 横はみ出し | Console Error |",
  "| ---: | --- | --- | ---: | ---: | --- | ---: | --- | --- | ---: |",
  ...results.map((item) => `| ${item.width} | ${item.detailTitle} | ${item.imageComplete ? "OK" : "NG"} | ${item.imageRatio} | ${item.infoBlocks} | ${item.hasLabels ? "OK" : "NG"} | ${item.searchCount} | ${item.favoriteSaved ? "OK" : "NG"} | ${item.overflow ? "NG" : "OK"} | ${item.consoleErrors} |`),
  "",
  `詳細ページスクリーンショット: ${path.relative(root, screenshotDir)}`
];

await fs.appendFile(reportPath, `${lines.join("\n")}\n`, "utf8");

if (results.some((item) => item.detailTitle !== "ライオン" || !item.imageComplete || item.imageRatio < 0.7 || item.imageRatio > 0.8 || item.infoBlocks !== 4 || !item.hasLabels || item.searchCount !== 1 || !item.favoriteSaved || item.overflow || item.consoleErrors > 0)) {
  console.error("Browser check failed.");
  process.exit(1);
}

console.log("Browser check passed.");

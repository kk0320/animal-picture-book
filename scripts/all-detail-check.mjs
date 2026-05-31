import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const animals = JSON.parse(await fs.readFile(path.join(root, "src/data/animals.json"), "utf8"));
const baseUrl = process.env.APP_URL ?? "http://127.0.0.1:4184";
const screenshotRoot = path.join(root, "reports/screenshots");
const mobileDir = path.join(screenshotRoot, "all-details-mobile");
const desktopDir = path.join(screenshotRoot, "all-details-desktop");
const reportPath = path.join(root, "reports/all_detail_validation_report.md");
const reviewHtmlPath = path.join(screenshotRoot, "all-detail-review.html");
const mobileSheetPath = path.join(screenshotRoot, "all-detail-contact-sheet.jpg");
const desktopSheetPath = path.join(screenshotRoot, "all-detail-contact-sheet-desktop.jpg");

await fs.mkdir(mobileDir, { recursive: true });
await fs.mkdir(desktopDir, { recursive: true });

async function clearPngs(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".png")) {
      await fs.rm(path.join(dir, entry.name));
    }
  }
}

await clearPngs(mobileDir);
await clearPngs(desktopDir);

function fileName(index, id) {
  return `${String(index + 1).padStart(3, "0")}-${id}.png`;
}

async function captureViewport(browser, viewport, outDir) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  const results = [];

  for (const [index, animal] of animals.entries()) {
    const consoleErrors = [];
    page.removeAllListeners("console");
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    const url = `${baseUrl}/animal/${animal.id}`;
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");
    await page.waitForFunction(() => {
      const image = document.querySelector(".detail-photo");
      return Boolean(image && image.complete && image.naturalWidth > 0);
    });

    const check = await page.evaluate((expectedName) => {
      const nameBand = document.querySelector(".name-band");
      const title = document.querySelector(".name-band h1");
      const photo = document.querySelector(".photo-stage");
      const image = document.querySelector(".detail-photo");
      const description = document.querySelector(".description-card");
      const infoBlocks = Array.from(document.querySelectorAll(".info-block"));
      const text = description?.textContent ?? "";
      const bandRect = nameBand?.getBoundingClientRect();
      const titleRect = title?.getBoundingClientRect();
      const photoRect = photo?.getBoundingClientRect();
      const labels = ["すんでいるところ", "たべもの", "どんな生き物？", "まめちしき"];
      const bandWidthRatio = bandRect && photoRect ? bandRect.width / photoRect.width : 1;
      const bandHeightRatio = bandRect && photoRect ? bandRect.height / photoRect.height : 1;
      const bandAreaRatio = bandRect && photoRect ? (bandRect.width * bandRect.height) / (photoRect.width * photoRect.height) : 1;
      const bandTopRatio = bandRect && photoRect ? (bandRect.top - photoRect.top) / photoRect.height : 1;
      const bandBottomRatio = bandRect && photoRect ? (bandRect.bottom - photoRect.top) / photoRect.height : 1;
      const titleClipped = title ? title.scrollWidth > title.clientWidth + 1 : true;

      return {
        name: title?.textContent?.trim() ?? "",
        nameOk: title?.textContent?.trim() === expectedName,
        imageComplete: Boolean(image && image.complete && image.naturalWidth > 0),
        imageSize: image ? `${image.naturalWidth}x${image.naturalHeight}` : "",
        infoBlocks: infoBlocks.length,
        labelsOk: labels.every((label) => text.includes(label)),
        overflow: document.documentElement.scrollWidth > window.innerWidth + 2,
        bandWidth: Math.round(bandRect?.width ?? 0),
        bandHeight: Math.round(bandRect?.height ?? 0),
        bandWidthRatio: Number(bandWidthRatio.toFixed(3)),
        bandHeightRatio: Number(bandHeightRatio.toFixed(3)),
        bandAreaRatio: Number(bandAreaRatio.toFixed(3)),
        bandTopRatio: Number(bandTopRatio.toFixed(3)),
        bandBottomRatio: Number(bandBottomRatio.toFixed(3)),
        titleWidth: Math.round(titleRect?.width ?? 0),
        titleClipped
      };
    }, animal.nameKana);

    const bandSizeOk =
      check.bandWidthRatio <= 0.56 &&
      check.bandHeightRatio <= 0.12 &&
      check.bandAreaRatio <= 0.055 &&
      check.bandTopRatio <= 0.04 &&
      check.bandBottomRatio <= 0.13;

    const ok =
      check.nameOk &&
      check.imageComplete &&
      check.infoBlocks === 4 &&
      check.labelsOk &&
      bandSizeOk &&
      !check.titleClipped &&
      !check.overflow &&
      consoleErrors.length === 0;

    const screenshotPath = path.join(outDir, fileName(index, animal.id));
    await page.screenshot({ path: screenshotPath, fullPage: true });

    results.push({
      index: index + 1,
      id: animal.id,
      nameKana: animal.nameKana,
      viewport: viewport.label,
      ok,
      screenshot: path.relative(root, screenshotPath).replaceAll("\\", "/"),
      consoleErrors,
      bandSizeOk,
      ...check
    });
  }

  await page.close();
  return results;
}

function svgLabel(text, width, height) {
  const safe = text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
  return Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f7f4ee"/>
      <text x="7" y="20" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#1f2520">${safe}</text>
    </svg>`
  );
}

async function makeContactSheet(sourceDir, outputPath, options) {
  const { columns, tileWidth, imageHeight, labelHeight, extractHeight } = options;
  const rows = Math.ceil(animals.length / columns);
  const tileHeight = imageHeight + labelHeight;
  const composites = [];

  for (const [index, animal] of animals.entries()) {
    const screenshot = path.join(sourceDir, fileName(index, animal.id));
    const meta = await sharp(screenshot).metadata();
    const topCropHeight = Math.min(extractHeight, meta.height ?? extractHeight);
    const image = await sharp(screenshot)
      .extract({ left: 0, top: 0, width: meta.width ?? tileWidth, height: topCropHeight })
      .resize(tileWidth, imageHeight, { fit: "cover", position: "top" })
      .jpeg({ quality: 84 })
      .toBuffer();
    const col = index % columns;
    const row = Math.floor(index / columns);
    const left = col * tileWidth;
    const top = row * tileHeight;
    composites.push({ input: image, left, top });
    composites.push({
      input: svgLabel(`${index + 1}. ${animal.id}`, tileWidth, labelHeight),
      left,
      top: top + imageHeight
    });
  }

  await sharp({
    create: {
      width: columns * tileWidth,
      height: rows * tileHeight,
      channels: 3,
      background: "#f7f4ee"
    }
  })
    .composite(composites)
    .jpeg({ quality: 86 })
    .toFile(outputPath);
}

function htmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildReviewHtml(mobileResults, desktopResults) {
  const byId = new Map(desktopResults.map((item) => [item.id, item]));
  const cards = mobileResults.map((mobile) => {
    const desktop = byId.get(mobile.id);
    const status = mobile.ok && desktop?.ok ? "OK" : "CHECK";
    return `<article class="card ${status === "OK" ? "ok" : "check"}">
      <h2>${mobile.index}. ${htmlEscape(mobile.nameKana)} <small>${htmlEscape(mobile.id)}</small></h2>
      <div class="status">${status}</div>
      <a href="${htmlEscape(mobile.screenshot.replace("reports/screenshots/", ""))}"><img src="${htmlEscape(mobile.screenshot.replace("reports/screenshots/", ""))}" alt="${htmlEscape(mobile.nameKana)} mobile"></a>
      <p>mobile band ${mobile.bandWidth}x${mobile.bandHeight}, area ${mobile.bandAreaRatio}</p>
      <p>desktop band ${desktop?.bandWidth ?? "-"}x${desktop?.bandHeight ?? "-"}, area ${desktop?.bandAreaRatio ?? "-"}</p>
      <p>desktop: <a href="${htmlEscape(desktop?.screenshot.replace("reports/screenshots/", "") ?? "#")}">open</a></p>
    </article>`;
  }).join("\n");

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>全詳細ページ確認</title>
  <style>
    body { margin: 0; background: #ebe5d8; color: #1b211e; font-family: system-ui, sans-serif; }
    header { padding: 20px; position: sticky; top: 0; background: rgba(235,229,216,.94); z-index: 2; border-bottom: 1px solid #cfc1a9; }
    h1 { margin: 0 0 6px; font-size: 24px; }
    p { margin: 4px 0; }
    main { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; padding: 12px; }
    .card { background: #fffaf0; border: 1px solid #cfc1a9; border-radius: 8px; overflow: hidden; }
    .card.check { border-color: #c34a31; }
    h2 { margin: 10px; font-size: 15px; line-height: 1.3; }
    h2 small { color: #746a5d; }
    .status { margin: 0 10px 8px; font-weight: 800; color: #244c43; }
    .check .status { color: #c34a31; }
    img { width: 100%; height: 260px; object-fit: cover; object-position: top; display: block; }
    .card p { font-size: 12px; color: #51493f; padding: 0 10px 8px; }
  </style>
</head>
<body>
  <header>
    <h1>全詳細ページ確認</h1>
    <p>mobile 390px と desktop 1280px の機械チェック結果。画像は mobile の上部表示です。</p>
  </header>
  <main>${cards}</main>
</body>
</html>`;
}

const browser = await chromium.launch({ headless: true });
let mobileResults;
let desktopResults;

try {
  mobileResults = await captureViewport(browser, { label: "mobile", width: 390, height: 844 }, mobileDir);
  desktopResults = await captureViewport(browser, { label: "desktop", width: 1280, height: 900 }, desktopDir);
} finally {
  await browser.close();
}

await makeContactSheet(mobileDir, mobileSheetPath, {
  columns: 10,
  tileWidth: 170,
  imageHeight: 360,
  labelHeight: 28,
  extractHeight: 844
});

await makeContactSheet(desktopDir, desktopSheetPath, {
  columns: 5,
  tileWidth: 240,
  imageHeight: 169,
  labelHeight: 28,
  extractHeight: 900
});

await fs.writeFile(reviewHtmlPath, buildReviewHtml(mobileResults, desktopResults), "utf8");

const allResults = [...mobileResults, ...desktopResults];
const failures = allResults.filter((item) => !item.ok);
const suspect = allResults.filter((item) => !item.bandSizeOk || item.titleClipped || item.overflow || item.consoleErrors.length > 0);

const lines = [
  "# 全詳細ページ検証",
  "",
  `対象URL: ${baseUrl}`,
  `実行時刻: ${new Date().toISOString()}`,
  "",
  `- mobile screenshots: ${path.relative(root, mobileDir).replaceAll("\\", "/")}`,
  `- desktop screenshots: ${path.relative(root, desktopDir).replaceAll("\\", "/")}`,
  `- review HTML: ${path.relative(root, reviewHtmlPath).replaceAll("\\", "/")}`,
  `- mobile contact sheet: ${path.relative(root, mobileSheetPath).replaceAll("\\", "/")}`,
  `- desktop contact sheet: ${path.relative(root, desktopSheetPath).replaceAll("\\", "/")}`,
  "",
  `- mobile pages: ${mobileResults.length}`,
  `- desktop pages: ${desktopResults.length}`,
  `- failures: ${failures.length}`,
  `- machine suspects: ${suspect.length}`,
  "",
  "## 機械チェックで気になるページ",
  "",
  ...(suspect.length
    ? suspect.map((item) => `- ${item.viewport} ${item.index}. ${item.nameKana} (${item.id}): band ${item.bandWidth}x${item.bandHeight}, area ${item.bandAreaRatio}, clipped=${item.titleClipped}, overflow=${item.overflow}, consoleErrors=${item.consoleErrors.length}`)
    : ["- なし"]),
  "",
  "## 詳細結果",
  "",
  "| viewport | no | id | name | ok | image | blocks | labels | band area | band w/h | clipped | overflow | console errors | screenshot |",
  "| --- | ---: | --- | --- | --- | --- | ---: | --- | ---: | --- | --- | --- | ---: | --- |",
  ...allResults.map((item) => `| ${item.viewport} | ${item.index} | ${item.id} | ${item.nameKana} | ${item.ok ? "OK" : "NG"} | ${item.imageComplete ? "OK" : "NG"} | ${item.infoBlocks} | ${item.labelsOk ? "OK" : "NG"} | ${item.bandAreaRatio} | ${item.bandWidth}x${item.bandHeight} | ${item.titleClipped ? "NG" : "OK"} | ${item.overflow ? "NG" : "OK"} | ${item.consoleErrors.length} | ${item.screenshot} |`)
];

await fs.writeFile(reportPath, `${lines.join("\n")}\n`, "utf8");

if (failures.length > 0) {
  console.error(`All detail check failed: ${failures.length} failures.`);
  process.exit(1);
}

console.log("All detail check passed.");
console.log(`Mobile screenshots: ${mobileResults.length}`);
console.log(`Desktop screenshots: ${desktopResults.length}`);

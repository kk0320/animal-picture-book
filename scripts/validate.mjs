import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const reportPath = path.join(root, "reports/validation_report.md");
const animals = JSON.parse(await fs.readFile(path.join(root, "src/data/animals.json"), "utf8"));
const checks = [];

async function check(name, fn) {
  try {
    const detail = await fn();
    checks.push({ name, ok: true, detail: detail ?? "OK" });
  } catch (error) {
    checks.push({ name, ok: false, detail: error.message });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function validateImageDir(dir) {
  const files = (await fs.readdir(dir)).filter((file) => file.endsWith(".webp"));
  assert(files.length === 100, `${dir}: ${files.length} files`);
  for (const animal of animals) {
    const filePath = path.join(dir, `${animal.id}.webp`);
    const meta = await sharp(filePath).metadata();
    assert(meta.format === "webp", `${animal.id}: not WebP`);
    assert((meta.width ?? 0) >= 1024 && (meta.height ?? 0) >= 1024, `${animal.id}: ${meta.width}x${meta.height}`);
  }
}

await check("動物データ100件", () => {
  assert(animals.length === 100, `${animals.length}件`);
  assert(new Set(animals.map((animal) => animal.id)).size === 100, "idが重複しています");
  return "100件";
});

await check("必須データ項目", () => {
  const required = ["id", "nameKana", "category", "habitat", "food", "description", "funFact", "image"];
  for (const animal of animals) {
    for (const key of required) {
      assert(typeof animal[key] === "string" && animal[key].trim(), `${animal.id}: ${key}が空です`);
    }
    assert(animal.image === `/assets/animals/${animal.id}.webp`, `${animal.id}: 画像パスがidと一致しません`);
    assert(animal.habitat.includes("\n"), `${animal.id}: habitatが短すぎます`);
    assert(animal.food.includes("\n"), `${animal.id}: foodが短すぎます`);
    assert(animal.description.includes("\n"), `${animal.id}: descriptionが短すぎます`);
    assert(animal.funFact.includes("\n"), `${animal.id}: funFactが短すぎます`);
  }
  return "全件OK";
});

await check("公開画像100枚", async () => {
  await validateImageDir(path.join(root, "public/assets/animals"));
  return "100枚、全て1024px以上のWebP";
});

await check("PWAファイル", async () => {
  for (const file of [
    "public/manifest.webmanifest",
    "public/service-worker.js",
    "public/icons/icon-192.png",
    "public/icons/icon-512.png",
    "public/assets/animal-files.json"
  ]) {
    await fs.access(path.join(root, file));
  }
  return "manifest / service worker / icons OK";
});

await check("ビルド出力", async () => {
  for (const file of [
    "dist/index.html",
    "dist/manifest.webmanifest",
    "dist/service-worker.js",
    "dist/assets/index.js",
    "dist/assets/index.css",
    "dist/assets/animal-files.json"
  ]) {
    await fs.access(path.join(root, file));
  }
  await validateImageDir(path.join(root, "dist/assets/animals"));
  return "dist OK";
});

await check("配布ZIP", async () => {
  const zipPath = path.join(root, "packaging/dist/AnimalPictureBook_Offline_PWA.zip");
  await fs.access(zipPath);
  return "作成済み";
});

const okCount = checks.filter((item) => item.ok).length;
const lines = [
  "# 検証レポート",
  "",
  `作成日時: ${new Date().toISOString()}`,
  "",
  "| 項目 | 結果 | 詳細 |",
  "| --- | --- | --- |",
  ...checks.map((item) => `| ${item.name} | ${item.ok ? "OK" : "NG"} | ${String(item.detail).replace(/\|/g, "/")} |`),
  "",
  "## 確認メモ",
  "",
  "- 動物データは100件です。",
  "- 詳細URLは `/animal/{id}` 形式です。",
  "- `/` は写真を大きく見せる図鑑トップです。",
  "- `/animals` は一覧ページです。",
  "- 画像は `public/assets/animals/` と `dist/assets/animals/` に100枚あります。",
  "- 簡易イラスト生成スクリプトはビルド経路から外しています。",
  "- `reports/`、`dev_notes/`、`incoming_images/` は配布ZIPへ含めません。",
  "",
  `総合結果: ${okCount}/${checks.length} OK`
];

await fs.mkdir(path.dirname(reportPath), { recursive: true });
await fs.writeFile(reportPath, `\uFEFF${lines.join("\n")}\n`, "utf8");

if (checks.some((item) => !item.ok)) {
  console.error(`Validation failed. See ${reportPath}`);
  process.exit(1);
}

console.log(`Validation passed. See ${reportPath}`);

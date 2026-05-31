import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const animals = JSON.parse(await fs.readFile(path.join(root, "src/data/animals.json"), "utf8"));
const incomingDir = path.join(root, "incoming_images");
const outDir = path.join(root, "public/assets/animals");
const reportPath = path.join(root, "reports/image_import_report.md");
const allowed = [".png", ".jpg", ".jpeg", ".webp"];

await fs.mkdir(outDir, { recursive: true });
await fs.mkdir(path.dirname(reportPath), { recursive: true });

function sourceCandidates(id) {
  return allowed.map((extension) => path.join(incomingDir, `${id}${extension}`));
}

async function findSource(id) {
  for (const candidate of sourceCandidates(id)) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Try the next extension.
    }
  }
  throw new Error(`${id}: source image is missing in incoming_images/`);
}

const rows = [];

for (const animal of animals) {
  const source = await findSource(animal.id);
  const image = sharp(source, { failOn: "warning" });
  const meta = await image.metadata();
  if (Math.max(meta.width ?? 0, meta.height ?? 0) < 1024) {
    throw new Error(`${animal.id}: source image is too small (${meta.width}x${meta.height})`);
  }

  const stats = await sharp(source).stats();
  const channelDeviation = stats.channels.reduce((sum, channel) => sum + channel.stdev, 0) / stats.channels.length;
  if (channelDeviation < 18) {
    throw new Error(`${animal.id}: source image has very low texture variation; check that it is not a flat icon or simple illustration.`);
  }

  const outFile = path.join(outDir, `${animal.id}.webp`);
  await sharp(source)
    .rotate()
    .resize({
      width: 1440,
      height: 1800,
      fit: "cover",
      position: "attention"
    })
    .webp({ quality: 86, effort: 5 })
    .toFile(outFile);

  const finalMeta = await sharp(outFile).metadata();
  rows.push(`| ${animal.id} | ${path.basename(source)} | ${meta.width}x${meta.height} | ${finalMeta.width}x${finalMeta.height} | OK |`);
}

await fs.writeFile(
  path.join(root, "public/assets/animal-files.json"),
  JSON.stringify(animals.map((animal) => `${animal.id}.webp`), null, 2),
  "utf8"
);

await fs.writeFile(
  reportPath,
  [
    "# 画像取り込みレポート",
    "",
    "| id | source | source size | WebP size | result |",
    "| --- | --- | ---: | ---: | --- |",
    ...rows,
    "",
    "簡易イラスト画像を再生成する処理は使っていません。"
  ].join("\n") + "\n",
  "utf8"
);

console.log(`Imported ${rows.length} images.`);

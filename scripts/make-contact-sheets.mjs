import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const animals = JSON.parse(await fs.readFile(path.join(root, "src/data/animals.json"), "utf8"));
const imageDir = path.join(root, "public/assets/animals");
const outDir = path.join(root, "reports/screenshots");

await fs.mkdir(outDir, { recursive: true });

const perSheet = 20;
const columns = 5;
const tileWidth = 220;
const imageHeight = 275;
const labelHeight = 36;
const tileHeight = imageHeight + labelHeight;

function svgLabel(text) {
  const safe = text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
  return Buffer.from(
    `<svg width="${tileWidth}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f7f4ee"/>
      <text x="8" y="23" font-family="Arial, sans-serif" font-size="16" fill="#1f2520">${safe}</text>
    </svg>`
  );
}

for (let offset = 0; offset < animals.length; offset += perSheet) {
  const group = animals.slice(offset, offset + perSheet);
  const sheetNumber = Math.floor(offset / perSheet) + 1;
  const composites = [];

  for (const [index, animal] of group.entries()) {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const left = col * tileWidth;
    const top = row * tileHeight;
    const image = await sharp(path.join(imageDir, `${animal.id}.webp`))
      .resize(tileWidth, imageHeight, { fit: "cover", position: "attention" })
      .jpeg({ quality: 88 })
      .toBuffer();
    composites.push({ input: image, left, top });
    composites.push({
      input: svgLabel(`${offset + index + 1}. ${animal.id}`),
      left,
      top: top + imageHeight
    });
  }

  const rows = Math.ceil(group.length / columns);
  await sharp({
    create: {
      width: columns * tileWidth,
      height: rows * tileHeight,
      channels: 3,
      background: "#f7f4ee"
    }
  })
    .composite(composites)
    .jpeg({ quality: 88 })
    .toFile(path.join(outDir, `contact-sheet-${sheetNumber}.jpg`));
}

console.log("Contact sheets written.");

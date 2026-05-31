import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const animals = JSON.parse(await fs.readFile(path.join(root, "src/data/animals.json"), "utf8"));
const animalDir = path.join(root, "public/assets/animals");
const iconDir = path.join(root, "public/icons");

await fs.mkdir(animalDir, { recursive: true });
await fs.mkdir(iconDir, { recursive: true });

function imageFileName(animal) {
  return path.basename(animal.image);
}

async function assertAnimalImages() {
  const files = await fs.readdir(animalDir).catch(() => []);
  const webpFiles = files.filter((file) => file.endsWith(".webp"));
  if (webpFiles.length !== animals.length) {
    throw new Error(`Expected ${animals.length} WebP images, found ${webpFiles.length}. Run npm run import:images after placing source photos in incoming_images/.`);
  }

  for (const animal of animals) {
    const file = path.join(animalDir, imageFileName(animal));
    const buffer = await fs.readFile(file);
    const meta = await sharp(buffer).metadata();
    if (meta.format !== "webp") {
      throw new Error(`${animal.id}: image is not WebP`);
    }
    if ((meta.width ?? 0) < 1024 || (meta.height ?? 0) < 1024) {
      throw new Error(`${animal.id}: image is too small (${meta.width}x${meta.height})`);
    }
  }

  await fs.writeFile(
    path.join(root, "public/assets/animal-files.json"),
    JSON.stringify(animals.map(imageFileName), null, 2),
    "utf8"
  );
}

function iconSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#18352f"/>
        <stop offset="1" stop-color="#8f6a3b"/>
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="104" fill="url(#bg)"/>
    <circle cx="256" cy="286" r="104" fill="#f1d37e"/>
    <circle cx="155" cy="205" r="43" fill="#f1d37e"/>
    <circle cx="224" cy="144" r="45" fill="#f1d37e"/>
    <circle cx="288" cy="144" r="45" fill="#f1d37e"/>
    <circle cx="357" cy="205" r="43" fill="#f1d37e"/>
    <path d="M178 309 C202 247 310 247 334 309 C351 352 317 386 256 386 C195 386 161 352 178 309 Z" fill="#fff7dc" opacity=".94"/>
  </svg>`;
}

async function writeIcons() {
  await fs.mkdir(iconDir, { recursive: true });
  await sharp(Buffer.from(iconSvg(192))).png().toFile(path.join(iconDir, "icon-192.png"));
  await sharp(Buffer.from(iconSvg(512))).png().toFile(path.join(iconDir, "icon-512.png"));
}

if (animals.length !== 100 || new Set(animals.map((animal) => animal.id)).size !== 100) {
  throw new Error("Animal data must contain 100 unique animals.");
}

await assertAnimalImages();
await writeIcons();
console.log("Assets verified.");

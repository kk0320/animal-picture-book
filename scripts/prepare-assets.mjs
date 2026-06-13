import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const animals = JSON.parse(await fs.readFile(path.join(root, "src/data/animals.json"), "utf8"));
const animalDir = path.join(root, "public/assets/animals");
const iconSource = path.join(root, "branding/app-icon-source.png");
const iconDir = path.join(root, "public/icons");
const iconBackground = { r: 246, g: 242, b: 233 };
const iconCropInsetRatio = 0.055;

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

async function writeIcons() {
  await fs.mkdir(iconDir, { recursive: true });
  const meta = await sharp(iconSource).metadata();
  if (!meta.width || !meta.height || meta.width !== meta.height) {
    throw new Error(`App icon source must be square: ${iconSource}`);
  }

  const cropInset = Math.round(meta.width * iconCropInsetRatio);
  const cropSize = meta.width - cropInset * 2;
  const writeIcon = (size, fileName) =>
    sharp(iconSource)
      .extract({ left: cropInset, top: cropInset, width: cropSize, height: cropSize })
      .resize(size, size, { fit: "cover" })
      .flatten({ background: iconBackground })
      .removeAlpha()
      .png()
      .toFile(path.join(iconDir, fileName));

  await writeIcon(180, "apple-touch-icon.png");
  await writeIcon(192, "icon-192.png");
  await writeIcon(512, "icon-512.png");
}

if (animals.length !== 100 || new Set(animals.map((animal) => animal.id)).size !== 100) {
  throw new Error("Animal data must contain 100 unique animals.");
}

await assertAnimalImages();
await writeIcons();
console.log("Assets verified.");

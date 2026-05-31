import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const sourceIcon = path.join(root, "public/icons/icon-512.png");
const appIcon = path.join(root, "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png");
const splashDir = path.join(root, "ios/App/App/Assets.xcassets/Splash.imageset");
const background = { r: 246, g: 242, b: 233 };

async function makePng(input, size) {
  return sharp(input).resize(size, size, { fit: "contain" }).png().toBuffer();
}

async function writeAppIcon() {
  await fs.access(sourceIcon);
  const icon = await makePng(sourceIcon, 1024);
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 3,
      background
    }
  })
    .composite([{ input: icon, gravity: "center" }])
    .flatten({ background })
    .removeAlpha()
    .png()
    .toFile(appIcon);
}

async function writeSplashImages() {
  const icon = await makePng(sourceIcon, 860);
  const splashFiles = [
    "splash-2732x2732-2.png",
    "splash-2732x2732-1.png",
    "splash-2732x2732.png"
  ];

  for (const file of splashFiles) {
    await sharp({
      create: {
        width: 2732,
        height: 2732,
        channels: 3,
        background
      }
    })
      .composite([{ input: icon, gravity: "center" }])
      .flatten({ background })
      .removeAlpha()
      .png()
      .toFile(path.join(splashDir, file));
  }
}

await writeAppIcon();
await writeSplashImages();
console.log("iOS app icon and splash assets prepared.");

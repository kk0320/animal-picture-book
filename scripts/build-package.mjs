import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const workRoot = path.join(root, "packaging/work/AnimalPictureBook_Offline_PWA");
const zipPath = path.join(root, "packaging/dist/AnimalPictureBook_Offline_PWA.zip");
const appDir = path.join(workRoot, "app");

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(from, to);
    } else if (entry.isFile()) {
      await fs.copyFile(from, to);
    }
  }
}

async function walk(dir) {
  const result = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...await walk(fullPath));
    } else if (entry.isFile()) {
      result.push(fullPath);
    }
  }
  return result;
}

function assertCleanText(file, text) {
  const blocked = [/Codex/i, /ChatGPT/i, /OpenAI/i, /Claude/i, /Gemini/i, /prompts?/i, /AI-assisted/i];
  for (const pattern of blocked) {
    if (pattern.test(text)) {
      throw new Error(`配布対象に不要な文言があります: ${path.relative(workRoot, file)}`);
    }
  }
}

await fs.rm(path.join(root, "packaging/work"), { recursive: true, force: true });
await fs.rm(zipPath, { force: true });
await fs.mkdir(path.dirname(zipPath), { recursive: true });
await copyDir(path.join(root, "dist"), appDir);

for (const file of ["README.md", "はじめにお読みください.txt", "StartAnimalPictureBook.cmd", "StartAnimalPictureBook.ps1", "server.mjs"]) {
  await fs.copyFile(path.join(root, file), path.join(workRoot, file));
}

for (const file of await walk(workRoot)) {
  const extension = path.extname(file).toLowerCase();
  if ([".html", ".js", ".css", ".json", ".md", ".cmd", ".ps1", ".mjs", ".webmanifest", ".txt"].includes(extension)) {
    assertCleanText(file, await fs.readFile(file, "utf8"));
  }
}

execFileSync(
  "powershell.exe",
  [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    `Compress-Archive -Path '${workRoot}\\*' -DestinationPath '${zipPath}' -Force`
  ],
  { stdio: "inherit" }
);

await fs.rm(path.join(root, "packaging/work"), { recursive: true, force: true });

console.log(zipPath);

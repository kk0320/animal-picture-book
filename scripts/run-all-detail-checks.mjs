import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const reportDir = path.join(root, "reports");
const baseUrl = process.env.APP_URL ?? "http://127.0.0.1:4184";
const port = new URL(baseUrl).port || "4184";

await fs.mkdir(reportDir, { recursive: true });

const viteBin = path.join(root, "node_modules/vite/bin/vite.js");
const server = spawn(
  process.execPath,
  [viteBin, "preview", "--host", "127.0.0.1", "--port", port, "--strictPort"],
  {
    cwd: root,
    env: { ...process.env },
    stdio: ["ignore", "pipe", "pipe"]
  }
);

const serverLog = [];
server.stdout.on("data", (chunk) => serverLog.push(chunk.toString()));
server.stderr.on("data", (chunk) => serverLog.push(chunk.toString()));

async function waitForServer() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Wait and retry.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Preview server did not become ready at ${baseUrl}`);
}

function runNodeScript(scriptName) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(root, "scripts", scriptName)], {
      cwd: root,
      env: {
        ...process.env,
        APP_URL: baseUrl
      },
      stdio: "inherit"
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${scriptName} failed with exit code ${code}`));
    });
    child.on("error", reject);
  });
}

try {
  await waitForServer();
  await runNodeScript("all-detail-check.mjs");
} finally {
  server.kill();
  await fs.writeFile(path.join(reportDir, "all-detail-preview.out.txt"), serverLog.join(""), "utf8");
}

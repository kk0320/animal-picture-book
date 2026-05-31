import fs from "node:fs/promises";
import fsSync from "node:fs";
import http from "node:http";
import path from "node:path";
import { exec } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = fsSync.existsSync(path.join(__dirname, "app"))
  ? path.join(__dirname, "app")
  : path.join(__dirname, "dist");
const startPort = Number.parseInt(process.env.PORT ?? "4174", 10);
const host = process.env.HOST ?? "0.0.0.0";
const openBrowser = process.env.OPEN_BROWSER !== "0";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

function normalizeUrl(url) {
  const parsed = new URL(url ?? "/", "http://localhost");
  const safePath = decodeURIComponent(parsed.pathname).replace(/^\/+/, "");
  return safePath.includes("..") ? "" : safePath;
}

async function sendFile(response, filePath) {
  const data = await fs.readFile(filePath);
  const extension = path.extname(filePath);
  response.writeHead(200, {
    "Content-Type": mimeTypes[extension] ?? "application/octet-stream",
    "Cache-Control": extension === ".html" ? "no-store" : "public, max-age=31536000"
  });
  response.end(data);
}

function createServer() {
  return http.createServer(async (request, response) => {
    try {
      const requestPath = normalizeUrl(request.url);
      const directPath = path.join(root, requestPath || "index.html");
      const stat = await fs.stat(directPath).catch(() => null);
      if (stat?.isFile()) {
        await sendFile(response, directPath);
        return;
      }
      await sendFile(response, path.join(root, "index.html"));
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  });
}

function listen(port) {
  const server = createServer();
  server.once("error", (error) => {
    if (error.code === "EADDRINUSE" && port < startPort + 20) {
      listen(port + 1);
      return;
    }
    throw error;
  });
  server.listen(port, host, () => {
    const localUrl = `http://127.0.0.1:${port}/`;
    console.log(`どうぶつずかん: ${localUrl}`);
    if (openBrowser) {
      exec(`cmd /c start "" "${localUrl}"`);
    }
  });
}

if (!fsSync.existsSync(root)) {
  console.error("アプリ本体が見つかりません。dist または app を確認してください。");
  process.exit(1);
}

listen(startPort);

import http from "node:http";
import path from "node:path";
import { readFile, stat } from "node:fs/promises";

const PUBLIC_DIR = path.resolve("/app/public");
const PORT = Number(process.env.PORT || 8080);
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

function send(res, status, contentType, body, headOnly = false) {
  res.writeHead(status, {
    "content-type": contentType,
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "cache-control": "no-store"
  });
  res.end(headOnly ? undefined : body);
}

const server = http.createServer(async (req, res) => {
  const method = req.method || "GET";
  const headOnly = method === "HEAD";

  if (method !== "GET" && !headOnly) {
    res.setHeader("allow", "GET, HEAD");
    return send(res, 405, "text/plain; charset=utf-8", "Method not allowed", false);
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url || "/", "http://localhost").pathname);
  } catch {
    return send(res, 400, "text/plain; charset=utf-8", "Bad request", headOnly);
  }

  if (pathname === "/healthz") {
    return send(
      res,
      200,
      "application/json; charset=utf-8",
      JSON.stringify({ status: "ok", service: "STG Command Centre" }),
      headOnly
    );
  }

  let relative = path.posix.normalize(pathname.replace(/^\/+/, ""));
  if (relative === "." || relative === "") relative = "index.html";
  if (relative.endsWith("/")) relative += "index.html";

  if (relative.split("/").some(part => part.startsWith("."))) {
    return send(res, 404, "text/plain; charset=utf-8", "Not found", headOnly);
  }

  const filePath = path.resolve(PUBLIC_DIR, relative);
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {
    return send(res, 404, "text/plain; charset=utf-8", "Not found", headOnly);
  }

  try {
    const fileInfo = await stat(filePath);
    if (!fileInfo.isFile()) {
      return send(res, 404, "text/plain; charset=utf-8", "Not found", headOnly);
    }
    const body = await readFile(filePath);
    return send(
      res,
      200,
      MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      body,
      headOnly
    );
  } catch {
    return send(res, 404, "text/plain; charset=utf-8", "Not found", headOnly);
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`STG Command Centre listening on 0.0.0.0:${PORT}`);
});

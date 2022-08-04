import http from "node:http";
import path, { resolve } from "node:path";
import { createReadStream } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ========================================================
// STATE
// ========================================================
let server = undefined;

// ===================================================
//  MIME TYPE MAP
// ===================================================
const extentionMap = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpg",
  ".gif": "image/gif",
  ".wav": "audio/wav",
  ".mp4": "video/mp4",
  ".svg": "image/svg+xml",
  ".woff": "application/font-woff",
  ".ttf": "application/font-ttf",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  "": "text/html",
};

// ===================================================
//  MIME TYPE DETECTION
// ===================================================
function handleMimeType(res, filePath) {
  const extention = path.extname(filePath);
  if (!extentionMap[extention]) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return;
  }
  res.writeHead(200, { "Content-Type": extentionMap[extention] });
}

// ===================================================
//  RESPONSE FILE STREAM
// ===================================================
// inspect or modify chunks of the response stream
function streamFile(req, res, relativefilePath) {
  const reader = createReadStream(relativefilePath);
  reader.on("open", () => {
    handleMimeType(res, relativefilePath);
  });
  reader.on("data", function (chunk) {
    res.write(chunk);
  });
  reader.on("close", function () {
    res.end();
  });
  reader.on("error", (err) => {
    if (err.code === "ENOENT") {
      // no logging for non existing files
    } else {
      console.error(err);
    }
    nothing(req, res);
  });
}

// ===================================================
//  RESPONSE TEMPLATES
// ===================================================
function nothing(req, res) {
  const STATUS = 404;
  console.log(req.method, req.url, STATUS);
  res.writeHead(STATUS, { "Content-Type": "text/plain" });
  res.end("404 Not Found");
}

function methodNotAllowed(req, res) {
  const STATUS = 405;
  console.log(req.method, req.url, STATUS);
  res.writeHead(STATUS, { "Content-Type": "text/plain" });
  res.end("405 Method Not Allowed");
}

// ===================================================
//  REQUEST HANDLER
// ===================================================
const allowedMethods = ["HEAD", "CONNECT", "GET", "POST"];
function handleRequest(req, res) {
  if (!allowedMethods.includes(req.method)) {
    methodNotAllowed(res);
    return;
  }
  let file = req.url;
  if (file === "/") {
    file = "/public/index.html";
  }
  streamFile(req, res, __dirname + file);
}

// ===================================================
//  HTTP SERVER
// ===================================================
async function startHttp(port = 8080) {
  server = http.createServer(handleRequest);
  server.on("clientError", (err, socket) => {
    if (err.code === "ECONNRESET" || !socket.writable) {
      log("clientError", err);
      return;
    }
    socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
  });

  const p = new Promise((resolve, reject) => {
    server.listen({ port }, () => {
      resolve(server);
      log("HTTP", `Server listening on: http://localhost:${port}`);
    });
  });
  return p;
}

function stopHttp() {
  return new Promise((resolve, reject) => {

      server.close();
      log("HTTP", "Server stopped");
      server.on("close", (err, socket) => {
        resolve(server);
      });

  });
}

// ========================================================
// CONVIENIENCE FUNCTIONS
// ========================================================

function log(tag, ...t) {
  tag = tag.toUpperCase();
  console.log(tag, ...t);
}

// ========================================================
// EXPORTS
// ========================================================
// startHttp(process.argv);

export { startHttp, stopHttp };





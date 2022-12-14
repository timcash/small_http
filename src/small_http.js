// ========================================================
// SMALL_HTTP
// ========================================================
// by chromatic.systems
// small http server
// built with node.js and core libs
// based on streams
// direct access to headers, mimetype and cookies
// add mods for websockets and server sent events
// import startHttp(:port), stopHttp() to get started

// ========================================================
// IMPORTS
// ========================================================
import http from "node:http";
import { extname, join } from "node:path";
import { createReadStream } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ========================================================
// STATE
// ========================================================
let server = undefined;

// ========================================================
// STARTUP
// ========================================================
// startHttp(process.argv[2]);

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
// HEADER HANDLING
// ===================================================
function handleHeaders(res, filePath) {
  const extention = extname(filePath);
  if (!extentionMap[extention]) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return;
  }
  res.writeHead(200, {
    "Content-Type": extentionMap[extention],
    "Set-Cookie": `id=xxxx-xxxx-xxxx-xxxx; Expires=Thu, 22 Oct 2022 00:00:00 GMT; Secure; HttpOnly`,
  });
}

// ===================================================
//  RESPONSE FILE STREAM
// ===================================================
// inspect or modify chunks of the response stream
function streamFile(req, res, relativefilePath) {
  const reader = createReadStream(relativefilePath);
  reader.on("open", () => {
    handleHeaders(res, relativefilePath);
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
  // opitional access to headers
  // for (const key in req.headers) {
  //   console.log(key, req.headers[key]);
  // }

  if (!allowedMethods.includes(req.method)) {
    methodNotAllowed(res);
    return;
  }

  // the only route we need to intercept is the root
  // else we map 1:1 to the file system
  let file = req.url;
  if (file === "/") {
    file = "/public/index.html";
  }

  const fullPath = join(__dirname,file)
  streamFile(req, res, fullPath);
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
// HELPER FUNCTIONS
// ========================================================
function log(tag, ...t) {
  tag = tag.toUpperCase();
  console.log(tag, ...t);
}

// ===================================================
// "unhandled" ERROR HANDLING
// ===================================================
process.on("unhandledRejection", (error) => {
  log("unhandledRejection", error.toString());
  throw error;
});

process.on("uncaughtException", (error) => {
  log("uncaughtException", error.toString());
  throw error;
});

// ========================================================
// EXPORTS
// ========================================================
export { startHttp, stopHttp };

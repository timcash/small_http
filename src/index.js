import http from "node:http";
import path from "node:path";
import {createReadStream} from "node:fs";
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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

function handleMimeType(res, filePath) {
  const extention = path.extname(filePath);
  if (!extentionMap[extention]) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return;
  }
  res.writeHead(200, { "Content-Type": extentionMap[extention] });
}

function streamFile(req, res, relativefilePath) {
  log("streamFile", req.method, req.url, relativefilePath);
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
function handleRequest(req, res) {
  const allowedMethods = ["HEAD", "CONNECT", "GET", "POST"];
  if (!allowedMethods.includes(req.method)) {
    methodNotAllowed(res);
    return;
  }
  log("handleRequest",req.method, req.url);
  let file = req.url 
  if (req.url === "/") {
    file = "/public/index.html"
  }
  streamFile(req, res, __dirname+file);
}

// ===================================================
//  HTTP SERVER
// ===================================================
async function startHttp(seed, secret, args) {
  const port = args[2] || 8080;
  const server = http.createServer(handleRequest);
  server.on("clientError", (err, socket) => {
    if (err.code === "ECONNRESET" || !socket.writable) {
      return;
    }
    socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
  });

  const p = new Promise((resolve, reject) => {
  server.listen({ port },() => {
    resolve(server);
    log("HTTP", `Server listening on: http://localhost:${port}`);
  });
  });

  return p
}

function log(tag, ...t) {
  tag = tag.toUpperCase();
  console.log(tag, ...t);
}


startHttp("", "", process.argv);

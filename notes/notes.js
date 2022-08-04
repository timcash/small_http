// ========================================================
// client error
// ========================================================
const http = require('node:http');

const server = http.createServer((req, res) => {
  res.end();
});
server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
server.listen(8000);

// ========================================================
// close idle
// ========================================================
//Added in: v18.2.0
//Closes all connections connected to this server which are not sending a request or waiting for a response.
server.closeIdleConnections();

// ========================================================
// Self restart function
// ========================================================
import childProcess from "node:child_process";
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { watch } from 'node:fs';
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
console.log('__filename', __filename);
let lastWatch = Date.now();
watch(__filename, (eventType, filename) => {
  if(Date.now() - lastWatch < 1000) {
    lastWatch = Date.now();
    console.log('too soon', eventType, filename);
    
    return;
  }
  console.log(`event type is: ${eventType}`);
  console.log('restarting...');
  console.log(`filename provided: ${filename}`);
  childProcess.spawn(process.argv.shift(), process.argv, {
    cwd: process.cwd(),
    detached: true,
    stdio: "inherit",
  });
  process.exit(0);
  // if (filename) {
  //   if (restartHandler) {
  //     clearTimeout(restartHandler);
  //   } else {
  //     restartHandler = setTimeout(() => {

  //       // process.exit(0);
  //     }, 1000);
  //   }
  // } else {
  //   console.log('filename not provided');
  // }
});

// ========================================================
// cookie request
// ========================================================
request.setHeader('content-type', 'text/html');
request.setHeader('Content-Length', Buffer.byteLength(body));
request.setHeader('Cookie', ['type=ninja', 'language=javascript']);
const contentType = request.getHeader('Content-Type');
// 'contentType' is 'text/html'
const contentLength = request.getHeader('Content-Length');
// 'contentLength' is of type number
const cookie = request.getHeader('Cookie');
// 'cookie' is of type string[]


const hasContentType = request.hasHeader('content-type');

request.setHeader('Foo', 'bar');
request.setHeader('Set-Cookie', ['foo=bar', 'bar=baz']);

const headerNames = request.getRawHeaderNames();
// headerNames === ['Foo', 'Set-Cookie']

// ========================================================
// request reused socket request.reusedSocket
// ========================================================

const http = require('node:http');

// Server has a 5 seconds keep-alive timeout by default
http
  .createServer((req, res) => {
    res.write('hello\n');
    res.end();
  })
  .listen(3000);

setInterval(() => {
  // Adapting a keep-alive agent
  http.get('http://localhost:3000', { agent }, (res) => {
    res.on('data', (data) => {
      // Do nothing
    });
  });
}, 5000); // Sending request on 5s interval so it's easy to hit idle timeout



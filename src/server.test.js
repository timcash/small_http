import { request } from "undici";
import {deepEqual} from "node:assert";
import test from "node:test";
// test/hello-world.js
// import {test, equal, pass} from 'tap'
import { startHttp, stopHttp } from "./server.js"

test('server starts', async () => {
    const server = await startHttp();
    deepEqual(server.listening, true);
});

test('get index.html from http server', async () => {
  const { statusCode, headers, trailers, body } = await request(
    "http://localhost:8080/"
  );

  const chunks = [];
  for await (const data of body) {
    chunks.push(data);
  }
  const text = Buffer.concat(chunks).toString();

  deepEqual(statusCode, 200);
  deepEqual(text.includes("hello"), true);
  deepEqual(headers !== undefined, true);
  deepEqual(body !== undefined, true);
});

test('stop the server', async () => {
  const server = await stopHttp();
  deepEqual(server.listening === false, true);
});
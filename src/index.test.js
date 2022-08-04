import { request } from "undici";
import assert from "node:assert";
import test from "node:test";

test('get index.html from http server', async () => {
  const { statusCode, headers, trailers, body } = await request(
    "http://localhost:8080/"
  );
  
  console.log("response received", statusCode);
  console.log("headers", headers);
  
  // access to raw stream
  const chunks = [];
  for await (const data of body) {
    chunks.push(data);
    console.log("data", data);
  }
  console.log("trailers", trailers);
  
  // does text have hello world in it?
  const text = Buffer.concat(chunks).toString();
  assert(text.includes("hello"));
});




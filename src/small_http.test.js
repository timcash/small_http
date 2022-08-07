import { request } from "undici";
import { deepEqual } from "node:assert";
import test from "node:test";
import { chromium } from "playwright";
import { devices } from "@playwright/test";
import { startHttp, stopHttp } from "./small_http.js";

// ========================================================
// START SERVER
// ========================================================
test("server starts", async () => {
  const server = await startHttp();
  deepEqual(server.listening, true);
});

// ========================================================
// SIMPLE GET REQUEST
// ========================================================
test("get index.html from http server", async () => {
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

// ========================================================
// TEST UI WITH REAL BROWSER PLAYWRIGHT
// ========================================================
test("browser goto index.html and get a secure cookie", async () => {
  const browser = await chromium.launch({
    // headless: false,
    // slowMo: 500,
    // devtools: true,
  });
  const iPhone = devices["iPhone 13 Pro Max"];
  const context = await browser.newContext({
    ...iPhone,
  });

  // go to page
  const page = await context.newPage();
  const path = "test.png";
  const response = await page.goto("http://localhost:8080/");

  // verify secure cookie set
  const cookies = await context.cookies(["http://localhost:8080/"]);
  const idCookie = cookies.find((cookie) => cookie.name === "id");
  deepEqual(idCookie.secure, true);
  deepEqual(idCookie.sameSite, "Lax");
  await page.screenshot({ path });

  // await page.goto("https://site.com");
  // await page.locator('textarea[name="message"]').click();
  // await page.locator('textarea[name="message"]').fill("love you");
  // await page.locator('[placeholder="name"]').click();
  // await page.locator('[placeholder="name"]').fill("tim");
  // await page.locator('button:has-text("Send")').click();
  // await expect(page).toHaveURL("https://site.com/api/email");
  // await page.screenshot({ path });
  await browser.close();
});

// ========================================================
// STOP SERVER
// ========================================================
test("stop the server", async () => {
  const server = await stopHttp();
  deepEqual(server.listening === false, true);
});

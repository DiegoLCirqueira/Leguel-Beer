import { chromium } from "@playwright/test";
const [,, url, out, w, h, full] = process.argv;
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2 });
await c.addCookies([{ name: "leguele_maioridade", value: String(Date.now()), url: "http://localhost:3002" }]);
const p = await c.newPage();
await p.goto(url); await p.waitForTimeout(1500);
await p.screenshot({ path: out, fullPage: full === "1" });
await b.close();

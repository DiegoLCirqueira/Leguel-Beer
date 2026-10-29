import { expect, test } from "@playwright/test";

test("API responde GET /health com status ok", async ({ request }) => {
  const response = await request.get("http://localhost:3333/health");

  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: "ok" });
});

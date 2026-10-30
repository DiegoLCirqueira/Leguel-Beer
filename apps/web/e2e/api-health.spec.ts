import { expect, test } from "@playwright/test";

test("API responde GET /health com a API e o banco no ar", async ({ request }) => {
  const response = await request.get("http://localhost:3333/health");

  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: "ok", database: "up" });
});

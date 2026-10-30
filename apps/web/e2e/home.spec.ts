import { expect, test } from "@playwright/test";

test("home mostra o título em viewport de celular", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Leguelé Beer" })).toBeVisible();
});

test("botões e chips têm área de toque de pelo menos 44 × 44 px", async ({ page }) => {
  await page.goto("/");

  const targets = page.locator("main").getByRole("button");
  const count = await targets.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const box = await targets.nth(i).boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

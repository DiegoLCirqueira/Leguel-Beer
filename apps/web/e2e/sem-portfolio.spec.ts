import { test as semConfirmacao } from "@playwright/test";
import { expect, test } from "./support/maior-de-idade";

for (const caminho of ["/boas-vindas", "/termos", "/privacidade", "/entregas", "/criar-conta"]) {
  test(`${caminho} não fala em projeto de portfólio`, async ({ page }) => {
    await page.goto(caminho);

    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expect(page.getByText(/portfólio/i)).toHaveCount(0);
  });
}

semConfirmacao("a pergunta de maioridade não fala em projeto de portfólio", async ({ page }) => {
  await page.goto("/maioridade");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText(/portfólio/i)).toHaveCount(0);
});

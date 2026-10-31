import { expect, test } from "@playwright/test";

test("link de confirmação aberto sem a maioridade confirmada volta para a confirmação", async ({
  page,
}) => {
  await page.goto("/auth/confirmar?token_hash=hash-de-teste&type=signup");

  await expect(page).toHaveURL(/\/maioridade\?retorno=/);
  await page.getByRole("button", { name: "Sim, tenho 18 anos ou mais" }).click();

  await expect(page).toHaveURL(/\/auth\/confirmar\?token_hash=hash-de-teste&type=signup$/);
  await expect(page.getByRole("button", { name: "Confirmar minha conta" })).toBeVisible();
});

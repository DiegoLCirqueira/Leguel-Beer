import { expect, test } from "@playwright/test";

test("no acesso não permitido, Voltar para a página inicial leva de volta à pergunta", async ({
  page,
}) => {
  await page.goto("/maioridade");
  await page.getByRole("button", { name: "Não" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Acesso não permitido" })).toBeVisible();

  const voltar = page.getByRole("button", { name: "Voltar para a página inicial" });
  const caixa = await voltar.boundingBox();
  expect(caixa?.height ?? 0).toBeGreaterThanOrEqual(44);
  await voltar.click();

  await expect(
    page.getByRole("heading", { level: 1, name: "Você tem 18 anos ou mais?" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Sim, tenho 18 anos ou mais" })).toBeVisible();
});

test("depois de voltar, confirmar a maioridade ainda leva à boas-vindas", async ({ page }) => {
  await page.goto("/maioridade");
  await page.getByRole("button", { name: "Não" }).click();
  await page.getByRole("button", { name: "Voltar para a página inicial" }).click();

  await page.getByRole("button", { name: "Sim, tenho 18 anos ou mais" }).click();

  await expect(page).toHaveURL(/\/boas-vindas$/);
});

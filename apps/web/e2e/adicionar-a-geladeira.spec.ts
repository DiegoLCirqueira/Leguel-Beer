import { expect, test } from "./support/maior-de-idade";
import { aguardarRevelacao } from "./support/revelacao";

test.use({ isMobile: false, hasTouch: false, viewport: { width: 390, height: 844 } });

test.beforeEach(async ({ context, baseURL }) => {
  await context.addCookies([
    { name: "leguele_convidado", value: "1", url: baseURL ?? "http://localhost:3000" },
  ]);
});

test("o convidado adiciona pelo card, vê o toast, o contador sobe e continua lá ao recarregar; o Desfazer volta", async ({
  page,
}) => {
  await page.goto("/catalogo");
  await aguardarRevelacao(page);
  await expect(page.getByRole("link", { name: "Geladeira, 0 unidades" })).toBeVisible();

  await page.getByRole("button", { name: "Adicionar", exact: true }).first().click();
  await expect(page.getByText(/foi para a geladeira/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Geladeira, 1 unidade" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("link", { name: "Geladeira, 1 unidade" })).toBeVisible();

  await page.getByRole("button", { name: "Adicionar", exact: true }).first().click();
  await expect(page.getByRole("link", { name: "Geladeira, 2 unidades" })).toBeVisible();
  await page.getByRole("button", { name: "Desfazer" }).click();
  await expect(page.getByRole("link", { name: "Geladeira, 1 unidade" })).toBeVisible();
});

test("na página do produto, a quantidade escolhida vai para a Geladeira pelo botão fixo", async ({
  page,
}) => {
  await page.goto("/catalogo/mare-alta");
  await aguardarRevelacao(page);

  const mais = page.getByRole("button", { name: "Aumentar quantidade" });
  await mais.click();
  await mais.click();
  await page.getByRole("button", { name: "Adicionar à geladeira" }).click();

  await expect(page.getByText("Maré Alta foi para a geladeira")).toBeVisible();
  await expect(page.getByRole("link", { name: "Geladeira, 3 unidades" })).toBeVisible();
});

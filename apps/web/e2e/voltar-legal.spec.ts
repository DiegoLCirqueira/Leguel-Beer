import { expect, test } from "./support/maior-de-idade";

test.use({ viewport: { width: 360, height: 780 } });

for (const caminho of ["/termos", "/privacidade", "/entregas"]) {
  test(`${caminho}: o botão Voltar fica no topo, tem 44 px e leva à boas-vindas em link direto`, async ({
    page,
  }) => {
    await page.goto(caminho);
    const voltar = page.getByRole("link", { name: "Voltar" });
    const titulo = page.getByRole("heading", { level: 1 });

    const caixa = await voltar.boundingBox();
    const caixaTitulo = await titulo.boundingBox();
    expect(caixa?.width ?? 0).toBeGreaterThanOrEqual(44);
    expect(caixa?.height ?? 0).toBeGreaterThanOrEqual(44);
    expect((caixa?.y ?? 999) + (caixa?.height ?? 0)).toBeLessThanOrEqual(caixaTitulo?.y ?? 0);

    await voltar.click();

    await expect(page).toHaveURL(/\/boas-vindas$/);
  });
}

test("termos aberto pelo rodapé de outra página voltam para ela, na história", async ({ page }) => {
  await page.goto("/entrar");
  await page.getByRole("contentinfo").getByRole("link", { name: "Termos de Uso" }).click();
  await expect(page).toHaveURL(/\/termos$/);

  await page.getByRole("link", { name: "Voltar" }).click();

  await expect(page).toHaveURL(/\/entrar$/);
});

test("termos abertos em nova aba pelo cadastro levam de volta ao /criar-conta, sem apagar o formulário", async ({
  page,
}) => {
  await page.goto("/criar-conta");
  await page.getByLabel("Nome completo").fill("Ana Souza");

  const [aba] = await Promise.all([
    page.context().waitForEvent("page"),
    page.locator("main").getByRole("link", { name: "Termos de Uso" }).click(),
  ]);
  await aba.waitForLoadState();
  await expect(aba).toHaveURL(/\/termos$/);
  await aba.getByRole("link", { name: "Voltar" }).click();

  await expect(aba).toHaveURL(/\/criar-conta$/);
  await expect(page.getByLabel("Nome completo")).toHaveValue("Ana Souza");
});

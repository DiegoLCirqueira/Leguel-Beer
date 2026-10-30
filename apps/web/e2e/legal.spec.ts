import { expect, test } from "@playwright/test";

const FAIXA = "Projeto de portfólio · pagamentos em modo de teste";

test.use({ viewport: { width: 360, height: 780 } });

for (const caminho of ["/boas-vindas", "/termos", "/privacidade", "/entregas"]) {
  test(`a faixa de portfólio fica no topo de ${caminho}`, async ({ page }) => {
    await page.goto(caminho);

    const faixa = page.getByText(FAIXA);
    await expect(faixa).toBeVisible();
    const caixa = await faixa.boundingBox();
    expect(caixa?.y).toBeLessThanOrEqual(1);
    await expect(page.getByRole("button", { name: /fechar/i })).toHaveCount(0);
  });
}

test("a faixa continua no topo depois de rolar a página", async ({ page }) => {
  await page.goto("/termos");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  const caixa = await page.getByText(FAIXA).boundingBox();

  expect(caixa?.y).toBeLessThanOrEqual(1);
});

test("o rodapé da boas-vindas aparece ao rolar até o fim, com avisos, links e dados fictícios", async ({
  page,
}) => {
  await page.goto("/boas-vindas");
  const rodape = page.getByRole("contentinfo");
  await rodape.scrollIntoViewIfNeeded();

  await expect(rodape.getByText("Aprecie com moderação.")).toBeVisible();
  await expect(rodape.getByText("Venda proibida para menores de 18 anos.")).toBeVisible();
  await expect(rodape.getByRole("link", { name: "Termos de Uso" })).toBeVisible();
  await expect(rodape.getByRole("link", { name: "Política de Privacidade" })).toBeVisible();
  await expect(rodape.getByRole("link", { name: "Entregas" })).toBeVisible();
  await expect(
    rodape.getByText(/empresa fictícia.*CNPJ 00\.000\.000\/0001-00 \(fictício\)/),
  ).toBeVisible();
});

test("os links do rodapé levam às páginas legais", async ({ page }) => {
  await page.goto("/boas-vindas");

  await page.getByRole("contentinfo").getByRole("link", { name: "Termos de Uso" }).click();

  await expect(page).toHaveURL(/\/termos$/);
  await expect(page.getByRole("heading", { level: 1, name: "Termos de Uso" })).toBeVisible();
});

for (const [caminho, titulo] of [
  ["/termos", "Termos de Uso"],
  ["/privacidade", "Política de Privacidade"],
  ["/entregas", "Entregas"],
] as const) {
  test(`${caminho} mostra a data da última atualização e não tem rolagem horizontal`, async ({
    page,
  }) => {
    await page.goto(caminho);

    await expect(page.getByRole("heading", { level: 1, name: titulo })).toBeVisible();
    await expect(page.getByText(/^Última atualização: \d{1,2} de \w+ de \d{4}$/)).toBeVisible();
    const excesso = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(excesso).toBeLessThanOrEqual(0);
  });
}

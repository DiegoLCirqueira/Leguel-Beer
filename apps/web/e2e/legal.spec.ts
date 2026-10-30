import { test as semConfirmacao } from "@playwright/test";
import { expect, test } from "./support/maior-de-idade";

test.use({ viewport: { width: 360, height: 780 } });
semConfirmacao.use({ viewport: { width: 360, height: 780 } });

test("o rodapé das páginas legais traz avisos, links e dados fictícios", async ({ page }) => {
  await page.goto("/termos");
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

test("os links do rodapé levam às outras páginas legais", async ({ page }) => {
  await page.goto("/termos");

  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Política de Privacidade" })
    .click();

  await expect(page).toHaveURL(/\/privacidade$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Política de Privacidade" }),
  ).toBeVisible();
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

for (const [caminho, titulo] of [
  ["/termos", "Termos de Uso"],
  ["/privacidade", "Política de Privacidade"],
] as const) {
  semConfirmacao(`${caminho} abre sem a pergunta de maioridade`, async ({ page }) => {
    await page.goto(caminho);

    await expect(page).toHaveURL(new RegExp(`${caminho}$`));
    await expect(page.getByRole("heading", { level: 1, name: titulo })).toBeVisible();
    await expect(page.getByText("Você tem 18 anos ou mais?")).toHaveCount(0);
  });
}

semConfirmacao("/entregas continua perguntando a maioridade", async ({ page }) => {
  await page.goto("/entregas");

  await expect(page).toHaveURL(/\/maioridade\?retorno=%2Fentregas$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Você tem 18 anos ou mais?" }),
  ).toBeVisible();
});

for (const viewport of [
  { width: 360, height: 780 },
  { width: 360, height: 640 },
]) {
  semConfirmacao(
    `a pergunta da maioridade cabe sem rolagem em ${viewport.width}x${viewport.height}`,
    async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/maioridade");

      const nao = await page.getByRole("button", { name: "Não" }).boundingBox();
      if (!nao) throw new Error("botão sem caixa");
      expect(nao.y + nao.height).toBeLessThanOrEqual(viewport.height);
      const rolagem = await page.evaluate(
        () => document.documentElement.scrollHeight - window.innerHeight,
      );
      expect(rolagem).toBeLessThanOrEqual(0);
    },
  );
}

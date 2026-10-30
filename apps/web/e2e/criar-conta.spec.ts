import { expect, test } from "./support/maior-de-idade";

test.describe("criar conta em 360x780", () => {
  test.use({ viewport: { width: 360, height: 780 } });

  test("não tem rolagem horizontal", async ({ page }) => {
    await page.goto("/criar-conta");

    const excesso = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(excesso).toBeLessThanOrEqual(0);
  });

  // Links dentro da frase (Termos de Uso, Política de Privacidade) ficam de fora: são texto corrido.
  test("os controles têm área de toque de pelo menos 44 px", async ({ page }) => {
    await page.goto("/criar-conta");

    const controles = [
      page.getByRole("link", { name: "Voltar" }),
      page.getByRole("button", { name: "Mostrar senha" }).first(),
      page.getByRole("button", { name: "Criar conta" }),
      page.getByRole("link", { name: "Entrar" }),
    ];
    for (const controle of controles) {
      const caixa = await controle.boundingBox();
      expect(caixa?.height ?? 0).toBeGreaterThanOrEqual(43);
    }
  });

  test("formulário vazio mostra as mensagens junto de cada campo", async ({ page }) => {
    await page.goto("/criar-conta");

    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(page.getByText("Informe seu nome completo.")).toBeVisible();
    await expect(page.getByText("Informe um e-mail válido.")).toBeVisible();
    await expect(page.getByText("Informe um telefone com DDD.")).toBeVisible();
    await expect(page.getByText("A senha precisa ter pelo menos 8 caracteres.")).toBeVisible();
    await expect(page.getByText("Aceite os termos para criar sua conta.")).toBeVisible();
  });

  test("telefone ganha a máscara e a confirmação diferente é recusada", async ({ page }) => {
    await page.goto("/criar-conta");
    await page.getByLabel("Nome completo").fill("Ana Souza");
    await page.getByLabel("E-mail").fill("ana@exemplo.com");
    await page.getByLabel("Telefone").fill("82999990000");
    await page.getByLabel("Senha", { exact: true }).fill("senha-segura");
    await page.getByLabel("Confirmar senha").fill("outra-senha");
    await page.getByRole("checkbox", { name: /Eu aceito os Termos de Uso/ }).check();

    await expect(page.getByLabel("Telefone")).toHaveValue("(82) 99999-0000");
    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(page.getByText("As senhas não conferem.")).toBeVisible();
  });

  test("os termos abrem em nova aba e o formulário continua preenchido", async ({ page }) => {
    await page.goto("/criar-conta");
    await page.getByLabel("Nome completo").fill("Ana Souza");

    const [aba] = await Promise.all([
      page.context().waitForEvent("page"),
      page.locator("main").getByRole("link", { name: "Termos de Uso" }).click(),
    ]);
    await aba.waitForLoadState();

    expect(aba.url()).toMatch(/\/termos$/);
    await expect(page).toHaveURL(/\/criar-conta$/);
    await expect(page.getByLabel("Nome completo")).toHaveValue("Ana Souza");
  });
});

test.describe("criar conta em 390x844", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("não tem rolagem horizontal", async ({ page }) => {
    await page.goto("/criar-conta");

    const excesso = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(excesso).toBeLessThanOrEqual(0);
  });
});

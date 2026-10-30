import { expect, test } from "./support/maior-de-idade";

test.use({ viewport: { width: 360, height: 780 } });

test("a tela de entrar não tem rolagem horizontal e os controles têm 44 px de toque", async ({
  page,
}) => {
  await page.goto("/entrar");

  const excesso = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(excesso).toBeLessThanOrEqual(0);
  for (const controle of [
    page.getByRole("link", { name: "Voltar" }),
    page.getByRole("button", { name: "Mostrar senha" }),
    page.getByRole("link", { name: "Esqueci minha senha" }),
    page.getByRole("button", { name: "Entrar" }),
    page.getByRole("link", { name: "Criar conta" }).first(),
  ]) {
    const caixa = await controle.boundingBox();
    expect(caixa?.height ?? 0).toBeGreaterThanOrEqual(43);
  }
});

test("formulário vazio mostra as mensagens e leva o foco ao primeiro campo", async ({ page }) => {
  await page.goto("/entrar");

  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page.getByText("Informe um e-mail válido.")).toBeVisible();
  await expect(page.getByText("Informe sua senha.")).toBeVisible();
  await expect(page.getByLabel("E-mail")).toBeFocused();
});

test("Manter-me conectado vem marcado, ou desmarcado quando a boas-vindas manda 0", async ({
  page,
}) => {
  await page.goto("/entrar");
  await expect(page.getByRole("checkbox", { name: "Manter-me conectado" })).toBeChecked();

  await page.goto("/entrar?manter-conectado=0");
  await expect(page.getByRole("checkbox", { name: "Manter-me conectado" })).not.toBeChecked();
});

test("da boas-vindas, Entrar leva a escolha de Manter-me conectado para a tela de entrar", async ({
  page,
}) => {
  await page.goto("/boas-vindas");
  await page.getByRole("checkbox", { name: "Manter-me conectado" }).uncheck();

  await page.getByRole("link", { name: "Entrar" }).click();

  await expect(page).toHaveURL(/\/entrar\?manter-conectado=0$/);
  await expect(page.getByRole("checkbox", { name: "Manter-me conectado" })).not.toBeChecked();
});

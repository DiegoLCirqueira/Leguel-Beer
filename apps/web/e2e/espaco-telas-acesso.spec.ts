import { expect, test } from "./support/maior-de-idade";

test.use({ viewport: { width: 390, height: 844 } });

test("em criar conta, 'Já tem uma conta?' e 'Entrar' ficam na mesma linha", async ({ page }) => {
  await page.goto("/criar-conta");

  const pergunta = await page.getByText("Já tem uma conta?").boundingBox();
  const entrar = await page.getByRole("link", { name: "Entrar", exact: true }).last().boundingBox();

  expect(pergunta).not.toBeNull();
  expect(entrar).not.toBeNull();
  const centroPergunta = (pergunta?.y ?? 0) + (pergunta?.height ?? 0) / 2;
  const centroEntrar = (entrar?.y ?? 0) + (entrar?.height ?? 0) / 2;
  expect(Math.abs(centroPergunta - centroEntrar)).toBeLessThanOrEqual(4);
  expect(entrar?.x ?? 0).toBeGreaterThan((pergunta?.x ?? 0) + (pergunta?.width ?? 0) - 1);
});

test("em criar conta, 'Já tem uma conta? Entrar' fica visível sem rolar a página", async ({
  page,
}) => {
  await page.goto("/criar-conta");

  const entrar = await page.getByRole("link", { name: "Entrar", exact: true }).last().boundingBox();

  expect(entrar).not.toBeNull();
  expect((entrar?.y ?? 0) + (entrar?.height ?? 0)).toBeLessThanOrEqual(844);
});

test("em entrar, a borda de baixo de 'Criar conta' fica a no máximo 48 px do fim da tela", async ({
  page,
}) => {
  await page.goto("/entrar");

  const criar = await page.getByRole("link", { name: "Criar conta" }).boundingBox();

  expect(criar).not.toBeNull();
  const folga = 844 - ((criar?.y ?? 0) + (criar?.height ?? 0));
  expect(folga).toBeGreaterThanOrEqual(0);
  expect(folga).toBeLessThanOrEqual(48);
});

test("em nova senha, o botão 'Salvar nova senha' fica a no máximo 96 px do fim da tela", async ({
  page,
}) => {
  await page.goto("/nova-senha?token_hash=abc&type=recovery");

  const botao = await page.getByRole("button", { name: "Salvar nova senha" }).boundingBox();

  expect(botao).not.toBeNull();
  const folga = 844 - ((botao?.y ?? 0) + (botao?.height ?? 0));
  expect(folga).toBeGreaterThanOrEqual(0);
  expect(folga).toBeLessThanOrEqual(96);
});

import { expect, test } from "./support/maior-de-idade";

test.use({ viewport: { width: 390, height: 844 } });

test("em criar conta, 'Já tem uma conta?' e 'Entrar' ficam na mesma linha", async ({ page }) => {
  await page.goto("/criar-conta");

  const pergunta = await page.getByText("Já tem uma conta?").boundingBox();
  const entrar = await page
    .getByRole("link", { name: "Entrar", exact: true })
    .last()
    .boundingBox();

  expect(pergunta).not.toBeNull();
  expect(entrar).not.toBeNull();
  const centroPergunta = (pergunta?.y ?? 0) + (pergunta?.height ?? 0) / 2;
  const centroEntrar = (entrar?.y ?? 0) + (entrar?.height ?? 0) / 2;
  expect(Math.abs(centroPergunta - centroEntrar)).toBeLessThanOrEqual(4);
  expect(entrar?.x ?? 0).toBeGreaterThan((pergunta?.x ?? 0) + (pergunta?.width ?? 0) - 1);
});

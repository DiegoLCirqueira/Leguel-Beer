import { expect, test } from "./support/maior-de-idade";

test.use({ isMobile: false, hasTouch: false });

test("com zoom de 200% (195x422), a privacidade não tem rolagem horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 195, height: 422 });
  await page.goto("/privacidade");

  const excesso = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );

  expect(excesso).toBeLessThanOrEqual(0);
});

test("em criar conta, o link Entrar tem alvo de toque de 44 px nos dois lados", async ({
  page,
}) => {
  await page.goto("/criar-conta");

  const caixa = await page.getByRole("link", { name: "Entrar", exact: true }).last().boundingBox();

  expect(caixa?.width ?? 0).toBeGreaterThanOrEqual(44);
  expect(caixa?.height ?? 0).toBeGreaterThanOrEqual(44);
});

import { expect, test } from "./support/maior-de-idade";

test.use({ isMobile: false, hasTouch: false, viewport: { width: 390, height: 844 } });

test.beforeEach(async ({ context, baseURL }) => {
  await context.addCookies([
    { name: "leguele_convidado", value: "1", url: baseURL ?? "http://localhost:3000" },
  ]);
});

test("a home tem cabeçalho com a Geladeira, barra inferior fixa e o rodapé acima da barra no fim", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Geladeira, 0 itens" })).toBeVisible();
  const barra = page.getByRole("navigation", { name: "Menu da loja" });
  await expect(barra).toBeVisible();
  await expect(barra.getByRole("link", { name: "Início" })).toHaveAttribute("aria-current", "page");
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const caixaBarra = await barra.boundingBox();
  const caixaRodape = await page.getByRole("contentinfo").boundingBox();

  expect(caixaBarra).not.toBeNull();
  expect((caixaBarra?.y ?? 0) + (caixaBarra?.height ?? 0)).toBeCloseTo(844, 0);
  expect((caixaRodape?.y ?? 0) + (caixaRodape?.height ?? 0)).toBeLessThanOrEqual(
    (caixaBarra?.y ?? 0) + 1,
  );
  for (const aba of await barra.getByRole("link").all()) {
    const caixa = await aba.boundingBox();
    expect(caixa?.height ?? 0).toBeGreaterThanOrEqual(44);
    expect(caixa?.width ?? 0).toBeGreaterThanOrEqual(44);
  }
});

test("as telas de acesso não têm a barra da loja", async ({ page }) => {
  await page.goto("/entrar");

  await expect(page.getByRole("navigation", { name: "Menu da loja" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Geladeira, / })).toHaveCount(0);
});

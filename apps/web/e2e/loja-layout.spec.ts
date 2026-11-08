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
    (caixaBarra?.y ?? 0) + 0.01,
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

for (const medida of [
  { width: 360, height: 600 },
  { width: 195, height: 422 },
]) {
  test(`em ${medida.width}x${medida.height}, a barra mostra todos os rótulos inteiros e não corta nenhum alvo`, async ({
    page,
  }) => {
    await page.setViewportSize(medida);
    await page.goto("/");
    const barra = page.getByRole("navigation", { name: "Menu da loja" });

    const rotulos = await barra.locator("a span").evaluateAll((spans) =>
      spans.map((s) => ({
        texto: s.textContent,
        cortado: s.scrollWidth > s.clientWidth,
        direita: s.getBoundingClientRect().right,
      })),
    );

    for (const rotulo of rotulos) {
      expect(rotulo.cortado, `rótulo ${rotulo.texto} cortado`).toBe(false);
      expect(rotulo.direita, `rótulo ${rotulo.texto} fora da tela`).toBeLessThanOrEqual(
        medida.width,
      );
    }
    for (const aba of await barra.getByRole("link").all()) {
      const caixa = await aba.boundingBox();
      expect(caixa?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
    const excesso = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(excesso).toBeLessThanOrEqual(0);
  });
}

for (const medida of [
  { width: 667, height: 375 },
  { width: 195, height: 422 },
]) {
  test(`em ${medida.width}x${medida.height}, ao rolar até o fim nenhum controle fica atrás da barra`, async ({
    page,
  }) => {
    await page.setViewportSize(medida);
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const barra = await page.getByRole("navigation", { name: "Menu da loja" }).boundingBox();

    const controles = page.locator("main a, main button, footer a");
    for (const controle of await controles.all()) {
      const caixa = await controle.boundingBox();
      expect((caixa?.y ?? 0) + (caixa?.height ?? 0), "base do controle").toBeLessThanOrEqual(
        (barra?.y ?? 0) + 1,
      );
    }
  });
}

import { expect, test } from "./support/maior-de-idade";

test.use({ isMobile: false, hasTouch: false });

test("em 360x640, 4 cervejas de 1 unidade na mesma prateleira ficam em placas dentro da moldura, sem sobreposição nem rolagem lateral", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/dev/tokens");

  const lager = page.getByRole("region", { name: "Lager" });
  const placas = lager.locator("[data-placa]");
  await expect(placas).toHaveCount(4);
  await placas.first().scrollIntoViewIfNeeded();

  const caixas = [];
  for (const placa of await placas.all()) {
    caixas.push((await placa.boundingBox())!);
    // O ×N segue inteiro e junto da própria placa.
    const em = (await placa.locator("em").boundingBox())!;
    const caixa = caixas[caixas.length - 1]!;
    // O ×N é um selo no canto da placa: passa só alguns px da borda (-right-1), nunca da moldura.
    expect(em.x + em.width).toBeLessThanOrEqual(caixa.x + caixa.width + 6);
    expect(em.x).toBeGreaterThanOrEqual(caixa.x);
  }
  for (let i = 1; i < caixas.length; i++) {
    expect(caixas[i]!.x).toBeGreaterThanOrEqual(caixas[i - 1]!.x + caixas[i - 1]!.width - 0.5);
  }
  const rolagem = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(rolagem).toBeLessThanOrEqual(0);
});

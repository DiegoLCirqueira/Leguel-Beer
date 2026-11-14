import { expect, test } from "./support/maior-de-idade";

test.use({ isMobile: false, hasTouch: false });

test("em 360x640 cada garrafa fantasma tem alvo de toque de pelo menos 44 px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/dev/tokens");

  const fantasmas = page.getByRole("region", { name: "Malt" }).getByRole("link", {
    name: "Adicionar Malt",
  });
  expect(await fantasmas.count()).toBe(4);
  for (const fantasma of await fantasmas.all()) {
    await fantasma.scrollIntoViewIfNeeded();
    const caixa = await fantasma.boundingBox();
    expect(caixa!.width).toBeGreaterThanOrEqual(44);
    expect(caixa!.height).toBeGreaterThanOrEqual(44);
  }
});

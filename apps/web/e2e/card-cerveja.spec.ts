import { expect, test } from "./support/maior-de-idade";

test.use({ isMobile: false, hasTouch: false });

for (const medida of [
  { width: 390, height: 844 },
  { width: 360, height: 600 },
  { width: 195, height: 422 },
]) {
  test(`em ${medida.width}x${medida.height}, o conteúdo de cada card fica dentro dele e o Adicionar tem 44 px`, async ({
    page,
  }) => {
    await page.setViewportSize(medida);
    await page.goto("/dev/tokens");

    const cards = page.getByRole("article");
    expect(await cards.count()).toBe(2);
    for (const card of await cards.all()) {
      await card.scrollIntoViewIfNeeded();
      const caixa = await card.boundingBox();
      const dentro = await card.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return Array.from(el.querySelectorAll("h3, p, span, button"))
          .filter((filho) => {
            if (filho.classList.contains("sr-only")) return false;
            const f = filho.getBoundingClientRect();
            return f.width > 0 && (f.left < r.left - 1 || f.right > r.right + 1);
          })
          .map((f) => f.textContent?.trim().slice(0, 20));
      });
      expect(dentro, "elementos para fora do card").toEqual([]);
      const botao = await card.getByRole("button", { name: "Adicionar" }).boundingBox();
      expect(botao?.height ?? 0).toBeGreaterThanOrEqual(44);
      expect((botao?.x ?? 0) + (botao?.width ?? 0)).toBeLessThanOrEqual(
        (caixa?.x ?? 0) + (caixa?.width ?? 0) + 1,
      );
    }
    const excesso = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(excesso).toBeLessThanOrEqual(0);
  });
}

test("o selo Esgotado fica dentro do card e não cobre o nome nem o botão", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dev/tokens");
  const card = page.getByRole("article").filter({ hasText: "Cupuaçu Ale" });
  await card.scrollIntoViewIfNeeded();

  const selo = await card.getByText("Esgotado").boundingBox();
  const nome = await card.getByRole("heading").boundingBox();
  const botao = await card.getByRole("button", { name: "Adicionar" }).boundingBox();

  expect((selo?.y ?? 0) + (selo?.height ?? 0)).toBeLessThanOrEqual(nome?.y ?? 0);
  expect((selo?.y ?? 0) + (selo?.height ?? 0)).toBeLessThanOrEqual(botao?.y ?? 0);
});

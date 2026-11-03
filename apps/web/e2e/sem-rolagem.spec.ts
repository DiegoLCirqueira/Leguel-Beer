import { expect, test } from "./support/maior-de-idade";

// O modo móvel esconde a barra de rolagem e mascara o problema: estes testes rodam sem ele.
test.use({ viewport: { width: 390, height: 844 }, isMobile: false, hasTouch: false });

test("a barra de rolagem não ocupa espaço (estilo) e a página longa ainda rola pelo teclado", async ({
  page,
}) => {
  await page.goto("/termos");

  // O Chromium sem janela esconde a barra por conta própria; por isso a medida é o estilo aplicado.
  const estilo = await page.evaluate(
    () => getComputedStyle(document.documentElement).scrollbarWidth,
  );
  expect(estilo).toBe("none");

  await page.keyboard.press("End");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});

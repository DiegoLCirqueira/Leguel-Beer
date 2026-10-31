import { expect, test } from "./support/maior-de-idade";

// O rodapé é um detalhe: texto de 12 px, pouco espaço, links em linha e na cor texto-suave.
for (const caminho of ["/criar-conta", "/termos"]) {
  test(`o rodapé de ${caminho} é pequeno e discreto em 360x780`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto(caminho);
    const rodape = page.getByRole("contentinfo");
    await rodape.scrollIntoViewIfNeeded();

    const caixa = await rodape.boundingBox();
    expect(caixa?.height ?? 999, "altura do rodapé").toBeLessThanOrEqual(80);

    // Texto no piso de 12 px e na cor texto-suave (#a9bfa0).
    const estilos = await rodape.evaluate((el) => {
      const itens = Array.from(el.querySelectorAll("p, a, span"));
      return itens.map((e) => ({
        tamanho: getComputedStyle(e).fontSize,
        cor: getComputedStyle(e).color,
      }));
    });
    for (const { tamanho, cor } of estilos) {
      expect(tamanho).toBe("12px");
      expect(cor).toBe("rgb(169, 191, 160)");
    }

    // Os três links na mesma linha, cada um com área de toque de pelo menos 24 px (WCAG 2.5.8).
    const links = rodape.getByRole("link");
    await expect(links).toHaveCount(3);
    const caixas = await links.evaluateAll((els) =>
      els.map((e) => {
        const r = e.getBoundingClientRect();
        return { y: r.y, w: r.width, h: r.height };
      }),
    );
    for (const l of caixas) {
      expect(l.h, "altura do link").toBeGreaterThanOrEqual(24);
      expect(l.w, "largura do link").toBeGreaterThanOrEqual(24);
      expect(Math.abs(l.y - (caixas[0]?.y ?? 0)), "links na mesma linha").toBeLessThan(2);
    }
    await expect(rodape.getByText("·", { exact: true }).first()).toBeVisible();
  });
}

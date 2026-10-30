import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 360, height: 640 },
  { width: 390, height: 700 },
  { width: 360, height: 740 },
  { width: 360, height: 780 },
  { width: 390, height: 844 },
]) {
  test(`a folhagem da base não passa por cima dos avisos em ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/maioridade");
    const folhagem = await page.locator('img[src*="folhagem-base"]').boundingBox();
    if (!folhagem) throw new Error("folhagem sem caixa");

    for (const aviso of ["Aprecie com moderação.", "Venda proibida para menores de 18 anos."]) {
      const caixa = await page.getByText(aviso).boundingBox();
      if (!caixa) throw new Error(`${aviso} sem caixa`);
      const seCruzam =
        caixa.x < folhagem.x + folhagem.width &&
        caixa.x + caixa.width > folhagem.x &&
        caixa.y < folhagem.y + folhagem.height &&
        caixa.y + caixa.height > folhagem.y;
      expect(seCruzam, `${aviso} cruza a folhagem`).toBe(false);
    }
  });
}

import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 360, height: 640 },
  { width: 390, height: 700 },
  { width: 360, height: 740 },
  { width: 360, height: 780 },
  { width: 390, height: 844 },
]) {
  test(`a folhagem da base não passa por cima dos botões em ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/maioridade");
    const folhagem = await page.locator('img[src*="folhagem-base"]').boundingBox();
    if (!folhagem) throw new Error("folhagem sem caixa");

    for (const nome of ["Sim, tenho 18 anos ou mais", "Não"]) {
      const caixa = await page.getByRole("button", { name: nome }).boundingBox();
      if (!caixa) throw new Error(`${nome} sem caixa`);
      const seCruzam =
        caixa.x < folhagem.x + folhagem.width &&
        caixa.x + caixa.width > folhagem.x &&
        caixa.y < folhagem.y + folhagem.height &&
        caixa.y + caixa.height > folhagem.y;
      expect(seCruzam, `${nome} cruza a folhagem`).toBe(false);
    }
  });
}

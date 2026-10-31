import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./support/maior-de-idade";

const luminancia = ([r, g, b]: number[]) => {
  const canal = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(r!) + 0.7152 * canal(g!) + 0.0722 * canal(b!);
};
const contraste = (a: number[], b: number[]) => {
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro! + 0.05) / (escuro! + 0.05);
};

// Pixels do fundo do botão, em quatro pontos longe do ícone (como a pessoa o vê, sobre a folhagem).
async function amostrarFundo(page: Page, botao: Locator): Promise<number[][]> {
  const png = (await botao.screenshot()).toString("base64");
  return page.evaluate(async (base64) => {
    const imagem = new Image();
    imagem.src = `data:image/png;base64,${base64}`;
    await imagem.decode();
    const tela = document.createElement("canvas");
    tela.width = imagem.width;
    tela.height = imagem.height;
    const ctx = tela.getContext("2d")!;
    ctx.drawImage(imagem, 0, 0);
    return [
      [0.22, 0.5],
      [0.78, 0.5],
      [0.5, 0.22],
      [0.5, 0.78],
    ].map(([x, y]) =>
      Array.from(
        ctx.getImageData(Math.round(imagem.width * x!), Math.round(imagem.height * y!), 1, 1).data,
      ).slice(0, 3),
    );
  }, png);
}

const ICONE_PRIMARIA = [149, 220, 80]; // token primaria (#95DC50)

for (const caminho of ["/criar-conta", "/entrar"]) {
  for (const { w, h } of [
    { w: 320, h: 568 },
    { w: 360, h: 780 },
    { w: 390, h: 844 },
    { w: 412, h: 915 },
  ]) {
    test(`o botão de voltar de ${caminho} se destaca sobre a folhagem em ${w}x${h}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto(caminho);
      const voltar = page.getByRole("link", { name: "Voltar" });
      await expect(voltar).toBeVisible();
      await page.evaluate(() => document.fonts.ready);

      // Área de toque de 44 px.
      const caixa = await voltar.boundingBox();
      expect(caixa?.width ?? 0).toBeGreaterThanOrEqual(44);
      expect(caixa?.height ?? 0).toBeGreaterThanOrEqual(44);

      // Fundo quase opaco (token arte-vidro) e borda de 2 px: não depende da folhagem atrás.
      const estilo = await voltar.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { fundo: cs.backgroundColor, borda: cs.borderTopWidth };
      });
      const alfa = Number(estilo.fundo.match(/rgba?\(([^)]*)\)/)?.[1]?.split(",")[3] ?? 1);
      expect(alfa, `fundo ${estilo.fundo}`).toBeGreaterThanOrEqual(0.85);
      expect(estilo.fundo).not.toBe("rgba(0, 0, 0, 0)");
      expect(parseFloat(estilo.borda)).toBeGreaterThanOrEqual(2);

      // O ícone (primaria) lê bem sobre o que se vê atrás dele: contraste AA de componente (3:1)
      // com margem; usamos 4,5:1.
      for (const pixel of await amostrarFundo(page, voltar)) {
        expect(contraste(ICONE_PRIMARIA, pixel), `fundo ${pixel}`).toBeGreaterThanOrEqual(4.5);
      }
    });
  }

  test(`o botão de voltar de ${caminho} mostra o foco do teclado`, async ({ page }) => {
    await page.goto(caminho);
    await page.keyboard.press("Tab");

    const voltar = page.getByRole("link", { name: "Voltar" });
    await expect(voltar).toBeFocused();
    const contorno = await voltar.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { estilo: cs.outlineStyle, largura: cs.outlineWidth };
    });
    expect(contorno.estilo).not.toBe("none");
    expect(parseFloat(contorno.largura)).toBeGreaterThanOrEqual(2);
  });
}

import { expect, test } from "./support/maior-de-idade";

test.use({ isMobile: false, hasTouch: true });

const MEDIDAS = [
  { width: 180, height: 390 },
  { width: 195, height: 422 },
  { width: 360, height: 599 },
];

for (const medida of MEDIDAS) {
  test.describe(`boas-vindas em ${medida.width}x${medida.height}`, () => {
    test.use({ viewport: medida });

    test("o texto de cada ação fica dentro da própria caixa, numa linha, sem invadir o vizinho", async ({
      page,
    }) => {
      await page.goto("/boas-vindas");
      const nomes = ["Entrar", "Criar conta", "Continuar como convidado"];

      const caixas = await page.evaluate((textos) => {
        return textos.map((texto) => {
          const link = Array.from(document.querySelectorAll("main a")).find(
            (a) => a.textContent?.trim() === texto,
          ) as HTMLElement;
          const caixa = link.getBoundingClientRect();
          const intervalo = document.createRange();
          const no = Array.from(link.childNodes).find(
            (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim() === texto,
          ) as Text;
          intervalo.selectNodeContents(no);
          const linhas = Array.from(intervalo.getClientRects());
          return {
            texto,
            caixa: { top: caixa.top, bottom: caixa.bottom, left: caixa.left, right: caixa.right },
            linhas: linhas.map((l) => ({
              top: l.top,
              bottom: l.bottom,
              left: l.left,
              right: l.right,
            })),
          };
        });
      }, nomes);

      for (const { texto, caixa, linhas } of caixas) {
        expect(linhas.length, `${texto}: texto em uma linha`).toBe(1);
        const [linha] = linhas;
        expect(linha?.top ?? 0, `${texto}: topo`).toBeGreaterThanOrEqual(caixa.top - 1);
        expect(linha?.bottom ?? 0, `${texto}: base`).toBeLessThanOrEqual(caixa.bottom + 1);
        expect(linha?.left ?? 0, `${texto}: esquerda`).toBeGreaterThanOrEqual(caixa.left - 1);
        expect(linha?.right ?? 0, `${texto}: direita`).toBeLessThanOrEqual(caixa.right + 1);
      }
    });
  });
}

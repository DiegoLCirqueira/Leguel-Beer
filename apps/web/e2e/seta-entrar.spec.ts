import type { Locator } from "@playwright/test";
import { expect, test } from "./support/maior-de-idade";

test.use({ viewport: { width: 390, height: 844 } });

type Medidas = { folgaDireita: number; desvioVertical: number; traco: string | null };

/** Posição da seta dentro do botão: folga até a borda direita, desvio do centro vertical e traço. */
async function medirSeta(botao: Locator): Promise<Medidas> {
  return botao.evaluate((el) => {
    const caixa = el.getBoundingClientRect();
    const seta = el.querySelector("svg:last-of-type") as SVGElement;
    const s = seta.getBoundingClientRect();
    return {
      folgaDireita: caixa.right - s.right,
      desvioVertical: s.top + s.height / 2 - (caixa.top + caixa.height / 2),
      traco: seta.getAttribute("stroke-width"),
    };
  });
}

test("em entrar, a seta do botão fica como na boas-vindas: na borda direita, centrada e com o mesmo traço", async ({
  page,
}) => {
  await page.goto("/boas-vindas");
  const naBoasVindas = await medirSeta(page.getByRole("link", { name: "Entrar" }));

  await page.goto("/entrar");
  const emEntrar = await medirSeta(page.getByRole("button", { name: "Entrar" }));

  expect(emEntrar.traco).toBe(naBoasVindas.traco);
  expect(Math.abs(emEntrar.desvioVertical)).toBeLessThanOrEqual(1);
  expect(Math.abs(emEntrar.folgaDireita - naBoasVindas.folgaDireita)).toBeLessThanOrEqual(3);
});

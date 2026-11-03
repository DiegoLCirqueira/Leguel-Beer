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

test("em entrar, o divisor 'ou' fica entre o botão Entrar e o convite para criar conta", async ({
  page,
}) => {
  await page.goto("/entrar");

  const botao = await page.getByRole("button", { name: "Entrar" }).boundingBox();
  const ou = await page.getByText("ou", { exact: true }).boundingBox();
  const pergunta = await page.getByText("Ainda não tem conta?").boundingBox();

  expect(ou).not.toBeNull();
  expect(ou?.y ?? 0).toBeGreaterThanOrEqual((botao?.y ?? 0) + (botao?.height ?? 0));
  expect((ou?.y ?? 0) + (ou?.height ?? 0)).toBeLessThanOrEqual(pergunta?.y ?? 0);
});

test("em entrar, 'Ainda não tem conta?' e 'Criar conta' ficam na mesma linha, com 44 px de toque", async ({
  page,
}) => {
  await page.goto("/entrar");

  const pergunta = await page.getByText("Ainda não tem conta?").boundingBox();
  const criar = await page.getByRole("link", { name: "Criar conta" }).boundingBox();

  const centroPergunta = (pergunta?.y ?? 0) + (pergunta?.height ?? 0) / 2;
  const centroCriar = (criar?.y ?? 0) + (criar?.height ?? 0) / 2;
  expect(Math.abs(centroPergunta - centroCriar)).toBeLessThanOrEqual(4);
  expect(criar?.x ?? 0).toBeGreaterThan((pergunta?.x ?? 0) + (pergunta?.width ?? 0) - 1);
  expect(criar?.height ?? 0).toBeGreaterThanOrEqual(44);
});

import type { Locator } from "@playwright/test";
import { expect, test } from "./support/maior-de-idade";

test.use({ viewport: { width: 390, height: 844 } });

test("em criar conta, 'Já tem uma conta?' e 'Entrar' ficam na mesma linha", async ({ page }) => {
  await page.goto("/criar-conta");

  const pergunta = await page.getByText("Já tem uma conta?").boundingBox();
  const entrar = await page.getByRole("link", { name: "Entrar", exact: true }).last().boundingBox();

  expect(pergunta).not.toBeNull();
  expect(entrar).not.toBeNull();
  const centroPergunta = (pergunta?.y ?? 0) + (pergunta?.height ?? 0) / 2;
  const centroEntrar = (entrar?.y ?? 0) + (entrar?.height ?? 0) / 2;
  expect(Math.abs(centroPergunta - centroEntrar)).toBeLessThanOrEqual(4);
  expect(entrar?.x ?? 0).toBeGreaterThan((pergunta?.x ?? 0) + (pergunta?.width ?? 0) - 1);
});

test("em criar conta, 'Já tem uma conta? Entrar' vem no fim, abaixo do botão Criar conta", async ({
  page,
}) => {
  await page.goto("/criar-conta");

  const botao = await page.getByRole("button", { name: "Criar conta" }).boundingBox();
  const entrar = await page.getByRole("link", { name: "Entrar", exact: true }).last().boundingBox();

  expect(botao).not.toBeNull();
  expect(entrar).not.toBeNull();
  expect(entrar?.y ?? 0).toBeGreaterThanOrEqual((botao?.y ?? 0) + (botao?.height ?? 0));
});

type Caixa = { top: number; bottom: number };

/** Caixas dos blocos da tela, de cima para baixo; falha se algum não estiver na tela. */
async function caixasDosBlocos(blocos: Locator[]): Promise<Caixa[]> {
  const caixas: Caixa[] = [];
  for (const bloco of blocos) {
    const caixa = await bloco.boundingBox();
    if (!caixa) throw new Error("bloco sem caixa");
    caixas.push({ top: caixa.y, bottom: caixa.y + caixa.height });
  }
  return caixas;
}

/** Vão de 24 a 48 px entre blocos vizinhos e o grupo centralizado na área do conteúdo principal. */
function esperarGrupoAgrupadoECentralizado(caixas: Caixa[], area: Caixa) {
  for (let i = 1; i < caixas.length; i++) {
    const vao = (caixas[i]?.top ?? 0) - (caixas[i - 1]?.bottom ?? 0);
    expect(vao, `vão entre o bloco ${i} e o anterior`).toBeGreaterThanOrEqual(24);
    expect(vao, `vão entre o bloco ${i} e o anterior`).toBeLessThanOrEqual(48);
  }
  const acima = (caixas[0]?.top ?? 0) - area.top;
  const abaixo = area.bottom - (caixas[caixas.length - 1]?.bottom ?? 0);
  expect(acima).toBeGreaterThanOrEqual(0);
  expect(abaixo).toBeGreaterThanOrEqual(0);
  expect(Math.abs(acima - abaixo), "espaço livre repartido em cima e embaixo").toBeLessThanOrEqual(
    12,
  );
}

test("em entrar, os blocos ficam a 24-48 px um do outro e o grupo centralizado na altura", async ({
  page,
}) => {
  await page.goto("/entrar");

  const caixas = await caixasDosBlocos([
    page.getByRole("img", { name: "Leguelé Beer" }),
    page.locator("main header"),
    page.locator("main form > div").first(),
    page.getByRole("button", { name: "Entrar" }),
    page.locator("main form > div").last(),
  ]);

  const [area] = await caixasDosBlocos([page.getByRole("main")]);
  esperarGrupoAgrupadoECentralizado(caixas, area as Caixa);
});

test("em nova senha, os blocos ficam a 24-48 px um do outro e o grupo centralizado na altura", async ({
  page,
}) => {
  await page.goto("/nova-senha?token_hash=abc&type=recovery");

  const caixas = await caixasDosBlocos([
    page.getByRole("img", { name: "Leguelé Beer" }),
    page.locator("main header"),
    page.locator("main form > div").first(),
    page.getByRole("button", { name: "Salvar nova senha" }),
  ]);

  const [area] = await caixasDosBlocos([page.getByRole("main")]);
  esperarGrupoAgrupadoECentralizado(caixas, area as Caixa);
});

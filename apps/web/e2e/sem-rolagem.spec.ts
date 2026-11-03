import type { Page } from "@playwright/test";
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

async function alturaDoDocumento(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollHeight);
}

test("em entrar, o conteúdo e o rodapé cabem na tela de 844 px sem rolagem vertical", async ({
  page,
}) => {
  await page.goto("/entrar");

  expect(await alturaDoDocumento(page)).toBeLessThanOrEqual(844);
});

test("em entrar com o aviso de link inválido (confirmar sem token), cabe sem rolagem vertical", async ({
  page,
}) => {
  await page.goto("/auth/confirmar");

  await expect(page).toHaveURL(/\/entrar\?aviso=link-invalido$/);
  expect(await alturaDoDocumento(page)).toBeLessThanOrEqual(844);
});

test("em nova senha, o conteúdo e o rodapé cabem na tela de 844 px sem rolagem vertical", async ({
  page,
}) => {
  await page.goto("/nova-senha?token_hash=abc&type=recovery");

  expect(await alturaDoDocumento(page)).toBeLessThanOrEqual(844);
});

test("em recuperar senha, o conteúdo e o rodapé cabem na tela de 844 px sem rolagem vertical", async ({
  page,
}) => {
  await page.goto("/recuperar-senha");

  expect(await alturaDoDocumento(page)).toBeLessThanOrEqual(844);
});

test("em confirmar conta, o conteúdo e o rodapé cabem na tela de 844 px sem rolagem vertical", async ({
  page,
}) => {
  await page.goto("/auth/confirmar?token_hash=abc&type=signup");

  expect(await alturaDoDocumento(page)).toBeLessThanOrEqual(844);
});

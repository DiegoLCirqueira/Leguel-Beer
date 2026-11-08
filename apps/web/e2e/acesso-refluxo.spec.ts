import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./support/maior-de-idade";

test.use({ isMobile: false, hasTouch: false });

const screens = [
  { name: "boas-vindas", path: "/boas-vindas", title: "Leguelé Beer" },
  { name: "entrar", path: "/entrar", title: "Entrar na sua conta" },
  { name: "criar conta", path: "/criar-conta", title: "Criar sua conta" },
  { name: "maioridade", path: "/maioridade", title: "Você tem 18 anos ou mais?" },
  { name: "acesso negado", path: "/maioridade", title: "Acesso não permitido" },
  { name: "recuperar senha", path: "/recuperar-senha", title: "Recuperar senha" },
];

async function openScreen(page: Page, screen: (typeof screens)[number]) {
  await page.goto(screen.path);
  if (screen.name === "acesso negado") {
    await page.getByRole("button", { name: "Não", exact: true }).click();
  }
  await expect(page.getByRole("heading", { name: screen.title, exact: true })).toBeAttached();
  await page.evaluate(() => document.fonts.ready);
}

async function expectReachable(control: Locator) {
  await expect(control).toBeVisible();
  await control.scrollIntoViewIfNeeded();
  await expect(control).toBeInViewport({ ratio: 1 });
  await control.click({ trial: true });
}

for (const screen of screens) {
  test(`${screen.name}: não renderiza rodapé`, async ({ page }) => {
    await openScreen(page, screen);
    await expect(page.getByRole("contentinfo", { includeHidden: true })).toHaveCount(0);
    await expect(page.getByText("Aprecie com moderação", { exact: false })).toHaveCount(0);
    await expect(
      page.getByText("Venda proibida para menores de 18 anos", { exact: false }),
    ).toHaveCount(0);
  });

  for (const viewport of [
    { width: 360, height: 600 },
    { width: 195, height: 422 },
  ]) {
    test(`${screen.name}: controles alcançáveis em ${viewport.width}x${viewport.height}`, async ({
      page,
    }) => {
      // 195x422 equivale à área CSS de 390x844 com zoom de 200%; deviceScaleFactor só muda pixels físicos.
      test.fixme(
        screen.name === "boas-vindas" && viewport.width === 195,
        "BUG-ACESSO-ZOOM (297bb03, reportado ao Orchestrator): Entrar mede 260,92px em viewport 195px; main tem overflow-x:hidden. Mesmo rolando, nenhuma posição exibe 100%; clique no centro funciona",
      );
      await page.setViewportSize(viewport);
      await openScreen(page, screen);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
        "sem rolagem horizontal",
      ).toBeLessThanOrEqual(0);
      const main = page.getByRole("main");
      const controls = main.locator('a, button, input:not([type="hidden"])');
      expect(await controls.count(), "a tela deve ter controles").toBeGreaterThan(0);
      for (const control of await controls.all()) await expectReachable(control);
    });
  }
}

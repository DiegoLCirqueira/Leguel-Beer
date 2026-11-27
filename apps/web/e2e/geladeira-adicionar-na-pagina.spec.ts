import { expect, test } from "./support/maior-de-idade";

test.use({ isMobile: false, hasTouch: false, viewport: { width: 360, height: 640 } });

test.describe("Geladeira: adicionar pela garrafa fantasma (360x640)", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await context.addCookies([
      { name: "leguele_convidado", value: "1", url: baseURL ?? "http://localhost:3000" },
    ]);
  });

  test("a fantasma abre a lista na própria página; Adicionar fecha, mostra o toast e a garrafa entra", async ({
    page,
  }) => {
    await page.goto("/geladeira");
    const frutas = page.getByRole("region", { name: "Frutas" });
    await frutas.getByRole("button", { name: "Adicionar Frutas" }).first().click();

    const dialogo = page.getByRole("dialog", { name: "Adicionar Frutas" });
    await expect(dialogo).toBeVisible();
    await expect(page).toHaveURL(/\/geladeira$/);
    await page.screenshot({ path: "test-results/geladeira-lista.png" });
    await dialogo.getByRole("button", { name: "Adicionar", exact: true }).first().click();

    await expect(dialogo).toBeHidden();
    await expect(page.getByText(/foi para a geladeira/)).toBeVisible();
    await expect(frutas.getByText(/1 unidade/)).toBeAttached();
    await page.screenshot({ path: "test-results/geladeira-depois.png" });
  });

  test("Esc fecha a lista e devolve o foco à garrafa tocada", async ({ page }) => {
    await page.goto("/geladeira");
    const fantasma = page
      .getByRole("region", { name: "Malt" })
      .getByRole("button", { name: "Adicionar Malt" })
      .first();
    await fantasma.click();
    await expect(page.getByRole("dialog", { name: "Adicionar Malt" })).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(fantasma).toBeFocused();
  });
});

import { expect, test } from "./support/maior-de-idade";
import { aguardarRevelacao } from "./support/revelacao";

test.use({ isMobile: false, hasTouch: false, viewport: { width: 360, height: 640 } });

test.describe("home: faixa de categorias (360x640)", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await context.addCookies([
      { name: "leguele_convidado", value: "1", url: baseURL ?? "http://localhost:3000" },
    ]);
  });

  test("mostra Todas e as categorias com contagem e tocar em IPAs abre o catálogo filtrado", async ({
    page,
  }) => {
    await page.goto("/");
    await aguardarRevelacao(page);

    const faixa = page.getByRole("navigation", { name: "Categorias" });
    await expect(faixa.getByRole("button", { name: /^Todas \(\d+\)$/ })).toBeVisible();
    const sobra = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(sobra).toBeLessThanOrEqual(0);

    await faixa.getByRole("button", { name: /^IPAs \(\d+\)$/ }).click();

    await expect(page).toHaveURL(/\/catalogo\?categoria=ipa$/);
  });
});

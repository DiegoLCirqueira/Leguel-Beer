import { expect, test } from "./support/maior-de-idade";
import { aguardarRevelacao } from "./support/revelacao";

test.use({ isMobile: false, hasTouch: false, viewport: { width: 360, height: 640 } });

test.describe("home: herói (360x640)", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await context.addCookies([
      { name: "leguele_convidado", value: "1", url: baseURL ?? "http://localhost:3000" },
    ]);
  });

  test("o herói e o botão Ver catálogo cabem na primeira tela, sem rolagem lateral, e o botão abre o catálogo", async ({
    page,
  }) => {
    await page.goto("/");
    await aguardarRevelacao(page);

    await expect(page.getByText("Cervejas artesanais", { exact: true })).toBeInViewport();
    await expect(
      page.getByRole("heading", { level: 2, name: "Sabor de verdade em cada gole!" }),
    ).toBeInViewport();
    const botao = page.getByRole("link", { name: "Ver catálogo" });
    await expect(botao).toBeInViewport({ ratio: 1 });
    const sobra = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(sobra).toBeLessThanOrEqual(0);
    await page.screenshot({ path: "test-results/heroi-360x640.png" });

    await botao.click();

    await expect(page).toHaveURL(/\/catalogo$/);
  });
});

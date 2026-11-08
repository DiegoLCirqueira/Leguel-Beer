import { expect, test } from "./support/maior-de-idade";

test.use({ isMobile: false, hasTouch: false });

for (const medida of [
  { width: 390, height: 844 },
  { width: 195, height: 422 },
  { width: 667, height: 375 },
]) {
  test(`em ${medida.width}x${medida.height}, o sheet cabe na tela e rola por dentro, com o rodapé sempre à vista`, async ({
    page,
  }) => {
    await page.setViewportSize(medida);
    await page.goto("/dev/tokens");
    await page.getByRole("button", { name: "Abrir bottom sheet" }).click();
    const dialogo = page.getByRole("dialog", { name: "Filtros e ordenação" });
    await expect(dialogo).toBeVisible();

    const painel = await dialogo.boundingBox();
    expect((painel?.y ?? -1) >= 0, "topo do painel dentro da tela").toBe(true);
    expect((painel?.y ?? 0) + (painel?.height ?? 0)).toBeLessThanOrEqual(medida.height + 1);
    const aplicar = page.getByRole("button", { name: "Aplicar" });
    await expect(aplicar).toBeInViewport({ ratio: 1 });
    // O conteúdo é maior que o painel nas telas baixas e rola por dentro, sem rolar a página.
    const rolaPorDentro = await dialogo.evaluate((el) => {
      const area = el.querySelector<HTMLElement>(".overflow-y-auto");
      return area ? area.scrollHeight > area.clientHeight : false;
    });
    if (medida.height < 600) expect(rolaPorDentro).toBe(true);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");

    await page.getByLabel("Campo 8").scrollIntoViewIfNeeded();
    await expect(page.getByLabel("Campo 8")).toBeInViewport({ ratio: 1 });
    await expect(aplicar).toBeInViewport({ ratio: 1 });
  });
}

test("o sheet fecha com Esc e no fundo, e o foco volta ao botão que abriu", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dev/tokens");
  const abrir = page.getByRole("button", { name: "Abrir bottom sheet" });

  await abrir.click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(abrir).toBeFocused();

  await abrir.click();
  await page.getByTestId("fundo-do-sheet").click({ position: { x: 5, y: 5 } });
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("o véu do sheet escurece a página: o fundo não é transparente", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dev/tokens");
  await page.getByRole("button", { name: "Abrir bottom sheet" }).click();

  const cor = await page
    .getByTestId("fundo-do-sheet")
    .evaluate((el) => getComputedStyle(el).backgroundColor);

  expect(cor).not.toBe("rgba(0, 0, 0, 0)");
  expect(cor).not.toBe("transparent");
});

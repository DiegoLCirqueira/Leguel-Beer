import { expect, test } from "./support/maior-de-idade";

test.use({ isMobile: false, hasTouch: false });

const TAMANHOS = [
  { width: 360, height: 640 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
];

test.beforeEach(async ({ context, baseURL }) => {
  await context.addCookies([
    { name: "leguele_convidado", value: "1", url: baseURL ?? "http://localhost:3000" },
  ]);
});

for (const tamanho of TAMANHOS) {
  test(`em ${tamanho.width}x${tamanho.height} a Geladeira cabe entre o header e a barra, sem rolagem`, async ({
    page,
  }) => {
    await page.setViewportSize(tamanho);
    await page.goto("/geladeira");

    const moldura = page.getByRole("region", { name: "IPA" }).locator("xpath=..");
    await expect(moldura).toBeVisible();
    const caixa = (await moldura.boundingBox())!;
    const header = (await page.getByRole("banner").boundingBox())!;
    const barra = (await page.getByRole("navigation").last().boundingBox())!;
    expect(caixa.y).toBeGreaterThanOrEqual(header.y + header.height - 1);
    expect(caixa.y + caixa.height).toBeLessThanOrEqual(barra.y + 1);
    expect(caixa.width / caixa.height).toBeCloseTo(710 / 1573, 2);
    const rolagem = await page.evaluate(
      () => document.documentElement.scrollHeight - document.documentElement.clientHeight,
    );
    expect(rolagem).toBeLessThanOrEqual(0);
  });
}

test("em 360x640, com a moldura encolhida, cada garrafa fantasma da Geladeira tem alvo de toque de pelo menos 44 px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/geladeira");

  for (const categoria of ["IPA", "Frutas", "Malt", "Lager"]) {
    const fantasmas = page.getByRole("link", { name: `Adicionar ${categoria}` });
    await expect(fantasmas).toHaveCount(4);
    for (const fantasma of await fantasmas.all()) {
      const caixa = (await fantasma.boundingBox())!;
      expect(caixa.width).toBeGreaterThanOrEqual(44);
      expect(caixa.height).toBeGreaterThanOrEqual(44);
    }
  }
});

test("a fonte da faixa acompanha a largura da moldura, não a da janela", async ({ page }) => {
  const medir = async (tamanho: { width: number; height: number }) => {
    await page.setViewportSize(tamanho);
    await page.goto("/geladeira");
    const faixa = page.getByText("Toque no + para escolher uma IPA");
    await expect(faixa).toBeVisible();
    const moldura = (await page
      .getByRole("region", { name: "IPA" })
      .locator("xpath=..")
      .boundingBox())!;
    const fonte = await faixa.evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
    return { largura: moldura.width, fonte };
  };

  const pequena = await medir({ width: 360, height: 640 });
  const grande = await medir({ width: 430, height: 932 });

  expect(grande.fonte / pequena.fonte).toBeCloseTo(grande.largura / pequena.largura, 1);
});

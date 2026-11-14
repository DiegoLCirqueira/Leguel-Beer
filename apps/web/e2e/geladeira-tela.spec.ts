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

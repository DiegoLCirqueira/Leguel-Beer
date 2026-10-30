import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });

test("o fundo e o logo da maioridade são servidos em qualidade 90 e na largura da tela de DPR 3", async ({
  page,
}) => {
  await page.goto("/maioridade");

  const fundo = page.locator('img[src*="maioridade%2Ffundo.webp"]');
  const logo = page.getByRole("img", { name: "Leguelé Beer" });
  await expect(fundo).toHaveJSProperty("complete", true);
  await expect(logo).toHaveJSProperty("complete", true);

  const urls = await page.evaluate(() =>
    Array.from(document.querySelectorAll("img")).map((imagem) => imagem.currentSrc),
  );
  const urlFundo = urls.find((url) => url.includes("fundo.webp")) ?? "";
  const urlLogo = urls.find((url) => url.includes("logo.webp")) ?? "";
  expect(urlFundo).toContain("q=90");
  expect(urlLogo).toContain("q=90");
  // 390 px x 3 = 1170 px físicos: o fundo vem em 1200 e o logo (128 px x 3) em 384.
  expect(Number(new URL(urlFundo).searchParams.get("w"))).toBeGreaterThanOrEqual(1170);
  expect(Number(new URL(urlLogo).searchParams.get("w"))).toBeGreaterThanOrEqual(384);
});

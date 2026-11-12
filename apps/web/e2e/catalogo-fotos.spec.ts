import { expect, test } from "./support/maior-de-idade";

test("os cards do catálogo mostram a foto da garrafa (com o arquivo no ar) onde ela existe e a imagem padrão onde não", async ({
  page,
}) => {
  await page.goto("/catalogo");

  const foto = page.getByRole("img", { name: "Maré Alta, American IPA" });
  await foto.scrollIntoViewIfNeeded();
  await expect(foto).toBeVisible();
  const origem = await foto.evaluate((img: HTMLImageElement) => img.currentSrc);
  const resposta = await page.request.get(origem);
  expect(resposta.status(), "a foto da garrafa existe em /cervejas").toBe(200);
  expect(resposta.headers()["content-type"]).toMatch(/^image\//);
  // Sem foto ainda (Jaraguá Hazy IPA), o card usa a imagem padrão decorativa.
  await expect(page.getByRole("img", { name: "Jaraguá Hazy IPA, New England IPA" })).toHaveCount(0);
});

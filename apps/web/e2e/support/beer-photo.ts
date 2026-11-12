import { expect, type Locator, type Page } from "@playwright/test";

/** Espera a imagem escolhida pelo navegador e confere o arquivo que ele está exibindo. */
export async function expectBeerPhoto(page: Page, photo: Locator, slug: string) {
  await photo.scrollIntoViewIfNeeded();
  await expect(photo).toBeVisible();
  await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.currentSrc)).not.toBe("");

  const source = await photo.evaluate((img: HTMLImageElement) => img.currentSrc);
  const url = new URL(source);
  expect(url.searchParams.get("url") ?? url.pathname).toBe(`/cervejas/${slug}.webp`);
  const response = await page.request.get(source);
  expect(response.status(), "a foto da garrafa existe em /cervejas").toBe(200);
  expect(response.headers()["content-type"]).toMatch(/^image\//);
  await expect
    .poll(() => photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
    .toBe(true);
}

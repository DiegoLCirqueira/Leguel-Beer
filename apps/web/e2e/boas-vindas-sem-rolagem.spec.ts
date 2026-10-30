import { expect, test } from "./support/maior-de-idade";

for (const { width, height } of [
  { width: 360, height: 780 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
]) {
  test(`a boas-vindas não tem rolagem em ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/boas-vindas");

    const excesso = await page.evaluate(() => ({
      x: document.documentElement.scrollWidth - window.innerWidth,
      y: document.documentElement.scrollHeight - window.innerHeight,
    }));

    expect(excesso.x).toBeLessThanOrEqual(0);
    expect(excesso.y).toBeLessThanOrEqual(0);
    await expect(page.getByRole("contentinfo")).toHaveCount(0);
  });
}

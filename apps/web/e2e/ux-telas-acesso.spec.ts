import { expect, test } from "./support/maior-de-idade";

test.use({ isMobile: false, hasTouch: false });

test("com zoom de 200% (195x422), a privacidade não tem rolagem horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 195, height: 422 });
  await page.goto("/privacidade");

  const excesso = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );

  expect(excesso).toBeLessThanOrEqual(0);
});

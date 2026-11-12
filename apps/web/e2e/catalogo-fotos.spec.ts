import { expect, test } from "./support/maior-de-idade";
import { expectBeerPhoto } from "./support/beer-photo";

test("os cards do catálogo mostram a foto da garrafa (com o arquivo no ar) onde ela existe e a imagem padrão onde não", async ({
  page,
}) => {
  await page.goto("/catalogo");

  const foto = page.getByRole("img", { name: "Maré Alta, American IPA" });
  await expectBeerPhoto(page, foto, "mare-alta");
  // Sem foto ainda (Jaraguá Hazy IPA), o card usa a imagem padrão decorativa.
  const jaragua = page.getByRole("article").filter({
    has: page.getByRole("heading", { level: 3, name: "Jaraguá Hazy IPA", exact: true }),
  });
  await expect(jaragua).toBeVisible();
  await jaragua.scrollIntoViewIfNeeded();
  await expect(jaragua.getByRole("img", { name: "Jaraguá Hazy IPA, New England IPA" })).toHaveCount(
    0,
  );
  await expect(jaragua.locator("img")).toBeVisible();
  await expect(jaragua.locator("img")).toHaveAttribute("alt", "");
});

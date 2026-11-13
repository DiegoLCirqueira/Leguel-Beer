import { expect, test } from "./support/maior-de-idade";
import { expectBeerPhoto } from "./support/beer-photo";

test("os cards do catálogo mostram a foto da garrafa, com o arquivo no ar, nas 16 cervejas", async ({
  page,
}) => {
  await page.goto("/catalogo");

  await expectBeerPhoto(
    page,
    page.getByRole("img", { name: "Maré Alta, American IPA" }),
    "mare-alta",
  );
  // Uma das 7 fotos que entraram depois (antes usava a imagem padrão).
  await expectBeerPhoto(
    page,
    page.getByRole("img", { name: "Jaraguá Hazy IPA, New England IPA" }),
    "jaragua-hazy-ipa",
  );
});

import { expect, test } from "./support/maior-de-idade";

// Contra a API real com o seed do catálogo: 16 cervejas, 4 por categoria, 1 esgotada (Leguelé Comendador).
test.use({ isMobile: false, hasTouch: false, viewport: { width: 390, height: 844 } });

const cards = (page: import("@playwright/test").Page) => page.getByRole("article");

test("os chips mostram o contador de cada categoria e a contagem total", async ({ page }) => {
  await page.goto("/catalogo");

  for (const nome of ["Todas (16)", "IPAs (4)", "Frutas (4)", "Malt (4)", "Lager (4)"]) {
    await expect(page.getByRole("button", { name: nome })).toBeVisible();
  }
  await expect(page.getByText("16 cervejas")).toBeVisible();
  await expect(cards(page)).toHaveCount(16);
});

test("tocar num chip filtra pela categoria na URL e o contador dos chips não muda", async ({
  page,
}) => {
  await page.goto("/catalogo");

  await page.getByRole("button", { name: "IPAs (4)" }).click();

  await expect(page).toHaveURL(/\/catalogo\?categoria=ipa$/);
  await expect(page.getByText("4 cervejas")).toBeVisible();
  await expect(cards(page)).toHaveCount(4);
  await expect(page.getByRole("button", { name: "Todas (16)" })).toBeVisible();
  await expect(page.getByRole("button", { name: "IPAs (4)" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("filtros por faixa vêm da URL e Filtrar mostra quantos estão ativos", async ({ page }) => {
  await page.goto("/catalogo?teor=6-ou-mais&ibu=40-ou-mais");

  await expect(page.getByText("3 cervejas")).toBeVisible();
  await expect(cards(page).filter({ hasText: "Maré Alta" })).toHaveCount(1);
  await expect(cards(page).filter({ hasText: "Leguelé Maceió IPA" })).toHaveCount(1);
  await expect(cards(page).filter({ hasText: "Jaraguá Hazy IPA" })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Filtrar (2)" })).toBeVisible();
});

test("o sheet aplica uma faixa na URL", async ({ page }) => {
  await page.goto("/catalogo");

  await page.getByRole("button", { name: "Filtrar" }).click();
  await page.getByRole("radio", { name: "6% ou mais" }).check();
  await page.getByRole("button", { name: "Aplicar" }).click();

  await expect(page).toHaveURL(/\/catalogo\?teor=6-ou-mais$/);
  await expect(page.getByRole("button", { name: "Filtrar (1)" })).toBeVisible();
});

test("a esgotada vai para o fim com o selo e o Adicionar desabilitado; só disponíveis a esconde", async ({
  page,
}) => {
  await page.goto("/catalogo");

  const ultimo = cards(page).last();
  await expect(ultimo).toContainText("Leguelé Comendador");
  await expect(ultimo.getByText("Esgotado")).toBeVisible();
  await expect(ultimo.getByRole("button", { name: "Adicionar" })).toBeDisabled();

  await page.goto("/catalogo?disponiveis=true");

  await expect(page.getByText("15 cervejas")).toBeVisible();
  await expect(page.getByText("Esgotado")).toHaveCount(0);
});

test("sem resultado mostra a mensagem e Limpar filtros volta ao catálogo inteiro", async ({
  page,
}) => {
  await page.goto("/catalogo?teor=abaixo-de-4-5&ibu=40-ou-mais");

  await expect(page.getByText("Nenhuma cerveja encontrada com esses filtros.")).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "0 cervejas" })).toBeVisible();
  await page.getByRole("button", { name: "Limpar filtros" }).click();

  await expect(page).toHaveURL(/\/catalogo$/);
  await expect(page.getByText("16 cervejas")).toBeVisible();
});

test("menor preço e maior preço ordenam a lista, com a esgotada sempre no fim", async ({
  page,
}) => {
  const precos = async () => {
    await expect(cards(page)).toHaveCount(16);
    const textos = await cards(page).getByText(/^R\$/).allTextContents();
    expect(textos).toHaveLength(16);
    return textos.map((t) => Number(t.replace(/[^\d,]/g, "").replace(",", ".")));
  };

  await page.goto("/catalogo?ordem=menor-preco");
  const crescente = (await precos()).slice(0, 15);
  expect(crescente).toEqual([...crescente].sort((a, b) => a - b));
  await expect(cards(page).last()).toContainText("Esgotado");

  await page.goto("/catalogo?ordem=maior-preco");
  const decrescente = (await precos()).slice(0, 15);
  expect(decrescente).toEqual([...decrescente].sort((a, b) => b - a));
  await expect(cards(page).last()).toContainText("Esgotado");
});

test("em 195x422 (zoom de 200%) o catálogo não tem rolagem horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 195, height: 422 });
  await page.goto("/catalogo");
  await expect(cards(page).first()).toBeVisible();

  const excesso = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );

  expect(excesso).toBeLessThanOrEqual(0);
});

test("combinar categoria, faixa e ordem mostra a lista certa e Limpar filtros ao lado da contagem desfaz tudo", async ({
  page,
}) => {
  await page.goto("/catalogo?categoria=ipa&teor=6-ou-mais&ordem=menor-preco");

  await expect(page.getByRole("heading", { level: 2, name: "3 cervejas" })).toBeVisible();
  const nomes = await cards(page).getByRole("heading", { level: 3 }).allTextContents();
  expect(nomes).toEqual(["Leguelé Maceió IPA", "Maré Alta", "Jaraguá Hazy IPA"]);

  await page.getByRole("button", { name: "Limpar filtros" }).click();

  await expect(page).toHaveURL(/\/catalogo$/);
  await expect(page.getByRole("heading", { level: 2, name: "16 cervejas" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Limpar filtros" })).toHaveCount(0);
});

test("o sheet oferece a categoria e Aplicar a leva para a URL", async ({ page }) => {
  await page.goto("/catalogo");

  await page.getByRole("button", { name: "Filtrar" }).click();
  const sheet = page.getByRole("dialog", { name: "Filtros e ordenação" });
  await expect(sheet.getByRole("radio", { name: "Todas" })).toBeChecked();
  await sheet.getByRole("radio", { name: "Frutas" }).check();
  await sheet.getByRole("button", { name: "Aplicar" }).click();

  await expect(page).toHaveURL(/\/catalogo\?categoria=frutas$/);
  await expect(page.getByRole("button", { name: /^Frutas \(\d+\)$/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("categoria que não existe na URL é ignorada: Todas marcada e sem Limpar filtros", async ({
  page,
}) => {
  await page.goto("/catalogo?categoria=nao-existe");

  await expect(page.getByRole("button", { name: /^Todas \(\d+\)$/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("button", { name: "Limpar filtros" })).toHaveCount(0);
  await expect(cards(page).first()).toBeVisible();
});

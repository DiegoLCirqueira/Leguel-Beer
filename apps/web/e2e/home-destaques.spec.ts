import { expect, test } from "./support/maior-de-idade";

// Contra a API real com o seed do catálogo (o seed do CI tem 8 cervejas em destaque: a home mostra 6).
test.use({ isMobile: false, hasTouch: false, viewport: { width: 390, height: 844 } });

test.beforeEach(async ({ context, baseURL }) => {
  await context.addCookies([
    { name: "leguele_convidado", value: "1", url: baseURL ?? "http://localhost:3000" },
  ]);
});

type Destaque = { nome: string; esgotada: boolean };

async function destaquesDaApi(): Promise<Destaque[]> {
  const api = process.env.API_URL ?? "http://localhost:3333";
  const resposta = await fetch(`${api}/catalogo/destaques`);
  return ((await resposta.json()) as { itens: Destaque[] }).itens;
}

test("a home mostra até 6 destaques na ordem da API, com o selo nas esgotadas e Ver todas", async ({
  page,
}) => {
  const esperados = await destaquesDaApi();
  expect(esperados.length).toBeGreaterThan(0);
  expect(esperados.length).toBeLessThanOrEqual(6);

  await page.goto("/");

  await expect(page.getByRole("heading", { level: 2, name: "Cervejas em destaque" })).toBeVisible();
  const cards = page.getByRole("article");
  await expect(cards).toHaveCount(esperados.length);
  expect(await cards.getByRole("heading", { level: 3 }).allTextContents()).toEqual(
    esperados.map((d) => d.nome),
  );
  await expect(page.getByText("Esgotado")).toHaveCount(esperados.filter((d) => d.esgotada).length);
  await expect(page.getByRole("link", { name: "Ver todas" })).toHaveAttribute("href", "/catalogo");
});

test("a hierarquia de títulos da home é h1, h2 e h3", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 2, name: "Cervejas em destaque" })).toBeVisible();

  const niveis = await page
    .locator("h1, h2, h3")
    .evaluateAll((titulos) => titulos.map((t) => Number(t.tagName.slice(1))));

  expect(niveis[0]).toBe(1);
  expect(niveis.filter((n) => n === 1)).toHaveLength(1);
  expect(niveis[1]).toBe(2);
  expect(niveis.slice(2).every((n) => n === 3)).toBe(true);
});

test("Ver todas abre o catálogo sem filtros", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Ver todas" }).click();

  // O conteúdo do catálogo é coberto em catalogo.spec.ts; aqui só o destino do link.
  await expect(page).toHaveURL(/\/catalogo$/);
});

test("em 195x422 (zoom de 200%) a home não tem rolagem horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 195, height: 422 });
  await page.goto("/");
  await expect(page.getByRole("article").first()).toBeVisible();

  const excesso = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );

  expect(excesso).toBeLessThanOrEqual(0);
});

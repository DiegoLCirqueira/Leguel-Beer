import { expect, test } from "./support/maior-de-idade";

// Contra a API real com o seed do catálogo: Maré Alta (R$ 32,00, antes R$ 36,90, 24 em estoque) e
// Leguelé Comendador (esgotada).
test.use({ isMobile: false, hasTouch: false, viewport: { width: 390, height: 844 } });

test("a ficha da Maré Alta mostra nome, estilo, selo, ficha técnica, preço com desconto e descrição", async ({
  page,
}) => {
  await page.goto("/catalogo/mare-alta");

  await expect(page.getByRole("heading", { level: 1, name: "Maré Alta" })).toBeVisible();
  await expect(page.getByText("American IPA", { exact: true })).toBeVisible();
  await expect(page.getByText("IPAS", { exact: true })).toBeVisible();
  const ficha = page.getByRole("list", { name: "Ficha técnica" });
  await expect(ficha).toContainText("6,5%");
  await expect(ficha).toContainText("65");
  await expect(ficha).toContainText("330 ml");
  await expect(page.getByText(/R\$\s*32,00/)).toBeVisible();
  await expect(page.locator("s")).toContainText(/R\$\s*36,90/);
  await expect(page.getByText("-13%")).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Sobre a cerveja" })).toBeVisible();
  await expect(page.getByText("Frete grátis em compras acima de R$ 150,00")).toBeVisible();
  await expect(page.getByText(/em estoque!/)).toHaveCount(0);
});

test("cerveja sem preço anterior não mostra desconto", async ({ page }) => {
  await page.goto("/catalogo/leguele-carnaval");

  await expect(page.getByRole("heading", { level: 1, name: "Leguelé Carnaval" })).toBeVisible();
  await expect(page.locator("s")).toHaveCount(0);
  await expect(page.getByText(/^-\d+%$/)).toHaveCount(0);
});

test("a esgotada mostra o selo, sem seletor, e o botão fica desabilitado", async ({ page }) => {
  await page.goto("/catalogo/leguele-comendador");

  await expect(page.getByText("Esgotado", { exact: true })).toBeVisible();
  await expect(page.getByRole("group", { name: /Quantidade/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Adicionar à geladeira" })).toBeDisabled();
});

test("slug que não existe mostra Cerveja não encontrada e Ver catálogo leva ao catálogo", async ({
  page,
}) => {
  await page.goto("/catalogo/nao-existe");

  await expect(
    page.getByRole("heading", { level: 1, name: "Cerveja não encontrada" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Ver catálogo" }).click();

  await expect(page).toHaveURL(/\/catalogo$/);
});

test("o seletor sobe de 1 até a quantidade e o botão fixo fica no pé da tela, sem a barra da loja", async ({
  page,
}) => {
  await page.goto("/catalogo/mare-alta");

  const grupo = page.getByRole("group", { name: "Quantidade de Maré Alta" });
  await expect(grupo).toContainText("1");
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: "Aumentar quantidade" }).click();
  await expect(grupo).toContainText("4");
  await expect(page.getByRole("navigation", { name: "Menu da loja" })).toHaveCount(0);
  const botao = await page.getByRole("button", { name: "Adicionar à geladeira" }).boundingBox();
  expect((botao?.y ?? 0) + (botao?.height ?? 0)).toBeLessThanOrEqual(844);
  expect(botao?.y ?? 0).toBeGreaterThan(844 - 100);

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const frete = await page.getByText("Frete grátis em compras acima de R$ 150,00").boundingBox();
  expect((frete?.y ?? 0) + (frete?.height ?? 0)).toBeLessThanOrEqual(botao?.y ?? 0);
});

test("o card do catálogo abre a página da cerveja", async ({ page }) => {
  await page.goto("/catalogo");

  await page.getByRole("link", { name: "Maré Alta" }).click();

  await expect(page).toHaveURL(/\/catalogo\/mare-alta$/);
  await expect(page.getByRole("heading", { level: 1, name: "Maré Alta" })).toBeVisible();
});

test("em 195x422 (zoom de 200%) não há rolagem horizontal e o botão fixo segue à vista", async ({
  page,
}) => {
  await page.setViewportSize({ width: 195, height: 422 });
  await page.goto("/catalogo/mare-alta");
  await expect(page.getByRole("heading", { level: 1, name: "Maré Alta" })).toBeVisible();

  const excesso = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );

  expect(excesso).toBeLessThanOrEqual(0);
  await expect(page.getByRole("button", { name: "Adicionar à geladeira" })).toBeInViewport({
    ratio: 1,
  });
});

test("/catalogo/destaques não é cerveja: mostra Cerveja não encontrada, não erro", async ({
  page,
}) => {
  await page.goto("/catalogo/destaques");

  await expect(
    page.getByRole("heading", { level: 1, name: "Cerveja não encontrada" }),
  ).toBeVisible();
  // Não vale contar role=alert: o build de produção do Next injeta o next-route-announcer (alert vazio).
  await expect(page.getByText("Não foi possível carregar a cerveja agora.")).toHaveCount(0);
});

test("Voltar da página de produto volta ao catálogo quando veio dele", async ({ page }) => {
  await page.goto("/catalogo");
  await page.getByRole("link", { name: "Maré Alta" }).click();
  await expect(page).toHaveURL(/\/catalogo\/mare-alta$/);

  await page.getByRole("link", { name: "Voltar" }).click();

  await expect(page).toHaveURL(/\/catalogo$/);
});

test("Voltar do produto devolve o catálogo com o filtro de categoria que estava na URL", async ({
  page,
}) => {
  await page.goto("/catalogo?categoria=ipa");
  await page.getByRole("link", { name: "Maré Alta" }).click();
  await expect(page).toHaveURL(/\/catalogo\/mare-alta$/);

  await page.getByRole("link", { name: "Voltar" }).click();

  await expect(page).toHaveURL(/\/catalogo\?categoria=ipa$/);
  await expect(page.getByRole("button", { name: /^IPAs/ })).toHaveAttribute("aria-pressed", "true");
});

test("Voltar volta à home para quem abriu a cerveja pelos destaques", async ({
  page,
  context,
  baseURL,
}) => {
  await context.addCookies([
    { name: "leguele_convidado", value: "1", url: baseURL ?? "http://localhost:3000" },
  ]);
  await page.goto("/");
  await page
    .getByRole("region", { name: "Cervejas em destaque" })
    .getByRole("link", { name: "Maré Alta" })
    .click();
  await expect(page).toHaveURL(/\/catalogo\/mare-alta$/);

  await page.getByRole("link", { name: "Voltar" }).click();

  await expect(page).toHaveURL((url) => url.pathname === "/");
});

test("Voltar em link direto (sem página anterior do site) vai ao catálogo", async ({ page }) => {
  await page.goto("/catalogo/mare-alta");

  await page.getByRole("link", { name: "Voltar" }).click();

  await expect(page).toHaveURL(/\/catalogo$/);
});

import { expect, test, type BrowserContext, type Page } from "@playwright/test";

const DIA = 24 * 60 * 60 * 1000;
const COOKIE = "leguele_maioridade";

async function confirmadaHa(context: BrowserContext, baseURL: string | undefined, dias: number) {
  await context.addCookies([
    {
      name: COOKIE,
      value: String(Date.now() - dias * DIA),
      url: baseURL ?? "http://localhost:3000",
    },
  ]);
}

const pergunta = (page: Page) =>
  page.getByRole("heading", { level: 1, name: "Você tem 18 anos ou mais?" });

test("maior de idade confirma, vê a boas-vindas e não é perguntado de novo", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await expect(pergunta(page)).toBeVisible();

  await page.getByRole("button", { name: "Sim, tenho 18 anos ou mais" }).click();
  await expect(page).toHaveURL(/\/boas-vindas$/);

  await page.goto("/boas-vindas");
  await expect(pergunta(page)).toHaveCount(0);

  const cookies = await context.cookies();
  expect(cookies.find((c) => c.name === COOKIE)).toBeTruthy();
});

test("confirmação de 29 dias atrás ainda vale", async ({ page, context, baseURL }) => {
  await confirmadaHa(context, baseURL, 29);

  await page.goto("/boas-vindas");

  await expect(page).toHaveURL(/\/boas-vindas$/);
});

test("confirmação de 31 dias atrás pergunta de novo", async ({ page, context, baseURL }) => {
  await confirmadaHa(context, baseURL, 31);

  await page.goto("/boas-vindas");

  await expect(pergunta(page)).toBeVisible();
});

test("menor de idade vê o acesso não permitido e o catálogo continua bloqueado", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Não" }).click();

  await expect(page.getByRole("heading", { level: 1, name: "Acesso não permitido" })).toBeVisible();
  await expect(page.getByText("Este site é só para maiores de 18 anos.")).toBeVisible();

  await page.goto("/catalogo");
  await expect(pergunta(page)).toBeVisible();
});

test("link direto volta para a página pedida depois da confirmação", async ({ page }) => {
  await page.goto("/catalogo?categoria=ipa");
  await expect(pergunta(page)).toBeVisible();

  await page.getByRole("button", { name: "Sim, tenho 18 anos ou mais" }).click();

  await expect(page).toHaveURL(/\/catalogo\?categoria=ipa$/);
});

test("endereço de retorno externo é ignorado", async ({ page }) => {
  await page.goto("/maioridade?retorno=https://exemplo.com/roubo");

  await page.getByRole("button", { name: "Sim, tenho 18 anos ou mais" }).click();

  await expect(page).toHaveURL(/localhost:\d+\/boas-vindas$/);
});

test("robô de busca abre o catálogo sem a pergunta", async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  });
  const page = await context.newPage();

  await page.goto("/catalogo");

  await expect(page).not.toHaveURL(/maioridade/);
  await expect(pergunta(page)).toHaveCount(0);
  await context.close();
});

test("imagens e arquivos estáticos não passam pela pergunta", async ({ request }) => {
  const resposta = await request.get("/maioridade/logo.webp", { maxRedirects: 0 });

  expect(resposta.status()).toBe(200);
});

for (const { width, height } of [
  { width: 360, height: 780 },
  { width: 390, height: 844 },
]) {
  test(`a pergunta cabe em ${width}x${height} sem rolagem e com botões de 44 px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/maioridade");

    const medidas = await page.evaluate(() => ({
      x: document.documentElement.scrollWidth - window.innerWidth,
      y: document.documentElement.scrollHeight - window.innerHeight,
    }));
    expect(medidas.x).toBeLessThanOrEqual(0);
    expect(medidas.y).toBeLessThanOrEqual(0);

    for (const nome of ["Sim, tenho 18 anos ou mais", "Não"]) {
      const caixa = await page.getByRole("button", { name: nome }).boundingBox();
      expect(caixa?.height).toBeGreaterThanOrEqual(44);
    }
  });
}

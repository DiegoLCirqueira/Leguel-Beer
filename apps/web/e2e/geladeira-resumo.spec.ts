import { expect, test } from "./support/maior-de-idade";

test.use({ isMobile: false, hasTouch: false });

const API = process.env.API_URL ?? "http://localhost:3333";

test.beforeEach(async ({ context, page, baseURL, request }) => {
  await context.addCookies([
    { name: "leguele_convidado", value: "1", url: baseURL ?? "http://localhost:3000" },
  ]);
  // Cervejas reais da API: a revalidação do convidado descarta ids que o catálogo não conhece.
  const slugs = [
    ["mare-alta", 2],
    ["umbu-gose", 1],
    ["cupuacu-ale", 3],
  ] as const;
  const itens = await Promise.all(
    slugs.map(async ([slug, quantidade]) => ({
      cerveja: await (await request.get(`${API}/catalogo/${slug}`)).json(),
      quantidade,
    })),
  );
  // Semeia a Geladeira só na primeira carga, para recarregar não desfazer o que o teste fez.
  await page.addInitScript((semente) => {
    if (localStorage.getItem("semeado")) return;
    localStorage.setItem("semeado", "1");
    localStorage.setItem("lb:geladeira", JSON.stringify({ versao: 1, itens: semente }));
  }, itens);
});

const semRolagem = (page: import("@playwright/test").Page) =>
  page.evaluate(
    () => document.documentElement.scrollHeight - document.documentElement.clientHeight,
  );

test("em 360x640 a barra do resumo fica entre a área da Geladeira e a barra inferior, sem rolagem da página", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/geladeira");

  const verResumo = page.getByRole("button", { name: "Ver resumo" });
  await expect(verResumo).toBeVisible();
  const barra = (await verResumo.locator("xpath=..").boundingBox())!;
  // A moldura rola dentro da área da Geladeira (o pai dela): é a área que termina na barra do resumo.
  const area = (await page
    .getByRole("region", { name: "IPA" })
    .locator("xpath=../..")
    .boundingBox())!;
  const navegacao = (await page.getByRole("navigation").last().boundingBox())!;
  expect(area.y + area.height).toBeLessThanOrEqual(barra.y + 1);
  expect(barra.y + barra.height).toBeLessThanOrEqual(navegacao.y + 1);
  expect((await verResumo.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  expect(await semRolagem(page)).toBeLessThanOrEqual(0);
});

test("em 360x640 o sheet lista as cervejas e o 'Desfazer' devolve a que saiu", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/geladeira");

  await page.getByRole("button", { name: "Ver resumo" }).click();
  const sheet = page.getByRole("dialog", { name: "Resumo da Geladeira" });
  await expect(sheet.getByRole("listitem")).toHaveCount(3);
  await expect(sheet.getByText("Subtotal (6 itens)")).toBeVisible();

  await sheet.getByRole("button", { name: "Remover Umbu Gose" }).click();
  const toast = page.getByText("Umbu Gose saiu da geladeira");
  await expect(toast).toBeVisible();
  await expect(sheet.getByRole("listitem")).toHaveCount(2);

  await page.getByRole("button", { name: "Desfazer" }).click();
  await expect(sheet.getByRole("listitem")).toHaveCount(3);
});

test("em 1280x800 o resumo é a coluna da direita, ao lado da Geladeira e sem rolagem da página", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/geladeira");

  const resumo = page.getByRole("complementary", { name: "Resumo da Geladeira" });
  await expect(resumo).toBeVisible();
  await expect(page.getByRole("button", { name: "Ver resumo" })).toHaveCount(0);
  await expect(resumo.getByRole("listitem")).toHaveCount(3);
  const caixaDoResumo = (await resumo.boundingBox())!;
  const moldura = (await page
    .getByRole("region", { name: "IPA" })
    .locator("xpath=..")
    .boundingBox())!;
  expect(caixaDoResumo.x).toBeGreaterThanOrEqual(moldura.x + moldura.width - 1);
  expect(await semRolagem(page)).toBeLessThanOrEqual(0);
});

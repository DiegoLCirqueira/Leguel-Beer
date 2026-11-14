import { expect, test } from "./support/maior-de-idade";

test.use({ isMobile: false, hasTouch: false });

test.beforeEach(async ({ context, page, baseURL }) => {
  await context.addCookies([
    { name: "leguele_convidado", value: "1", url: baseURL ?? "http://localhost:3000" },
  ]);
  // Semeia a Geladeira só na primeira carga, para recarregar não desfazer o que o teste fez.
  await page.addInitScript(() => {
    if (localStorage.getItem("semeado")) return;
    localStorage.setItem("semeado", "1");
    const itens = [
      ["mare", "Maré Alta", 3200, 2],
      ["umbu", "Umbu Gose", 2800, 1],
      ["cupuacu", "Cupuaçu Ale", 3000, 3],
    ].map(([id, nome, preco, quantidade]) => ({
      cerveja: {
        id,
        slug: id,
        nome,
        estilo: "American IPA",
        categoria: { slug: "ipa", nome: "IPAs", ordem: 1 },
        teorAlcoolico: 6.5,
        ibu: 65,
        volumeMl: 330,
        precoCentavos: preco,
        destaque: false,
        quantidadeDisponivel: 9,
        esgotada: false,
        imagemUrl: null,
        cadastradaEm: "2026-10-01T10:00:00.000Z",
      },
      quantidade,
    }));
    localStorage.setItem("lb:geladeira", JSON.stringify({ versao: 1, itens }));
  });
});

const semRolagem = (page: import("@playwright/test").Page) =>
  page.evaluate(
    () => document.documentElement.scrollHeight - document.documentElement.clientHeight,
  );

test("em 360x640 a barra do resumo fica entre a moldura e a barra inferior, sem rolagem", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/geladeira");

  const verResumo = page.getByRole("button", { name: "Ver resumo" });
  await expect(verResumo).toBeVisible();
  const barra = (await verResumo.locator("xpath=..").boundingBox())!;
  const moldura = (await page
    .getByRole("region", { name: "IPA" })
    .locator("xpath=..")
    .boundingBox())!;
  const navegacao = (await page.getByRole("navigation").last().boundingBox())!;
  expect(moldura.y + moldura.height).toBeLessThanOrEqual(barra.y + 1);
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

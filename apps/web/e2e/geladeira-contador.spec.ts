import { expect, test } from "./support/maior-de-idade";

test.use({ isMobile: false, hasTouch: false, viewport: { width: 390, height: 844 } });

const cerveja = (id: string, nome: string) => ({
  id,
  slug: id,
  nome,
  estilo: "American IPA",
  categoria: { slug: "ipa", nome: "IPAs", ordem: 1 },
  teorAlcoolico: 6.5,
  ibu: 65,
  volumeMl: 330,
  precoCentavos: 3200,
  destaque: false,
  quantidadeDisponivel: 5,
  esgotada: false,
  imagemUrl: null,
  cadastradaEm: "2026-10-01T10:00:00.000Z",
});

test.beforeEach(async ({ context, baseURL }) => {
  await context.addCookies([
    { name: "leguele_convidado", value: "1", url: baseURL ?? "http://localhost:3000" },
  ]);
});

test("o contador do header soma as unidades da Geladeira guardada no navegador, sem erro de hidratação", async ({
  page,
}) => {
  const erros: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") erros.push(m.text());
  });
  await page.addInitScript(
    (geladeira) => {
      window.localStorage.setItem("lb:geladeira", JSON.stringify(geladeira));
    },
    {
      versao: 1,
      itens: [
        { cerveja: cerveja("a", "Maré Alta"), quantidade: 2 },
        { cerveja: cerveja("b", "Carnaval"), quantidade: 1 },
      ],
    },
  );

  await page.goto("/");

  await expect(page.getByRole("link", { name: "Geladeira, 3 unidades" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("link", { name: "Geladeira, 3 unidades" })).toBeVisible();
  expect(erros.filter((e) => /hydrat|did not match/i.test(e))).toEqual([]);
});

test("cópia local inválida começa vazia, sem quebrar a página", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem("lb:geladeira", "{quebrado"));

  await page.goto("/");

  await expect(page.getByRole("link", { name: "Geladeira, 0 unidades" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Leguelé Beer" })).toBeVisible();
});

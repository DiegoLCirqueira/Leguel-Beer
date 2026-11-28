import { expect, test } from "./support/maior-de-idade";

// Com as barras de rolagem VISÍVEIS (o headless as esconde por padrão): a barra clássica de ~15 px
// tirava largura da área e fazia a moldura passar do conteúdo útil (barra horizontal no portal).
test.use({
  isMobile: false,
  hasTouch: false,
  launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] },
});

const TAMANHOS = [
  { width: 360, height: 640 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
];

const API = process.env.API_URL ?? "http://localhost:3333";

// Cervejas REAIS do seed (a revalidação do convidado descarta ids que o catálogo não conhece, e uma
// cerveja inventada sumia da Geladeira): IPA com 4 grupos e Lager com 3, o pior caso para as placas.
const SEMENTE = [
  ["jaragua-hazy-ipa", 2],
  ["leguele-carnaval", 4],
  ["mare-alta", 1],
  ["leguele-maceio-ipa", 1],
  ["leguele-kolsch", 1],
  ["leguele-cream-ale", 1],
  ["ponta-verde-pilsen", 1],
] as const;

test.beforeEach(async ({ context, page, baseURL, request }) => {
  await context.addCookies([
    { name: "leguele_convidado", value: "1", url: baseURL ?? "http://localhost:3000" },
  ]);
  const itens = await Promise.all(
    SEMENTE.map(async ([slug, quantidade]) => ({
      cerveja: await (await request.get(`${API}/catalogo/${slug}`)).json(),
      quantidade,
    })),
  );
  // Semeia só na primeira carga, para recarregar não desfazer o que o teste fez.
  await page.addInitScript((semente) => {
    if (localStorage.getItem("semeado")) return;
    localStorage.setItem("semeado", "1");
    localStorage.setItem("lb:geladeira", JSON.stringify({ versao: 1, itens: semente }));
  }, itens);
});

for (const tamanho of TAMANHOS) {
  test(`em ${tamanho.width}x${tamanho.height} com a Geladeira cheia: sem rolagem lateral, placas legíveis e letreiro inteiro no fim da rolagem`, async ({
    page,
  }) => {
    await page.setViewportSize(tamanho);
    await page.goto("/geladeira");

    const area = page.getByRole("region", { name: "Prateleiras da Geladeira" });
    // Espera o conteúdo da Geladeira (7 placas de cerveja) e não só o primeiro convite de prateleira
    // vazia: no CI o localStorage chega depois da hidratação, e medir antes dava 0 placas.
    await expect(page.locator("[data-placa] > span[aria-hidden]")).toHaveCount(7);

    // Sem rolagem lateral na área (a spec proíbe).
    expect(await area.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);

    // A área não tem barra que roube largura, e a moldura fica centrada nela.
    const geometria = await area.evaluate((alvo) => {
      const el = alvo as HTMLElement;
      const moldura = el.querySelector("[data-moldura]")!.getBoundingClientRect();
      const caixa = el.getBoundingClientRect();
      return {
        barra: el.offsetWidth - el.clientWidth,
        esquerda: moldura.left - caixa.left,
        direita: caixa.right - moldura.right,
      };
    });
    expect(geometria.barra).toBe(0);
    expect(Math.abs(geometria.esquerda - geometria.direita)).toBeLessThanOrEqual(1);

    // O nome de cada placa aparece inteiro (sem reticências).
    const nomes = await page
      .locator("[data-placa] > span[aria-hidden]")
      .evaluateAll((els) =>
        els.map((el) => ({ texto: el.textContent, truncado: el.scrollWidth > el.clientWidth })),
      );
    expect(nomes.length).toBeGreaterThan(0);
    expect(nomes.filter((n) => n.truncado)).toEqual([]);

    // No fim da rolagem, o letreiro aparece inteiro dentro da área.
    await area.evaluate((el) => el.scrollTo(0, el.scrollHeight));
    const letreiro = (await page.getByText("Leguelé Beer", { exact: true }).boundingBox())!;
    const caixa = (await area.boundingBox())!;
    expect(letreiro.y).toBeGreaterThanOrEqual(caixa.y);
    expect(letreiro.y + letreiro.height).toBeLessThanOrEqual(caixa.y + caixa.height);
    // E a moldura inteira tem folga embaixo no fim da rolagem (padding inferior de 8 a 12 px), sem encostar na barra.
    const moldura = (await page
      .getByRole("region", { name: "IPA" })
      .locator("xpath=..")
      .boundingBox())!;
    const folga = caixa.y + caixa.height - (moldura.y + moldura.height);
    expect(folga).toBeGreaterThanOrEqual(8);
    expect(folga).toBeLessThanOrEqual(12);
  });
}

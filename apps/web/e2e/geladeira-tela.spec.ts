import { expect, test } from "./support/maior-de-idade";

test.use({ isMobile: false, hasTouch: false });

const TAMANHOS = [
  { width: 360, height: 640 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
];

test.beforeEach(async ({ context, baseURL }) => {
  await context.addCookies([
    { name: "leguele_convidado", value: "1", url: baseURL ?? "http://localhost:3000" },
  ]);
});

for (const tamanho of TAMANHOS) {
  test(`em ${tamanho.width}x${tamanho.height} a Geladeira cabe entre o header e a barra, sem rolagem`, async ({
    page,
  }) => {
    await page.setViewportSize(tamanho);
    await page.goto("/geladeira");

    const moldura = page.getByRole("region", { name: "IPA" }).locator("xpath=..");
    await expect(moldura).toBeVisible();
    const caixa = (await moldura.boundingBox())!;
    const header = (await page.getByRole("banner").boundingBox())!;
    const barra = (await page.getByRole("navigation").last().boundingBox())!;
    expect(caixa.y).toBeGreaterThanOrEqual(header.y + header.height - 1);
    expect(caixa.y + caixa.height).toBeLessThanOrEqual(barra.y + 1);
    expect(caixa.width / caixa.height).toBeCloseTo(710 / 1573, 2);
    const rolagem = await page.evaluate(
      () => document.documentElement.scrollHeight - document.documentElement.clientHeight,
    );
    expect(rolagem).toBeLessThanOrEqual(0);
  });
}

test("em 360x640, com a moldura encolhida, cada garrafa fantasma da Geladeira tem alvo de toque de pelo menos 44 px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/geladeira");

  for (const categoria of ["IPA", "Frutas", "Malt", "Lager"]) {
    const fantasmas = page.getByRole("link", { name: `Adicionar ${categoria}` });
    await expect(fantasmas).toHaveCount(4);
    for (const fantasma of await fantasmas.all()) {
      const caixa = (await fantasma.boundingBox())!;
      expect(caixa.width).toBeGreaterThanOrEqual(44);
      expect(caixa.height).toBeGreaterThanOrEqual(44);
    }
  }
});

test("a fonte da faixa acompanha a largura da moldura, não a da janela", async ({ page }) => {
  const medir = async (tamanho: { width: number; height: number }) => {
    await page.setViewportSize(tamanho);
    await page.goto("/geladeira");
    const faixa = page.getByText("Toque no + para escolher uma IPA");
    await expect(faixa).toBeVisible();
    const moldura = (await page
      .getByRole("region", { name: "IPA" })
      .locator("xpath=..")
      .boundingBox())!;
    const fonte = await faixa.evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
    return { largura: moldura.width, fonte };
  };

  const pequena = await medir({ width: 360, height: 640 });
  const grande = await medir({ width: 430, height: 932 });

  expect(grande.fonte / pequena.fonte).toBeCloseTo(grande.largura / pequena.largura, 1);
});

const GELADEIRA_COM_UMA_MARE = {
  versao: 1,
  itens: [
    {
      cerveja: {
        id: "mare",
        slug: "mare-alta",
        nome: "Maré Alta",
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
      },
      quantidade: 1,
    },
  ],
};

for (const [movimento, esperado] of [
  ["no-preference", ["garrafa-queda"]],
  ["reduce", []],
] as const) {
  test(`a garrafa que cai ${movimento === "reduce" ? "não se move com movimento reduzido" : "anima só transform e opacity"}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: movimento });
    await page.addInitScript((geladeira) => {
      window.localStorage.setItem("lb:geladeira", JSON.stringify(geladeira));
    }, GELADEIRA_COM_UMA_MARE);
    await page.goto("/geladeira");

    const garrafa = page.locator("[data-garrafa]").first();
    await expect(garrafa).toBeAttached();
    const animacoes = await garrafa.evaluate((e) => {
      e.setAttribute("data-animacao", "queda");
      return (e.firstElementChild as HTMLElement).getAnimations().map((a) => ({
        nome: (a as CSSAnimation).animationName,
        propriedades: [
          ...new Set(
            (a.effect as KeyframeEffect)
              .getKeyframes()
              .flatMap((k) => Object.keys(k))
              .filter((p) => !["offset", "easing", "composite", "computedOffset"].includes(p)),
          ),
        ].sort(),
      }));
    });

    expect(animacoes.map((a) => a.nome)).toEqual(esperado);
    for (const a of animacoes) expect(a.propriedades).toEqual(["opacity", "transform"]);
  });
}

test.describe("esqueleto de carregamento (HTML do servidor, sem JavaScript)", () => {
  test.use({ javaScriptEnabled: false });

  for (const tamanho of TAMANHOS) {
    test(`em ${tamanho.width}x${tamanho.height} o esqueleto cabe entre o header e a barra, sem rolagem`, async ({
      page,
    }) => {
      await page.setViewportSize(tamanho);
      await page.goto("/geladeira");

      await expect(
        page.getByRole("status").filter({ hasText: "Carregando a Geladeira" }),
      ).toBeVisible();
      const esqueleto = page.getByTestId("esqueleto-da-geladeira");
      const caixa = (await esqueleto.boundingBox())!;
      const barra = (await page.getByRole("navigation").last().boundingBox())!;
      expect(caixa.y + caixa.height).toBeLessThanOrEqual(barra.y + 1);
      expect(caixa.width / caixa.height).toBeCloseTo(710 / 1573, 2);
      const rolagem = await page.evaluate(
        () => document.documentElement.scrollHeight - document.documentElement.clientHeight,
      );
      expect(rolagem).toBeLessThanOrEqual(0);
    });
  }
});

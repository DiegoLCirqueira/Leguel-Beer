import { expect, test } from "./support/maior-de-idade";

test.use({ isMobile: false, hasTouch: false });

const TAMANHOS = [
  { width: 360, height: 640 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
];

const cerveja = (id: string, nome: string, categoria: string, quantidade: number) => ({
  cerveja: {
    id,
    slug: id,
    nome,
    estilo: "Estilo",
    categoria: { slug: categoria, nome: categoria.toUpperCase(), ordem: 1 },
    teorAlcoolico: 5,
    ibu: 20,
    volumeMl: 330,
    precoCentavos: 3200,
    destaque: false,
    quantidadeDisponivel: 20,
    esgotada: false,
    imagemUrl: null,
    cadastradaEm: "2026-10-01T10:00:00.000Z",
  },
  quantidade,
});

// IPA com 3 grupos (dois "Jaraguá" e um "Carnaval") e Lager cheia: o pior caso para as placas.
const GELADEIRA_CHEIA = {
  versao: 1,
  itens: [
    cerveja("jaragua-premium", "Jaraguá Premium", "ipa", 2),
    cerveja("jaragua-extra", "Jaraguá Extra", "ipa", 1),
    cerveja("carnaval", "Leguelé Carnaval", "ipa", 4),
    cerveja("l1", "Ponta Verde Pilsen", "lager", 1),
    cerveja("l2", "Pajuçara Extra Lager", "lager", 1),
    cerveja("l3", "Maceió Clássica", "lager", 1),
    cerveja("l4", "Jatiúca Lager", "lager", 1),
  ],
};

for (const tamanho of TAMANHOS) {
  test(`em ${tamanho.width}x${tamanho.height} com a Geladeira cheia: sem rolagem lateral, placas legíveis e letreiro inteiro no fim da rolagem`, async ({
    page,
  }) => {
    await page.addInitScript((geladeira) => {
      window.localStorage.setItem("lb:geladeira", JSON.stringify(geladeira));
    }, GELADEIRA_CHEIA);
    await page.setViewportSize(tamanho);
    await page.goto("/geladeira");

    const area = page.getByRole("region", { name: "Prateleiras da Geladeira" });
    await expect(page.locator("[data-placa]").first()).toBeVisible();

    // Sem rolagem lateral na área (a spec proíbe).
    expect(await area.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);

    // O nome de cada placa aparece inteiro (sem reticências).
    for (const nome of await page.locator("[data-placa] > span[aria-hidden]").all()) {
      const truncado = await nome.evaluate((el) => el.scrollWidth > el.clientWidth);
      expect(truncado, `placa truncada: ${await nome.textContent()}`).toBe(false);
    }

    // No fim da rolagem, o letreiro aparece inteiro dentro da área.
    await area.evaluate((el) => el.scrollTo(0, el.scrollHeight));
    const letreiro = (await page.getByText("Leguelé Beer", { exact: true }).boundingBox())!;
    const caixa = (await area.boundingBox())!;
    expect(letreiro.y).toBeGreaterThanOrEqual(caixa.y);
    expect(letreiro.y + letreiro.height).toBeLessThanOrEqual(caixa.y + caixa.height);
  });
}

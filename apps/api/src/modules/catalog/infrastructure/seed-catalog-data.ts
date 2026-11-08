/**
 * Dados de desenvolvimento do catálogo (LB-4). Os nomes das 9 cervejas do design (pasta
 * `Imagens/figma/cervejas`) são reais; as outras 7 têm nome provisório "Teste ...". Teor, IBU, preço,
 * estoque e datas são de teste e cobrem as faixas de filtro de `@leguele/shared`.
 */
export interface SeedBeer {
  slug: string;
  name: string;
  style: string;
  abv: number;
  ibu: number;
  volumeMl: number;
  priceCents: number;
  featured: boolean;
  stock: number;
  description?: string | null;
  previousPriceCents?: number | null;
  createdAt: Date;
}

export interface SeedCategory {
  slug: string;
  name: string;
  order: number;
  beers: SeedBeer[];
}

/** Descrição e preço anterior de exemplo da página de produto (LB-40 e LB-41), por slug. */
const DETAILS: Record<string, Pick<SeedBeer, "description" | "previousPriceCents">> = {
  "mare-alta": {
    description:
      "Uma American IPA de aroma cítrico e final resinoso, para quem gosta de lúpulo. (texto de exemplo)",
    previousPriceCents: 3690,
  },
  "leguele-ipa": {
    description: "A IPA da casa, equilibrada entre o amargor e o malte. (texto de exemplo)",
  },
  "leguele-carnaval": {
    description: "Uma Session IPA leve e refrescante, boa para a festa. (texto de exemplo)",
    previousPriceCents: 3190,
  },
  "cupuacu-ale": {
    description: "Uma ale de fruta com o azedinho e o aroma do cupuaçu. (texto de exemplo)",
    previousPriceCents: 2990,
  },
  cajupa: {
    description: "Uma ale de fruta com caju e um toque de acidez. (texto de exemplo)",
  },
  avermelhou: {
    description: "Uma Red Ale de cor avermelhada e sabor de caramelo. (texto de exemplo)",
  },
  "cream-ale": {
    description: "Uma Cream Ale suave, clara e de final macio. (texto de exemplo)",
  },
  kolsch: {
    description: "Uma Kölsch limpa e delicada, de corpo leve. (texto de exemplo)",
  },
  "teste-malt-1": { previousPriceCents: 3050 },
  "leguele-comendador": {
    description: "Uma lager clara e fácil de beber, a cara do Comendador. (texto de exemplo)",
  },
};

const beer = (
  slug: string,
  name: string,
  style: string,
  abv: number,
  ibu: number,
  priceCents: number,
  featured: boolean,
  stock: number,
  createdAt: string,
): SeedBeer => ({
  slug,
  name,
  style,
  abv,
  ibu,
  volumeMl: 500,
  priceCents,
  featured,
  stock,
  createdAt: new Date(createdAt),
  ...DETAILS[slug],
});

export const SEED_CATEGORIES: SeedCategory[] = [
  {
    slug: "ipa",
    name: "IPAs",
    order: 1,
    beers: [
      beer(
        "mare-alta",
        "Maré Alta",
        "American IPA",
        6.5,
        65,
        3200,
        true,
        24,
        "2026-10-02T12:00:00Z",
      ),
      beer(
        "leguele-ipa",
        "Leguelé IPA",
        "American IPA",
        6.2,
        38,
        3090,
        true,
        18,
        "2026-10-05T12:00:00Z",
      ),
      beer(
        "leguele-carnaval",
        "Leguelé Carnaval",
        "Session IPA",
        4.8,
        32,
        2790,
        true,
        30,
        "2026-10-03T12:00:00Z",
      ),
      beer(
        "teste-ipa-1",
        "Teste IPA 1",
        "West Coast IPA",
        6.4,
        62,
        3150,
        false,
        12,
        "2026-10-09T12:00:00Z",
      ),
    ],
  },
  {
    slug: "frutas",
    name: "Frutas",
    order: 2,
    beers: [
      beer(
        "cupuacu-ale",
        "Cupuaçu Ale",
        "Fruit Ale",
        4.5,
        12,
        2690,
        true,
        36,
        "2026-10-04T12:00:00Z",
      ),
      beer("cajupa", "Cajupá", "Fruit Ale", 4.7, 8, 2790, true, 20, "2026-10-06T12:00:00Z"),
      beer(
        "teste-frutas-1",
        "Teste Frutas 1",
        "Fruit Wheat",
        5.0,
        15,
        2890,
        false,
        0,
        "2026-10-11T12:00:00Z",
      ),
      beer(
        "teste-frutas-2",
        "Teste Frutas 2",
        "Witbier com coco",
        4.9,
        14,
        2990,
        false,
        16,
        "2026-10-14T12:00:00Z",
      ),
    ],
  },
  {
    slug: "malt",
    name: "Malt",
    order: 3,
    beers: [
      beer("avermelhou", "Avermelhou", "Red Ale", 5.2, 24, 2890, true, 22, "2026-10-07T12:00:00Z"),
      beer(
        "teste-malt-1",
        "Teste Malt 1",
        "Brown Ale",
        5.6,
        22,
        3050,
        false,
        14,
        "2026-10-10T12:00:00Z",
      ),
      beer(
        "teste-malt-2",
        "Teste Malt 2",
        "Amber Ale",
        5.4,
        28,
        2990,
        false,
        26,
        "2026-10-12T12:00:00Z",
      ),
      beer(
        "teste-malt-3",
        "Teste Malt 3",
        "Dubbel",
        6.5,
        20,
        3200,
        false,
        10,
        "2026-10-16T12:00:00Z",
      ),
    ],
  },
  {
    slug: "lager",
    name: "Lager",
    order: 4,
    beers: [
      beer("cream-ale", "Cream Ale", "Cream Ale", 4.8, 26, 2590, true, 40, "2026-10-08T12:00:00Z"),
      beer("kolsch", "Kölsch", "Kölsch", 5.0, 21, 2690, false, 28, "2026-10-13T12:00:00Z"),
      beer(
        "leguele-comendador",
        "Leguelé Comendador",
        "Lager",
        5.8,
        23,
        2890,
        false,
        15,
        "2026-10-15T12:00:00Z",
      ),
      beer(
        "teste-lager-1",
        "Teste Lager 1",
        "Helles",
        4.2,
        18,
        2490,
        true,
        48,
        "2026-10-01T12:00:00Z",
      ),
    ],
  },
];

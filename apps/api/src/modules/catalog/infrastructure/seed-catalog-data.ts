/**
 * Dados de desenvolvimento do catálogo (LB-4): nomes, estilos e números são de teste, não rótulos
 * da Leguelé. Os números cobrem as faixas de filtro de `@leguele/shared` (teor, IBU e preço).
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
  createdAt: Date;
}

export interface SeedCategory {
  slug: string;
  name: string;
  order: number;
  beers: SeedBeer[];
}

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
});

export const SEED_CATEGORIES: SeedCategory[] = [
  {
    slug: "ipa",
    name: "IPAs",
    order: 1,
    beers: [
      beer(
        "ipa-aratu",
        "IPA Aratu",
        "American IPA",
        6.5,
        55,
        3200,
        true,
        24,
        "2026-10-02T12:00:00Z",
      ),
      beer(
        "ipa-zabumba",
        "IPA Zabumba",
        "Session IPA",
        4.8,
        32,
        2790,
        true,
        30,
        "2026-10-03T12:00:00Z",
      ),
      beer(
        "ipa-jangada",
        "IPA Jangada",
        "Hazy IPA",
        6.2,
        38,
        3090,
        true,
        18,
        "2026-10-05T12:00:00Z",
      ),
      beer(
        "ipa-mare-alta",
        "IPA Maré Alta",
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
        "frutas-caju",
        "Frutas Caju",
        "Fruit Ale",
        4.5,
        12,
        2690,
        true,
        36,
        "2026-10-04T12:00:00Z",
      ),
      beer(
        "frutas-maracuja",
        "Frutas Maracujá",
        "Sour de maracujá",
        4.7,
        8,
        2790,
        true,
        20,
        "2026-10-06T12:00:00Z",
      ),
      beer(
        "frutas-caja",
        "Frutas Cajá",
        "Fruit Wheat",
        5.0,
        15,
        2890,
        false,
        0,
        "2026-10-11T12:00:00Z",
      ),
      beer(
        "frutas-coco",
        "Frutas Coco",
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
      beer(
        "malt-ferrugem",
        "Malt Ferrugem",
        "Irish Red Ale",
        5.2,
        24,
        2890,
        true,
        22,
        "2026-10-07T12:00:00Z",
      ),
      beer(
        "malt-cacau",
        "Malt Cacau",
        "Brown Ale",
        5.6,
        22,
        3050,
        false,
        14,
        "2026-10-10T12:00:00Z",
      ),
      beer(
        "malt-brasa",
        "Malt Brasa",
        "Amber Ale",
        5.4,
        28,
        2990,
        false,
        26,
        "2026-10-12T12:00:00Z",
      ),
      beer("malt-dunas", "Malt Dunas", "Dubbel", 6.5, 20, 3200, false, 10, "2026-10-16T12:00:00Z"),
    ],
  },
  {
    slug: "lager",
    name: "Lager",
    order: 4,
    beers: [
      beer("lager-praia", "Lager Praia", "Helles", 4.2, 18, 2490, true, 48, "2026-10-01T12:00:00Z"),
      beer("lager-sol", "Lager Sol", "Pilsen", 4.8, 26, 2590, false, 40, "2026-10-08T12:00:00Z"),
      beer(
        "lager-vento",
        "Lager Vento",
        "Vienna Lager",
        5.0,
        21,
        2690,
        false,
        28,
        "2026-10-13T12:00:00Z",
      ),
      beer(
        "lager-farol",
        "Lager Farol",
        "Märzen",
        5.8,
        23,
        2890,
        false,
        15,
        "2026-10-15T12:00:00Z",
      ),
    ],
  },
];

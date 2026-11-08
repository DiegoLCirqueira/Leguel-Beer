export interface BeerCategory {
  slug: string;
  name: string;
  order: number;
}

/** Cerveja ativa do catálogo, com a categoria. O preço é em centavos. */
export interface Beer {
  id: string;
  slug: string;
  name: string;
  style: string;
  category: BeerCategory;
  /** Teor alcoólico em %. */
  abv: number;
  ibu: number;
  volumeMl: number;
  priceCents: number;
  featured: boolean;
  stock: number;
  imageUrl: string | null;
  createdAt: Date;
}

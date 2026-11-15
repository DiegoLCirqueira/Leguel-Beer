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
  /** Estoque físico. */
  stock: number;
  /** Unidades reservadas por pedidos aguardando pagamento ainda dentro da validade. */
  reserved: number;
  /** Texto curto da página de produto; nulo some a seção. */
  description: string | null;
  /** Preço anterior em centavos, opcional: só vira desconto se for maior que o atual. */
  previousPriceCents: number | null;
  imageUrl: string | null;
  createdAt: Date;
}

/** Estoque físico menos as unidades reservadas em pedidos válidos; nunca negativa. */
export function availableQuantity(beer: Beer): number {
  return Math.max(0, beer.stock - beer.reserved);
}

export function isSoldOut(beer: Beer): boolean {
  return availableQuantity(beer) === 0;
}

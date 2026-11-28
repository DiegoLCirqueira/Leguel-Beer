import type { CriarCerveja, EditarCerveja } from "@leguele/shared";

/** A cerveja como o admin a vê: ativa ou não, com estoque físico e mínimo. */
export interface AdminBeer {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  style: string;
  description: string | null;
  priceCents: number;
  previousPriceCents: number | null;
  volumeMl: number;
  abv: number;
  ibu: number;
  stock: number;
  minStock: number;
  featured: boolean;
  active: boolean;
  imageUrl: string | null;
  createdAt: Date;
}

export const MAX_ACTIVE_BEERS_PER_CATEGORY = 4;

export class CategoryNotFoundError extends Error {
  constructor() {
    super("Categoria não encontrada.");
    this.name = "CategoryNotFoundError";
  }
}

export class BeerNameTakenError extends Error {
  constructor() {
    super("Já existe uma cerveja com este nome.");
    this.name = "BeerNameTakenError";
  }
}

export class CategoryFullError extends Error {
  constructor(categoryName: string) {
    super(
      `A categoria ${categoryName} já tem ${MAX_ACTIVE_BEERS_PER_CATEGORY} cervejas ativas. Desative uma antes.`,
    );
    this.name = "CategoryFullError";
  }
}

export type AdminBeerFilter = { busca?: string; estado?: "todas" | "ativas" | "inativas" };

/** Porta do cadastro de cervejas do admin. */
export interface AdminBeerRepository {
  list(filter: AdminBeerFilter): Promise<AdminBeer[]>;
  /** `null` se a cerveja não existe. */
  find(id: string): Promise<AdminBeer | null>;
  /** Lança `CategoryNotFoundError`, `BeerNameTakenError` ou `CategoryFullError`. */
  create(input: CriarCerveja): Promise<AdminBeer>;
  /** `null` se a cerveja não existe; os mesmos erros do cadastro. O slug nunca muda. */
  update(id: string, input: EditarCerveja): Promise<AdminBeer | null>;
}

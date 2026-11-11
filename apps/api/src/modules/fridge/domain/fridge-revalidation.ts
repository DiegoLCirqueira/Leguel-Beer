import type { Beer } from "../../catalog/domain/beer.js";

/** Item que continua na Geladeira depois da revalidação, com a cerveja como está agora. */
export interface ValidatedItem {
  beer: Beer;
  quantity: number;
}

/** O que a revalidação mudou, na ordem em que os itens entraram. */
export type FridgeAdjustment =
  | {
      type: "price-changed";
      beerId: string;
      name: string;
      seenPriceCents: number;
      currentPriceCents: number;
    }
  /** `name` é nulo quando a cerveja não existe. */
  | { type: "unavailable"; beerId: string; name: string | null }
  | {
      type: "quantity-reduced";
      beerId: string;
      name: string;
      previousQuantity: number;
      currentQuantity: number;
    };

export interface FridgeRevalidation {
  items: ValidatedItem[];
  adjustments: FridgeAdjustment[];
}

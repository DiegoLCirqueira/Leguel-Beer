import { availableQuantity, isSoldOut } from "../../catalog/domain/beer.js";
import type { FridgeBeerLookup } from "../domain/fridge-beer-lookup.js";
import type {
  FridgeAdjustment,
  FridgeRevalidation,
  ValidatedItem,
} from "../domain/fridge-revalidation.js";

/** O que o cliente tem na Geladeira: a cerveja, a quantidade e o preço que ele viu. */
export interface FridgeEntry {
  beerId: string;
  quantity: number;
  seenPriceCents: number;
}

/** O servidor é a fonte de preço, estoque e situação: confere cada item e ajusta o que mudou. */
export class RevalidateFridge {
  constructor(private readonly lookup: FridgeBeerLookup) {}

  async execute(entries: readonly FridgeEntry[]): Promise<FridgeRevalidation> {
    // O UUID vale igual em maiúsculas e minúsculas, mas o banco devolve minúsculas: compara-se assim.
    const normalized = entries
      .map((entry) => ({ ...entry, beerId: entry.beerId.toLowerCase() }))
      .filter(
        (entry, index, all) => all.findIndex((other) => other.beerId === entry.beerId) === index,
      );
    const found = await this.lookup.findByIds(normalized.map((entry) => entry.beerId));
    const items: ValidatedItem[] = [];
    const adjustments: FridgeAdjustment[] = [];
    for (const entry of normalized) {
      const match = found.find((candidate) => candidate.beer.id === entry.beerId);
      if (!match) {
        adjustments.push({ type: "unavailable", beerId: entry.beerId, name: null });
        continue;
      }
      const { beer } = match;
      if (!match.active || isSoldOut(beer)) {
        adjustments.push({ type: "unavailable", beerId: beer.id, name: beer.name });
        continue;
      }
      if (beer.priceCents !== entry.seenPriceCents) {
        adjustments.push({
          type: "price-changed",
          beerId: beer.id,
          name: beer.name,
          seenPriceCents: entry.seenPriceCents,
          currentPriceCents: beer.priceCents,
        });
      }
      const available = availableQuantity(beer);
      if (entry.quantity > available) {
        adjustments.push({
          type: "quantity-reduced",
          beerId: beer.id,
          name: beer.name,
          previousQuantity: entry.quantity,
          currentQuantity: available,
        });
      }
      items.push({ beer, quantity: Math.min(entry.quantity, available) });
    }
    return { items, adjustments };
  }
}

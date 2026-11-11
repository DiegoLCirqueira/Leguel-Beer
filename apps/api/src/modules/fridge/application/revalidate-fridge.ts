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
    const found = await this.lookup.findByIds(entries.map((entry) => entry.beerId));
    const items: ValidatedItem[] = [];
    const adjustments: FridgeAdjustment[] = [];
    for (const entry of entries) {
      const beer = found.find((candidate) => candidate.beer.id === entry.beerId)?.beer;
      if (!beer) continue;
      if (beer.priceCents !== entry.seenPriceCents) {
        adjustments.push({
          type: "price-changed",
          beerId: beer.id,
          name: beer.name,
          seenPriceCents: entry.seenPriceCents,
          currentPriceCents: beer.priceCents,
        });
      }
      items.push({ beer, quantity: entry.quantity });
    }
    return { items, adjustments };
  }
}

import type { GeladeiraRequest } from "@leguele/shared";
import type { FridgeEntry } from "../application/revalidate-fridge.js";

export function toEntries(body: GeladeiraRequest): FridgeEntry[] {
  return body.itens.map((item) => ({
    beerId: item.cervejaId,
    quantity: item.quantidade,
    seenPriceCents: item.precoVistoCentavos,
  }));
}

import { resumirGeladeira, type GeladeiraResponse } from "@leguele/shared";
import { toCervejaCard } from "../../catalog/presentation/catalog.mapper.js";
import type { FridgeRevalidation } from "../domain/fridge-revalidation.js";

export function toGeladeiraResponse(revalidation: FridgeRevalidation): GeladeiraResponse {
  const itens = revalidation.items.map(({ beer, quantity }) => ({
    cerveja: toCervejaCard(beer),
    quantidade: quantity,
    totalCentavos: quantity * beer.priceCents,
  }));
  return { itens, ajustes: [], ...resumirGeladeira(itens) };
}

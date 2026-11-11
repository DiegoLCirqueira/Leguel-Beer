import { resumirGeladeira, type AjusteDaGeladeira, type GeladeiraResponse } from "@leguele/shared";
import { toCervejaCard } from "../../catalog/presentation/catalog.mapper.js";
import type { FridgeAdjustment, FridgeRevalidation } from "../domain/fridge-revalidation.js";

function toAjuste(adjustment: FridgeAdjustment): AjusteDaGeladeira {
  switch (adjustment.type) {
    case "price-changed":
      return {
        tipo: "preco-mudou",
        cervejaId: adjustment.beerId,
        nome: adjustment.name,
        precoVistoCentavos: adjustment.seenPriceCents,
        precoAtualCentavos: adjustment.currentPriceCents,
      };
    case "unavailable":
      return { tipo: "indisponivel", cervejaId: adjustment.beerId, nome: adjustment.name };
    case "quantity-reduced":
      return {
        tipo: "quantidade-reduzida",
        cervejaId: adjustment.beerId,
        nome: adjustment.name,
        quantidadeAnterior: adjustment.previousQuantity,
        quantidadeAtual: adjustment.currentQuantity,
      };
  }
}

export function toGeladeiraResponse(revalidation: FridgeRevalidation): GeladeiraResponse {
  const itens = revalidation.items.map(({ beer, quantity }) => ({
    cerveja: toCervejaCard(beer),
    quantidade: quantity,
    totalCentavos: quantity * beer.priceCents,
  }));
  return { itens, ajustes: revalidation.adjustments.map(toAjuste), ...resumirGeladeira(itens) };
}

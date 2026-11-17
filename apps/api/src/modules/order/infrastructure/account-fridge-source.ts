import type { GetAccountFridge } from "../../fridge/application/get-account-fridge.js";
import { toGeladeiraResponse } from "../../fridge/presentation/fridge.mapper.js";
import type { FridgeSource } from "../domain/create-order-ports.js";

/**
 * A Geladeira da conta revalidada pela API. A revalidação grava os ajustes na Geladeira em transação
 * própria, fora da transação do pedido: eles sobrevivem ao rollback de `TOTAL_CHANGED` e `OUT_OF_STOCK`.
 */
export class AccountFridgeSource implements FridgeSource {
  constructor(private readonly fridge: GetAccountFridge) {}

  async revalidated(ownerId: string): ReturnType<FridgeSource["revalidated"]> {
    const revalidation = await this.fridge.execute(ownerId);
    return {
      lines: revalidation.items.map(({ beer, quantity }) => ({
        beerId: beer.id,
        name: beer.name,
        priceCents: beer.priceCents,
        quantity,
      })),
      adjustments: toGeladeiraResponse(revalidation).ajustes,
    };
  }
}

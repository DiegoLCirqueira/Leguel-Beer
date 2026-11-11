import type { AccountFridgeRepository } from "../domain/account-fridge-repository.js";
import type { FridgeRevalidation } from "../domain/fridge-revalidation.js";
import type { FridgeEntry, RevalidateFridge } from "./revalidate-fridge.js";

/**
 * Substitui a Geladeira da conta pelo que o cliente mandou, já revalidado: o que fica guardado é o
 * que a resposta mostra (preço atual, quantidade ajustada, sem as cervejas que saíram). Repetir o
 * mesmo envio dá o mesmo resultado.
 */
export class SaveAccountFridge {
  constructor(
    private readonly revalidate: RevalidateFridge,
    private readonly fridges: AccountFridgeRepository,
  ) {}

  async execute(profileId: string, entries: readonly FridgeEntry[]): Promise<FridgeRevalidation> {
    const revalidation = await this.revalidate.execute(entries);
    await this.fridges.replace(
      profileId,
      revalidation.items.map(({ beer, quantity }) => ({
        beerId: beer.id,
        quantity,
        seenPriceCents: beer.priceCents,
      })),
    );
    return revalidation;
  }
}

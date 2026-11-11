import type { AccountFridgeRepository } from "../domain/account-fridge-repository.js";
import type { FridgeRevalidation } from "../domain/fridge-revalidation.js";
import type { RevalidateFridge } from "./revalidate-fridge.js";

/**
 * Lê a Geladeira da conta e a revalida: o servidor é a fonte de preço, estoque e situação. Quando a
 * revalidação ajusta algo, grava o resultado, para o mesmo aviso não se repetir na próxima leitura.
 * Ler, revalidar e gravar acontecem sob a mesma trava da conta, então uma gravação de outro
 * aparelho não é sobrescrita pela versão antiga.
 */
export class GetAccountFridge {
  constructor(
    private readonly revalidate: RevalidateFridge,
    private readonly fridges: AccountFridgeRepository,
  ) {}

  async execute(profileId: string): Promise<FridgeRevalidation> {
    return this.fridges.update(profileId, async (stored) => {
      const revalidation = await this.revalidate.execute(stored);
      const adjusted = revalidation.adjustments.length > 0;
      return {
        items: adjusted
          ? revalidation.items.map(({ beer, quantity }) => ({
              beerId: beer.id,
              quantity,
              seenPriceCents: beer.priceCents,
            }))
          : null,
        result: revalidation,
      };
    });
  }
}

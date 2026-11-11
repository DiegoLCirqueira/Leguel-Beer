import type { AccountFridgeRepository } from "../domain/account-fridge-repository.js";
import type { FridgeRevalidation } from "../domain/fridge-revalidation.js";
import type { RevalidateFridge } from "./revalidate-fridge.js";

/** Lê a Geladeira da conta e a revalida: o servidor é a fonte de preço, estoque e situação. */
export class GetAccountFridge {
  constructor(
    private readonly revalidate: RevalidateFridge,
    private readonly fridges: AccountFridgeRepository,
  ) {}

  async execute(profileId: string): Promise<FridgeRevalidation> {
    const stored = await this.fridges.find(profileId);
    return this.revalidate.execute(
      stored.map(({ beerId, quantity, seenPriceCents }) => ({ beerId, quantity, seenPriceCents })),
    );
  }
}

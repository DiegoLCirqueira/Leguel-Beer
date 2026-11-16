import type { GetAccountFridge } from "../../fridge/application/get-account-fridge.js";
import type { FridgeSubtotalProvider } from "../domain/fridge-subtotal.js";

/**
 * Subtotal da Geladeira da conta tirado da própria Geladeira, já revalidada pela API com os preços e as
 * quantidades atuais. O subtotal nunca vem do cliente.
 */
export class AccountFridgeSubtotal implements FridgeSubtotalProvider {
  constructor(private readonly fridge: GetAccountFridge) {}

  async subtotalCents(ownerId: string): Promise<number> {
    const { items } = await this.fridge.execute(ownerId);
    return items.reduce((total, { beer, quantity }) => total + beer.priceCents * quantity, 0);
  }
}

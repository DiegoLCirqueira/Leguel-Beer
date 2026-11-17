import type { CotacaoDeFrete } from "@leguele/shared";
import type { QuoteShipping } from "../../delivery/application/quote-shipping.js";
import type { ShipTo, ShippingQuoter } from "../domain/create-order-ports.js";

/** O pedido cota o frete e copia o endereço pelo caso de uso do módulo de entrega. */
export class DeliveryShippingQuoter implements ShippingQuoter {
  constructor(private readonly quoting: QuoteShipping) {}

  async quote(
    ownerId: string,
    addressId: string,
    subtotalCents: number,
  ): Promise<{ shipTo: ShipTo; quote: CotacaoDeFrete }> {
    const { address, quote } = await this.quoting.forSubtotal(ownerId, addressId, subtotalCents);
    return {
      quote,
      shipTo: {
        zip: address.zip,
        street: address.street,
        number: address.number,
        complement: address.complement ?? null,
        district: address.district,
        city: address.city,
        state: address.state,
      },
    };
  }
}

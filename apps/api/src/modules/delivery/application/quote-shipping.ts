import { calcularFrete, type CotacaoDeFrete } from "@leguele/shared";
import { NotFoundError } from "../../../common/errors/not-found-error.js";
import type { AddressRepository } from "../domain/address-repository.js";
import type { DeliverySettingsRepository } from "../domain/delivery-settings-repository.js";
import type { FridgeSubtotalProvider } from "../domain/fridge-subtotal.js";
import type { RouteCalculator } from "../domain/maps.js";

export class QuoteShipping {
  constructor(
    private readonly addresses: AddressRepository,
    private readonly settings: DeliverySettingsRepository,
    private readonly router: RouteCalculator,
    private readonly fridgeSubtotal: FridgeSubtotalProvider,
  ) {}

  async execute(ownerId: string, addressId: string): Promise<CotacaoDeFrete> {
    const address = (await this.addresses.list(ownerId)).find(({ id }) => id === addressId);
    if (!address) throw new NotFoundError();
    const config = await this.settings.get();
    const subtotalCentavos = await this.fridgeSubtotal.subtotalCents(ownerId);

    return calcularFrete(
      { distanciaMetros: address.distanceMeters ?? 0, subtotalCentavos },
      config,
    );
  }
}

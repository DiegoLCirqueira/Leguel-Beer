import { LIMITE_DE_ENDERECOS } from "@leguele/shared";
import type { Address, AddressInput } from "../domain/address.js";
import { AddressLimitReachedError, AddressNotLocatedError } from "../domain/address-errors.js";
import { isOutsideDeliveryArea } from "../domain/delivery-area.js";
import type { AddressRepository } from "../domain/address-repository.js";
import type { DeliverySettingsRepository } from "../domain/delivery-settings-repository.js";
import {
  validCoordinates,
  validDistanceMeters,
  type Geocoder,
  type RouteCalculator,
} from "../domain/maps.js";
import type { AddressListItem } from "./list-addresses.js";

export class AddAddress {
  constructor(
    private readonly addresses: AddressRepository,
    private readonly geocoder: Geocoder,
    private readonly router: RouteCalculator,
    private readonly settings: DeliverySettingsRepository,
    private readonly newId: () => string,
    private readonly now: () => Date,
  ) {}

  async execute(ownerId: string, input: AddressInput): Promise<AddressListItem> {
    // Antes de gastar os mapas: com o limite cheio, nada é enviado a eles.
    if ((await this.addresses.list(ownerId)).length >= LIMITE_DE_ENDERECOS) {
      throw new AddressLimitReachedError();
    }
    const { origem, raioMaximoMetros } = await this.settings.get();
    // Os mapas ficam fora da trava da conta: nenhuma chamada externa dentro da gravação.
    const coordinates = await this.geocoder.geocode({
      street: input.street,
      number: input.number,
      district: input.district,
      city: input.city,
      state: input.state,
      zip: input.zip,
    });
    if (!coordinates) throw new AddressNotLocatedError();
    validCoordinates(coordinates);
    const distanceMeters = validDistanceMeters(
      await this.router.routeDistanceMeters(origem, coordinates),
    );

    const created = await this.addresses.update(ownerId, (current) => {
      // Reconfere sob a trava: outra requisição pode ter ocupado a última vaga enquanto os mapas respondiam.
      if (current.length >= LIMITE_DE_ENDERECOS) throw new AddressLimitReachedError();
      const address: Address = {
        ...input,
        id: this.newId(),
        ownerId,
        isDefault: current.length === 0,
        coordinates,
        distanceMeters,
        routeOrigin: origem,
        createdAt: this.now(),
      };
      return { addresses: [...current, address], result: address };
    });
    return {
      ...created,
      outsideArea: isOutsideDeliveryArea(created.distanceMeters, raioMaximoMetros),
    };
  }
}

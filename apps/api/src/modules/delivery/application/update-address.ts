import { NotFoundError } from "../../../common/errors/not-found-error.js";
import type { Address, AddressInput, Coordinates } from "../domain/address.js";
import { AddressConcurrentEditError, AddressNotLocatedError } from "../domain/address-errors.js";
import type { AddressRepository } from "../domain/address-repository.js";
import type { DeliverySettingsRepository } from "../domain/delivery-settings-repository.js";
import { isOutsideDeliveryArea } from "../domain/delivery-area.js";
import type { Geocoder, RouteCalculator } from "../domain/maps.js";
import type { AddressListItem } from "./list-addresses.js";

/** Mudar qualquer um destes muda o lugar: recalcula coordenadas e distância. Apelido e complemento não. */
function locationChanged(address: Address, input: AddressInput): boolean {
  return (
    address.zip !== input.zip ||
    address.street !== input.street ||
    address.number !== input.number ||
    address.district !== input.district ||
    address.city !== input.city ||
    address.state !== input.state
  );
}

const MAX_ATTEMPTS = 3;

function sameLocation(a: Address, b: Address): boolean {
  return !locationChanged(a, b);
}

interface Recalculated {
  coordinates: Coordinates;
  distanceMeters: number | null;
  routeOrigin: Coordinates;
}

export class UpdateAddress {
  constructor(
    private readonly addresses: AddressRepository,
    private readonly geocoder: Geocoder,
    private readonly router: RouteCalculator,
    private readonly settings: DeliverySettingsRepository,
  ) {}

  async execute(ownerId: string, addressId: string, input: AddressInput): Promise<AddressListItem> {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const updated = await this.attempt(ownerId, addressId, input);
      if (updated) return updated;
    }
    throw new AddressConcurrentEditError();
  }

  /** Uma tentativa; `null` quando o lugar gravado mudou entre a leitura e a trava e é preciso reler. */
  private async attempt(
    ownerId: string,
    addressId: string,
    input: AddressInput,
  ): Promise<AddressListItem | null> {
    const existing = (await this.addresses.list(ownerId)).find(({ id }) => id === addressId);
    if (!existing) throw new NotFoundError();
    const { origem, raioMaximoMetros } = await this.settings.get();

    // Os mapas ficam fora da trava da conta: nenhuma chamada externa dentro da gravação.
    const recalculated = locationChanged(existing, input)
      ? await this.recalculate(input, origem)
      : null;

    const updated = await this.addresses.update(ownerId, (current) => {
      const target = current.find((address) => address.id === addressId);
      if (!target) throw new NotFoundError();
      // Outra edição mudou o lugar depois da leitura: a decisão de recalcular ou não ficou velha.
      if (sameLocation(target, existing) === false) return { addresses: null, result: null };
      // Campos opcionais ausentes no formulário são apagados, não herdados do endereço antigo.
      const next: Address = {
        ...target,
        ...input,
        nickname: input.nickname,
        complement: input.complement,
        ...recalculated,
      };
      return {
        addresses: current.map((address) => (address.id === addressId ? next : address)),
        result: next,
      };
    });
    if (!updated) return null;
    return {
      ...updated,
      outsideArea: isOutsideDeliveryArea(updated.distanceMeters, raioMaximoMetros),
    };
  }

  private async recalculate(input: AddressInput, origem: Coordinates): Promise<Recalculated> {
    const coordinates = await this.geocoder.geocode({
      street: input.street,
      number: input.number,
      district: input.district,
      city: input.city,
      state: input.state,
      zip: input.zip,
    });
    if (!coordinates) throw new AddressNotLocatedError();
    const distanceMeters = await this.router.routeDistanceMeters(origem, coordinates);
    return { coordinates, distanceMeters, routeOrigin: origem };
  }
}

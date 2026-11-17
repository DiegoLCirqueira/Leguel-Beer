import { calcularFrete, type CotacaoDeFrete } from "@leguele/shared";
import { NotFoundError } from "../../../common/errors/not-found-error.js";
import type { Address, Coordinates } from "../domain/address.js";
import type { AddressRepository } from "../domain/address-repository.js";
import type { DeliverySettingsRepository } from "../domain/delivery-settings-repository.js";
import type { FridgeSubtotalProvider } from "../domain/fridge-subtotal.js";
import { validDistanceMeters, type RouteCalculator } from "../domain/maps.js";

function sameCoordinates(a: Coordinates, b: Coordinates): boolean {
  return a.latitude === b.latitude && a.longitude === b.longitude;
}

export class QuoteShipping {
  constructor(
    private readonly addresses: AddressRepository,
    private readonly settings: DeliverySettingsRepository,
    private readonly router: RouteCalculator,
    private readonly fridgeSubtotal: FridgeSubtotalProvider,
  ) {}

  async execute(ownerId: string, addressId: string): Promise<CotacaoDeFrete> {
    // O subtotal só é lido depois de o endereço e as configurações existirem, como sempre foi.
    const found = await this.find(ownerId, addressId);
    const subtotalCentavos = await this.fridgeSubtotal.subtotalCents(ownerId);
    return (await this.quoteFor(ownerId, found, subtotalCentavos)).quote;
  }

  /**
   * Cota o frete do endereço para um subtotal já conhecido (o da Geladeira revalidada que o pedido
   * usa) e devolve também o endereço, para o pedido guardar a cópia.
   */
  async forSubtotal(
    ownerId: string,
    addressId: string,
    subtotalCentavos: number,
  ): Promise<{ address: Address; quote: CotacaoDeFrete }> {
    return this.quoteFor(ownerId, await this.find(ownerId, addressId), subtotalCentavos);
  }

  private async find(ownerId: string, addressId: string) {
    const address = (await this.addresses.list(ownerId)).find(({ id }) => id === addressId);
    if (!address) throw new NotFoundError();
    return { address, config: await this.settings.get() };
  }

  private async quoteFor(
    ownerId: string,
    {
      address,
      config,
    }: { address: Address; config: Awaited<ReturnType<DeliverySettingsRepository["get"]>> },
    subtotalCentavos: number,
  ): Promise<{ address: Address; quote: CotacaoDeFrete }> {
    const distanceMeters = sameCoordinates(address.routeOrigin, config.origem)
      ? address.distanceMeters
      : await this.recalculate(ownerId, address, config.origem);

    // Sem rota até a cervejaria o endereço está fora da área, e a distância nunca é inventada.
    if (distanceMeters === null) return { address, quote: { naArea: false } };

    return {
      address,
      quote: calcularFrete({ distanciaMetros: distanceMeters, subtotalCentavos }, config),
    };
  }

  /**
   * A origem das configurações mudou: calcula a distância de rota de novo, na própria requisição, e a
   * guarda com a origem usada. A rota é chamada fora da trava da conta; se ela falhar, o erro sobe e
   * a distância antiga (de outra origem) não é usada.
   */
  private async recalculate(
    ownerId: string,
    address: Address,
    origin: Coordinates,
  ): Promise<number | null> {
    const distanceMeters = validDistanceMeters(
      await this.router.routeDistanceMeters(origin, address.coordinates),
    );

    await this.addresses.update(ownerId, (current) => {
      const target = current.find(({ id }) => id === address.id);
      if (!target) throw new NotFoundError();
      // Se o endereço mudou de lugar enquanto a rota era calculada, o resultado já não vale para ele.
      if (!sameCoordinates(target.coordinates, address.coordinates)) {
        return { addresses: null, result: undefined };
      }
      return {
        addresses: current.map((candidate) =>
          candidate.id === address.id
            ? { ...candidate, distanceMeters, routeOrigin: origin }
            : candidate,
        ),
        result: undefined,
      };
    });
    return distanceMeters;
  }
}

import type { Coordinates } from "../domain/address.js";
import {
  MapsUnavailableError,
  type GeocodeQuery,
  type Geocoder,
  type RouteCalculator,
} from "../domain/maps.js";

/** Geocodificador fake: devolve as coordenadas dadas, `null` (não achou) ou falha. Guarda o que recebeu. */
export class FakeGeocoder implements Geocoder {
  readonly received: GeocodeQuery[] = [];

  constructor(
    private outcome: Coordinates | null | "unavailable" = { latitude: -9.66, longitude: -35.74 },
  ) {}

  respondWith(outcome: Coordinates | null | "unavailable"): void {
    this.outcome = outcome;
  }

  async geocode(query: GeocodeQuery): Promise<Coordinates | null> {
    this.received.push(query);
    if (this.outcome === "unavailable") throw new MapsUnavailableError();
    return this.outcome;
  }
}

/** Calculador de rota fake: devolve a distância dada, `null` (sem rota) ou falha. Guarda o que recebeu. */
export class FakeRouteCalculator implements RouteCalculator {
  readonly received: { origin: Coordinates; destination: Coordinates }[] = [];

  constructor(private outcome: number | null | "unavailable" = 5_200) {}

  respondWith(outcome: number | null | "unavailable"): void {
    this.outcome = outcome;
  }

  async routeDistanceMeters(origin: Coordinates, destination: Coordinates): Promise<number | null> {
    this.received.push({ origin, destination });
    if (this.outcome === "unavailable") throw new MapsUnavailableError();
    return this.outcome;
  }
}

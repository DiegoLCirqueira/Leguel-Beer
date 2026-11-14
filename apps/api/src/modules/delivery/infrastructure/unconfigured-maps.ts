import type { Coordinates } from "../domain/address.js";
import { MapsUnavailableError, type Geocoder, type RouteCalculator } from "../domain/maps.js";

/**
 * Adaptador de mapas enquanto nenhum serviço está configurado: sempre indisponível. Assim a API
 * nunca inventa coordenadas nem distância; responde 503 `MAPS_UNAVAILABLE` e não grava nada.
 * O adaptador do serviço escolhido no spike LB-62 o substitui no módulo (depende da chave, do Diego).
 */
export class UnconfiguredMaps implements Geocoder, RouteCalculator {
  async geocode(): Promise<Coordinates | null> {
    throw new MapsUnavailableError();
  }

  async routeDistanceMeters(
    _origin: Coordinates,
    _destination: Coordinates,
  ): Promise<number | null> {
    throw new MapsUnavailableError();
  }
}

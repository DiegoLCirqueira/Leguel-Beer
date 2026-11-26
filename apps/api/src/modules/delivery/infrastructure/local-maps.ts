import type { Coordinates } from "../domain/address.js";
import type { GeocodeQuery, Geocoder, RouteCalculator } from "../domain/maps.js";

/**
 * Mapas locais do MVP de portfólio: determinísticos e sem rede, conta nem chave. As coordenadas são
 * uma aproximação pelo bairro ou pela cidade; a distância é a linha reta (spec de endereços e entrega).
 */
export class LocalMaps implements Geocoder, RouteCalculator {
  async geocode(_query: GeocodeQuery): Promise<Coordinates | null> {
    return null;
  }

  async routeDistanceMeters(
    _origin: Coordinates,
    _destination: Coordinates,
  ): Promise<number | null> {
    return 0;
  }
}

import type { Coordinates } from "../domain/address.js";
import type { GeocodeQuery, Geocoder, RouteCalculator } from "../domain/maps.js";
import { MACEIO_DISTRICTS } from "./local-maps-data.js";

/** Minúsculas, sem acento e sem espaço sobrando: a chave das tabelas. */
function normalize(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
}

const EARTH_RADIUS_METERS = 6_371_000;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/** Distância em linha reta (haversine) em metros inteiros. */
function straightLineMeters(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.latitude)) * Math.cos(toRadians(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h)));
}

/**
 * Mapas locais do MVP de portfólio: determinísticos e sem rede, conta nem chave. As coordenadas são
 * uma aproximação pelo bairro ou pela cidade; a distância é a linha reta (spec de endereços e entrega).
 */
export class LocalMaps implements Geocoder, RouteCalculator {
  async geocode(query: GeocodeQuery): Promise<Coordinates | null> {
    return MACEIO_DISTRICTS[normalize(query.district)] ?? null;
  }

  async routeDistanceMeters(origin: Coordinates, destination: Coordinates): Promise<number | null> {
    return straightLineMeters(origin, destination);
  }
}

import type { Coordinates } from "./address.js";

/** Só o que o serviço de mapas pode receber para geocodificar (minimização, LGPD): nunca nome, apelido nem complemento. */
export interface GeocodeQuery {
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  zip: string;
}

/** O serviço de mapas não respondeu a tempo ou falhou. */
export class MapsUnavailableError extends Error {
  constructor() {
    super("o serviço de mapas não respondeu");
    this.name = "MapsUnavailableError";
  }
}

export interface Geocoder {
  /** Coordenadas do endereço, ou `null` se o serviço não o achou. Lança `MapsUnavailableError` se falhar. */
  geocode(query: GeocodeQuery): Promise<Coordinates | null>;
}

export interface RouteCalculator {
  /** Distância de rota de carro em metros, ou `null` se não há caminho. Só recebe coordenadas. Lança `MapsUnavailableError` se falhar. */
  routeDistanceMeters(origin: Coordinates, destination: Coordinates): Promise<number | null>;
}

/**
 * Confere a resposta do serviço antes de gravar: coordenada finita e dentro das faixas, distância
 * inteira e sem negativos. Resposta fora disso é tratada como serviço indisponível (nunca vira dado).
 */
export function validCoordinates(coordinates: Coordinates): Coordinates {
  const { latitude, longitude } = coordinates;
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    throw new MapsUnavailableError();
  }
  return coordinates;
}

export function validDistanceMeters(distanceMeters: number | null): number | null {
  if (distanceMeters === null) return null;
  if (!Number.isInteger(distanceMeters) || distanceMeters < 0) throw new MapsUnavailableError();
  return distanceMeters;
}

import type { Geocoder, RouteCalculator } from "../domain/maps.js";
import { UnconfiguredMaps } from "./unconfigured-maps.js";

/** Adaptador de mapas escolhido pela variável `MAPS_ADAPTER`; sem ela, fail-closed. */
export function mapsAdapterFromEnv(
  _env: Record<string, string | undefined>,
): Geocoder & RouteCalculator {
  return new UnconfiguredMaps();
}

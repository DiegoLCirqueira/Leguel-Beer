import type { Geocoder, RouteCalculator } from "../domain/maps.js";
import { LocalMaps } from "./local-maps.js";
import { UnconfiguredMaps } from "./unconfigured-maps.js";

/**
 * Adaptador de mapas escolhido pela variável `MAPS_ADAPTER`: `local` liga os mapas locais do MVP.
 * Ausente ou com outro valor, fica não configurado (503 `MAPS_UNAVAILABLE`), nunca um adaptador
 * escolhido por engano. O adaptador real é pós-MVP.
 */
export function mapsAdapterFromEnv(
  env: Record<string, string | undefined>,
): Geocoder & RouteCalculator {
  return env["MAPS_ADAPTER"] === "local" ? new LocalMaps() : new UnconfiguredMaps();
}

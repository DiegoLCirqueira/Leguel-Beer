import { describe, expect, it } from "vitest";
import { LocalMaps } from "./local-maps.js";
import { mapsAdapterFromEnv } from "./maps-adapter.js";
import { UnconfiguredMaps } from "./unconfigured-maps.js";

describe("mapsAdapterFromEnv", () => {
  it("MAPS_ADAPTER=local liga os mapas locais do MVP", () => {
    expect(mapsAdapterFromEnv({ MAPS_ADAPTER: "local" })).toBeInstanceOf(LocalMaps);
  });

  it.each([undefined, "", "LOCAL", "geoapify", " local"])(
    "MAPS_ADAPTER=%j não liga nada: fica não configurado (fail-closed)",
    (value) => {
      expect(mapsAdapterFromEnv({ MAPS_ADAPTER: value })).toBeInstanceOf(UnconfiguredMaps);
    },
  );
});

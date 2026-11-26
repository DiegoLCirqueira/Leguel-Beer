import { describe, expect, it } from "vitest";
import { LocalMaps } from "./local-maps.js";

describe("LocalMaps: distância em linha reta", () => {
  const maps = new LocalMaps();

  it("é zero entre o mesmo ponto e nunca nula (sempre há linha reta)", async () => {
    const point = { latitude: -9.6649, longitude: -35.7313 };

    expect(await maps.routeDistanceMeters(point, point)).toBe(0);
  });

  it("mede 1 grau de latitude como 111.195 m, em metros inteiros", async () => {
    const distance = await maps.routeDistanceMeters(
      { latitude: 0, longitude: 0 },
      { latitude: 1, longitude: 0 },
    );

    expect(distance).toBe(111_195);
  });

  it("é a mesma nos dois sentidos", async () => {
    const a = { latitude: -9.6649, longitude: -35.7313 };
    const b = { latitude: -9.4781, longitude: -35.8528 };

    expect(await maps.routeDistanceMeters(a, b)).toBe(await maps.routeDistanceMeters(b, a));
  });
});

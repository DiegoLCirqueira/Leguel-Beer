import { describe, expect, it } from "vitest";
import type { GeocodeQuery } from "../domain/maps.js";
import { LocalMaps } from "./local-maps.js";

const ORIGEM = { latitude: -9.6649, longitude: -35.7313 };

const endereco = (overrides: Partial<GeocodeQuery> = {}): GeocodeQuery => ({
  street: "Rua do Sol",
  number: "100",
  district: "Ponta Verde",
  city: "Maceió",
  state: "AL",
  zip: "57035000",
  ...overrides,
});

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

  it("encurta o grau de longitude com a latitude: no equador 111.195 m, a 60° a metade", async () => {
    const noEquador = await maps.routeDistanceMeters(
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 1 },
    );
    const aSessentaGraus = await maps.routeDistanceMeters(
      { latitude: 60, longitude: 0 },
      { latitude: 60, longitude: 1 },
    );

    expect(noEquador).toBe(111_195);
    expect(aSessentaGraus).toBe(55_597);
  });
});

describe("LocalMaps: coordenadas pelo bairro e pela cidade", () => {
  const maps = new LocalMaps();

  it("acha um bairro conhecido de Maceió, sem diferenciar maiúsculas nem acentos", async () => {
    const pontaVerde = await maps.geocode(endereco({ district: "Ponta Verde" }));
    const jaragua = await maps.geocode(endereco({ district: "  JARAGUA " }));

    expect(pontaVerde).toEqual({ latitude: -9.6636, longitude: -35.7064 });
    expect(jaragua).toEqual({ latitude: -9.6649, longitude: -35.7313 });
  });

  it("os bairros de Maceió ficam dentro dos 25 km da origem", async () => {
    for (const district of ["Ponta Verde", "Jatiúca", "Benedito Bentes", "Ipioca", "Pescaria"]) {
      const coordinates = await maps.geocode(endereco({ district }));
      const distance = await maps.routeDistanceMeters(ORIGEM, coordinates!);

      expect(distance).toBeLessThan(25_000);
    }
  });
});

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

describe("LocalMaps: bairro desconhecido e outras cidades", () => {
  const maps = new LocalMaps();
  const MACEIO = { latitude: -9.6658, longitude: -35.7353 };

  it("bairro desconhecido de Maceió cai perto do centro, pelo CEP, sempre no mesmo lugar", async () => {
    const first = await maps.geocode(endereco({ district: "Bairro Novo", zip: "57045123" }));
    const again = await maps.geocode(endereco({ district: "Bairro Novo", zip: "57045123" }));
    const other = await maps.geocode(endereco({ district: "Bairro Novo", zip: "57099456" }));

    expect(first).toEqual(again);
    expect(first).not.toEqual(other);
    expect(await maps.routeDistanceMeters(MACEIO, first!)).toBeLessThan(4_000);
  });

  it("usa o centro da cidade, com o CEP, quando o município não é Maceió e o bairro não vale lá", async () => {
    const rioLargo = await maps.geocode(
      endereco({ city: "Rio Largo", district: "Centro", zip: "57100000" }),
    );

    expect(rioLargo).not.toEqual(MACEIO);
    expect(
      await maps.routeDistanceMeters({ latitude: -9.4781, longitude: -35.8528 }, rioLargo!),
    ).toBeLessThan(4_000);
  });

  it("cidade fora da tabela não é achada (o endereço vira 'não encontrado')", async () => {
    expect(await maps.geocode(endereco({ city: "Cidade Inventada" }))).toBeNull();
  });

  it("cidades vizinhas ficam dentro do raio e as distantes, fora de 25 km", async () => {
    const dentro = await maps.geocode(endereco({ city: "Marechal Deodoro", district: "Centro" }));
    const fora = await maps.geocode(endereco({ city: "Murici", district: "Centro" }));

    expect(await maps.routeDistanceMeters(ORIGEM, dentro!)).toBeLessThan(25_000);
    expect(await maps.routeDistanceMeters(ORIGEM, fora!)).toBeGreaterThan(25_000);
  });

  it("CEPs vizinhos mudam a latitude, não só a longitude", async () => {
    const a = await maps.geocode(endereco({ district: "Bairro Novo", zip: "57045123" }));
    const b = await maps.geocode(endereco({ district: "Bairro Novo", zip: "57045124" }));

    expect(a!.latitude).not.toBe(b!.latitude);
  });
});

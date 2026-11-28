import { FOTO_TAMANHO_MAXIMO_BYTES } from "@leguele/shared";
import { beforeEach, describe, expect, it } from "vitest";
import type { AdminBeer, AdminBeerRepository } from "../domain/admin-beer.js";
import { InvalidPhotoError, PhotoPathInvalidError } from "../domain/beer-photo.js";
import { InMemoryPhotoStorage, InMemoryPhotoUploads } from "../testing/photo-fakes.js";
import { PublishBeerPhoto } from "./publish-beer-photo.js";

const NOW = new Date("2026-11-28T15:00:00.000Z");
const ADMIN = "admin-1";
const BEER_ID = "beer-1";
const TOKEN = "token-do-admin";

const webp = (size: number): Uint8Array => {
  const bytes = new Uint8Array(size);
  bytes.set([0x52, 0x49, 0x46, 0x46], 0); // RIFF
  bytes.set([0x57, 0x45, 0x42, 0x50], 8); // WEBP
  return bytes;
};

function beerRepository() {
  const beer = { id: BEER_ID, imageUrl: null } as AdminBeer;
  const repository = {
    find: async (id: string) => (id === BEER_ID ? beer : null),
    setImage: async (id: string, imageUrl: string) => {
      if (id !== BEER_ID) return null;
      beer.imageUrl = imageUrl;
      return beer;
    },
  } as unknown as AdminBeerRepository;
  return { beer, repository };
}

describe("PublishBeerPhoto", () => {
  let uploads: InMemoryPhotoUploads;
  let storage: InMemoryPhotoStorage;
  let beers: ReturnType<typeof beerRepository>;
  let publish: PublishBeerPhoto;
  let path: string;

  beforeEach(async () => {
    uploads = new InMemoryPhotoUploads();
    storage = new InMemoryPhotoStorage();
    beers = beerRepository();
    publish = new PublishBeerPhoto(
      beers.repository,
      uploads,
      storage,
      () => NOW,
      () => "foto-nova",
    );
    path = (await uploads.issue(ADMIN, NOW)).path;
  });

  const run = (overrides: Partial<{ path: string; adminId: string; beerId: string }> = {}) =>
    publish.execute({ beerId: BEER_ID, adminId: ADMIN, token: TOKEN, path, ...overrides });

  it("publica o WebP de 40 KB: copia com nome novo, apaga o envio e grava o endereço público", async () => {
    storage.uploads.set(path, webp(FOTO_TAMANHO_MAXIMO_BYTES));

    const beer = await run();

    expect(beer?.imageUrl).toBe("https://storage.test/public/cervejas/foto-nova.webp");
    expect([...storage.published.keys()]).toEqual(["foto-nova.webp"]);
    expect(storage.deleted).toEqual([path]);
    expect(new Set(storage.tokens)).toEqual(new Set([TOKEN]));
  });

  it("recusa o arquivo que não é WebP, apaga o envio e não muda a cerveja", async () => {
    storage.uploads.set(path, new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0, 0, 0, 0, 0, 0]));

    await expect(run()).rejects.toBeInstanceOf(InvalidPhotoError);

    expect(storage.deleted).toEqual([path]);
    expect(storage.published.size).toBe(0);
    expect(beers.beer.imageUrl).toBeNull();
  });

  it("recusa WebP acima de 40 KB, mesmo com o cabeçalho certo", async () => {
    storage.uploads.set(path, webp(FOTO_TAMANHO_MAXIMO_BYTES + 1));

    await expect(run()).rejects.toBeInstanceOf(InvalidPhotoError);

    expect(storage.deleted).toEqual([path]);
    expect(beers.beer.imageUrl).toBeNull();
  });

  it("caminho que nunca recebeu arquivo é foto inválida e nada é publicado", async () => {
    await expect(run()).rejects.toBeInstanceOf(InvalidPhotoError);

    expect(storage.published.size).toBe(0);
  });

  it.each([
    ["que não foi emitido", { path: "99999999-9999-4999-8999-999999999999.webp" }],
    ["emitido a outro admin", { adminId: "outro-admin" }],
  ])("caminho %s é recusado e nada é lido nem publicado", async (_nome, overrides) => {
    storage.uploads.set(path, webp(1000));

    await expect(run(overrides)).rejects.toBeInstanceOf(PhotoPathInvalidError);

    expect(storage.tokens).toEqual([]);
    expect(storage.published.size).toBe(0);
  });

  it("caminho vencido (10 minutos) e caminho já usado são recusados", async () => {
    storage.uploads.set(path, webp(1000));
    const late = new PublishBeerPhoto(
      beers.repository,
      uploads,
      storage,
      () => new Date(NOW.getTime() + 10 * 60_000),
      () => "x",
    );

    await expect(
      late.execute({ beerId: BEER_ID, adminId: ADMIN, token: TOKEN, path }),
    ).rejects.toBeInstanceOf(PhotoPathInvalidError);

    await run();
    storage.uploads.set(path, webp(1000));
    await expect(run()).rejects.toBeInstanceOf(PhotoPathInvalidError);
  });

  it("cerveja que não existe devolve null sem gastar o caminho", async () => {
    storage.uploads.set(path, webp(1000));

    expect(await run({ beerId: "outra" })).toBeNull();

    expect(await uploads.consume(path, ADMIN, NOW)).toBe(true);
  });

  it("se o armazenamento público falha, a cerveja fica como estava", async () => {
    storage.uploads.set(path, webp(1000));
    storage.failPublish = true;

    await expect(run()).rejects.toThrow("armazenamento fora");

    expect(beers.beer.imageUrl).toBeNull();
  });
});

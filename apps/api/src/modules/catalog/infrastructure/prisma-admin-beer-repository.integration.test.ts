import type { CriarCerveja, EditarCerveja } from "@leguele/shared";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";
import {
  BeerNameTakenError,
  CategoryFullError,
  CategoryNotFoundError,
} from "../domain/admin-beer.js";
import { PrismaAdminBeerRepository } from "./prisma-admin-beer-repository.js";

describe("PrismaAdminBeerRepository (banco real)", () => {
  const prisma = new PrismaService();
  const repository = new PrismaAdminBeerRepository(prisma);

  beforeEach(async () => {
    await resetDatabase(prisma);
    await prisma.category.create({ data: { slug: "ipa", name: "IPA", order: 1 } });
    await prisma.category.create({ data: { slug: "lager", name: "Lager", order: 2 } });
  });

  afterAll(() => prisma.onModuleDestroy());

  const input = (extra: Partial<CriarCerveja> = {}): CriarCerveja => ({
    nome: "Maré Alta",
    categoriaSlug: "ipa",
    estilo: "American IPA",
    precoCentavos: 3_900,
    volumeMl: 500,
    teorAlcoolico: 6.5,
    ibu: 60,
    estoqueInicial: 24,
    estoqueMinimo: 6,
    destaque: false,
    ativa: true,
    ...extra,
  });

  /** O que a edição recebe: o mesmo corpo, sem o estoque inicial. */
  const edit = (extra: Partial<CriarCerveja> = {}): EditarCerveja => {
    const { estoqueInicial: _inicial, ...rest } = input(extra);
    void _inicial;
    return rest;
  };

  const fillCategory = async (slug: string, count: number) => {
    for (let i = 0; i < count; i += 1) {
      await repository.create(input({ nome: `${slug} ${i}`, categoriaSlug: slug }));
    }
  };

  describe("create", () => {
    it("cadastra com slug gerado do nome, estoque inicial e mínimo", async () => {
      const beer = await repository.create(
        input({ descricao: "Cítrica", precoAnteriorCentavos: 4_500 }),
      );

      expect(beer).toMatchObject({
        slug: "mare-alta",
        name: "Maré Alta",
        categorySlug: "ipa",
        categoryName: "IPA",
        description: "Cítrica",
        priceCents: 3_900,
        previousPriceCents: 4_500,
        abv: 6.5,
        stock: 24,
        minStock: 6,
        active: true,
        imageUrl: null,
      });
    });

    it("nome que gera o mesmo slug ganha -2", async () => {
      await repository.create(input({ nome: "Maré Alta" }));

      const second = await repository.create(input({ nome: "Mare Alta!", categoriaSlug: "lager" }));

      expect(second.slug).toBe("mare-alta-2");
    });

    it("recusa nome repetido sem diferenciar maiúsculas", async () => {
      await repository.create(input());

      await expect(
        repository.create(input({ nome: "MARÉ ALTA", categoriaSlug: "lager" })),
      ).rejects.toBeInstanceOf(BeerNameTakenError);
    });

    it("recusa categoria que não existe", async () => {
      await expect(
        repository.create(input({ categoriaSlug: "nao-existe" })),
      ).rejects.toBeInstanceOf(CategoryNotFoundError);
    });

    it("a 5ª cerveja ativa da categoria é recusada com o nome da categoria; inativas não contam", async () => {
      await fillCategory("ipa", 4);

      await expect(repository.create(input({ nome: "Quinta" }))).rejects.toThrow(
        new CategoryFullError("IPA"),
      );
      await expect(
        repository.create(input({ nome: "Quinta", ativa: false })),
      ).resolves.toMatchObject({ active: false });
    });

    it("duas gravações disputando a 4ª vaga: só uma passa", async () => {
      await fillCategory("ipa", 3);

      const results = await Promise.allSettled([
        repository.create(input({ nome: "Disputa A" })),
        repository.create(input({ nome: "Disputa B" })),
      ]);

      expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
      expect(await prisma.beer.count({ where: { active: true } })).toBe(4);
    });
  });

  describe("travas", () => {
    /** Segura uma trava (SQL dado) numa transação aberta até `release()`. */
    async function hold(
      lock: (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => Promise<unknown>,
    ) {
      let release!: () => void;
      const released = new Promise<void>((resolve) => (release = resolve));
      let acquired!: () => void;
      const locked = new Promise<void>((resolve) => (acquired = resolve));
      const transaction = prisma.$transaction(
        async (tx) => {
          await lock(tx);
          acquired();
          await released;
        },
        { timeout: 15_000 },
      );
      await locked;
      return async () => {
        release();
        await transaction;
      };
    }

    const pause = () => new Promise<"waiting">((resolve) => setTimeout(resolve, 300, "waiting"));

    it.each([
      [
        "da categoria",
        (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) =>
          tx.$queryRaw`SELECT id FROM categories WHERE slug = 'ipa' FOR UPDATE`,
      ],
      [
        "de escrita do admin",
        (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) =>
          tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('admin-beers'))`,
      ],
    ])("cadastrar espera a trava %s e passa depois que ela é solta", async (_name, lock) => {
      const release = await hold(lock);
      const creating = repository.create(input());

      const early = await Promise.race([creating.then(() => "done" as const), pause()]);
      expect(early).toBe("waiting");

      await release();
      await expect(creating).resolves.toMatchObject({ name: "Maré Alta" });
    });
  });

  describe("update", () => {
    it("edita sem mexer no slug nem no estoque físico", async () => {
      const created = await repository.create(input());

      const edited = await repository.update(
        created.id,
        edit({ nome: "Maré Baixa", precoCentavos: 4_100, estoqueMinimo: 3 }),
      );

      expect(edited).toMatchObject({
        slug: "mare-alta",
        name: "Maré Baixa",
        priceCents: 4_100,
        minStock: 3,
        stock: 24,
      });
    });

    it("cerveja que não existe devolve null", async () => {
      expect(await repository.update(crypto.randomUUID(), edit())).toBeNull();
    });

    it("o próprio nome não conta como repetido; o de outra cerveja conta", async () => {
      const first = await repository.create(input());
      await repository.create(input({ nome: "Outra", categoriaSlug: "lager" }));

      await expect(repository.update(first.id, edit())).resolves.toMatchObject({
        name: "Maré Alta",
      });
      await expect(repository.update(first.id, edit({ nome: "outra" }))).rejects.toBeInstanceOf(
        BeerNameTakenError,
      );
    });

    it("trocar para categoria cheia, ou ativar nela, é recusado; desativar sempre passa", async () => {
      await fillCategory("lager", 4);
      const ipa = await repository.create(input());
      const inactive = await repository.create(
        input({ nome: "Parada", categoriaSlug: "lager", ativa: false }),
      );

      await expect(repository.update(ipa.id, edit({ categoriaSlug: "lager" }))).rejects.toThrow(
        new CategoryFullError("Lager"),
      );
      await expect(
        repository.update(inactive.id, edit({ nome: "Parada", categoriaSlug: "lager" })),
      ).rejects.toBeInstanceOf(CategoryFullError);
      await expect(repository.update(ipa.id, edit({ ativa: false }))).resolves.toMatchObject({
        active: false,
      });
    });

    it("editar uma cerveja já ativa na categoria cheia, sem trocar de categoria, passa", async () => {
      await fillCategory("ipa", 3);
      const fourth = await repository.create(input({ nome: "Quarta" }));

      await expect(
        repository.update(fourth.id, edit({ nome: "Quarta", precoCentavos: 5_000 })),
      ).resolves.toMatchObject({ priceCents: 5_000 });
    });
  });

  describe("find e list", () => {
    it("lista todas, filtra por estado e busca por nome, ordenadas por nome", async () => {
      await repository.create(input({ nome: "Bravia", ativa: false }));
      await repository.create(input({ nome: "Alvorada", categoriaSlug: "lager" }));
      await repository.create(input({ nome: "Cacau" }));

      expect((await repository.list({})).map((b) => b.name)).toEqual([
        "Alvorada",
        "Bravia",
        "Cacau",
      ]);
      expect((await repository.list({ estado: "inativas" })).map((b) => b.name)).toEqual([
        "Bravia",
      ]);
      expect((await repository.list({ estado: "ativas" })).map((b) => b.name)).toEqual([
        "Alvorada",
        "Cacau",
      ]);
      expect((await repository.list({ busca: "ALV" })).map((b) => b.name)).toEqual(["Alvorada"]);
    });

    it("lê uma cerveja pelo id e devolve null se não existe", async () => {
      const created = await repository.create(input());

      expect(await repository.find(created.id)).toMatchObject({ name: "Maré Alta" });
      expect(await repository.find(crypto.randomUUID())).toBeNull();
    });
  });
});

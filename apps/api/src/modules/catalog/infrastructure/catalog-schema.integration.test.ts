import { afterAll, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";

describe("schema do catálogo (banco real)", () => {
  const prisma = new PrismaService();

  afterAll(async () => {
    await prisma.onModuleDestroy();
  });

  it("tem as tabelas de categorias e de cervejas", async () => {
    const tables = await prisma.$queryRaw<{ table_name: string }[]>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name IN ('categories', 'beers')
      ORDER BY table_name`;

    expect(tables.map((t) => t.table_name)).toEqual(["beers", "categories"]);
  });

  it("a cerveja tem descrição e preço anterior opcionais (colunas nulas)", async () => {
    const columns = await prisma.$queryRaw<{ column_name: string; is_nullable: string }[]>`
      SELECT column_name, is_nullable FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'beers'
        AND column_name IN ('description', 'previous_price_cents')
      ORDER BY column_name`;

    expect(columns).toEqual([
      { column_name: "description", is_nullable: "YES" },
      { column_name: "previous_price_cents", is_nullable: "YES" },
    ]);
  });
});

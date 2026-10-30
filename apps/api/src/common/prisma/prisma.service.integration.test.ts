import { afterAll, describe, expect, it, vi } from "vitest";
import { PrismaService } from "./prisma.service.js";

describe("PrismaService (banco real)", () => {
  const prisma = new PrismaService();

  afterAll(async () => {
    await prisma.onModuleDestroy();
  });

  it("executa consultas no Postgres de teste", async () => {
    const rows = await prisma.$queryRaw<{ ok: number }[]>`SELECT 1::int AS ok`;

    expect(rows).toEqual([{ ok: 1 }]);
  });

  it("encontra as migrations aplicadas no banco de teste", async () => {
    const rows = await prisma.$queryRaw<{ total: number }[]>`
      SELECT count(*)::int AS total FROM _prisma_migrations WHERE finished_at IS NOT NULL
    `;

    expect(rows[0]?.total).toBeGreaterThan(0);
  });

  it("fecha a conexão ao encerrar", async () => {
    const service = new PrismaService();
    const disconnect = vi.spyOn(service, "$disconnect");

    await service.onModuleDestroy();

    expect(disconnect).toHaveBeenCalledOnce();
  });
});

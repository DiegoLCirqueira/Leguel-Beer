import { caminhoDeEnvioSchema } from "@leguele/shared";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";
import { PrismaPhotoUploadRepository } from "./prisma-photo-upload-repository.js";

const NOW = new Date("2026-11-28T15:00:00.000Z");

describe("PrismaPhotoUploadRepository (banco real)", () => {
  const prisma = new PrismaService();
  const repository = new PrismaPhotoUploadRepository(prisma);
  let adminId: string;
  let otherAdminId: string;

  beforeEach(async () => {
    await resetDatabase(prisma);
    adminId = (
      await prisma.profile.create({
        data: { id: crypto.randomUUID(), email: "a@x.test", role: "ADMIN" },
      })
    ).id;
    otherAdminId = (
      await prisma.profile.create({
        data: { id: crypto.randomUUID(), email: "b@x.test", role: "ADMIN" },
      })
    ).id;
  });

  afterAll(() => prisma.onModuleDestroy());

  it("emite um caminho aleatório no formato do contrato, válido por 10 minutos, e cada emissão é nova", async () => {
    const first = await repository.issue(adminId, NOW);
    const second = await repository.issue(adminId, NOW);

    expect(caminhoDeEnvioSchema.safeParse(first.path).success).toBe(true);
    expect(first.path).not.toBe(second.path);
    expect(first.expiresAt).toEqual(new Date(NOW.getTime() + 10 * 60_000));
  });

  it("gasta o caminho uma vez só, para o admin que o recebeu, até o instante do vencimento", async () => {
    const { path } = await repository.issue(adminId, NOW);

    expect(await repository.consume(path, otherAdminId, NOW)).toBe(false);
    expect(await repository.consume("nao-emitido.webp", adminId, NOW)).toBe(false);
    expect(await repository.consume(path, adminId, new Date(NOW.getTime() + 10 * 60_000))).toBe(
      false,
    );
    expect(await repository.consume(path, adminId, new Date(NOW.getTime() + 9 * 60_000))).toBe(
      true,
    );
    expect(await repository.consume(path, adminId, NOW)).toBe(false);
  });

  it("duas tentativas ao mesmo tempo: só uma gasta o caminho", async () => {
    const { path } = await repository.issue(adminId, NOW);

    const results = await Promise.all(
      Array.from({ length: 5 }, () => repository.consume(path, adminId, NOW)),
    );

    expect(results.filter(Boolean)).toHaveLength(1);
  });

  it("ao emitir, apaga os caminhos vencidos há mais de um dia: a tabela não cresce para sempre", async () => {
    const day = 24 * 3_600_000;
    const old = await repository.issue(adminId, new Date(NOW.getTime() - 2 * day));
    const recent = await repository.issue(adminId, new Date(NOW.getTime() - 2 * 3_600_000));

    const fresh = await repository.issue(adminId, NOW);

    const paths = (await prisma.beerPhotoUpload.findMany()).map((row) => row.path);
    expect(paths).not.toContain(old.path);
    expect(paths).toContain(recent.path);
    expect(paths).toContain(fresh.path);
  });
});

import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";
import type { Profile } from "../domain/profile.js";
import { PrismaProfileRepository } from "./prisma-profile-repository.js";

function perfil(overrides: Partial<Profile> = {}): Profile {
  const id = overrides.id ?? randomUUID();
  return {
    id,
    email: `${id}@leguele.test`,
    nome: "Ana Souza",
    telefone: "82912345678",
    role: "customer",
    aceite: {
      termosVersao: "2026-10-30",
      privacidadeVersao: "2026-10-30",
      aceitoEm: new Date("2026-10-30T12:00:00.000Z"),
    },
    ...overrides,
  };
}

describe("PrismaProfileRepository: criar e ler o perfil (banco real)", () => {
  const prisma = new PrismaService();
  const repository = new PrismaProfileRepository(prisma);

  beforeEach(() => resetDatabase(prisma));
  afterAll(() => prisma.onModuleDestroy());

  it("cria o perfil completo e o devolve na leitura", async () => {
    const novo = perfil();

    const result = await repository.createProfile(novo);

    expect(result).toEqual({ profile: novo, created: true });
    expect(await repository.findProfile(novo.id)).toEqual(novo);
  });

  it("não encontra perfil que não existe", async () => {
    expect(await repository.findProfile(randomUUID())).toBeNull();
  });

  it("repetir devolve o perfil existente sem alterar nada", async () => {
    const original = perfil();
    await repository.createProfile(original);

    const result = await repository.createProfile({
      ...original,
      nome: "Outro Nome",
      telefone: "11987654321",
      role: "admin",
    });

    expect(result).toEqual({ profile: original, created: false });
    expect(await repository.findProfile(original.id)).toEqual(original);
  });

  it("duas chamadas simultâneas criam um perfil só", async () => {
    const novo = perfil();

    const results = await Promise.all([
      repository.createProfile(novo),
      repository.createProfile(novo),
    ]);

    expect(results.filter((r) => r.created)).toHaveLength(1);
    expect(results.every((r) => r.profile.id === novo.id)).toBe(true);
    expect(await prisma.profile.count()).toBe(1);
  });

  it("completa o perfil sem dados criado pelo seed do admin e mantém o papel admin", async () => {
    const id = randomUUID();
    await repository.ensureRole({ id, email: `${id}@leguele.test` }, "admin");
    expect(await repository.findProfile(id)).toBeNull();

    const result = await repository.createProfile(perfil({ id }));

    expect(result.created).toBe(true);
    expect(result.profile.role).toBe("admin");
    expect(result.profile.nome).toBe("Ana Souza");
  });

  it("falha com erro claro quando outro perfil já usa o e-mail com outro id", async () => {
    const antigo = perfil();
    await repository.createProfile(antigo);

    const attempt = repository.createProfile(perfil({ email: antigo.email }));

    await expect(attempt).rejects.toThrow(/outro id/);
  });
});

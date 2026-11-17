import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";
import type { Profile } from "../domain/profile.js";
import { PrismaProfileRepository } from "./prisma-profile-repository.js";

function perfil(): Profile {
  const id = randomUUID();
  return {
    id,
    email: `${id}@leguele.test`,
    nome: "Ana Souza",
    telefone: "82912345678",
    dataNascimento: null,
    role: "customer",
    aceite: {
      termosVersao: "2026-10-30",
      privacidadeVersao: "2026-10-30",
      aceitoEm: new Date("2026-10-30T12:00:00.000Z"),
    },
  };
}

describe("PrismaProfileRepository: editar o perfil (banco real)", () => {
  const prisma = new PrismaService();
  const repository = new PrismaProfileRepository(prisma);

  beforeEach(() => resetDatabase(prisma));
  afterAll(() => prisma.onModuleDestroy());

  it("grava nome, telefone e data de nascimento e lê a data como AAAA-MM-DD", async () => {
    const original = perfil();
    await repository.createProfile(original);

    const updated = await repository.updateProfile(original.id, {
      nome: "Ana Maria Souza",
      telefone: "82998765432",
      dataNascimento: "1992-03-15",
    });

    expect(updated).toEqual({
      ...original,
      nome: "Ana Maria Souza",
      telefone: "82998765432",
      dataNascimento: "1992-03-15",
    });
    expect(await repository.findProfile(original.id)).toEqual(updated);
  });

  it("data nula apaga a data guardada", async () => {
    const original = perfil();
    await repository.createProfile(original);
    await repository.updateProfile(original.id, {
      nome: original.nome,
      telefone: original.telefone,
      dataNascimento: "1992-03-15",
    });

    const updated = await repository.updateProfile(original.id, {
      nome: original.nome,
      telefone: original.telefone,
      dataNascimento: null,
    });

    expect(updated?.dataNascimento).toBeNull();
  });

  it("devolve null para a conta sem perfil completo e não preenche nada", async () => {
    const id = randomUUID();
    await repository.ensureRole({ id, email: `${id}@leguele.test` }, "customer");

    const updated = await repository.updateProfile(id, {
      nome: "Ana",
      telefone: "82912345678",
      dataNascimento: null,
    });

    expect(updated).toBeNull();
    expect(await prisma.profile.findUniqueOrThrow({ where: { id } })).toMatchObject({
      nome: null,
      telefone: null,
    });
  });
});

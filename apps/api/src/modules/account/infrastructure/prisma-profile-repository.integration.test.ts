import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { PrismaProfileRepository } from "./prisma-profile-repository.js";

describe("PrismaProfileRepository (banco real)", () => {
  const prisma = new PrismaService();
  const repository = new PrismaProfileRepository(prisma);
  const createdIds: string[] = [];

  function newId(): string {
    const id = randomUUID();
    createdIds.push(id);
    return id;
  }

  afterAll(async () => {
    await prisma.profile.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.onModuleDestroy();
  });

  it("cria o perfil com o papel admin", async () => {
    const id = newId();

    await repository.ensureRole({ id, email: `${id}@leguele.test` }, "admin");

    expect(await prisma.profile.findUnique({ where: { id } })).toMatchObject({ id, role: "ADMIN" });
  });

  it("repetir não duplica o perfil", async () => {
    const id = newId();

    await repository.ensureRole({ id, email: `${id}@leguele.test` }, "admin");
    await repository.ensureRole({ id, email: `${id}@leguele.test` }, "admin");

    expect(await prisma.profile.count({ where: { id } })).toBe(1);
  });

  it("promove um perfil de cliente já existente", async () => {
    const id = newId();
    await prisma.profile.create({ data: { id, email: `${id}@leguele.test` } });

    await repository.ensureRole({ id, email: `${id}@leguele.test` }, "admin");

    expect(await prisma.profile.findUnique({ where: { id } })).toMatchObject({ role: "ADMIN" });
  });

  it("o papel padrão do perfil é cliente", async () => {
    const id = newId();

    const profile = await prisma.profile.create({ data: { id, email: `${id}@leguele.test` } });

    expect(profile.role).toBe("CUSTOMER");
  });

  it("falha com erro claro quando outro perfil já usa o e-mail com outro id", async () => {
    const oldId = newId();
    const email = `${oldId}@leguele.test`;
    await prisma.profile.create({ data: { id: oldId, email } });

    const attempt = repository.ensureRole({ id: newId(), email }, "admin");

    await expect(attempt).rejects.toThrow(/outro id/);
    await expect(attempt).rejects.not.toThrow(/P2002|Unique constraint/);
  });

  it("devolve o papel gravado do perfil e null quando não há perfil", async () => {
    const adminId = newId();
    const customerId = newId();
    await prisma.profile.create({
      data: { id: adminId, email: `${adminId}@leguele.test`, role: "ADMIN" },
    });
    await prisma.profile.create({ data: { id: customerId, email: `${customerId}@leguele.test` } });

    expect(await repository.findRole(adminId)).toBe("admin");
    expect(await repository.findRole(customerId)).toBe("customer");
    expect(await repository.findRole(randomUUID())).toBeNull();
  });
});

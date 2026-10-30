import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../prisma/prisma.service.js";
import { resetDatabase } from "./database.js";

describe("isolamento entre testes de integração", () => {
  const prisma = new PrismaService();
  const sharedId = "0b0f6f0e-3f65-4e4e-8a4e-5d6a7c2d9a11";
  const sharedEmail = "mesmo-identificador@leguele.test";

  beforeEach(() => resetDatabase(prisma));
  afterAll(() => prisma.onModuleDestroy());

  it("primeiro teste grava um registro com o identificador único", async () => {
    await prisma.profile.create({ data: { id: sharedId, email: sharedEmail } });

    expect(await prisma.profile.count()).toBe(1);
  });

  it("segundo teste grava o mesmo identificador e não encontra o registro do primeiro", async () => {
    expect(await prisma.profile.count()).toBe(0);

    await prisma.profile.create({ data: { id: sharedId, email: sharedEmail } });

    expect(await prisma.profile.count()).toBe(1);
  });
});

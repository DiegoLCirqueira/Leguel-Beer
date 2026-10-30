import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { resetDatabase } from "../../../common/testing/database.js";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { createProfile } from "./factories.js";

describe("createProfile (banco real)", () => {
  const prisma = new PrismaService();

  beforeEach(() => resetDatabase(prisma));
  afterAll(() => prisma.onModuleDestroy());

  it("grava o perfil gerado no banco", async () => {
    const profile = await createProfile(prisma, { role: "ADMIN" });

    expect(await prisma.profile.findUnique({ where: { id: profile.id } })).toMatchObject({
      email: profile.email,
      role: "ADMIN",
    });
  });
});

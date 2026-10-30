import { afterAll, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { InMemoryAuthAdmin } from "../application/in-memory.js";
import { PrismaProfileRepository } from "./prisma-profile-repository.js";
import { seedAdmin } from "./seed-admin.js";

describe("seedAdmin (banco real)", () => {
  const prisma = new PrismaService();
  const email = `seed-${Date.now()}@leguele.test`;
  const env = {
    ADMIN_EMAIL: email,
    ADMIN_SEED_PASSWORD: "senha-de-teste-123456",
    SUPABASE_URL: "http://127.0.0.1:54321",
    SUPABASE_SERVICE_ROLE_KEY: "chave-de-teste",
  };

  afterAll(async () => {
    await prisma.profile.deleteMany({ where: { email } });
    await prisma.onModuleDestroy();
  });

  it("cria a conta e grava o perfil admin; rodar de novo não duplica", async () => {
    const auth = new InMemoryAuthAdmin();
    const deps = { auth, profiles: new PrismaProfileRepository(prisma) };

    const first = await seedAdmin(env, deps);
    const second = await seedAdmin(env, deps);

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(auth.users).toHaveLength(1);
    expect(await prisma.profile.findMany({ where: { email } })).toEqual([
      expect.objectContaining({ id: first.userId, role: "ADMIN" }),
    ]);
  });

  it("falha apontando a variável que falta, sem imprimir valores", async () => {
    const attempt = seedAdmin({ ...env, ADMIN_SEED_PASSWORD: "" }, {});

    await expect(attempt).rejects.toThrow(/ADMIN_SEED_PASSWORD/);
    await expect(attempt).rejects.not.toThrow(/senha-de-teste-123456/);
  });
});

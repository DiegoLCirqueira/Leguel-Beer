import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { PrismaEmailConfirmation } from "./prisma-email-confirmation.js";

describe("PrismaEmailConfirmation: lê auth.users (banco real)", () => {
  const prisma = new PrismaService();
  const confirmation = new PrismaEmailConfirmation(prisma);

  beforeEach(async () => {
    await prisma.$executeRaw`DELETE FROM auth.users`;
  });
  afterAll(async () => {
    await prisma.$executeRaw`DELETE FROM auth.users`;
    await prisma.onModuleDestroy();
  });

  it("e-mail confirmado: verdadeiro", async () => {
    const id = randomUUID();
    await prisma.$executeRaw`INSERT INTO auth.users (id, email, email_confirmed_at) VALUES (${id}::uuid, 'ana@exemplo.com', now())`;

    expect(await confirmation.isConfirmed(id)).toBe(true);
  });

  it("e-mail não confirmado (email_confirmed_at nulo): falso", async () => {
    const id = randomUUID();
    await prisma.$executeRaw`INSERT INTO auth.users (id, email, email_confirmed_at) VALUES (${id}::uuid, 'ana@exemplo.com', NULL)`;

    expect(await confirmation.isConfirmed(id)).toBe(false);
  });

  it("conta que não existe em auth.users: falso", async () => {
    expect(await confirmation.isConfirmed(randomUUID())).toBe(false);
  });

  it("um id que não é UUID não vira injeção de SQL: falso, sem erro", async () => {
    expect(await confirmation.isConfirmed("x'; DROP TABLE auth.users; --")).toBe(false);
    expect(await prisma.$queryRaw`SELECT count(*)::int AS n FROM auth.users`).toEqual([{ n: 0 }]);
  });
});

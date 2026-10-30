import { randomUUID } from "node:crypto";
import type { PrismaService } from "../../../common/prisma/prisma.service.js";

export interface ProfileData {
  id: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
}

/** Dados de um perfil de cliente com id e e-mail únicos; sobrescreva o que o teste precisa. */
export function buildProfile(overrides: Partial<ProfileData> = {}): ProfileData {
  const id = overrides.id ?? randomUUID();
  return { id, email: `${id}@leguele.test`, role: "CUSTOMER", ...overrides };
}

export async function createProfile(
  prisma: PrismaService,
  overrides: Partial<ProfileData> = {},
): Promise<ProfileData> {
  const data = buildProfile(overrides);
  await prisma.profile.create({ data });
  return data;
}

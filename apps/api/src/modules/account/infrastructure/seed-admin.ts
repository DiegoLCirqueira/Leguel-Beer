import { PrismaService } from "../../../common/prisma/prisma.service.js";
import {
  EnsureAdminAccount,
  type EnsureAdminAccountResult,
} from "../application/ensure-admin-account.js";
import type { AuthAdmin } from "../domain/auth-admin.js";
import type { ProfileRepository } from "../domain/profile-repository.js";
import { PrismaProfileRepository } from "./prisma-profile-repository.js";
import { SupabaseAuthAdmin } from "./supabase-auth-admin.js";

const REQUIRED = [
  "ADMIN_EMAIL",
  "ADMIN_SEED_PASSWORD",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

type SeedEnv = Partial<Record<(typeof REQUIRED)[number], string | undefined>>;

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

function isLocal(url: string): boolean {
  try {
    return LOCAL_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

export interface SeedAdminDeps {
  auth?: AuthAdmin;
  profiles?: ProfileRepository;
}

/** Seed de desenvolvimento: garante a conta admin no Supabase Auth local e o perfil com papel admin. */
export async function seedAdmin(
  env: SeedEnv,
  deps: SeedAdminDeps = {},
): Promise<EnsureAdminAccountResult> {
  for (const key of REQUIRED) {
    if (!env[key]) throw new Error(`Variável de ambiente ${key} não definida`);
  }
  if (!isLocal(env.SUPABASE_URL as string)) {
    throw new Error("O seed do admin só roda contra o Supabase local: SUPABASE_URL não é local");
  }
  const email = env.ADMIN_EMAIL as string;
  const password = env.ADMIN_SEED_PASSWORD as string;

  const prisma = deps.profiles ? undefined : new PrismaService();
  try {
    const auth =
      deps.auth ??
      new SupabaseAuthAdmin(env.SUPABASE_URL as string, env.SUPABASE_SERVICE_ROLE_KEY as string);
    const profiles = deps.profiles ?? new PrismaProfileRepository(prisma as PrismaService);
    return await new EnsureAdminAccount(auth, profiles).execute({ email, password });
  } finally {
    await prisma?.onModuleDestroy();
  }
}

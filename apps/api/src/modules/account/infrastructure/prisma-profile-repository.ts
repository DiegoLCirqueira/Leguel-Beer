import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import type { Profile } from "../domain/profile.js";
import type { ProfileRepository } from "../domain/profile-repository.js";
import type { Role } from "../domain/role.js";

const CONFLICT_MESSAGE =
  "Já existe um perfil com esse e-mail e outro id (a conta do Auth foi recriada?); resolva à mão";

const DOMAIN_ROLE = { CUSTOMER: "customer", ADMIN: "admin" } as const;

const PRISMA_ROLE = { customer: "CUSTOMER", admin: "ADMIN" } as const satisfies Record<
  Role,
  string
>;

@Injectable()
export class PrismaProfileRepository implements ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findRole(id: string): Promise<Role | null> {
    const profile = await this.prisma.profile.findUnique({ where: { id }, select: { role: true } });
    if (!profile) return null;
    return profile.role === "ADMIN" ? "admin" : "customer";
  }

  async findProfile(id: string): Promise<Profile | null> {
    const row = await this.prisma.profile.findUnique({ where: { id } });
    return row ? toProfile(row) : null;
  }

  async createProfile(profile: Profile): Promise<{ profile: Profile; created: boolean }> {
    const registration = {
      nome: profile.nome,
      telefone: profile.telefone,
      termsVersion: profile.aceite.termosVersao,
      privacyVersion: profile.aceite.privacidadeVersao,
      termsAcceptedAt: profile.aceite.aceitoEm,
    };
    // O perfil que o seed deixou só com o papel é completado (nome nulo), mantendo o papel gravado.
    const completed = await this.prisma.profile.updateMany({
      where: { id: profile.id, nome: null },
      data: registration,
    });
    if (completed.count === 1) return { profile: await this.mustFind(profile.id), created: true };

    try {
      await this.prisma.profile.create({
        data: {
          id: profile.id,
          email: profile.email,
          role: PRISMA_ROLE[profile.role],
          ...registration,
        },
      });
      return { profile: await this.mustFind(profile.id), created: true };
    } catch (error) {
      if ((error as { code?: string }).code !== "P2002") throw error;
      const existing = await this.findProfile(profile.id);
      if (existing) return { profile: existing, created: false };
      throw new Error(CONFLICT_MESSAGE, { cause: error });
    }
  }

  private async mustFind(id: string): Promise<Profile> {
    const profile = await this.findProfile(id);
    if (!profile) throw new Error("Perfil não encontrado logo depois de gravado");
    return profile;
  }

  async ensureRole(profile: { id: string; email: string }, role: Role): Promise<void> {
    try {
      await this.prisma.profile.upsert({
        where: { id: profile.id },
        create: { id: profile.id, email: profile.email, role: PRISMA_ROLE[role] },
        update: { role: PRISMA_ROLE[role] },
      });
    } catch (error) {
      if ((error as { code?: string }).code === "P2002") {
        throw new Error(CONFLICT_MESSAGE, { cause: error });
      }
      throw error;
    }
  }
}

function toProfile(row: {
  id: string;
  email: string;
  role: keyof typeof DOMAIN_ROLE;
  nome: string | null;
  telefone: string | null;
  termsVersion: string | null;
  privacyVersion: string | null;
  termsAcceptedAt: Date | null;
}): Profile | null {
  if (
    row.nome === null ||
    row.telefone === null ||
    row.termsVersion === null ||
    row.privacyVersion === null ||
    row.termsAcceptedAt === null
  )
    return null;
  return {
    id: row.id,
    email: row.email,
    nome: row.nome,
    telefone: row.telefone,
    role: DOMAIN_ROLE[row.role],
    aceite: {
      termosVersao: row.termsVersion,
      privacidadeVersao: row.privacyVersion,
      aceitoEm: row.termsAcceptedAt,
    },
  };
}

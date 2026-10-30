import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import type { ProfileRepository } from "../domain/profile-repository.js";
import type { Role } from "../domain/role.js";

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

  async ensureRole(profile: { id: string; email: string }, role: Role): Promise<void> {
    try {
      await this.prisma.profile.upsert({
        where: { id: profile.id },
        create: { id: profile.id, email: profile.email, role: PRISMA_ROLE[role] },
        update: { role: PRISMA_ROLE[role] },
      });
    } catch (error) {
      if ((error as { code?: string }).code === "P2002") {
        throw new Error(
          "Já existe um perfil com esse e-mail e outro id (a conta do Auth foi recriada?); resolva à mão",
          { cause: error },
        );
      }
      throw error;
    }
  }
}

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

  async ensureRole(profile: { id: string; email: string }, role: Role): Promise<void> {
    await this.prisma.profile.upsert({
      where: { id: profile.id },
      create: { id: profile.id, email: profile.email, role: PRISMA_ROLE[role] },
      update: { role: PRISMA_ROLE[role] },
    });
  }
}

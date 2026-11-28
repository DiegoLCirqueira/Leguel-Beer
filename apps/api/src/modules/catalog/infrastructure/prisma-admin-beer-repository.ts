import type { CriarCerveja, EditarCerveja } from "@leguele/shared";
import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import type { AdminBeer, AdminBeerFilter, AdminBeerRepository } from "../domain/admin-beer.js";

export class PrismaAdminBeerRepository implements AdminBeerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(filter: AdminBeerFilter): Promise<AdminBeer[]> {
    void this.prisma;
    void filter;
    return [];
  }

  async find(id: string): Promise<AdminBeer | null> {
    void id;
    return null;
  }

  async create(input: CriarCerveja): Promise<AdminBeer> {
    void input;
    throw new Error("não implementado");
  }

  async update(id: string, input: EditarCerveja): Promise<AdminBeer | null> {
    void id;
    void input;
    return null;
  }
}

import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import { toBeer } from "../../catalog/infrastructure/prisma-beer-repository.js";
import type { FridgeBeer, FridgeBeerLookup } from "../domain/fridge-beer-lookup.js";

export class PrismaFridgeBeerLookup implements FridgeBeerLookup {
  constructor(private readonly prisma: PrismaService) {}

  async findByIds(ids: readonly string[]): Promise<FridgeBeer[]> {
    const rows = await this.prisma.beer.findMany({
      where: { id: { in: [...ids] } },
      include: { category: true },
    });
    return rows.map((row) => ({ beer: toBeer(row), active: row.active }));
  }
}

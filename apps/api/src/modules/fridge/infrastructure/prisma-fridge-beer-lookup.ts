import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import { toBeer } from "../../catalog/infrastructure/prisma-beer-repository.js";
import type { FridgeBeer, FridgeBeerLookup } from "../domain/fridge-beer-lookup.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class PrismaFridgeBeerLookup implements FridgeBeerLookup {
  constructor(private readonly prisma: PrismaService) {}

  async findByIds(ids: readonly string[]): Promise<FridgeBeer[]> {
    // A coluna é uuid: um id de outro formato faria o Postgres recusar a consulta inteira.
    const validIds = ids.filter((id) => UUID.test(id));
    if (validIds.length === 0) return [];
    const rows = await this.prisma.beer.findMany({
      where: { id: { in: validIds } },
      include: { category: true },
    });
    return rows.map((row) => ({ beer: toBeer(row), active: row.active }));
  }
}

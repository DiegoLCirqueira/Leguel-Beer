import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import type { Beer } from "../domain/beer.js";
import type { BeerRepository } from "../domain/beer-repository.js";

export class PrismaBeerRepository implements BeerRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActive(): Promise<Beer[]> {
    void this.prisma;
    return Promise.resolve([]);
  }
}

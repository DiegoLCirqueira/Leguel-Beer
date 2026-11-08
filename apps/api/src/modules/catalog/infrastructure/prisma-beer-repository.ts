import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import type { Beer } from "../domain/beer.js";
import type { BeerRepository } from "../domain/beer-repository.js";

export class PrismaBeerRepository implements BeerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActive(): Promise<Beer[]> {
    const rows = await this.prisma.beer.findMany({
      where: { active: true },
      include: { category: true },
    });
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      style: row.style,
      category: { slug: row.category.slug, name: row.category.name, order: row.category.order },
      abv: row.abv.toNumber(),
      ibu: row.ibu,
      volumeMl: row.volumeMl,
      priceCents: row.priceCents,
      featured: row.featured,
      stock: row.stock,
      imageUrl: row.imageUrl,
      createdAt: row.createdAt,
    }));
  }
}

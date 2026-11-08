import type { AppLogger } from "../../../common/logging/app-logger.js";
import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import type { Beer } from "../domain/beer.js";
import type { BeerRepository } from "../domain/beer-repository.js";

/**
 * Teto de segurança da leitura: o catálogo do MVP tem 16 cervejas e o filtro e a ordenação rodam em
 * memória, sem paginação. Se o catálogo se aproximar deste teto, é hora de filtrar no banco e
 * paginar, e não de subir o número.
 */
const MAX_ACTIVE_BEERS = 200;

export class PrismaBeerRepository implements BeerRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger?: Pick<AppLogger, "warn">,
  ) {}

  async findActive(): Promise<Beer[]> {
    const rows = await this.prisma.beer.findMany({
      where: { active: true },
      include: { category: true },
      orderBy: { slug: "asc" },
      take: MAX_ACTIVE_BEERS,
    });
    if (rows.length === MAX_ACTIVE_BEERS) {
      this.logger?.warn(
        `Leitura do catálogo no teto de ${MAX_ACTIVE_BEERS} cervejas: pode haver cervejas ativas fora da lista`,
      );
    }
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

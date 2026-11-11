import type { AppLogger } from "../../../common/logging/app-logger.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import type { Beer } from "../domain/beer.js";
import type { BeerRepository, BeerWithStatus } from "../domain/beer-repository.js";

/**
 * Teto de segurança da leitura: o catálogo do MVP tem 16 cervejas e o filtro e a ordenação rodam em
 * memória, sem paginação. Se o catálogo se aproximar deste teto, é hora de filtrar no banco e
 * paginar, e não de subir o número.
 */
const MAX_ACTIVE_BEERS = 200;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type BeerRow = Prisma.BeerGetPayload<{ include: { category: true } }>;

export function toBeer(row: BeerRow): Beer {
  return {
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
    description: row.description,
    previousPriceCents: row.previousPriceCents,
    imageUrl: row.imageUrl,
    createdAt: row.createdAt,
  };
}

export class PrismaBeerRepository implements BeerRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Pick<AppLogger, "warn">,
  ) {}

  async findActiveBySlug(slug: string): Promise<Beer | null> {
    const row = await this.prisma.beer.findFirst({
      where: { slug, active: true },
      include: { category: true },
    });
    return row && toBeer(row);
  }

  async findActive(): Promise<Beer[]> {
    const rows = await this.prisma.beer.findMany({
      where: { active: true },
      include: { category: true },
      orderBy: { slug: "asc" },
      take: MAX_ACTIVE_BEERS,
    });
    if (rows.length === MAX_ACTIVE_BEERS) {
      this.logger.warn(
        `Leitura do catálogo no teto de ${MAX_ACTIVE_BEERS} cervejas: pode haver cervejas ativas fora da lista`,
      );
    }
    return rows.map(toBeer);
  }

  async findByIds(ids: readonly string[]): Promise<BeerWithStatus[]> {
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

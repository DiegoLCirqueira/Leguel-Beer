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

function toBeer(row: BeerRow, reserved: number): Beer {
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
    reserved,
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
    private readonly now: () => Date = () => new Date(),
  ) {}

  /**
   * Unidades reservadas por cerveja: reservas ainda não liberadas nem consumidas e dentro da validade.
   * A reserva de um pedido vencido não conta, mesmo antes de o pedido ser cancelado.
   */
  private async reservedByBeer(beerIds: readonly string[]): Promise<Map<string, number>> {
    if (beerIds.length === 0) return new Map();
    const sums = await this.prisma.stockReservation.groupBy({
      by: ["beerId"],
      where: {
        beerId: { in: [...beerIds] },
        releasedAt: null,
        consumedAt: null,
        expiresAt: { gt: this.now() },
      },
      _sum: { quantity: true },
    });
    return new Map(sums.map((sum) => [sum.beerId, sum._sum.quantity ?? 0]));
  }

  async findActiveBySlug(slug: string): Promise<Beer | null> {
    const row = await this.prisma.beer.findFirst({
      where: { slug, active: true },
      include: { category: true },
    });
    if (!row) return null;
    return toBeer(row, (await this.reservedByBeer([row.id])).get(row.id) ?? 0);
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
    const reserved = await this.reservedByBeer(rows.map((row) => row.id));
    return rows.map((row) => toBeer(row, reserved.get(row.id) ?? 0));
  }

  async findByIds(ids: readonly string[]): Promise<BeerWithStatus[]> {
    // A coluna é uuid: um id de outro formato faria o Postgres recusar a consulta inteira.
    const validIds = ids.filter((id) => UUID.test(id));
    if (validIds.length === 0) return [];
    const rows = await this.prisma.beer.findMany({
      where: { id: { in: validIds } },
      include: { category: true },
    });
    const reserved = await this.reservedByBeer(rows.map((row) => row.id));
    return rows.map((row) => ({
      beer: toBeer(row, reserved.get(row.id) ?? 0),
      active: row.active,
    }));
  }
}

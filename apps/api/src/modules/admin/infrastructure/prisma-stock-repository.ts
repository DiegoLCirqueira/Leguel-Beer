import { estoqueBaixoNoAdmin, variacaoDoAjuste, type AjusteDeEstoque } from "@leguele/shared";
import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import type { Prisma, StockMovementType } from "../../../generated/prisma/client.js";
import type { StockCursor } from "../domain/stock-cursor.js";
import {
  StockBelowReservedError,
  StockNegativeError,
  type StockItem,
  type StockMovement,
  type StockMovementKind,
  type StockRepository,
} from "../domain/stock.js";

const KIND_BY_TYPE: Record<StockMovementType, StockMovementKind> = {
  ENTRY: "entrada",
  LOSS: "perda",
  CORRECTION: "correcao",
  SALE: "venda",
  CANCELLATION: "cancelamento",
};

const TYPE_BY_ADJUSTMENT: Record<AjusteDeEstoque["tipo"], StockMovementType> = {
  entrada: "ENTRY",
  perda: "LOSS",
  correcao: "CORRECTION",
};

type MovementRow = Prisma.StockMovementGetPayload<{
  include: { order: { select: { number: true } } };
}>;

function toMovement(row: MovementRow): StockMovement {
  return {
    id: row.id,
    kind: KIND_BY_TYPE[row.type],
    quantity: row.quantity,
    reason: row.reason,
    balanceAfter: row.balanceAfter,
    orderNumber: row.order?.number ?? null,
    createdAt: row.createdAt,
  };
}

export class PrismaStockRepository implements StockRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(at: Date): Promise<StockItem[]> {
    // Disponível = físico menos as reservas válidas (não liberadas, não consumidas, dentro da validade).
    const rows = await this.prisma.$queryRaw<
      { id: string; name: string; physical: number; minimum: number; reserved: number }[]
    >`
      SELECT b.id::text AS id, b.name, b.stock AS physical, b.min_stock AS minimum,
        COALESCE((
          SELECT SUM(r.quantity) FROM stock_reservations r
          WHERE r.beer_id = b.id AND r.released_at IS NULL AND r.consumed_at IS NULL
            AND r.expires_at > ${at}
        ), 0)::int AS reserved
      FROM beers b
      WHERE b.active`;
    return rows
      .map((row) => {
        const available = row.physical - row.reserved;
        return {
          beerId: row.id,
          name: row.name,
          physical: row.physical,
          reserved: row.reserved,
          available,
          minimum: row.minimum,
          low: estoqueBaixoNoAdmin(available, row.minimum),
        };
      })
      .sort((a, b) => Number(b.low) - Number(a.low) || a.name.localeCompare(b.name, "pt-BR"));
  }

  async movements(
    beerId: string,
    page: { after: StockCursor | null; limit: number },
  ): Promise<StockMovement[] | null> {
    const beer = await this.prisma.beer.findUnique({ where: { id: beerId }, select: { id: true } });
    if (!beer) return null;
    const rows = await this.prisma.stockMovement.findMany({
      where: {
        beerId,
        ...(page.after
          ? {
              OR: [
                { createdAt: { lt: page.after.createdAt } },
                { createdAt: page.after.createdAt, id: { lt: page.after.id } },
              ],
            }
          : {}),
      },
      take: page.limit,
      include: { order: { select: { number: true } } },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
    return rows.map(toMovement);
  }

  async adjust(
    beerId: string,
    actorId: string,
    adjustment: AjusteDeEstoque,
    at: Date,
  ): Promise<StockMovement | null> {
    return this.prisma.$transaction(async (tx) => {
      // A mesma trava por cerveja da criação do pedido: ajuste e venda simultâneos não se atropelam.
      const locked = await tx.$queryRaw<{ stock: number }[]>`
        SELECT stock FROM beers WHERE id = ${beerId}::uuid FOR UPDATE`;
      const current = locked[0];
      if (!current) return null;

      const change = variacaoDoAjuste(adjustment);
      const balance = current.stock + change;
      if (balance < 0) throw new StockNegativeError();
      const reserved = await reservedUnits(tx, beerId, at);
      if (balance < reserved) throw new StockBelowReservedError(reserved);

      await tx.beer.update({ where: { id: beerId }, data: { stock: balance } });
      const row = await tx.stockMovement.create({
        data: {
          beerId,
          type: TYPE_BY_ADJUSTMENT[adjustment.tipo],
          quantity: change,
          reason: adjustment.motivo,
          balanceAfter: balance,
          actorId,
          createdAt: at,
        },
        include: { order: { select: { number: true } } },
      });
      return toMovement(row);
    });
  }
}

async function reservedUnits(
  tx: Prisma.TransactionClient,
  beerId: string,
  at: Date,
): Promise<number> {
  const sum = await tx.stockReservation.aggregate({
    where: { beerId, releasedAt: null, consumedAt: null, expiresAt: { gt: at } },
    _sum: { quantity: true },
  });
  return sum._sum.quantity ?? 0;
}

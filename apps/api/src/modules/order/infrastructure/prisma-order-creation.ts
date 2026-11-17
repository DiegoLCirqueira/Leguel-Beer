import type { PedidoCriado } from "@leguele/shared";
import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import type {
  CreateOrderUnit,
  NewOrder,
  OrderCreation,
  StoredResponse,
} from "../domain/create-order-ports.js";

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60_000;
/** Sorteios seguidos do número do pedido antes de desistir (a colisão é de 1 em um milhão). */
const NUMBER_ATTEMPTS = 3;
const TRANSACTION_TIMEOUT_MS = 15_000;

/**
 * Criação do pedido numa transação do Postgres, serializada por cliente com uma trava consultiva
 * (`pg_advisory_xact_lock`) tomada antes de qualquer leitura: duas criações do mesmo cliente passam
 * uma de cada vez, mesmo com chaves de idempotência diferentes, e a conferência do pedido pendente e
 * a criação nunca se cruzam. Clientes diferentes não esperam um pelo outro, só pelas cervejas.
 */
export class PrismaOrderCreation implements OrderCreation {
  constructor(private readonly prisma: PrismaService) {}

  async run<T>(ownerId: string, work: (unit: CreateOrderUnit) => Promise<T>): Promise<T> {
    for (let attempt = 1; ; attempt++) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${ownerId}, 0))`;
            return work(new PrismaCreateOrderUnit(tx, ownerId));
          },
          { timeout: TRANSACTION_TIMEOUT_MS },
        );
      } catch (error) {
        // Número "#LB" sorteado igual ao de outro pedido: a transação inteira caiu, sorteia de novo.
        if (!isOrderNumberCollision(error) || attempt >= NUMBER_ATTEMPTS) throw error;
      }
    }
  }
}

function isOrderNumberCollision(error: unknown): boolean {
  const { code, meta, message } = error as { code?: string; meta?: unknown; message?: string };
  // Com o adaptador do `pg`, o nome da restrição vem no meta ou só na mensagem, conforme a versão.
  return (
    code === "P2002" &&
    `${JSON.stringify(meta ?? "")} ${message ?? ""}`.includes("orders_number_key")
  );
}

class PrismaCreateOrderUnit implements CreateOrderUnit {
  constructor(
    private readonly tx: Prisma.TransactionClient,
    private readonly ownerId: string,
  ) {}

  async findStoredResponse(key: string, at: Date): Promise<StoredResponse | null> {
    const row = await this.tx.idempotencyKey.findFirst({
      where: { profileId: this.ownerId, key, expiresAt: { gt: at } },
    });
    if (!row) return null;
    return {
      requestHash: row.requestHash,
      body: row.responseBody as PedidoCriado,
    };
  }

  async findPendingOrderId(at: Date): Promise<string | null> {
    const row = await this.tx.order.findFirst({
      where: { profileId: this.ownerId, status: "AWAITING_PAYMENT", expiresAt: { gt: at } },
      select: { id: true },
    });
    return row?.id ?? null;
  }

  async lockAvailability(beerIds: readonly string[], at: Date): Promise<Map<string, number>> {
    if (beerIds.length === 0) return new Map();
    const ids = [...beerIds];
    // Trava as linhas das cervejas em ordem fixa (pelo id): pedidos que pedem as mesmas cervejas em
    // ordens diferentes nunca esperam um pelo outro em ciclo.
    const stocks = await this.tx.$queryRaw<{ id: string; stock: number }[]>`
      SELECT id::text AS id, stock FROM beers
      WHERE id = ANY(${ids}::uuid[])
      ORDER BY id
      FOR UPDATE`;
    const reserved = await this.tx.stockReservation.groupBy({
      by: ["beerId"],
      where: {
        beerId: { in: ids },
        releasedAt: null,
        consumedAt: null,
        expiresAt: { gt: at },
      },
      _sum: { quantity: true },
    });
    const reservedByBeer = new Map(reserved.map((sum) => [sum.beerId, sum._sum.quantity ?? 0]));
    return new Map(
      stocks.map(({ id, stock }) => [id, Math.max(0, stock - (reservedByBeer.get(id) ?? 0))]),
    );
  }

  async insert(
    order: NewOrder,
    idempotency: { key: string; hash: string; response: PedidoCriado },
  ): Promise<void> {
    // A chave vencida (24 h) já não vale, mas a restrição única (cliente, chave) continua: a linha velha
    // sai na mesma transação, para a chave poder ser usada de novo sem erro.
    await this.tx.idempotencyKey.deleteMany({
      where: {
        profileId: order.ownerId,
        key: idempotency.key,
        expiresAt: { lte: order.createdAt },
      },
    });
    const card = order.payment.tipo === "cartao" ? order.payment : null;
    await this.tx.order.create({
      data: {
        id: order.id,
        number: order.number,
        profileId: order.ownerId,
        status: "AWAITING_PAYMENT",
        paymentMethod: card ? "CARD" : "PIX",
        installments: card?.parcelas ?? null,
        subtotalCents: order.subtotalCents,
        shippingCents: order.shippingCents,
        totalCents: order.totalCents,
        expiresAt: order.expiresAt,
        customerName: order.customer.nome,
        customerPhone: order.customer.telefone,
        shipZip: order.shipTo.zip,
        shipStreet: order.shipTo.street,
        shipNumber: order.shipTo.number,
        shipComplement: order.shipTo.complement,
        shipDistrict: order.shipTo.district,
        shipCity: order.shipTo.city,
        shipState: order.shipTo.state,
        createdAt: order.createdAt,
        items: {
          create: order.lines.map((line) => ({
            beerId: line.beerId,
            name: line.name,
            unitPriceCents: line.priceCents,
            quantity: line.quantity,
          })),
        },
        reservations: {
          create: order.lines.map((line) => ({
            beerId: line.beerId,
            quantity: line.quantity,
            expiresAt: order.expiresAt,
          })),
        },
        pendingDeductions: {
          create: order.lines.map((line) => ({ beerId: line.beerId, quantity: line.quantity })),
        },
        statusHistory: {
          create: { fromStatus: null, toStatus: "AWAITING_PAYMENT", createdAt: order.createdAt },
        },
        idempotencyKey: {
          create: {
            profileId: order.ownerId,
            key: idempotency.key,
            requestHash: idempotency.hash,
            responseStatus: 201,
            responseBody: idempotency.response,
            createdAt: order.createdAt,
            expiresAt: new Date(order.createdAt.getTime() + IDEMPOTENCY_TTL_MS),
          },
        },
      },
    });
  }
}

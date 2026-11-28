import type { ListaDePedidos } from "@leguele/shared";
import { decodeOrderCursor, encodeOrderCursor } from "../domain/order-cursor.js";
import type { OrderReader } from "../domain/order-reader.js";
import type { OrderExpirer } from "./expire-due-orders.js";

export interface ListMyOrdersInput {
  ownerId: string;
  cursor?: string;
  limit: number;
}

/** "Meus pedidos": os pedidos do cliente da sessão, 20 por vez, do mais recente ao mais antigo. */
export class ListMyOrders {
  constructor(
    private readonly reader: OrderReader,
    private readonly expiration: OrderExpirer,
    private readonly now: () => Date,
  ) {}

  async execute(input: ListMyOrdersInput): Promise<ListaDePedidos> {
    // Vencido, o pedido cancela na própria requisição, sem esperar o cron diário.
    for (const id of await this.reader.findDueOwnedIds(input.ownerId, this.now())) {
      await this.expiration.execute(id);
    }
    const after = input.cursor ? decodeOrderCursor(input.cursor) : null;
    // Uma a mais que a página: se ela vier, existe próxima página.
    const rows = await this.reader.listOwned(input.ownerId, { after, limit: input.limit + 1 });
    const page = rows.slice(0, input.limit);
    const last = page[page.length - 1];
    return {
      pedidos: page.map((row) => ({
        id: row.id,
        numero: row.number,
        status: row.status,
        criadoEm: row.createdAt.toISOString(),
        quantidadeDeItens: row.itemCount,
        cervejas: row.beerNames,
        totalCentavos: row.totalCents,
      })),
      proximoCursor:
        rows.length > input.limit && last
          ? encodeOrderCursor({ createdAt: last.createdAt, id: last.id })
          : null,
    };
  }
}

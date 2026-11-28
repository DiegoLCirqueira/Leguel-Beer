import type { ListaDePedidos } from "@leguele/shared";
import { ValidationError } from "../../../common/errors/validation-error.js";
import { decodeOrderCursor, encodeOrderCursor } from "../domain/order-cursor.js";
import type { OrderReader } from "../domain/order-reader.js";
import type { OrderExpirer } from "./expire-due-orders.js";

/** Quantos pedidos vencidos uma leitura da lista tenta expirar. */
const DUE_ORDERS_PER_LIST = 20;

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
    /** Falha ao expirar um pedido: o pedido vira só um aviso, a lista segue. */
    private readonly onExpirationFailure: (failure: { orderId: string; error: unknown }) => void,
  ) {}

  async execute(input: ListMyOrdersInput): Promise<ListaDePedidos> {
    const after = input.cursor ? decodeOrderCursor(input.cursor) : null;
    if (input.cursor && !after) {
      throw new ValidationError([{ field: "cursor", message: "Cursor inválido." }]);
    }
    // Vencido, o pedido cancela na própria requisição, sem esperar o cron diário.
    // Só a primeira página expira (o cliente tem no máximo um pedido aguardando, o mais recente).
    // Um pedido que falha não pode derrubar a lista: o cron tenta de novo depois.
    const due = input.cursor
      ? []
      : await this.reader.findDueOwnedIds(input.ownerId, this.now(), DUE_ORDERS_PER_LIST);
    for (const orderId of due) {
      try {
        await this.expiration.execute(orderId);
      } catch (error) {
        this.onExpirationFailure({ orderId, error });
      }
    }
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

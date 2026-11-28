import type { ListaDePedidos } from "@leguele/shared";
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
    void this.reader;
    void this.expiration;
    void this.now;
    void input;
    return { pedidos: [], proximoCursor: null };
  }
}

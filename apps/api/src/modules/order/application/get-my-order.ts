import type { PedidoDoCliente } from "@leguele/shared";
import { NotFoundError } from "../../../common/errors/not-found-error.js";
import type { OrderReader } from "../domain/order-reader.js";
import type { OrderExpirer } from "./expire-due-orders.js";

export interface GetMyOrderInput {
  ownerId: string;
  orderId: string;
}

/** Um pedido do cliente da sessão, com itens, endereço de entrega e histórico de status. */
export class GetMyOrder {
  constructor(
    private readonly reader: OrderReader,
    private readonly expiration: OrderExpirer,
    private readonly now: () => Date,
  ) {}

  async execute(input: GetMyOrderInput): Promise<PedidoDoCliente> {
    void this.reader;
    void this.expiration;
    void this.now;
    void input;
    throw new NotFoundError();
  }
}

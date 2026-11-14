import type { OrderRepository } from "../domain/order-repository.js";

export interface OrderExpirer {
  execute(orderId: string): Promise<void>;
}

/** Cron diário: expira os pedidos vencidos que a checagem no uso não pegou. */
export class ExpireDueOrders {
  constructor(
    private readonly orders: OrderRepository,
    private readonly expireOrder: OrderExpirer,
    private readonly now: () => Date,
  ) {}

  async execute(): Promise<void> {
    for (const orderId of await this.orders.findDueOrderIds(this.now())) {
      await this.expireOrder.execute(orderId);
    }
  }
}

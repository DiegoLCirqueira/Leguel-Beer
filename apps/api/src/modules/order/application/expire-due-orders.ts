import type { OrderRepository } from "../domain/order-repository.js";

export interface OrderExpirer {
  execute(orderId: string): Promise<void>;
}

export interface ExpirationFailure {
  orderId: string;
  error: unknown;
}

export interface ExpireDueOrdersResult {
  failures: ExpirationFailure[];
}

/** Cron diário: expira os pedidos vencidos que a checagem no uso não pegou. */
export class ExpireDueOrders {
  constructor(
    private readonly orders: OrderRepository,
    private readonly expireOrder: OrderExpirer,
    private readonly now: () => Date,
  ) {}

  /** Um pedido que falha não interrompe a varredura: a falha volta no resultado e o resto segue. */
  async execute(): Promise<ExpireDueOrdersResult> {
    const failures: ExpirationFailure[] = [];
    for (const orderId of await this.orders.findDueOrderIds(this.now())) {
      try {
        await this.expireOrder.execute(orderId);
      } catch (error) {
        failures.push({ orderId, error });
      }
    }
    return { failures };
  }
}

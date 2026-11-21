import type { OrderRepository } from "../domain/order-repository.js";

export interface ConfirmPaymentInput {
  orderId: string;
  /** O admin que tocou em "Confirmar pagamento". */
  actorId: string;
}

/** O pagamento é só visual ([[ADR-020-aviso-de-portfolio-no-pagamento]]): o admin confirma o pedido. */
export class ConfirmPayment {
  constructor(
    private readonly orders: OrderRepository,
    private readonly now: () => Date,
  ) {}

  async execute(input: ConfirmPaymentInput): Promise<void> {
    await this.orders.confirmPaymentIfAwaiting(input.orderId, input.actorId, this.now());
  }
}

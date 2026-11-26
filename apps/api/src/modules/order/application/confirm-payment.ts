import { pedidoVencido } from "@leguele/shared";
import { NotFoundError } from "../../../common/errors/not-found-error.js";
import { OrderExpiredError, PaymentNotConfirmableError } from "../domain/order-errors.js";
import type { OrderRepository } from "../domain/order-repository.js";
import { ExpireOrder } from "./expire-order.js";

export interface ConfirmPaymentInput {
  orderId: string;
  /** O admin que tocou em "Confirmar pagamento". */
  actorId: string;
}

/** O pagamento é só visual ([[ADR-020-aviso-de-portfolio-no-pagamento]]): o admin confirma o pedido. */
export class ConfirmPayment {
  private readonly expiration: ExpireOrder;

  constructor(
    private readonly orders: OrderRepository,
    private readonly now: () => Date,
  ) {
    this.expiration = new ExpireOrder(orders, now);
  }

  async execute(input: ConfirmPaymentInput): Promise<void> {
    const order = await this.orders.findForExpiration(input.orderId);
    if (!order) throw new NotFoundError();
    if (pedidoVencido(order.expiresAt, this.now())) {
      // Vencido, o pedido expira (mesmo caso de uso da checagem no uso) e o admin recebe conflito.
      await this.expiration.execute(input.orderId);
      throw new OrderExpiredError();
    }
    // O repositório decide a corrida: só quem ainda vê o pedido aguardando pagamento confirma.
    const confirmed = await this.orders.confirmPaymentIfAwaiting(
      input.orderId,
      input.actorId,
      this.now(),
    );
    if (!confirmed) throw new PaymentNotConfirmableError();
  }
}

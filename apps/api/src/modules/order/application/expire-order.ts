import { pedidoVencido } from "@leguele/shared";
import type { OrderRepository } from "../domain/order-repository.js";

export const EXPIRATION_REASON = "pagamento não concluído";

/** O pagamento é só visual ([[ADR-020-aviso-de-portfolio-no-pagamento]]): vencido, o pedido só cancela. */
export class ExpireOrder {
  constructor(
    private readonly orders: OrderRepository,
    private readonly now: () => Date,
  ) {}

  async execute(orderId: string): Promise<void> {
    const order = await this.orders.findForExpiration(orderId);
    // Só quem ainda aguarda pagamento expira; pago ou cancelado fica como está.
    if (!order || order.status !== "aguardando-pagamento") return;

    const at = this.now();
    if (!pedidoVencido(order.expiresAt, at)) return;

    await this.orders.cancelIfAwaitingPayment(orderId, EXPIRATION_REASON, at);
  }
}

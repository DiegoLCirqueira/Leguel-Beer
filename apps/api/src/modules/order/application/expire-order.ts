import { pedidoVencido } from "@leguele/shared";
import type { OrderRepository } from "../domain/order-repository.js";
import { PaymentGatewayUnavailableError, type PaymentGateway } from "../domain/payment-gateway.js";

export const EXPIRATION_REASON = "pagamento não concluído";

export class ExpireOrder {
  constructor(
    private readonly orders: OrderRepository,
    private readonly gateway: PaymentGateway,
    private readonly now: () => Date,
  ) {}

  async execute(orderId: string): Promise<void> {
    const order = await this.orders.findForExpiration(orderId);
    if (!order) return;

    const at = this.now();
    if (!pedidoVencido(order.expiresAt, at)) return;

    try {
      await this.gateway.findApprovedPayment(orderId);
    } catch (error) {
      // Sem resposta do gateway o pedido segue aguardando, com a reserva; a próxima checagem tenta de novo.
      if (error instanceof PaymentGatewayUnavailableError) return;
      throw error;
    }

    await this.orders.cancelIfAwaitingPayment(orderId, EXPIRATION_REASON, at);
  }
}

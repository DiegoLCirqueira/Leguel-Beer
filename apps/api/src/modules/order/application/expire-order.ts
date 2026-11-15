import { pedidoVencido } from "@leguele/shared";
import type { ApprovalApplier } from "../domain/approval-applier.js";
import type { OrderRepository } from "../domain/order-repository.js";
import { PaymentGatewayUnavailableError, type PaymentGateway } from "../domain/payment-gateway.js";

export const EXPIRATION_REASON = "pagamento não concluído";

export class ExpireOrder {
  constructor(
    private readonly orders: OrderRepository,
    private readonly gateway: PaymentGateway,
    private readonly approvals: ApprovalApplier,
    private readonly now: () => Date,
  ) {}

  async execute(orderId: string): Promise<void> {
    const order = await this.orders.findForExpiration(orderId);
    // Só quem ainda aguarda pagamento expira; pago ou cancelado não consulta o gateway nem aplica nada.
    if (!order || order.status !== "aguardando-pagamento") return;

    const at = this.now();
    if (!pedidoVencido(order.expiresAt, at)) return;

    let approved;
    try {
      approved = await this.gateway.findApprovedPayment(orderId);
    } catch (error) {
      // Sem resposta do gateway o pedido segue aguardando, com a reserva; a próxima checagem tenta de novo.
      if (error instanceof PaymentGatewayUnavailableError) return;
      throw error;
    }

    // Vale a hora da aprovação no gateway: aprovada dentro da validade, aplica em vez de cancelar.
    if (approved && !pedidoVencido(order.expiresAt, approved.approvedAt)) {
      await this.approvals.apply(orderId, approved.approvedAt);
      return;
    }

    await this.orders.cancelIfAwaitingPayment(orderId, EXPIRATION_REASON, at);
  }
}

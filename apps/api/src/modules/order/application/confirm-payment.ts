import { pedidoVencido } from "@leguele/shared";
import { NotFoundError } from "../../../common/errors/not-found-error.js";
import { OrderExpiredError, PaymentNotConfirmableError } from "../domain/order-errors.js";
import type { OrderRepository } from "../domain/order-repository.js";
import type { OrderExpirer } from "./expire-due-orders.js";

export interface ConfirmPaymentInput {
  orderId: string;
  /** O admin que tocou em "Confirmar pagamento". */
  actorId: string;
}

export interface ConfirmPaymentResult {
  /** `false` quando o e-mail ao cliente não saiu (falha do provedor ou adaptador de desenvolvimento). */
  emailEnviado: boolean;
}

export interface ConfirmationEmailSender {
  execute(orderId: string): Promise<boolean>;
}

/** O pagamento é só visual ([[ADR-020-aviso-de-portfolio-no-pagamento]]): o admin confirma o pedido. */
export class ConfirmPayment {
  constructor(
    private readonly orders: OrderRepository,
    private readonly expiration: OrderExpirer,
    private readonly now: () => Date,
    private readonly confirmationEmail: ConfirmationEmailSender,
  ) {}

  async execute(input: ConfirmPaymentInput): Promise<ConfirmPaymentResult> {
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
    // Fora da transação e depois do "Pago": o e-mail nunca desfaz a confirmação.
    return { emailEnviado: await this.confirmationEmail.execute(input.orderId) };
  }
}

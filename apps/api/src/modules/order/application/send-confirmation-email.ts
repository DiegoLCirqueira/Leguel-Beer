import type { ConfirmationEmailSource, OrderEmailSender } from "../domain/order-email.js";

export interface SendConfirmationEmailOptions {
  source: ConfirmationEmailSource;
  sender: OrderEmailSender;
  siteUrl: string;
  now: () => Date;
  /** Falha do envio: só o id do pedido e o tipo do erro, nunca dado do cliente. */
  onFailure: (failure: { orderId: string; error: unknown }) => void;
  timeoutMs?: number;
}

/** Tempo máximo do provedor; passado isso, conta como falha. */
export const EMAIL_TIMEOUT_MS = 5_000;

/** Envia o e-mail de "pedido pago", fora da transação. Nunca lança: o pedido já está pago. */
export class SendConfirmationEmail {
  constructor(private readonly options: SendConfirmationEmailOptions) {}

  /** `true` só quando o provedor confirmou o envio e a marca foi gravada. */
  async execute(orderId: string): Promise<boolean> {
    void this.options;
    void orderId;
    return false;
  }
}

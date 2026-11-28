import {
  buildConfirmationEmail,
  type ConfirmationEmailSource,
  type OrderEmailSender,
} from "../domain/order-email.js";

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
    const { source, sender, siteUrl, now, onFailure } = this.options;
    try {
      const data = await source.find(orderId);
      if (!data) return false;
      const result = await withTimeout(
        sender.send(buildConfirmationEmail(data, siteUrl)),
        this.options.timeoutMs ?? EMAIL_TIMEOUT_MS,
      );
      // Adaptador de desenvolvimento: nada saiu de verdade, então não há marca de enviado.
      if (result !== "sent") return false;
      // A marca vem depois do sucesso do provedor, numa escrita separada do "Pago".
      try {
        await source.markSent(orderId, now());
      } catch (error) {
        // O e-mail saiu: a falha é só da marca, então vai ao log e não vira aviso ao admin.
        onFailure({ orderId, error });
      }
      return true;
    } catch (error) {
      onFailure({ orderId, error });
      return false;
    }
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("EMAIL_TIMEOUT")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(String(error)));
      },
    );
  });
}

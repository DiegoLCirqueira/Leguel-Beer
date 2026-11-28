import type { AppLogger } from "../../../common/logging/app-logger.js";
import type { EmailMessage, EmailSendResult, OrderEmailSender } from "../domain/order-email.js";

/**
 * Adaptador de desenvolvimento: não envia nada e devolve "skipped" (sem marca de enviado). O log
 * traz só o assunto, nunca o destinatário nem o corpo. O provedor real é pós-MVP.
 */
export class DevOrderEmailSender implements OrderEmailSender {
  constructor(private readonly logger: AppLogger) {}

  async send(message: EmailMessage): Promise<EmailSendResult> {
    this.logger.info("E-mail de confirmação não enviado (adaptador de desenvolvimento)", {
      assunto: message.subject,
    });
    return "skipped";
  }
}

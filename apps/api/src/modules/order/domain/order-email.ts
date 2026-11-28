export interface ConfirmationEmailData {
  /** E-mail da conta dona do pedido: o único destinatário. */
  to: string;
  customerName: string | null;
  number: string;
  createdAt: Date;
  items: { name: string; priceCents: number; quantity: number }[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  payment: { tipo: "pix" } | { tipo: "cartao"; parcelas: number };
  shipTo: {
    zip: string;
    street: string;
    number: string;
    complement: string | null;
    district: string;
    city: string;
    state: string;
  };
}

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/** "sent": o provedor confirmou; "skipped": adaptador de desenvolvimento, nada saiu de verdade. Falha lança. */
export type EmailSendResult = "sent" | "skipped";

export interface OrderEmailSender {
  send(message: EmailMessage): Promise<EmailSendResult>;
}

/** Lê os dados do e-mail e guarda a marca de enviado. */
export interface ConfirmationEmailSource {
  find(orderId: string): Promise<ConfirmationEmailData | null>;
  markSent(orderId: string, at: Date): Promise<void>;
}

export function buildConfirmationEmail(data: ConfirmationEmailData, siteUrl: string): EmailMessage {
  void data;
  void siteUrl;
  return { to: "", subject: "", text: "", html: "" };
}

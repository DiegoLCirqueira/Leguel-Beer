import { dataDoPedido, formatPriceBRL } from "@leguele/shared";

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

const PORTFOLIO_NOTICE =
  "O Leguelé Beer é um projeto sem fins lucrativos, feito para portfólio. Nenhum pagamento é real e nada é cobrado.";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function paymentText(payment: ConfirmationEmailData["payment"]): string {
  return payment.tipo === "pix" ? "Pix" : `Cartão em ${payment.parcelas}x`;
}

/** Texto simples e HTML mínimo, sem imagem nem link de rastreio. Só os campos desta lista saem. */
export function buildConfirmationEmail(data: ConfirmationEmailData, siteUrl: string): EmailMessage {
  const firstName = data.customerName?.trim().split(/\s+/)[0];
  const greeting = firstName ? `Olá, ${firstName}` : "Olá,";
  const zip = `${data.shipTo.zip.slice(0, 5)}-${data.shipTo.zip.slice(5)}`;
  const address = [
    `${data.shipTo.street}, ${data.shipTo.number}`,
    ...(data.shipTo.complement ? [data.shipTo.complement] : []),
    data.shipTo.district,
    `${data.shipTo.city} - ${data.shipTo.state}`,
    zip,
  ];
  const items = data.items.map(
    (item) => `${item.quantity}× ${item.name} — ${formatPriceBRL(item.priceCents * item.quantity)}`,
  );
  const link = `${siteUrl.replace(/\/$/, "")}/conta/pedidos`;
  const lines = [
    `Pedido ${data.number} • ${dataDoPedido(data.createdAt.toISOString())}`,
    "Pagamento confirmado. Seu pedido já está com a gente.",
    "",
    ...items,
    "",
    `Subtotal: ${formatPriceBRL(data.subtotalCents)}`,
    `Frete: ${data.shippingCents === 0 ? "Grátis" : formatPriceBRL(data.shippingCents)}`,
    `Total: ${formatPriceBRL(data.totalCents)}`,
    `Pagamento: ${paymentText(data.payment)}`,
    "",
    "Entrega em:",
    ...address,
    "",
    `Acompanhe em Meus pedidos: ${link}`,
    "",
    PORTFOLIO_NOTICE,
  ];
  const text = `${greeting}\n${lines.join("\n")}\n`;
  const html = [
    `<p>${escapeHtml(greeting)}</p>`,
    ...lines
      .filter((line) => line !== "" && !line.startsWith("Acompanhe") && line !== PORTFOLIO_NOTICE)
      .map((line) => `<p>${escapeHtml(line)}</p>`),
    `<p><a href="${escapeHtml(link)}">Meus pedidos</a></p>`,
    `<p><small>${escapeHtml(PORTFOLIO_NOTICE)}</small></p>`,
  ].join("\n");
  return { to: data.to, subject: `Pedido ${data.number} confirmado`, text, html };
}

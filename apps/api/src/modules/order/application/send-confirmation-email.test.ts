import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  ConfirmationEmailData,
  ConfirmationEmailSource,
  EmailMessage,
  EmailSendResult,
  OrderEmailSender,
} from "../domain/order-email.js";
import { EMAIL_TIMEOUT_MS, SendConfirmationEmail } from "./send-confirmation-email.js";

const NOW = new Date("2026-11-27T15:00:00.000Z");

const DATA: ConfirmationEmailData = {
  to: "ana@exemplo.com",
  customerName: "Ana Souza",
  number: "#LB482731",
  createdAt: new Date("2026-11-27T14:30:00.000Z"),
  items: [{ name: "Maré Alta", priceCents: 3_900, quantity: 3 }],
  subtotalCents: 11_700,
  shippingCents: 1_300,
  totalCents: 13_000,
  payment: { tipo: "pix" },
  shipTo: {
    zip: "57035000",
    street: "Rua do Sol",
    number: "100",
    complement: null,
    district: "Farol",
    city: "Maceió",
    state: "AL",
  },
};

class FakeSource implements ConfirmationEmailSource {
  marked: { orderId: string; at: Date }[] = [];
  async find(): Promise<ConfirmationEmailData | null> {
    return DATA;
  }
  async markSent(orderId: string, at: Date): Promise<void> {
    this.marked.push({ orderId, at });
  }
}

class FakeSender implements OrderEmailSender {
  sent: EmailMessage[] = [];
  constructor(private readonly behavior: () => Promise<EmailSendResult> = async () => "sent") {}
  async send(message: EmailMessage): Promise<EmailSendResult> {
    this.sent.push(message);
    return this.behavior();
  }
}

describe("SendConfirmationEmail", () => {
  const failures: { orderId: string; error: unknown }[] = [];

  beforeEach(() => {
    failures.length = 0;
  });
  afterEach(() => vi.useRealTimers());

  function build(sender: OrderEmailSender, source = new FakeSource()) {
    const useCase = new SendConfirmationEmail({
      source,
      sender,
      siteUrl: "https://leguele.example",
      now: () => NOW,
      onFailure: (failure) => failures.push(failure),
    });
    return { useCase, source };
  }

  it("envia ao e-mail da conta e só depois grava a marca de enviado", async () => {
    const sender = new FakeSender();
    const { useCase, source } = build(sender);

    expect(await useCase.execute("order-1")).toBe(true);

    expect(sender.sent).toHaveLength(1);
    expect(sender.sent[0]).toMatchObject({
      to: "ana@exemplo.com",
      subject: "Pedido #LB482731 confirmado",
    });
    expect(source.marked).toEqual([{ orderId: "order-1", at: NOW }]);
  });

  it("se o provedor falha, não lança, não marca e registra só o id e o tipo do erro", async () => {
    const boom = Object.assign(new Error("ana@exemplo.com Rua do Sol"), { code: "ECONNRESET" });
    const { useCase, source } = build(new FakeSender(() => Promise.reject(boom)));

    expect(await useCase.execute("order-1")).toBe(false);

    expect(source.marked).toEqual([]);
    expect(failures).toEqual([{ orderId: "order-1", error: boom }]);
  });

  it("passados 5 segundos sem resposta do provedor, conta como falha", async () => {
    vi.useFakeTimers();
    const { useCase, source } = build(new FakeSender(() => new Promise(() => {})));

    const result = useCase.execute("order-1");
    await vi.advanceTimersByTimeAsync(EMAIL_TIMEOUT_MS + 1);

    expect(await result).toBe(false);
    expect(source.marked).toEqual([]);
    expect(failures).toHaveLength(1);
  });

  it("o adaptador de desenvolvimento ('skipped') não grava a marca nem conta como falha", async () => {
    const { useCase, source } = build(new FakeSender(async () => "skipped"));

    expect(await useCase.execute("order-1")).toBe(false);

    expect(source.marked).toEqual([]);
    expect(failures).toEqual([]);
  });
});

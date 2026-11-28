import { describe, expect, it } from "vitest";
import { buildConfirmationEmail, type ConfirmationEmailData } from "./order-email.js";

const DATA: ConfirmationEmailData = {
  to: "ana@exemplo.com",
  customerName: "Ana Souza",
  number: "#LB482731",
  createdAt: new Date("2026-11-27T02:30:00.000Z"),
  items: [
    { name: "Maré Alta", priceCents: 3_900, quantity: 3 },
    { name: "Cupuaçu Ale", priceCents: 4_600, quantity: 2 },
  ],
  subtotalCents: 20_900,
  shippingCents: 1_300,
  totalCents: 22_200,
  payment: { tipo: "cartao", parcelas: 3 },
  shipTo: {
    zip: "57035000",
    street: "Rua do Sol",
    number: "100",
    complement: "Apto 2",
    district: "Farol",
    city: "Maceió",
    state: "AL",
  },
};

describe("buildConfirmationEmail", () => {
  const email = buildConfirmationEmail(DATA, "https://leguele.example");

  it("vai só para o e-mail da conta, com o assunto do pedido", () => {
    expect(email.to).toBe("ana@exemplo.com");
    expect(email.subject).toBe("Pedido #LB482731 confirmado");
  });

  it("traz saudação, número, data no fuso de Maceió, itens, valores, pagamento e endereço", () => {
    for (const part of [
      "Olá, Ana",
      "#LB482731",
      "26/11/2026 • 23:30",
      "3× Maré Alta",
      "2× Cupuaçu Ale",
      "Subtotal",
      "Frete",
      "Total",
      "3x",
      "Rua do Sol, 100",
      "Apto 2",
      "Farol",
      "Maceió",
      "57035-000",
    ]) {
      expect(email.text).toContain(part);
      expect(email.html).toContain(part.replace("×", "×"));
    }
  });

  it("tem o link para Meus pedidos e o aviso de projeto de portfólio", () => {
    expect(email.text).toContain("https://leguele.example/conta/pedidos");
    expect(email.html).toContain('href="https://leguele.example/conta/pedidos"');
    expect(email.text).toContain("projeto sem fins lucrativos, feito para portfólio");
  });

  it("sem nome, a saudação é só 'Olá,'", () => {
    const anonymous = buildConfirmationEmail({ ...DATA, customerName: null }, "https://x.test");
    expect(anonymous.text).toMatch(/^Olá,\n/);
  });

  it("escapa HTML nos nomes", () => {
    const hostile = buildConfirmationEmail(
      { ...DATA, items: [{ name: "<script>x</script>", priceCents: 100, quantity: 1 }] },
      "https://x.test",
    );
    expect(hostile.html).not.toContain("<script>");
  });

  it("não traz telefone, data de nascimento nem id do cliente", () => {
    const leaky = JSON.stringify(email);
    for (const secret of ["82999990000", "1990-01-01", "00000000-0000-4000-8000"]) {
      expect(leaky).not.toContain(secret);
    }
    expect(Object.keys(DATA)).not.toContain("phone");
  });
});

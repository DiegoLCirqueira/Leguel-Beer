import { describe, expect, it } from "vitest";
import { pedidoDoClienteSchema } from "./detalhe.js";

const pedido = {
  id: "8d1b5f0e-6a73-4c1d-9a2e-3f6d7c8b9a10",
  numero: "#LB482731",
  status: "em-preparo",
  criadoEm: "2026-11-13T00:00:00.000Z",
  validoAte: "2026-11-13T00:30:00.000Z",
  pagamento: { tipo: "pix" },
  itens: [{ cervejaId: "c1", nome: "Maré Alta", precoCentavos: 3200, quantidade: 2 }],
  subtotalCentavos: 6400,
  freteCentavos: 500,
  totalCentavos: 6900,
  enderecoDeEntrega: {
    apelido: "Casa",
    cep: "57035000",
    rua: "Rua do Sol",
    numero: "100",
    bairro: "Farol",
    cidade: "Maceió",
    uf: "AL",
  },
  historico: [
    { status: "pago", em: "2026-11-13T00:10:00.000Z" },
    { status: "em-preparo", em: "2026-11-13T01:00:00.000Z" },
  ],
};

describe("pedido do cliente (detalhe)", () => {
  it("traz o pedido com o endereço de entrega guardado e o histórico de status com data", () => {
    expect(pedidoDoClienteSchema.parse(pedido)).toEqual(pedido);
  });

  it("recusa o pedido sem histórico, com status desconhecido no histórico ou com data inválida", () => {
    const semHistorico: Partial<typeof pedido> = { ...pedido };
    delete semHistorico.historico;

    expect(pedidoDoClienteSchema.safeParse(semHistorico).success).toBe(false);
    expect(
      pedidoDoClienteSchema.safeParse({
        ...pedido,
        historico: [{ status: "x", em: pedido.criadoEm }],
      }).success,
    ).toBe(false);
    expect(
      pedidoDoClienteSchema.safeParse({ ...pedido, historico: [{ status: "pago", em: "ontem" }] })
        .success,
    ).toBe(false);
  });

  it("mantém as regras do pedido: o total é o subtotal mais o frete", () => {
    expect(pedidoDoClienteSchema.safeParse({ ...pedido, totalCentavos: 1 }).success).toBe(false);
  });

  it("nunca leva o motivo do cancelamento: campo extra é descartado", () => {
    const comMotivo = { ...pedido, status: "cancelado", motivoDoCancelamento: "interno" };

    expect(pedidoDoClienteSchema.parse(comMotivo)).not.toHaveProperty("motivoDoCancelamento");
  });

  it("exige o endereço de entrega com rua, número, bairro, cidade, UF e CEP", () => {
    const semRua: Partial<typeof pedido.enderecoDeEntrega> = { ...pedido.enderecoDeEntrega };
    delete semRua.rua;

    expect(pedidoDoClienteSchema.safeParse({ ...pedido, enderecoDeEntrega: semRua }).success).toBe(
      false,
    );
  });
});

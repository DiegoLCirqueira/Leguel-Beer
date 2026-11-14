import { describe, expect, it } from "vitest";
import { chaveDeIdempotenciaSchema, criarPedidoRequestSchema } from "./criar.js";

const corpo = {
  enderecoId: "7b0c2a52-5c6e-4a3e-9f1a-0d5b6f3b1c11",
  pagamento: { tipo: "pix" },
  totalVistoCentavos: 16_200,
};

describe("criarPedidoRequestSchema", () => {
  it("aceita o id do endereço, a forma de pagamento e o total visto", () => {
    expect(criarPedidoRequestSchema.parse(corpo)).toEqual(corpo);
  });

  it("aceita cartão com token e parcelas", () => {
    const cartao = { tipo: "cartao", token: "tok_1", parcelas: 3, bandeira: "visa" };

    expect(criarPedidoRequestSchema.parse({ ...corpo, pagamento: cartao }).pagamento).toEqual(
      cartao,
    );
  });

  it("ignora itens, preços e frete mandados pelo site", () => {
    const resultado = criarPedidoRequestSchema.parse({
      ...corpo,
      itens: [{ cervejaId: "mare-alta", quantidade: 99, precoCentavos: 1 }],
      freteCentavos: 0,
      subtotalCentavos: 1,
    });

    expect(resultado).toEqual(corpo);
  });

  it.each([
    ["sem endereço", { ...corpo, enderecoId: "" }],
    ["sem pagamento", { enderecoId: corpo.enderecoId, totalVistoCentavos: 100 }],
    ["total negativo", { ...corpo, totalVistoCentavos: -1 }],
    ["total quebrado", { ...corpo, totalVistoCentavos: 100.5 }],
    ["total zero", { ...corpo, totalVistoCentavos: 0 }],
  ])("recusa %s", (_nome, entrada) => {
    expect(criarPedidoRequestSchema.safeParse(entrada).success).toBe(false);
  });
});

describe("chaveDeIdempotenciaSchema", () => {
  it.each(["7b0c2a52-5c6e-4a3e-9f1a-0d5b6f3b1c11", "abcdefgh12345678", "a".repeat(128)])(
    "aceita %s",
    (chave) => {
      expect(chaveDeIdempotenciaSchema.parse(chave)).toBe(chave);
    },
  );

  it.each(["", "curta", "a".repeat(129), "com espaço no meio 1234", "chave/com/barra/1234"])(
    "recusa %j",
    (chave) => {
      expect(chaveDeIdempotenciaSchema.safeParse(chave).success).toBe(false);
    },
  );
});

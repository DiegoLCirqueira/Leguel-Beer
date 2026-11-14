import { describe, expect, it } from "vitest";
import { formaDePagamentoSchema, PARCELAS_MAXIMAS } from "./forma.js";

describe("formaDePagamentoSchema", () => {
  it("aceita Pix, sem mais nada", () => {
    expect(formaDePagamentoSchema.parse({ tipo: "pix" })).toEqual({ tipo: "pix" });
  });

  it("aceita cartão com token, parcelas e bandeira", () => {
    const cartao = { tipo: "cartao", token: "tok_123", parcelas: 3, bandeira: "visa" };

    expect(formaDePagamentoSchema.parse(cartao)).toEqual(cartao);
  });

  it("limita as parcelas de 1 a 12", () => {
    expect(PARCELAS_MAXIMAS).toBe(12);
    const com = (parcelas: number) =>
      formaDePagamentoSchema.safeParse({ tipo: "cartao", token: "t", parcelas, bandeira: "visa" });

    expect(com(1).success).toBe(true);
    expect(com(12).success).toBe(true);
    expect(com(0).success).toBe(false);
    expect(com(13).success).toBe(false);
    expect(com(2.5).success).toBe(false);
  });

  it.each([
    [{ tipo: "cartao", parcelas: 1, bandeira: "visa" }],
    [{ tipo: "cartao", token: "", parcelas: 1, bandeira: "visa" }],
    [{ tipo: "cartao", token: "t", parcelas: 1 }],
    [{ tipo: "boleto" }],
    [{}],
  ])("recusa %j", (entrada) => {
    expect(formaDePagamentoSchema.safeParse(entrada).success).toBe(false);
  });

  it("descarta campo extra no Pix (como número do cartão mandado por engano)", () => {
    const resultado = formaDePagamentoSchema.parse({ tipo: "pix", numero: "4111111111111111" });

    expect(resultado).toEqual({ tipo: "pix" });
  });
});

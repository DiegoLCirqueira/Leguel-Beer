import { describe, expect, it } from "vitest";
import { confirmacaoDoPagamentoSchema } from "./confirmacao.js";

describe("confirmacaoDoPagamentoSchema", () => {
  it("diz se o e-mail ao cliente saiu", () => {
    expect(confirmacaoDoPagamentoSchema.parse({ emailEnviado: false })).toEqual({
      emailEnviado: false,
    });
  });

  it("recusa a resposta sem o aviso do e-mail", () => {
    expect(confirmacaoDoPagamentoSchema.safeParse({}).success).toBe(false);
  });
});

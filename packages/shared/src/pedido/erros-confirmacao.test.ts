import { describe, expect, it } from "vitest";
import { CODIGOS_DE_ERRO_DA_CONFIRMACAO, erroDaConfirmacaoSchema } from "./erros-confirmacao.js";

describe("erros da confirmação do pagamento (admin)", () => {
  it("lista os dois 409: pedido vencido e pedido que não aguarda mais pagamento", () => {
    expect(CODIGOS_DE_ERRO_DA_CONFIRMACAO).toEqual(["ORDER_EXPIRED", "PAYMENT_NOT_CONFIRMABLE"]);
  });

  it("aceita os dois códigos com a mensagem e recusa os de criar pedido e códigos desconhecidos", () => {
    for (const code of CODIGOS_DE_ERRO_DA_CONFIRMACAO) {
      expect(erroDaConfirmacaoSchema.parse({ code, message: "Texto" })).toEqual({
        code,
        message: "Texto",
      });
    }
    expect(erroDaConfirmacaoSchema.safeParse({ code: "UNDERAGE", message: "x" }).success).toBe(
      false,
    );
    expect(erroDaConfirmacaoSchema.safeParse({ code: "ORDER_EXPIRED" }).success).toBe(false);
  });
});

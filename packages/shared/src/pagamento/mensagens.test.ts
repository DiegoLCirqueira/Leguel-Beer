import { describe, expect, it } from "vitest";
import { MENSAGENS_DE_PAGAMENTO } from "./mensagens.js";

describe("mensagens de pagamento", () => {
  it("usa os textos da spec", () => {
    expect(MENSAGENS_DE_PAGAMENTO).toEqual({
      recusado: "Pagamento recusado. Tente outro cartão ou Pix.",
      indisponivel: "Não foi possível processar o pagamento agora. Tente de novo em instantes.",
    });
  });
});

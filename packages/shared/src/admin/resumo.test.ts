import { describe, expect, it } from "vitest";
import { resumoDoAdminSchema } from "./resumo.js";

describe("resumoDoAdminSchema", () => {
  it("traz os dois contadores, sem negativos", () => {
    expect(
      resumoDoAdminSchema.parse({ cervejasComEstoqueBaixo: 2, pedidosPagosAguardandoPreparo: 0 }),
    ).toEqual({ cervejasComEstoqueBaixo: 2, pedidosPagosAguardandoPreparo: 0 });
    expect(
      resumoDoAdminSchema.safeParse({
        cervejasComEstoqueBaixo: -1,
        pedidosPagosAguardandoPreparo: 0,
      }).success,
    ).toBe(false);
  });
});

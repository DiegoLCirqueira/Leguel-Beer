import { describe, expect, it } from "vitest";
import { CodedHttpError } from "../../../common/errors/coded-http-error.js";
import { MapsUnavailableError } from "../../delivery/domain/maps.js";
import { OutOfStockError } from "../domain/order-errors.js";
import { withOrderErrors } from "./order-http-errors.js";

describe("withOrderErrors", () => {
  it("traduz OutOfStockError em 409 OUT_OF_STOCK com as cervejas e os ajustes", async () => {
    const error = new OutOfStockError(
      [{ beerId: "cerveja-1", name: "Jaraguá Hazy IPA" }],
      [{ tipo: "indisponivel", cervejaId: "cerveja-1", nome: "Jaraguá Hazy IPA" }],
    );

    const thrown = await withOrderErrors(() => Promise.reject(error)).catch((e: unknown) => e);

    expect(thrown).toBeInstanceOf(CodedHttpError);
    expect(thrown).toMatchObject({
      status: 409,
      code: "OUT_OF_STOCK",
      message: "Algumas cervejas não têm mais a quantidade pedida.",
      extra: {
        cervejas: [{ cervejaId: "cerveja-1", nome: "Jaraguá Hazy IPA" }],
        ajustes: [{ tipo: "indisponivel", cervejaId: "cerveja-1", nome: "Jaraguá Hazy IPA" }],
      },
    });
  });

  it("traduz MapsUnavailableError em 503 MAPS_UNAVAILABLE sem vazar a causa", async () => {
    const thrown = await withOrderErrors(() => Promise.reject(new MapsUnavailableError())).catch(
      (e: unknown) => e,
    );

    expect(thrown).toBeInstanceOf(CodedHttpError);
    expect(thrown).toMatchObject({
      status: 503,
      code: "MAPS_UNAVAILABLE",
      message: "Não conseguimos calcular o frete agora. Tente de novo em instantes.",
    });
    expect((thrown as Error).message).not.toContain("serviço de mapas");
  });

  it("deixa passar o que não é erro do pedido e devolve o resultado em caso de sucesso", async () => {
    const unknown = new Error("boom");

    await expect(withOrderErrors(() => Promise.reject(unknown))).rejects.toBe(unknown);
    await expect(withOrderErrors(() => Promise.resolve(42))).resolves.toBe(42);
  });
});

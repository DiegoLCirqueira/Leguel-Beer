import { describe, expect, it } from "vitest";
import { pedidoVencido, validoAte, VALIDADE_DO_PEDIDO_MINUTOS } from "./validade.js";

const criadoEm = new Date("2026-11-13T10:00:00.000Z");

describe("validade do pedido", () => {
  it("dura 30 minutos desde a criação", () => {
    expect(VALIDADE_DO_PEDIDO_MINUTOS).toBe(30);
    expect(validoAte(criadoEm).toISOString()).toBe("2026-11-13T10:30:00.000Z");
  });

  it.each([
    ["10:00:00.000", false],
    ["10:29:59.000", false],
    ["10:29:59.999", false],
    ["10:30:00.000", true],
    ["10:31:00.000", true],
  ])("às %s o pedido vencido é %s", (hora, esperado) => {
    const agora = new Date(`2026-11-13T${hora}Z`);

    expect(pedidoVencido(validoAte(criadoEm), agora)).toBe(esperado);
  });
});

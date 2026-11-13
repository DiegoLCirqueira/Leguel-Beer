import { describe, expect, it } from "vitest";
import { posicaoDaGarrafa } from "./geometria";

describe("posicaoDaGarrafa", () => {
  it("garrafa da frente: caixa de 72 x 200 px da moldura, centrada na posição e apoiada na linha da prateleira", () => {
    const p = posicaoDaGarrafa(0, 0, 0);

    expect(p.left).toBeCloseTo((158.5 / 710) * 100, 3);
    expect(p.width).toBeCloseTo((72 / 710) * 100, 3);
    expect(p.height).toBeCloseTo((200 / 1573) * 100, 3);
    expect(p.bottom).toBeCloseTo(((1573 - 412.25) / 1573) * 100, 3);
    expect(p.brilho).toBe(1);
  });
});

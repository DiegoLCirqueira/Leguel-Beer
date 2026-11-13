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

  it("garrafa de trás: 10% menor, 30% mais escura e recuada 30 px por fileira", () => {
    const p = posicaoDaGarrafa(0, 0, 1);

    expect(p.height).toBeCloseTo((180 / 1573) * 100, 3);
    expect(p.width).toBeCloseTo((64.8 / 710) * 100, 3);
    expect(p.left).toBeCloseTo(((134 + (121 - 64.8) / 2 - 30) / 710) * 100, 3);
    expect(p.brilho).toBeCloseTo(0.7, 5);
  });

  it("nas prateleiras de baixo a fileira de trás sobe 6 px (3ª) e 17 px (4ª) por fileira", () => {
    const frente = posicaoDaGarrafa(3, 0, 0).bottom;
    const atras = posicaoDaGarrafa(3, 0, 1).bottom;

    expect(atras - frente).toBeCloseTo((17 / 1573) * 100, 3);
    expect(posicaoDaGarrafa(2, 0, 2).bottom - posicaoDaGarrafa(2, 0, 0).bottom).toBeCloseTo(
      (12 / 1573) * 100,
      3,
    );
  });
});

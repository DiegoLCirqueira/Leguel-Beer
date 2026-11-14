import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAnimacaoDasGarrafas, type GarrafaBase } from "./animacao-das-garrafas";

const garrafa = (cervejaId: string, k: number): GarrafaBase => ({
  chave: `${cervejaId}#${k}`,
  cervejaId,
});

const animacoes = (lista: { chave: string; animacao?: string }[]) =>
  Object.fromEntries(lista.map((g) => [g.chave, g.animacao ?? null]));

describe("useAnimacaoDasGarrafas", () => {
  it("na primeira leitura nenhuma garrafa anima (a Geladeira abre arrumada)", () => {
    const { result } = renderHook(() => useAnimacaoDasGarrafas([garrafa("a", 0), garrafa("a", 1)]));

    expect(animacoes(result.current)).toEqual({ "a#0": null, "a#1": null });
  });

  it("a garrafa que entra cai (queda) e as que já estavam não animam", () => {
    const { result, rerender } = renderHook(({ lista }) => useAnimacaoDasGarrafas(lista), {
      initialProps: { lista: [garrafa("a", 0)] },
    });

    rerender({ lista: [garrafa("a", 0), garrafa("b", 0)] });

    expect(animacoes(result.current)).toEqual({ "a#0": null, "b#0": "queda" });
  });

  it("ao aumentar a quantidade, as garrafas do rótulo balançam escalonadas e a nova cai", () => {
    const { result, rerender } = renderHook(({ lista }) => useAnimacaoDasGarrafas(lista), {
      initialProps: { lista: [garrafa("a", 0), garrafa("a", 1), garrafa("b", 0)] },
    });

    rerender({ lista: [garrafa("a", 0), garrafa("a", 1), garrafa("a", 2), garrafa("b", 0)] });

    expect(animacoes(result.current)).toEqual({
      "a#0": "balanco",
      "a#1": "balanco",
      "a#2": "queda",
      "b#0": null,
    });
    expect(result.current.map((g) => g.atraso)).toEqual([0, 60, 0, 0]);
  });
});

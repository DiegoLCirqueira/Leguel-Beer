import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAnimacaoDasGarrafas, type GarrafaBase } from "./animacao-das-garrafas";

const garrafa = (cervejaId: string, k: number): GarrafaBase => ({
  chave: `${cervejaId}#${k}`,
  cervejaId,
});

const animacoes = (lista: { chave: string; animacao?: string }[]) =>
  Object.fromEntries(lista.map((g) => [g.chave, g.animacao ?? null]));

afterEach(() => vi.useRealTimers());

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

  it("a garrafa que sai continua na tela por 300 ms, saindo, e depois some", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ lista }) => useAnimacaoDasGarrafas(lista), {
      initialProps: { lista: [garrafa("a", 0), garrafa("b", 0)] },
    });

    rerender({ lista: [garrafa("a", 0)] });

    expect(animacoes(result.current)).toEqual({ "a#0": null, "b#0": "saida" });

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current.map((g) => g.chave)).toContain("b#0");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.map((g) => g.chave)).toEqual(["a#0"]);
  });

  it("dois cortes rápidos: a garrafa que já está saindo mantém a rodada em que saiu", () => {
    const { result, rerender } = renderHook(({ lista }) => useAnimacaoDasGarrafas(lista), {
      initialProps: { lista: [garrafa("a", 0), garrafa("a", 1), garrafa("a", 2)] },
    });
    rerender({ lista: [garrafa("a", 0), garrafa("a", 1)] });
    const rodadaDaPrimeira = result.current.find((g) => g.chave === "a#2")!.rodada;

    rerender({ lista: [garrafa("a", 0)] });

    const saindo = result.current.filter((g) => g.animacao === "saida");
    expect(saindo.map((g) => g.chave)).toEqual(["a#2", "a#1"]);
    expect(saindo.find((g) => g.chave === "a#2")!.rodada).toBe(rodadaDaPrimeira);
    expect(saindo.find((g) => g.chave === "a#1")!.rodada).toBeGreaterThan(rodadaDaPrimeira);
  });

  it("com movimento reduzido nada anima: a garrafa nova só aparece e a que sai some na hora", () => {
    window.matchMedia = (consulta: string) =>
      ({ matches: consulta === "(prefers-reduced-motion: reduce)" }) as MediaQueryList;
    const { result, rerender } = renderHook(({ lista }) => useAnimacaoDasGarrafas(lista), {
      initialProps: { lista: [garrafa("a", 0), garrafa("b", 0)] },
    });

    rerender({ lista: [garrafa("a", 0), garrafa("a", 1)] });

    expect(animacoes(result.current)).toEqual({ "a#0": null, "a#1": null });
  });
});

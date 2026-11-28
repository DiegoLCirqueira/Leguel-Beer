import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useRolavel } from "./use-rolavel";

function Area({ chave }: { chave: string }) {
  const [ref, rolavel] = useRolavel<HTMLDivElement>(chave);
  return (
    <div ref={ref} data-testid="area">
      {rolavel ? "rola" : "cabe"}
    </div>
  );
}

describe("useRolavel", () => {
  afterEach(() => vi.restoreAllMocks());

  it("mede de novo quando a chave muda, mesmo que a caixa do elemento não mude", () => {
    let conteudo = 100;
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(() => conteudo);
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(400);

    const { rerender } = render(<Area chave="carregando" />);
    expect(screen.getByTestId("area")).toHaveTextContent("cabe");

    conteudo = 900;
    rerender(<Area chave="pronta" />);

    expect(screen.getByTestId("area")).toHaveTextContent("rola");
  });
});

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toast } from "./toast";

describe("Toast", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it("anuncia a mensagem numa região de status e mostra a ação", () => {
    render(
      <Toast
        mensagem="Munich Lager foi para a geladeira"
        acao={{ rotulo: "Desfazer", aoAcionar: vi.fn() }}
        aoFechar={vi.fn()}
      />,
    );

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Munich Lager foi para a geladeira");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(screen.getByRole("button", { name: "Desfazer" })).toBeInTheDocument();
  });

  it("a ação dispara o que foi pedido e fecha o toast", async () => {
    const aoAcionar = vi.fn();
    const aoFechar = vi.fn();
    const usuario = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Toast mensagem="Foi" acao={{ rotulo: "Desfazer", aoAcionar }} aoFechar={aoFechar} />);

    await usuario.click(screen.getByRole("button", { name: "Desfazer" }));

    expect(aoAcionar).toHaveBeenCalledOnce();
    expect(aoFechar).toHaveBeenCalledOnce();
  });

  it("some sozinho depois de 5 segundos, e não antes", () => {
    const aoFechar = vi.fn();
    render(<Toast mensagem="Foi" aoFechar={aoFechar} />);

    act(() => vi.advanceTimersByTime(4999));
    expect(aoFechar).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));

    expect(aoFechar).toHaveBeenCalledOnce();
  });

  it("respeita uma duração diferente e não fecha duas vezes depois de acionar a ação", async () => {
    const aoFechar = vi.fn();
    const usuario = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Toast
        mensagem="Foi"
        duracaoMs={2000}
        acao={{ rotulo: "Desfazer", aoAcionar: vi.fn() }}
        aoFechar={aoFechar}
      />,
    );

    await usuario.click(screen.getByRole("button", { name: "Desfazer" }));
    act(() => vi.advanceTimersByTime(10_000));

    expect(aoFechar).toHaveBeenCalledOnce();
  });

  it("pausa o contador com o mouse em cima e retoma só com o que restava", async () => {
    const aoFechar = vi.fn();
    const usuario = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Toast mensagem="Foi" aoFechar={aoFechar} />);

    act(() => vi.advanceTimersByTime(3000));
    await usuario.hover(screen.getByRole("status"));
    act(() => vi.advanceTimersByTime(10_000));
    expect(aoFechar).not.toHaveBeenCalled();
    await usuario.unhover(screen.getByRole("status"));
    act(() => vi.advanceTimersByTime(1900));
    expect(aoFechar).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(200));

    expect(aoFechar).toHaveBeenCalledOnce();
  });

  it("pausa o contador enquanto o foco está na ação", async () => {
    const aoFechar = vi.fn();
    const usuario = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Toast
        mensagem="Foi"
        acao={{ rotulo: "Desfazer", aoAcionar: vi.fn() }}
        aoFechar={aoFechar}
      />,
    );

    await usuario.tab();
    act(() => vi.advanceTimersByTime(10_000));
    expect(aoFechar).not.toHaveBeenCalled();
    await usuario.tab();
    act(() => vi.advanceTimersByTime(5100));

    expect(aoFechar).toHaveBeenCalledOnce();
  });

  it("com outra mensagem o contador recomeça e o toast pode fechar de novo", () => {
    const aoFechar = vi.fn();
    const { rerender } = render(<Toast mensagem="Primeira" aoFechar={aoFechar} />);

    act(() => vi.advanceTimersByTime(4000));
    rerender(<Toast mensagem="Segunda" aoFechar={aoFechar} />);
    act(() => vi.advanceTimersByTime(4000));
    expect(aoFechar).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1000));
    expect(aoFechar).toHaveBeenCalledTimes(1);

    rerender(<Toast mensagem="Terceira" aoFechar={aoFechar} />);
    act(() => vi.advanceTimersByTime(5000));

    expect(aoFechar).toHaveBeenCalledTimes(2);
  });
});

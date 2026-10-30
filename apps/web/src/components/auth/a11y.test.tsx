import { render } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import { CriarContaForm } from "./criar-conta-form";

describe("acessibilidade do cadastro", () => {
  it("o formulário de criar conta não tem violações do axe", async () => {
    const { container } = render(<CriarContaForm criar={vi.fn()} />);

    const resultado = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });

    expect(resultado.violations).toEqual([]);
  });
});

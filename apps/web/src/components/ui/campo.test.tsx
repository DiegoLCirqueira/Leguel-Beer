import { render, screen } from "@testing-library/react";
import { Mail } from "lucide-react";
import { describe, expect, it } from "vitest";
import { Campo } from "./campo";

function renderizar(erro?: string) {
  render(<Campo id="email" rotulo="E-mail" icone={Mail} erro={erro} />);
  return screen.getByTestId("campo-contorno");
}

describe("Campo", () => {
  it("traz o campo de digitar, com o nome do rótulo, dentro do contorno", () => {
    const contorno = renderizar();

    expect(contorno).toContainElement(screen.getByRole("textbox", { name: "E-mail" }));
  });

  it("tem contorno visível com a cor do token borda-campo, para parecer um lugar de digitar", () => {
    expect(renderizar()).toHaveClass("border", "border-borda-campo");
  });

  it("ganha um destaque de foco distinto da borda em repouso", () => {
    expect(renderizar()).toHaveClass("focus-within:border-primaria", "focus-within:ring-2");
  });
});

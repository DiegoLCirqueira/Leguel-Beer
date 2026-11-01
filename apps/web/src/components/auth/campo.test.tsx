import { render, screen } from "@testing-library/react";
import { Mail } from "lucide-react";
import { describe, expect, it } from "vitest";
import { Campo } from "./campo";

function contorno() {
  return screen.getByLabelText("E-mail").closest("div")?.parentElement as HTMLElement;
}

describe("Campo", () => {
  it("tem contorno visível com a cor do token borda-campo, para parecer um lugar de digitar", () => {
    render(<Campo id="email" rotulo="E-mail" icone={Mail} />);

    expect(contorno()).toHaveClass("border", "border-borda-campo");
  });

  it("ganha um destaque de foco distinto da borda em repouso", () => {
    render(<Campo id="email" rotulo="E-mail" icone={Mail} />);

    expect(contorno()).toHaveClass("focus-within:border-primaria", "focus-within:ring-2");
  });
});

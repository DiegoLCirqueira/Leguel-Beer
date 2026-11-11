import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const caminho = vi.hoisted(() => ({ atual: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => caminho.atual }));

import { navegouNoSite } from "@/lib/navegacao";
import { MarcadorDeNavegacao } from "./marcador-de-navegacao";

describe("MarcadorDeNavegacao", () => {
  afterEach(() => {
    sessionStorage.clear();
    caminho.atual = "/";
  });

  it("não marca na primeira tela e marca quando o caminho muda dentro do app", () => {
    const { rerender } = render(<MarcadorDeNavegacao />);
    expect(navegouNoSite()).toBe(false);

    caminho.atual = "/catalogo/mare-alta";
    rerender(<MarcadorDeNavegacao />);

    expect(navegouNoSite()).toBe(true);
  });
});

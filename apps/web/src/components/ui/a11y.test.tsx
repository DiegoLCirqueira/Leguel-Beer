import { render } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import { Button } from "./button";
import { CategoryChips } from "./category-chips";
import { StyleBadge } from "./style-badge";

describe("acessibilidade dos componentes base", () => {
  it("não tem violações do axe", async () => {
    const { container } = render(
      <div>
        <Button>Entrar</Button>
        <Button variant="outline">Criar conta</Button>
        <Button variant="ghost" size="sm">
          Continuar como convidado
        </Button>
        <Button loading>Entrar</Button>
        <StyleBadge slug="ipa" name="IPA" />
        <CategoryChips
          items={[{ id: "todas", label: "Todas", count: 16 }]}
          value="todas"
          onChange={() => {}}
        />
      </div>,
    );

    const { violations } = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });

    expect(violations).toEqual([]);
  });
});

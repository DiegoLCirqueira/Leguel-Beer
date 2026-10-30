import { describe, expect, it } from "vitest";
import { emailSchema } from "./email.js";

describe("emailSchema", () => {
  it("aceita um e-mail válido e o normaliza sem espaços nem maiúsculas", () => {
    expect(emailSchema.parse("  Ana@Exemplo.COM ")).toBe("ana@exemplo.com");
  });

  it.each(["", "ana@", "ana", "ana@exemplo"])("recusa %j", (entrada) => {
    const result = emailSchema.safeParse(entrada);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Informe um e-mail válido.");
  });
});

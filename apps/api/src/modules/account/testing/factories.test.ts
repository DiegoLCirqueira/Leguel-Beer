import { describe, expect, it } from "vitest";
import { buildProfile } from "./factories.js";

describe("buildProfile", () => {
  it("gera perfis de cliente com id e e-mail únicos", () => {
    const a = buildProfile();
    const b = buildProfile();

    expect(a.id).not.toBe(b.id);
    expect(a.email).not.toBe(b.email);
    expect(a.role).toBe("CUSTOMER");
  });

  it("aceita sobrescrever campos", () => {
    expect(buildProfile({ role: "ADMIN", email: "admin@leguele.test" })).toMatchObject({
      role: "ADMIN",
      email: "admin@leguele.test",
    });
  });
});

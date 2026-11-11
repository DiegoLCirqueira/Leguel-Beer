import { afterEach, describe, expect, it } from "vitest";
import { marcarNavegouNoSite, navegouNoSite } from "./navegacao";

describe("navegação dentro do site", () => {
  afterEach(() => sessionStorage.clear());

  it("começa sem marca e passa a lembrar que a pessoa navegou no site, por aba", () => {
    expect(navegouNoSite()).toBe(false);

    marcarNavegouNoSite();

    expect(navegouNoSite()).toBe(true);
  });

  it("sem sessionStorage (bloqueado) nunca lança e diz que não navegou", () => {
    const original = Object.getOwnPropertyDescriptor(window, "sessionStorage");
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      get() {
        throw new Error("bloqueado");
      },
    });
    try {
      expect(() => marcarNavegouNoSite()).not.toThrow();
      expect(navegouNoSite()).toBe(false);
    } finally {
      if (original) Object.defineProperty(window, "sessionStorage", original);
    }
  });
});

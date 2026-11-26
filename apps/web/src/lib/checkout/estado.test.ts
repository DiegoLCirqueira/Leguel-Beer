import { afterEach, describe, expect, it } from "vitest";
import {
  CHAVE_DO_CHECKOUT,
  gravarEstadoDoCheckout,
  lerEstadoDoCheckout,
  primeiraEtapaPendente,
} from "./estado";

afterEach(() => sessionStorage.clear());

describe("primeiraEtapaPendente", () => {
  it("sem endereço escolhido, é a Entrega", () => {
    expect(primeiraEtapaPendente({})).toBe("entrega");
  });

  it("com endereço e sem forma de pagamento, é o Pagamento", () => {
    expect(primeiraEtapaPendente({ enderecoId: "casa" })).toBe("pagamento");
  });

  it("com endereço e forma de pagamento, é a Revisão", () => {
    expect(primeiraEtapaPendente({ enderecoId: "casa", pagamento: { tipo: "pix" } })).toBe(
      "revisao",
    );
  });
});

describe("estado do checkout na aba", () => {
  it("guarda e lê o endereço e a forma de pagamento", () => {
    gravarEstadoDoCheckout({ enderecoId: "casa", pagamento: { tipo: "pix" } });

    expect(lerEstadoDoCheckout()).toEqual({ enderecoId: "casa", pagamento: { tipo: "pix" } });
  });

  it("vazio, ou com conteúdo inválido, lê como estado vazio", () => {
    expect(lerEstadoDoCheckout()).toEqual({});
    sessionStorage.setItem(CHAVE_DO_CHECKOUT, "{não é json");
    expect(lerEstadoDoCheckout()).toEqual({});
    sessionStorage.setItem(
      CHAVE_DO_CHECKOUT,
      JSON.stringify({ enderecoId: 5, pagamento: { tipo: "boleto" } }),
    );
    expect(lerEstadoDoCheckout()).toEqual({});
  });

  it("não guarda dados de cartão: só a forma de pagamento", () => {
    gravarEstadoDoCheckout({
      enderecoId: "casa",
      pagamento: { tipo: "pix", numero: "4111111111111111" } as never,
    });

    expect(sessionStorage.getItem(CHAVE_DO_CHECKOUT)).not.toContain("4111");
  });
});

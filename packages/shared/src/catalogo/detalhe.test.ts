import { describe, expect, it } from "vitest";
import { cervejaDetalheSchema } from "./detalhe.js";

const detalheValido = {
  id: "cerveja-1",
  slug: "mare-alta",
  nome: "Maré Alta",
  estilo: "American IPA",
  categoria: { slug: "ipa", nome: "IPAs", ordem: 1 },
  teorAlcoolico: 6.5,
  ibu: 65,
  volumeMl: 500,
  precoCentavos: 3200,
  destaque: true,
  quantidadeDisponivel: 12,
  esgotada: false,
  imagemUrl: null,
  cadastradaEm: "2026-10-02T12:00:00.000Z",
  descricao: "Uma IPA cítrica e resinosa.",
  precoAnteriorCentavos: 3690,
  descontoPercentual: 13,
};

describe("cervejaDetalheSchema", () => {
  it("aceita o card completo mais descrição, preço anterior e desconto", () => {
    expect(cervejaDetalheSchema.parse(detalheValido)).toEqual(detalheValido);
  });

  it("descrição, preço anterior e desconto podem ser nulos (sem desconto)", () => {
    const semDesconto = {
      ...detalheValido,
      descricao: null,
      precoAnteriorCentavos: null,
      descontoPercentual: null,
    };

    expect(cervejaDetalheSchema.parse(semDesconto)).toEqual(semDesconto);
  });

  it("recusa descrição vazia, preço anterior fracionado ou negativo e desconto fracionado", () => {
    const recusa = (campos: object) =>
      cervejaDetalheSchema.safeParse({ ...detalheValido, ...campos }).success;

    expect(recusa({ descricao: "" })).toBe(false);
    expect(recusa({ precoAnteriorCentavos: 3690.5 })).toBe(false);
    expect(recusa({ precoAnteriorCentavos: -1 })).toBe(false);
    expect(recusa({ descontoPercentual: 13.5 })).toBe(false);
  });

  it("exige descontoPercentual igual a calcularDesconto: 13 com 36,90 e 32,00", () => {
    const comDesconto = (campos: object) =>
      cervejaDetalheSchema.safeParse({ ...detalheValido, ...campos });

    expect(comDesconto({}).success).toBe(true);
    expect(comDesconto({ descontoPercentual: 11 }).success).toBe(false);
    expect(comDesconto({ descontoPercentual: null }).success).toBe(false);
  });

  it("sem desconto: anterior igual ao atual ou ausente exige descontoPercentual nulo", () => {
    const comDesconto = (campos: object) =>
      cervejaDetalheSchema.safeParse({ ...detalheValido, ...campos }).success;

    expect(comDesconto({ precoAnteriorCentavos: 3200, descontoPercentual: null })).toBe(true);
    expect(comDesconto({ precoAnteriorCentavos: 3200, descontoPercentual: 13 })).toBe(false);
    expect(comDesconto({ precoAnteriorCentavos: null, descontoPercentual: 13 })).toBe(false);
  });

  it("mantém a regra do card: esgotada só com quantidade disponível 0", () => {
    const recusa = (campos: object) =>
      cervejaDetalheSchema.safeParse({ ...detalheValido, ...campos }).success;

    expect(recusa({ quantidadeDisponivel: 0, esgotada: true })).toBe(true);
    expect(recusa({ quantidadeDisponivel: 0, esgotada: false })).toBe(false);
    expect(recusa({ quantidadeDisponivel: 3, esgotada: true })).toBe(false);
  });
});

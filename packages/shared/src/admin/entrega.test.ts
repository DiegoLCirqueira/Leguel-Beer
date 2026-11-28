import { describe, expect, it } from "vitest";
import { configuracoesDeEntregaSchema } from "./entrega.js";

const VALIDA = {
  origem: {
    cep: "57035-000",
    rua: "Rua do Sol",
    numero: "100",
    bairro: "Farol",
    cidade: "Maceió",
  },
  taxaBaseCentavos: 800,
  valorPorKmCentavos: 150,
  raioMaximoKm: 15,
  freteGratisMinimoCentavos: 15_000,
};

const ok = (extra: object) =>
  configuracoesDeEntregaSchema.safeParse({ ...VALIDA, ...extra }).success;

describe("configuracoesDeEntregaSchema", () => {
  it("aceita as configurações e a origem como endereço", () => {
    const config = configuracoesDeEntregaSchema.parse(VALIDA);

    expect(config.raioMaximoKm).toBe(15);
    expect(config.origem.cidade).toBe("Maceió");
  });

  it.each([
    ["taxaBaseCentavos", -1],
    ["taxaBaseCentavos", 10_001],
    ["valorPorKmCentavos", -1],
    ["valorPorKmCentavos", 10_001],
    ["raioMaximoKm", 0],
    ["raioMaximoKm", 101],
    ["raioMaximoKm", 1.5],
    ["freteGratisMinimoCentavos", -1],
    ["freteGratisMinimoCentavos", 1_000_001],
  ])("recusa %s = %s", (campo, valor) => {
    expect(ok({ [campo]: valor })).toBe(false);
  });

  it.each([
    ["taxaBaseCentavos", 0],
    ["taxaBaseCentavos", 10_000],
    ["valorPorKmCentavos", 10_000],
    ["raioMaximoKm", 1],
    ["raioMaximoKm", 100],
    ["freteGratisMinimoCentavos", 0],
    ["freteGratisMinimoCentavos", 1_000_000],
  ])("aceita o limite %s = %s", (campo, valor) => {
    expect(ok({ [campo]: valor })).toBe(true);
  });

  it("a origem exige CEP válido e os campos do endereço", () => {
    expect(ok({ origem: { ...VALIDA.origem, cep: "123" } })).toBe(false);
    expect(ok({ origem: { ...VALIDA.origem, rua: "" } })).toBe(false);
    expect(ok({ origem: { ...VALIDA.origem, cidade: "" } })).toBe(false);
  });

  it("campo a mais é recusado na configuração e na origem", () => {
    expect(ok({ latitude: 1 })).toBe(false);
    expect(ok({ origem: { ...VALIDA.origem, latitude: 1 } })).toBe(false);
  });

  it("rua, número, bairro e cidade têm tamanho máximo", () => {
    expect(ok({ origem: { ...VALIDA.origem, rua: "a".repeat(121) } })).toBe(false);
    expect(ok({ origem: { ...VALIDA.origem, numero: "1".repeat(21) } })).toBe(false);
    expect(ok({ origem: { ...VALIDA.origem, bairro: "a".repeat(81) } })).toBe(false);
    expect(ok({ origem: { ...VALIDA.origem, cidade: "a".repeat(81) } })).toBe(false);
    expect(ok({ origem: { ...VALIDA.origem, rua: "a".repeat(120) } })).toBe(true);
  });
});

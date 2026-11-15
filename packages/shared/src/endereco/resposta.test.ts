import { describe, expect, it } from "vitest";
import { enderecoRespostaSchema, listaDeEnderecosSchema } from "./resposta.js";

const endereco = {
  id: "5c1f6c1e-2f6a-4c4e-9c8e-2f0f4b1d7a11",
  apelido: "Casa",
  cep: "57035000",
  rua: "Rua do Sol",
  numero: "100",
  complemento: "Apto 12",
  bairro: "Farol",
  cidade: "Maceió",
  uf: "AL",
  padrao: true,
  foraDaArea: false,
};

describe("enderecoRespostaSchema", () => {
  it("aceita o endereço com o selo de padrão e de fora da área", () => {
    expect(enderecoRespostaSchema.parse(endereco)).toEqual(endereco);
  });

  it("aceita sem apelido e sem complemento", () => {
    const semOpcionais: Record<string, unknown> = { ...endereco };
    delete semOpcionais["apelido"];
    delete semOpcionais["complemento"];

    expect(enderecoRespostaSchema.parse(semOpcionais)).toEqual(semOpcionais);
  });

  it("não deixa passar coordenadas nem distância: o site não recebe esses dados", () => {
    const parsed = enderecoRespostaSchema.parse({
      ...endereco,
      latitude: -9.66,
      longitude: -35.74,
      distanciaMetros: 5200,
    });

    expect(parsed).toEqual(endereco);
  });

  it.each([
    ["sem id", { id: undefined }],
    ["sem a marca de padrão", { padrao: undefined }],
    ["sem a marca de fora da área", { foraDaArea: undefined }],
  ])("recusa o endereço %s", (_nome, alteracao) => {
    expect(enderecoRespostaSchema.safeParse({ ...endereco, ...alteracao }).success).toBe(false);
  });
});

describe("listaDeEnderecosSchema", () => {
  it("é uma lista de endereços e aceita vazia", () => {
    expect(listaDeEnderecosSchema.parse([])).toEqual([]);
    expect(listaDeEnderecosSchema.parse([endereco])).toEqual([endereco]);
  });
});

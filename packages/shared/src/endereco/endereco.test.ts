import { describe, expect, it } from "vitest";
import { enderecoFormSchema } from "./endereco.js";

const valido = {
  apelido: "Casa",
  cep: "57035-000",
  rua: "Avenida Fernandes Lima",
  numero: "100",
  complemento: "Apto 12",
  bairro: "Farol",
  cidade: "Maceió",
  uf: "AL",
};

describe("enderecoFormSchema", () => {
  it("aceita o endereço completo e guarda o CEP só com dígitos", () => {
    expect(enderecoFormSchema.parse(valido)).toEqual({ ...valido, cep: "57035000" });
  });

  it("aceita sem apelido e sem complemento", () => {
    const { apelido: _apelido, complemento: _complemento, ...semOpcionais } = valido;

    expect(enderecoFormSchema.parse(semOpcionais)).toEqual({ ...semOpcionais, cep: "57035000" });
  });
});

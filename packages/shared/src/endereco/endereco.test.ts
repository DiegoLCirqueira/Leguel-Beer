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
    const semOpcionais = omitir("apelido", "complemento");

    expect(enderecoFormSchema.parse(semOpcionais)).toEqual({ ...semOpcionais, cep: "57035000" });
  });

  it.each([
    ["rua", "Informe a rua."],
    ["numero", "Informe o número."],
    ["bairro", "Informe o bairro."],
    ["cidade", "Informe a cidade."],
  ])("recusa %s vazio, só com espaços ou ausente com a mensagem do campo", (campo, mensagem) => {
    for (const entrada of [
      { ...valido, [campo]: "" },
      { ...valido, [campo]: "   " },
      omitir(campo),
    ]) {
      const result = enderecoFormSchema.safeParse(entrada);

      expect(result.success).toBe(false);
      expect(result.error?.issues.map((i) => [i.path[0], i.message])).toEqual([[campo, mensagem]]);
    }
  });
  it.each(["SP", "PE", "", "al"])("recusa a UF %j: só Alagoas", (uf) => {
    const result = enderecoFormSchema.safeParse({ ...valido, uf });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((i) => [i.path[0], i.message])).toEqual([
      ["uf", "Por enquanto só entregamos em Alagoas."],
    ]);
  });
  it.each([
    ["apelido", 30],
    ["rua", 120],
    ["numero", 10],
    ["complemento", 60],
    ["bairro", 80],
    ["cidade", 80],
  ])("aceita %s com %i caracteres e recusa com um a mais", (campo, limite) => {
    const noLimite = enderecoFormSchema.safeParse({ ...valido, [campo]: "a".repeat(limite) });
    const acima = enderecoFormSchema.safeParse({ ...valido, [campo]: "a".repeat(limite + 1) });

    expect(noLimite.success).toBe(true);
    expect(acima.success).toBe(false);
    expect(acima.error?.issues.map((i) => [i.path[0], i.message])).toEqual([
      [campo, `Use até ${limite} caracteres.`],
    ]);
  });
  it.each(["apelido", "complemento"])("trata %s vazio ou só com espaços como ausente", (campo) => {
    for (const vazio of ["", "   "]) {
      const parsed = enderecoFormSchema.parse({ ...valido, [campo]: vazio });

      expect(parsed[campo as "apelido" | "complemento"]).toBeUndefined();
    }
  });

  it("tira os espaços das pontas dos textos", () => {
    const parsed = enderecoFormSchema.parse({ ...valido, rua: "  Rua A ", apelido: " Casa " });

    expect(parsed.rua).toBe("Rua A");
    expect(parsed.apelido).toBe("Casa");
  });
  it("recusa CEP fora da faixa 57 mesmo com a UF AL", () => {
    const result = enderecoFormSchema.safeParse({ ...valido, cep: "01432-000", uf: "AL" });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((i) => [i.path[0], i.message])).toEqual([
      ["cep", "Por enquanto só entregamos em Alagoas."],
    ]);
  });
});

function omitir(...campos: string[]): Record<string, string> {
  const copia: Record<string, string> = { ...valido };
  for (const campo of campos) delete copia[campo];
  return copia;
}

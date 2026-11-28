import { describe, expect, it } from "vitest";
import { criarCervejaSchema, editarCervejaSchema } from "./cerveja.js";

const VALIDA = {
  nome: "Maré Alta",
  categoriaSlug: "ipa",
  estilo: "American IPA",
  precoCentavos: 3_900,
  volumeMl: 500,
  teorAlcoolico: 6.5,
  ibu: 60,
  estoqueInicial: 24,
  destaque: false,
  ativa: true,
};

const mensagens = (r: { success: boolean; error?: { issues: { message: string }[] } }) =>
  r.error?.issues.map((i) => i.message) ?? [];

describe("criarCervejaSchema", () => {
  it("aceita o cadastro mínimo, com mínimo de estoque 6 e sem descrição", () => {
    expect(criarCervejaSchema.parse(VALIDA)).toMatchObject({
      nome: "Maré Alta",
      estoqueMinimo: 6,
      estoqueInicial: 24,
    });
  });

  it("apara o nome e recusa nome vazio ou com mais de 80 caracteres", () => {
    expect(criarCervejaSchema.parse({ ...VALIDA, nome: "  Maré Alta  " }).nome).toBe("Maré Alta");
    expect(criarCervejaSchema.safeParse({ ...VALIDA, nome: "  " }).success).toBe(false);
    expect(criarCervejaSchema.safeParse({ ...VALIDA, nome: "a".repeat(81) }).success).toBe(false);
  });

  it("recusa estilo com mais de 40 caracteres e descrição com mais de 200", () => {
    expect(criarCervejaSchema.safeParse({ ...VALIDA, estilo: "a".repeat(41) }).success).toBe(false);
    expect(criarCervejaSchema.safeParse({ ...VALIDA, descricao: "a".repeat(201) }).success).toBe(
      false,
    );
    expect(criarCervejaSchema.safeParse({ ...VALIDA, descricao: "a".repeat(200) }).success).toBe(
      true,
    );
  });

  it("o preço deve ser maior que zero e o anterior, maior que o atual", () => {
    expect(criarCervejaSchema.safeParse({ ...VALIDA, precoCentavos: 0 }).success).toBe(false);
    const igual = criarCervejaSchema.safeParse({ ...VALIDA, precoAnteriorCentavos: 3_900 });
    expect(mensagens(igual)).toContain("O preço anterior deve ser maior que o atual");
    expect(criarCervejaSchema.safeParse({ ...VALIDA, precoAnteriorCentavos: 4_500 }).success).toBe(
      true,
    );
  });

  it.each([
    ["volumeMl", 99],
    ["volumeMl", 2_001],
    ["teorAlcoolico", -0.1],
    ["teorAlcoolico", 20.1],
    ["teorAlcoolico", 5.55],
    ["ibu", -1],
    ["ibu", 151],
    ["estoqueInicial", -1],
    ["estoqueMinimo", -1],
  ])("recusa %s = %s", (campo, valor) => {
    expect(criarCervejaSchema.safeParse({ ...VALIDA, [campo]: valor }).success).toBe(false);
  });

  it("aceita os limites: volume 100 e 2000, teor 0 e 20, IBU 0 e 150", () => {
    for (const extra of [
      { volumeMl: 100 },
      { volumeMl: 2_000 },
      { teorAlcoolico: 0 },
      { teorAlcoolico: 20 },
      { ibu: 0 },
      { ibu: 150 },
    ]) {
      expect(criarCervejaSchema.safeParse({ ...VALIDA, ...extra }).success).toBe(true);
    }
  });
});

describe("editarCervejaSchema", () => {
  const SEM_ESTOQUE_INICIAL: Partial<typeof VALIDA> = { ...VALIDA };
  delete SEM_ESTOQUE_INICIAL.estoqueInicial;

  it("não leva estoque inicial: o estoque só muda pela tela de Estoque", () => {
    expect(editarCervejaSchema.safeParse(SEM_ESTOQUE_INICIAL).success).toBe(true);
    expect(editarCervejaSchema.safeParse(VALIDA).success).toBe(false);
  });

  it("não aceita trocar o slug", () => {
    expect(editarCervejaSchema.safeParse({ ...SEM_ESTOQUE_INICIAL, slug: "outro" }).success).toBe(
      false,
    );
  });
});

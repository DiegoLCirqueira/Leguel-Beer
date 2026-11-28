import { describe, expect, it } from "vitest";
import { cervejaDoAdminSchema, consultaDeCervejasDoAdminSchema } from "./cerveja-do-admin.js";

const CERVEJA = {
  id: "1",
  slug: "mare-alta",
  nome: "Maré Alta",
  categoria: { slug: "ipa", nome: "IPA" },
  estilo: "American IPA",
  descricao: null,
  precoCentavos: 3_900,
  precoAnteriorCentavos: null,
  volumeMl: 500,
  teorAlcoolico: 6.5,
  ibu: 60,
  estoqueFisico: 24,
  estoqueMinimo: 6,
  destaque: false,
  ativa: true,
  imagemUrl: null,
  cadastradaEm: "2026-11-27T15:00:00.000Z",
};

describe("cervejaDoAdminSchema", () => {
  it("aceita a cerveja do admin com estoque físico e mínimo", () => {
    expect(cervejaDoAdminSchema.parse(CERVEJA).estoqueMinimo).toBe(6);
  });

  it("recusa a cerveja sem o estado ativa", () => {
    const { ativa: _ativa, ...semAtiva } = CERVEJA;
    void _ativa;
    expect(cervejaDoAdminSchema.safeParse(semAtiva).success).toBe(false);
  });
});

describe("consultaDeCervejasDoAdminSchema", () => {
  it("o estado padrão é 'todas' e estado fora da lista é recusado", () => {
    expect(consultaDeCervejasDoAdminSchema.parse({}).estado).toBe("todas");
    expect(consultaDeCervejasDoAdminSchema.safeParse({ estado: "outra" }).success).toBe(false);
  });
});

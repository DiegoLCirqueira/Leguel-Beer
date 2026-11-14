// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ENTREGAS_ATUALIZADO_EM,
  PRIVACIDADE,
  PRIVACIDADE_ATUALIZADA_EM,
  TERMOS_ATUALIZADO_EM,
} from "./legal";

const arquivoDaApi = resolve(process.cwd(), "../api/src/modules/account/domain/legal-versions.ts");

function versaoNaApi(campo: string): string | undefined {
  const linha = readFileSync(arquivoDaApi, "utf8")
    .split("\n")
    .find((l) => l.trim().startsWith(`${campo}:`));
  return linha?.split('"')[1];
}

describe("versão dos textos legais", () => {
  it("a Política de Privacidade vale desde a Geladeira guardada na conta", () => {
    expect(PRIVACIDADE_ATUALIZADA_EM).toBe("2026-11-11");
  });

  it("os Termos seguem na data da retirada do aviso de portfólio e as Entregas na do frete grátis a partir de R$ 150", () => {
    expect(TERMOS_ATUALIZADO_EM).toBe("2026-10-31");
    expect(ENTREGAS_ATUALIZADO_EM).toBe("2026-11-14");
  });

  it("a API grava como versão do aceite a mesma data que o site mostra em cada página", () => {
    expect(versaoNaApi("termosVersao")).toBe(TERMOS_ATUALIZADO_EM);
    expect(versaoNaApi("privacidadeVersao")).toBe(PRIVACIDADE_ATUALIZADA_EM);
  });

  it("a Política de Privacidade cita a Geladeira em Quais dados coletamos", () => {
    const secao = PRIVACIDADE.find((s) => s.titulo === "Quais dados coletamos.");

    expect(secao?.texto).toContain(
      "Também guardamos as cervejas e as quantidades que você coloca na Geladeira: com a conta, elas ficam salvas na conta, para a Geladeira valer em outros aparelhos, e o navegador guarda uma cópia que é apagada quando você sai da conta; sem conta, ficam só no armazenamento do navegador deste aparelho.",
    );
  });
});

// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ATUALIZADO_EM } from "./legal";

const arquivoDaApi = resolve(process.cwd(), "../api/src/modules/account/domain/legal-versions.ts");

function versaoNaApi(campo: string): string | undefined {
  const linha = readFileSync(arquivoDaApi, "utf8")
    .split("\n")
    .find((l) => l.trim().startsWith(`${campo}:`));
  return linha?.split('"')[1];
}

describe("versão dos textos legais", () => {
  it("a data do site vale desde a retirada do aviso de portfólio dos Termos e de Entregas", () => {
    expect(ATUALIZADO_EM).toBe("2026-10-31");
  });

  it("a API grava como versão do aceite a mesma data que o site mostra", () => {
    expect(versaoNaApi("termosVersao")).toBe(ATUALIZADO_EM);
    expect(versaoNaApi("privacidadeVersao")).toBe(ATUALIZADO_EM);
  });
});

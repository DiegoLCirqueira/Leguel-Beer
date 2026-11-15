// @vitest-environment node
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("fotos das cervejas no site", () => {
  it.each([
    "avermelhou",
    "barra-nova-porter",
    "cajupa-sour",
    "cupuacu-ale",
    "graviola-witbier",
    "jaragua-hazy-ipa",
    "leguele-carnaval",
    "leguele-comendador",
    "leguele-cream-ale",
    "leguele-kolsch",
    "leguele-maceio-ipa",
    "mare-alta",
    "pajucara-amber-ale",
    "ponta-verde-pilsen",
    "rapadura-brown-ale",
    "umbu-gose",
  ])("a foto de %s existe em public/cervejas", (slug) => {
    const file = resolve(
      dirname(fileURLToPath(import.meta.url)),
      "../../public/cervejas",
      `${slug}.webp`,
    );

    expect(existsSync(file), `${slug}.webp`).toBe(true);
    // Arquivo vazio ou truncado não pode passar: cabeçalho RIFF/WEBP e tamanho declarado batendo com o arquivo.
    const bytes = readFileSync(file);
    expect(bytes.subarray(0, 4).toString("ascii"), `${slug}.webp: RIFF`).toBe("RIFF");
    expect(bytes.subarray(8, 12).toString("ascii"), `${slug}.webp: WEBP`).toBe("WEBP");
    expect(bytes.readUInt32LE(4) + 8, `${slug}.webp: tamanho`).toBe(bytes.length);
  });
});

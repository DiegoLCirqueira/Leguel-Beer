import { describe, expect, it } from "vitest";
import {
  caminhoDeEnvioRespostaSchema,
  ehWebp,
  FOTO_TAMANHO_MAXIMO_BYTES,
  publicarFotoSchema,
} from "./foto.js";

const ascii = (texto: string) => [...texto].map((c) => c.charCodeAt(0));

const webp = (extra = 0) => {
  const bytes = new Uint8Array(12 + extra);
  bytes.set(ascii("RIFF"), 0);
  bytes.set(ascii("WEBP"), 8);
  return bytes;
};

describe("ehWebp", () => {
  it("aceita o cabeçalho RIFF....WEBP", () => {
    expect(ehWebp(webp(100))).toBe(true);
  });

  it("recusa PNG, JPEG, arquivo curto e RIFF que não é WebP", () => {
    expect(ehWebp(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0, 0, 0, 0, 0]))).toBe(false);
    expect(ehWebp(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]))).toBe(false);
    expect(ehWebp(new Uint8Array(5))).toBe(false);
    const wave = webp();
    wave.set(ascii("WAVE"), 8);
    expect(ehWebp(wave)).toBe(false);
  });

  it("o teto é de 40 KB", () => {
    expect(FOTO_TAMANHO_MAXIMO_BYTES).toBe(40_960);
  });
});

describe("contrato do envio da foto", () => {
  const CAMINHO = "0b8f3c1e-5a3d-4f6e-9a7b-1c2d3e4f5a6b.webp";

  it("aceita só o caminho que a API gera (UUID.webp)", () => {
    expect(publicarFotoSchema.safeParse({ caminho: CAMINHO }).success).toBe(true);
    for (const ruim of ["../x.webp", "foto.webp", `${CAMINHO}.png`, `pasta/${CAMINHO}`, ""]) {
      expect(publicarFotoSchema.safeParse({ caminho: ruim }).success).toBe(false);
    }
  });

  it("recusa campo a mais na publicação e na resposta do caminho", () => {
    expect(publicarFotoSchema.safeParse({ caminho: CAMINHO, url: "x" }).success).toBe(false);
    expect(
      caminhoDeEnvioRespostaSchema.safeParse({
        caminho: CAMINHO,
        expiraEm: "2026-11-28T15:10:00.000Z",
        extra: 1,
      }).success,
    ).toBe(false);
  });
});

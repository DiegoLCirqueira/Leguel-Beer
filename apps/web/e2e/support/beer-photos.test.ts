// @vitest-environment node
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("fotos das cervejas no site", () => {
  it.each([
    "avermelhou",
    "cajupa-sour",
    "cupuacu-ale",
    "leguele-carnaval",
    "leguele-comendador",
    "leguele-cream-ale",
    "leguele-kolsch",
    "leguele-maceio-ipa",
    "mare-alta",
  ])("a foto de %s existe em public/cervejas", (slug) => {
    const file = resolve(
      dirname(fileURLToPath(import.meta.url)),
      "../../public/cervejas",
      `${slug}.webp`,
    );

    expect(existsSync(file), `${slug}.webp`).toBe(true);
  });
});

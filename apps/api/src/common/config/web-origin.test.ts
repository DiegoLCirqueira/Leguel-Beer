import { describe, expect, it } from "vitest";
import { resolveWebOrigin } from "./web-origin.js";

describe("resolveWebOrigin", () => {
  it("fora de produção usa WEB_ORIGIN se existir e, senão, o padrão local", () => {
    expect(resolveWebOrigin({})).toBe("http://localhost:3000");
    expect(resolveWebOrigin({ WEB_ORIGIN: "http://localhost:3001" })).toBe("http://localhost:3001");
  });

  it("em produção aceita uma única origem https", () => {
    expect(
      resolveWebOrigin({ NODE_ENV: "production", WEB_ORIGIN: "https://leguele-web.vercel.app" }),
    ).toBe("https://leguele-web.vercel.app");
    expect(
      resolveWebOrigin({
        VERCEL_ENV: "preview",
        WEB_ORIGIN: "https://leguele-web-git-x.vercel.app",
      }),
    ).toBe("https://leguele-web-git-x.vercel.app");
  });

  it.each([
    ["ausente", undefined],
    ["vazio", ""],
    ["curinga", "*"],
    ["curinga no subdomínio", "https://*.vercel.app"],
    ["duas origens", "https://a.example,https://b.example"],
    ["http", "http://leguele-web.vercel.app"],
    ["com caminho", "https://leguele-web.vercel.app/app"],
    ["com barra no fim", "https://leguele-web.vercel.app/"],
    ["localhost", "http://localhost:3000"],
  ])("em produção recusa subir com WEB_ORIGIN %s", (_nome, value) => {
    expect(() => resolveWebOrigin({ NODE_ENV: "production", WEB_ORIGIN: value })).toThrow(
      /WEB_ORIGIN/,
    );
  });
});

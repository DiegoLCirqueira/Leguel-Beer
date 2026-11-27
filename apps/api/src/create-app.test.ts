import { describe, expect, it } from "vitest";
import { createApp } from "./create-app.js";

describe("createApp", () => {
  it("em produção sem WEB_ORIGIN recusa subir com um erro claro, antes de criar o aplicativo", async () => {
    await expect(createApp({ NODE_ENV: "production" })).rejects.toThrow(/WEB_ORIGIN/);
  });

  it("na Vercel (VERCEL_ENV) com WEB_ORIGIN http recusa subir", async () => {
    await expect(
      createApp({ VERCEL_ENV: "preview", WEB_ORIGIN: "http://leguele-web.vercel.app" }),
    ).rejects.toThrow(/https/);
  });
});

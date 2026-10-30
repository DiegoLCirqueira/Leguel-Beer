// @vitest-environment node
import { unstable_doesMiddlewareMatch as doesProxyMatch } from "next/experimental/testing/server";
import { describe, expect, it } from "vitest";
import { config } from "./proxy";

const passaPeloProxy = (url: string) => doesProxyMatch({ config, url });

describe("matcher do proxy da maioridade", () => {
  it.each([
    "/",
    "/catalogo",
    "/catalogo?categoria=ipa",
    "/apiario",
    "/produto/v1.0",
    "/boas-vindas",
  ])("pergunta em páginas do site (%s)", (url) => {
    expect(passaPeloProxy(url)).toBe(true);
  });

  it.each([
    "/api/health",
    "/_next/static/chunks/app.js",
    "/_next/image?url=%2Flogo.webp&w=256&q=75",
    "/maioridade/logo.webp",
    "/favicon.ico",
    "/robots.txt",
  ])("deixa de fora a API, o Next e os estáticos (%s)", (url) => {
    expect(passaPeloProxy(url)).toBe(false);
  });
});

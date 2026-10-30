import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = vi.hoisted(() => ({ guest: false, session: false }));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      if (cookieStore.guest && name === "leguele_convidado") return { value: "1" };
      if (cookieStore.session && name === "lb_acesso") return { value: "acesso" };
      return undefined;
    },
  }),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
}));

import Home from "./page";

describe("Home", () => {
  beforeEach(() => {
    cookieStore.guest = false;
    cookieStore.session = false;
  });

  it("sem sessão e sem escolher convidado, leva para a boas-vindas", async () => {
    await expect(Home()).rejects.toThrow("NEXT_REDIRECT:/boas-vindas");
  });

  it("quem continuou como convidado vê a home", async () => {
    cookieStore.guest = true;

    render(await Home());

    expect(screen.getByRole("heading", { level: 1, name: "Leguelé Beer" })).toBeInTheDocument();
  });

  it("quem está com a sessão ativa vê a home direto, sem a boas-vindas", async () => {
    cookieStore.session = true;

    render(await Home());

    expect(screen.getByRole("heading", { level: 1, name: "Leguelé Beer" })).toBeInTheDocument();
  });
});

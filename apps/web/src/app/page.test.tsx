import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = vi.hoisted(() => ({ guest: false }));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      cookieStore.guest && name === "leguele_convidado" ? { value: "1" } : undefined,
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
  });

  it("sem sessão e sem escolher convidado, leva para a boas-vindas", async () => {
    await expect(Home()).rejects.toThrow("NEXT_REDIRECT:/boas-vindas");
  });

  it("quem continuou como convidado vê a home", async () => {
    cookieStore.guest = true;

    render(await Home());

    expect(screen.getByRole("heading", { level: 1, name: "Leguelé Beer" })).toBeInTheDocument();
  });
});

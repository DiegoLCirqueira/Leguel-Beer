import { describe, expect, it } from "vitest";
import { resolveHomeRoute } from "./home-route";

describe("resolveHomeRoute", () => {
  it.each([
    [{ hasSession: false, isGuest: false }, "/boas-vindas"],
    [{ hasSession: false, isGuest: true }, "/"],
    [{ hasSession: true, isGuest: false }, "/"],
    [{ hasSession: true, isGuest: true }, "/"],
  ])("com %j devolve %s", (state, expected) => {
    expect(resolveHomeRoute(state)).toBe(expected);
  });
});

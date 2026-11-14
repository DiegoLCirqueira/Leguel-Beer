import { expect, it } from "vitest";
import { LIMITE_DE_ENDERECOS } from "./limite.js";

it("cada cliente guarda até 5 endereços", () => {
  expect(LIMITE_DE_ENDERECOS).toBe(5);
});

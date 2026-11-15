import { describe, expect, it } from "vitest";
import { CodedHttpError } from "../../../common/errors/coded-http-error.js";
import { toErrorResponse } from "../../../common/errors/error-response.js";
import { AddressConcurrentEditError } from "../domain/address-errors.js";
import { withAddressErrors } from "./address-http-errors.js";

describe("withAddressErrors", () => {
  it("traduz a edição concorrente esgotada em 409 ADDRESS_CONCURRENT_EDIT, com a mensagem do cliente", async () => {
    const error = await withAddressErrors(() =>
      Promise.reject(new AddressConcurrentEditError()),
    ).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(CodedHttpError);
    expect(toErrorResponse(error)).toEqual({
      status: 409,
      body: {
        code: "ADDRESS_CONCURRENT_EDIT",
        message: "O endereço foi alterado por outra requisição. Tente de novo.",
      },
    });
  });
});

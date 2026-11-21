import { UnauthorizedException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import type { AppLogger } from "../../../common/logging/app-logger.js";
import type { ExpireDueOrders } from "../application/expire-due-orders.js";
import { CronController } from "./cron.controller.js";

function controller(secret: string, failures: { orderId: string; error: unknown }[] = []) {
  const calls: number[] = [];
  const errors: { message: string; context: unknown }[] = [];
  const expirer = {
    execute: async () => {
      calls.push(1);
      return { failures };
    },
  } as unknown as ExpireDueOrders;
  const logger = {
    error: (message: string, context: unknown) => errors.push({ message, context }),
    warn: () => undefined,
  } as unknown as AppLogger;
  return { cron: new CronController(expirer, secret, logger), calls, errors };
}

describe("CronController", () => {
  it("sem segredo configurado recusa até o cabeçalho 'Bearer ' vazio e não expira nada", async () => {
    const { cron, calls } = controller("");

    await expect(cron.expire("Bearer ")).rejects.toBeInstanceOf(UnauthorizedException);

    expect(calls).toEqual([]);
  });

  it("loga o id do pedido e o tipo do erro de cada falha, sem a mensagem nem dado do cliente", async () => {
    const failure = Object.assign(new Error("telefone 82999990000 da Ana Souza"), {
      code: "P2034",
    });
    const { cron, errors } = controller("segredo", [{ orderId: "order-2", error: failure }]);

    const result = await cron.expire("Bearer segredo");

    expect(result).toEqual({ falhas: 1 });
    expect(errors).toEqual([
      {
        message: "Falha ao expirar pedido",
        context: { orderId: "order-2", erro: "Error", codigo: "P2034" },
      },
    ]);
  });
});

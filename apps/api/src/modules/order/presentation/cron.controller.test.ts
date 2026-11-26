import { UnauthorizedException } from "@nestjs/common";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AppLogger } from "../../../common/logging/app-logger.js";
import type { ExpireDueOrders } from "../application/expire-due-orders.js";
import { CronController } from "./cron.controller.js";

function controller(secret: string, failures: { orderId: string; error: unknown }[] = []) {
  const calls: number[] = [];
  const errors: { message: string; context: unknown }[] = [];
  const warnings: string[] = [];
  const expirer = {
    execute: async () => {
      calls.push(1);
      return { failures };
    },
  } as unknown as ExpireDueOrders;
  const logger = {
    error: (message: string, context: unknown) => errors.push({ message, context }),
    warn: (message: string) => warnings.push(message),
  } as unknown as AppLogger;
  return { cron: new CronController(expirer, secret, logger), calls, errors, warnings };
}

describe("CronController", () => {
  afterEach(() => vi.unstubAllEnvs());

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

  it("avisa no boot que o cron fica mudo quando o segredo falta em produção", () => {
    vi.stubEnv("NODE_ENV", "production");

    const { warnings } = controller("");

    expect(warnings).toEqual([
      "CRON_SECRET ausente: o cron de expiração recusa todas as chamadas e os pedidos vencidos só expiram na checagem no uso.",
    ]);
  });

  it("avisa quando o segredo tem menos de 32 caracteres e fica quieto com 32 ou mais", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(controller("curto").warnings).toEqual([
      "CRON_SECRET com menos de 32 caracteres: use um segredo aleatório maior.",
    ]);
    expect(controller("x".repeat(32)).warnings).toEqual([]);
  });

  it("fora de produção a falta do segredo não gera aviso", () => {
    vi.stubEnv("NODE_ENV", "development");

    expect(controller("").warnings).toEqual([]);
  });
});

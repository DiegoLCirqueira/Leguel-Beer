import { UnauthorizedException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import type { ExpireDueOrders } from "../application/expire-due-orders.js";
import { CronController } from "./cron.controller.js";

function controller(secret: string) {
  const calls: number[] = [];
  const expirer = {
    execute: async () => {
      calls.push(1);
      return { failures: [] };
    },
  } as unknown as ExpireDueOrders;
  return { cron: new CronController(expirer, secret), calls };
}

describe("CronController", () => {
  it("sem segredo configurado recusa até o cabeçalho 'Bearer ' vazio e não expira nada", async () => {
    const { cron, calls } = controller("");

    await expect(cron.expire("Bearer ")).rejects.toBeInstanceOf(UnauthorizedException);

    expect(calls).toEqual([]);
  });
});

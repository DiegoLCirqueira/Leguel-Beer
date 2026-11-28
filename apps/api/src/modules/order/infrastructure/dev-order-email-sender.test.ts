import { describe, expect, it } from "vitest";
import { DevOrderEmailSender } from "./dev-order-email-sender.js";

describe("DevOrderEmailSender", () => {
  it("não envia: devolve 'skipped' e o log não traz destinatário nem corpo", async () => {
    const logs: { message: string; context: object }[] = [];
    const logger = { info: (message: string, context: object) => logs.push({ message, context }) };
    const sender = new DevOrderEmailSender(logger as never);

    const result = await sender.send({
      to: "ana@exemplo.com",
      subject: "Pedido #LB482731 confirmado",
      text: "Rua do Sol, 100",
      html: "<p>Rua do Sol, 100</p>",
    });

    expect(result).toBe("skipped");
    const logged = JSON.stringify(logs);
    expect(logged).toContain("Pedido #LB482731 confirmado");
    expect(logged).not.toContain("ana@exemplo.com");
    expect(logged).not.toContain("Rua do Sol");
  });
});

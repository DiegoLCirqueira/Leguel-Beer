import { timingSafeEqual } from "node:crypto";
import { Controller, Get, Headers, Inject, UnauthorizedException } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AppLogger } from "../../../common/logging/app-logger.js";
import { Public } from "../../account/presentation/access.decorators.js";
import { ExpireDueOrders } from "../application/expire-due-orders.js";
import { CRON_SECRET } from "../order.tokens.js";

function sameSecret(received: string, expected: string): boolean {
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

@ApiTags("cron")
@Public()
@Controller("cron")
export class CronController {
  constructor(
    private readonly expireDueOrders: ExpireDueOrders,
    @Inject(CRON_SECRET) private readonly secret: string,
    private readonly logger: AppLogger,
  ) {}

  @Get("expirar-pedidos")
  @ApiOperation({
    summary: "Cancela os pedidos aguardando pagamento vencidos (cron diário da plataforma)",
    description:
      "Exige `Authorization: Bearer <CRON_SECRET>`. Sem o segredo configurado, recusa toda chamada. A checagem no uso é a que vale para a validade de 30 minutos; este cron só limpa o que sobrar.",
  })
  async expire(@Headers("authorization") authorization?: string): Promise<{ falhas: number }> {
    // Rota pública (sem JWT): a chave é o segredo; sem segredo configurado, ninguém entra.
    if (!this.secret || !authorization || !sameSecret(authorization, `Bearer ${this.secret}`)) {
      throw new UnauthorizedException();
    }
    const { failures } = await this.expireDueOrders.execute();
    for (const { orderId, error } of failures) {
      // Só o id do pedido e o tipo do erro: a mensagem pode carregar dado do cliente.
      this.logger.error("Falha ao expirar pedido", {
        orderId,
        erro: error instanceof Error ? error.name : typeof error,
        codigo: (error as { code?: unknown } | null)?.code,
      });
    }
    return { falhas: failures.length };
  }
}

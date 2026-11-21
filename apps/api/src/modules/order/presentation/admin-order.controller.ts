import { Controller, HttpCode, Param, Post } from "@nestjs/common";
import {
  ApiConflictResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { z } from "zod";
import { NotFoundError } from "../../../common/errors/not-found-error.js";
import type { AuthorizedUser } from "../../account/application/authorize-request.js";
import { CurrentUser, Roles } from "../../account/presentation/access.decorators.js";
import { ConfirmPayment } from "../application/confirm-payment.js";
import { withOrderErrors } from "./order-http-errors.js";

/** Id fora do formato é tratado como pedido inexistente: a resposta não distingue os dois casos. */
const orderIdSchema = z.uuid();

@ApiTags("admin-pedidos")
@Roles("admin")
@Controller("admin/pedidos")
export class AdminOrderController {
  constructor(private readonly confirmPayment: ConfirmPayment) {}

  @Post(":id/confirmar-pagamento")
  @HttpCode(204)
  @ApiOperation({
    summary: "Confirma o pagamento de um pedido aguardando pagamento",
    description:
      "O pagamento é só visual: o admin confirma, dentro da validade. O pedido fica pago, a reserva vira baixa no estoque físico e sai a baixa da Geladeira, tudo numa transação. Vencido, o pedido expira e a resposta é 409.",
  })
  @ApiNoContentResponse({ description: "Pagamento confirmado." })
  @ApiNotFoundResponse({ description: "Pedido inexistente." })
  @ApiConflictResponse({
    description:
      "O pedido não aguarda pagamento (já pago, cancelado, vencido ou perdido numa corrida).",
  })
  async confirm(@CurrentUser() user: AuthorizedUser, @Param("id") rawId: string): Promise<void> {
    const id = orderIdSchema.safeParse(rawId);
    if (!id.success) throw new NotFoundError();
    await withOrderErrors(() =>
      this.confirmPayment.execute({ orderId: id.data, actorId: user.id }),
    );
  }
}

import { Controller, HttpCode, Param, ParseUUIDPipe, Post } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type { AuthorizedUser } from "../../account/application/authorize-request.js";
import { CurrentUser, Roles } from "../../account/presentation/access.decorators.js";
import { ConfirmPayment } from "../application/confirm-payment.js";
import { withOrderErrors } from "./order-http-errors.js";

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
  @ApiBadRequestResponse({ description: "Id fora do formato." })
  @ApiNotFoundResponse({ description: "Pedido inexistente." })
  @ApiConflictResponse({
    description:
      "O pedido não aguarda pagamento (já pago, cancelado, vencido ou perdido numa corrida).",
  })
  async confirm(
    @CurrentUser() user: AuthorizedUser,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<void> {
    await withOrderErrors(() => this.confirmPayment.execute({ orderId: id, actorId: user.id }));
  }
}

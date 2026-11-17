import { Body, Controller, Headers, HttpCode, Post, UseGuards } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from "@nestjs/swagger";
import {
  chaveDeIdempotenciaSchema,
  criarPedidoRequestSchema,
  pedidoCriadoSchema,
  type PedidoCriado,
} from "@leguele/shared";
import { ValidationError } from "../../../common/errors/validation-error.js";
import {
  AccountRateLimit,
  AccountRateLimitGuard,
} from "../../../common/http/account-rate-limit.guard.js";
import { zodDto } from "../../../common/validation/zod-dto.js";
import type { AuthorizedUser } from "../../account/application/authorize-request.js";
import { Authenticated, CurrentUser } from "../../account/presentation/access.decorators.js";
import { CreateOrder } from "../application/create-order.js";
import { withOrderErrors } from "./order-http-errors.js";

class CriarPedidoDto extends zodDto(criarPedidoRequestSchema) {}

/** Criar pedido gasta estoque e reserva: 10 por conta por minuto. */
const CREATE_LIMIT = { group: "order-create", limit: 10, windowMs: 60_000 };

/** Os pedidos são sempre os do dono do token: a rota não recebe id de cliente. */
@ApiTags("pedidos")
@Authenticated()
@Controller("me/pedidos")
export class OrderController {
  constructor(private readonly createOrder: CreateOrder) {}

  @Post()
  @HttpCode(201)
  @UseGuards(AccountRateLimitGuard)
  @AccountRateLimit(CREATE_LIMIT)
  @ApiOperation({
    summary: "Cria o pedido da Geladeira da conta",
    description:
      "Exige o cabeçalho `Idempotency-Key`. Itens, preços e frete vêm da Geladeira revalidada pela API; o corpo traz só o endereço, a forma de pagamento (Pix, ou cartão com as parcelas) e o total que o cliente viu. A mesma chave com o mesmo corpo repete a resposta; com outro corpo responde 422 `IDEMPOTENCY_KEY_REUSED`.",
  })
  @ApiHeader({ name: "Idempotency-Key", required: true })
  @ApiCreatedResponse({ description: "Pedido criado (formato `pedidoCriadoSchema`)." })
  @ApiBadRequestResponse({ description: "Corpo ou cabeçalho fora do contrato." })
  @ApiConflictResponse({ description: "PENDING_ORDER, TOTAL_CHANGED ou OUT_OF_STOCK." })
  @ApiUnprocessableEntityResponse({
    description:
      "UNDERAGE, BIRTH_DATE_REQUIRED, OUT_OF_DELIVERY_AREA, EMPTY_FRIDGE ou IDEMPOTENCY_KEY_REUSED.",
  })
  async create(
    @CurrentUser() user: AuthorizedUser,
    @Headers("idempotency-key") rawKey: string | undefined,
    @Body() body: CriarPedidoDto,
  ): Promise<PedidoCriado> {
    const key = chaveDeIdempotenciaSchema.safeParse(rawKey);
    if (!key.success) {
      throw new ValidationError([
        {
          field: "Idempotency-Key",
          message: "Informe o cabeçalho Idempotency-Key com 16 a 128 letras, números, _ ou -.",
        },
      ]);
    }
    const result = await withOrderErrors(() =>
      this.createOrder.execute({ ownerId: user.id, key: key.data, request: body }),
    );
    return pedidoCriadoSchema.parse(result.body);
  }
}

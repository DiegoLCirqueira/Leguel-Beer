import { Controller, Get, Param, ParseUUIDPipe, Query } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import {
  consultaDaListaDePedidosSchema,
  listaDePedidosSchema,
  type ListaDePedidos,
} from "@leguele/shared";
import { zodDto } from "../../../common/validation/zod-dto.js";
import type { AuthorizedUser } from "../../account/application/authorize-request.js";
import { Authenticated, CurrentUser } from "../../account/presentation/access.decorators.js";
import { GetMyOrder } from "../application/get-my-order.js";
import { ListMyOrders } from "../application/list-my-orders.js";

class ListaDePedidosQueryDto extends zodDto(consultaDaListaDePedidosSchema) {}

/** Os pedidos são sempre os do dono do token: nenhuma rota recebe id de cliente nem lê pelo número. */
@ApiTags("pedidos")
@Authenticated()
@Controller("me/pedidos")
export class OrderReadController {
  constructor(
    private readonly listMyOrders: ListMyOrders,
    private readonly getMyOrder: GetMyOrder,
  ) {}

  @Get()
  @ApiOperation({
    summary: "Lista os pedidos da conta",
    description:
      "Do mais recente ao mais antigo, 20 por página, com `cursor` opaco (`proximoCursor` da página anterior). O pedido aguardando pagamento com a validade vencida volta como cancelado.",
  })
  @ApiOkResponse({ description: "Página da lista (formato `listaDePedidosSchema`)." })
  async list(
    @CurrentUser() user: AuthorizedUser,
    @Query() query: ListaDePedidosQueryDto,
  ): Promise<ListaDePedidos> {
    const page = await this.listMyOrders.execute({
      ownerId: user.id,
      cursor: query.cursor,
      limit: query.limite,
    });
    return listaDePedidosSchema.parse(page);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Lê um pedido da conta",
    description:
      "Itens e valores da compra, endereço de entrega guardado no pedido e histórico de status do mais antigo ao mais recente, em UTC. Nunca traz o motivo do cancelamento. Pedido de outro cliente e id inexistente respondem o mesmo 404.",
  })
  @ApiOkResponse({ description: "O pedido (formato `pedidoDoClienteSchema`)." })
  @ApiBadRequestResponse({ description: "Id fora do formato." })
  @ApiNotFoundResponse({ description: "Pedido inexistente ou de outro cliente." })
  async get(
    @CurrentUser() user: AuthorizedUser,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<PedidoDoCliente> {
    const order = await this.getMyOrder.execute({ ownerId: user.id, orderId: id });
    return pedidoDoClienteSchema.parse(order);
  }
}

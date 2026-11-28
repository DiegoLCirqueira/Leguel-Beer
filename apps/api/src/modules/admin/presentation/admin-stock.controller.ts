import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from "@nestjs/swagger";
import {
  ajusteDeEstoqueSchema,
  historicoDoEstoqueSchema,
  listaDoEstoqueSchema,
  movimentoDeEstoqueSchema,
  type AjusteDeEstoque,
  type HistoricoDoEstoque,
  type ListaDoEstoque,
  type MovimentoDeEstoque,
} from "@leguele/shared";
import { NotFoundError } from "../../../common/errors/not-found-error.js";
import type { AuthorizedUser } from "../../account/application/authorize-request.js";
import { CurrentUser, Roles } from "../../account/presentation/access.decorators.js";
import { STOCK_REPOSITORY } from "../admin.tokens.js";
import type { StockMovement, StockRepository } from "../domain/stock.js";
import { withStockErrors } from "./admin-stock-http-errors.js";

/** Classe só para o `ZodValidationPipe` global: a união do ajuste não pode ser estendida por `zodDto`. */
class AjusteDto {
  static readonly schema = ajusteDeEstoqueSchema;
}

function toResponse(movement: StockMovement): MovimentoDeEstoque {
  return movimentoDeEstoqueSchema.parse({
    id: movement.id,
    tipo: movement.kind,
    quantidade: movement.quantity,
    motivo: movement.reason,
    saldoFisico: movement.balanceAfter,
    numeroDoPedido: movement.orderNumber,
    criadoEm: movement.createdAt.toISOString(),
  });
}

@ApiTags("admin-estoque")
@Roles("admin")
@Controller("admin/estoque")
export class AdminStockController {
  constructor(@Inject(STOCK_REPOSITORY) private readonly stock: StockRepository) {}

  @Get()
  @ApiOperation({
    summary: "Estoque por cerveja ativa",
    description:
      "Físico, reservado (só reservas válidas), disponível e mínimo; o selo Baixo (disponível igual ou abaixo do mínimo) vem primeiro, depois por nome. É a mesma consulta e a mesma regra do resumo do início.",
  })
  @ApiOkResponse({ description: "Formato `listaDoEstoqueSchema`." })
  async list(): Promise<ListaDoEstoque> {
    const items = await this.stock.list(new Date());
    return listaDoEstoqueSchema.parse({
      itens: items.map((item) => ({
        cervejaId: item.beerId,
        nome: item.name,
        fisico: item.physical,
        reservado: item.reserved,
        disponivel: item.available,
        minimo: item.minimum,
        baixo: item.low,
      })),
    });
  }

  @Get(":cervejaId/movimentos")
  @ApiOperation({ summary: "Histórico de movimentos da cerveja, do mais recente ao mais antigo" })
  @ApiOkResponse({ description: "Formato `historicoDoEstoqueSchema`." })
  @ApiNotFoundResponse({ description: "Cerveja inexistente." })
  async movements(@Param("cervejaId", ParseUUIDPipe) beerId: string): Promise<HistoricoDoEstoque> {
    const movements = await this.stock.movements(beerId);
    if (!movements) throw new NotFoundError();
    return historicoDoEstoqueSchema.parse({ movimentos: movements.map(toResponse) });
  }

  @Post(":cervejaId/ajustes")
  @ApiOperation({
    summary: "Ajusta o estoque físico da cerveja",
    description:
      "Entrada (soma; motivo padrão Produção), perda (subtrai) e correção (soma ou subtrai). Recusa físico negativo e abaixo do reservado (422). Usa a mesma trava por cerveja da criação do pedido.",
  })
  @ApiCreatedResponse({ description: "O movimento gravado (formato `movimentoDeEstoqueSchema`)." })
  @ApiBadRequestResponse({ description: "Corpo ou id fora do contrato." })
  @ApiNotFoundResponse({ description: "Cerveja inexistente." })
  @ApiUnprocessableEntityResponse({ description: "STOCK_NEGATIVE ou STOCK_BELOW_RESERVED." })
  async adjust(
    @CurrentUser() user: AuthorizedUser,
    @Param("cervejaId", ParseUUIDPipe) beerId: string,
    @Body() body: AjusteDto,
  ): Promise<MovimentoDeEstoque> {
    const adjustment = body as unknown as AjusteDeEstoque;
    const movement = await withStockErrors(() =>
      this.stock.adjust(beerId, user.id, adjustment, new Date()),
    );
    if (!movement) throw new NotFoundError();
    return toResponse(movement);
  }
}

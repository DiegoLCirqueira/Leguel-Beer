import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  type SchemaObject,
} from "@nestjs/swagger";
import {
  geladeiraRequestSchema,
  geladeiraResponseSchema,
  type GeladeiraResponse,
} from "@leguele/shared";
import { z } from "zod";
import { zodDto } from "../../../common/validation/zod-dto.js";
import { Public } from "../../account/presentation/access.decorators.js";
import { RevalidateFridge } from "../application/revalidate-fridge.js";
import { toGeladeiraResponse } from "./fridge.mapper.js";

class GeladeiraRequestDto extends zodDto(geladeiraRequestSchema) {}

const jsonSchema = (schema: z.ZodType, io: "input" | "output"): SchemaObject =>
  z.toJSONSchema(schema, { io, unrepresentable: "any" }) as SchemaObject;

@Public()
@ApiTags("geladeira")
@Controller("geladeira")
export class FridgeController {
  constructor(private readonly revalidateFridge: RevalidateFridge) {}

  @Post("validar")
  @HttpCode(200)
  @ApiOperation({
    summary: "Revalida a Geladeira com o preço, o estoque e a situação atuais",
    description:
      "Público (convidado). Não grava nada. Devolve os itens que continuam à venda, na ordem de entrada, com a quantidade reduzida ao disponível e o preço atual, e a lista de ajustes: `preco-mudou`, `indisponivel` (inativa, esgotada ou inexistente, com `nome` nulo quando não existe) e `quantidade-reduzida`. Um id desconhecido nunca é erro: vira `indisponivel`.",
  })
  @ApiBody({ schema: jsonSchema(geladeiraRequestSchema, "input") })
  @ApiOkResponse({ schema: jsonSchema(geladeiraResponseSchema, "output") })
  @ApiBadRequestResponse({ description: "Corpo fora do contrato." })
  async validate(@Body() body: GeladeiraRequestDto): Promise<GeladeiraResponse> {
    const revalidation = await this.revalidateFridge.execute(
      body.itens.map((item) => ({
        beerId: item.cervejaId,
        quantity: item.quantidade,
        seenPriceCents: item.precoVistoCentavos,
      })),
    );
    return toGeladeiraResponse(revalidation);
  }
}

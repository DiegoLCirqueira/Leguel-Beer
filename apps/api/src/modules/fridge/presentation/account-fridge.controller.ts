import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags, type SchemaObject } from "@nestjs/swagger";
import { geladeiraResponseSchema, type GeladeiraResponse } from "@leguele/shared";
import { z } from "zod";
import type { AuthorizedUser } from "../../account/application/authorize-request.js";
import { Authenticated, CurrentUser } from "../../account/presentation/access.decorators.js";
import { GetAccountFridge } from "../application/get-account-fridge.js";
import { toGeladeiraResponse } from "./fridge.mapper.js";

const responseSchema = z.toJSONSchema(geladeiraResponseSchema, {
  io: "output",
  unrepresentable: "any",
}) as SchemaObject;

/** A Geladeira da conta é sempre a do dono do token: as rotas não recebem id de cliente nem de Geladeira. */
@ApiTags("geladeira")
@Authenticated()
@Controller("me/geladeira")
export class AccountFridgeController {
  constructor(private readonly getAccountFridge: GetAccountFridge) {}

  @Get()
  @ApiOperation({
    summary: "Geladeira salva na conta, já revalidada",
    description:
      "Lê a Geladeira do dono do token e a revalida com preço, estoque e situação atuais; os ajustes também são gravados, então o mesmo aviso não se repete. Conta que nunca guardou nada recebe a Geladeira vazia.",
  })
  @ApiOkResponse({ schema: responseSchema })
  async read(@CurrentUser() user: AuthorizedUser): Promise<GeladeiraResponse> {
    return toGeladeiraResponse(await this.getAccountFridge.execute(user.id));
  }
}

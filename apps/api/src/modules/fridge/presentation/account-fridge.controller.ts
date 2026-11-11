import { Body, ConflictException, Controller, Get, Put } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
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
import type { AuthorizedUser } from "../../account/application/authorize-request.js";
import { Authenticated, CurrentUser } from "../../account/presentation/access.decorators.js";
import { zodDto } from "../../../common/validation/zod-dto.js";
import { GetAccountFridge } from "../application/get-account-fridge.js";
import { SaveAccountFridge } from "../application/save-account-fridge.js";
import { FridgeOwnerNotFoundError } from "../domain/account-fridge-repository.js";
import { toEntries } from "./fridge.entries.js";
import { toGeladeiraResponse } from "./fridge.mapper.js";

class GeladeiraRequestDto extends zodDto(geladeiraRequestSchema) {}

const requestSchema = z.toJSONSchema(geladeiraRequestSchema, {
  io: "input",
  unrepresentable: "any",
}) as SchemaObject;

const responseSchema = z.toJSONSchema(geladeiraResponseSchema, {
  io: "output",
  unrepresentable: "any",
}) as SchemaObject;

/** A Geladeira da conta é sempre a do dono do token: as rotas não recebem id de cliente nem de Geladeira. */
@ApiTags("geladeira")
@Authenticated()
@Controller("me/geladeira")
export class AccountFridgeController {
  constructor(
    private readonly getAccountFridge: GetAccountFridge,
    private readonly saveAccountFridge: SaveAccountFridge,
  ) {}

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

  @Put()
  @ApiOperation({
    summary: "Substitui a Geladeira da conta (idempotente)",
    description:
      "Troca a Geladeira inteira do dono do token pelo que foi enviado, já revalidado (preço atual, quantidade ajustada, sem as cervejas que saíram), e devolve o resultado com os ajustes. Repetir o mesmo envio dá o mesmo resultado. Conta sem perfil responde 409.",
  })
  @ApiBody({ schema: requestSchema })
  @ApiOkResponse({ schema: responseSchema })
  @ApiBadRequestResponse({ description: "Corpo fora do contrato." })
  @ApiConflictResponse({ description: "A conta ainda não criou o perfil." })
  async replace(
    @CurrentUser() user: AuthorizedUser,
    @Body() body: GeladeiraRequestDto,
  ): Promise<GeladeiraResponse> {
    try {
      return toGeladeiraResponse(await this.saveAccountFridge.execute(user.id, toEntries(body)));
    } catch (error) {
      if (error instanceof FridgeOwnerNotFoundError) throw new ConflictException();
      throw error;
    }
  }
}

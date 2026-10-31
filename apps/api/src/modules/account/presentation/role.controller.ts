import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags, type SchemaObject } from "@nestjs/swagger";
import { papelResponseSchema, type PapelResponse } from "@leguele/shared";
import { z } from "zod";
import type { AuthorizedUser } from "../application/authorize-request.js";
import { Authenticated, CurrentUser } from "./access.decorators.js";

const responseSchema = z.toJSONSchema(papelResponseSchema, {
  io: "output",
  unrepresentable: "any",
}) as SchemaObject;

@ApiTags("perfil")
@Authenticated()
@Controller("me/role")
export class RoleController {
  /** O papel já foi lido pelo guard (findRole), a mesma fonte da proteção das rotas; não exige perfil completo. */
  @Get()
  @ApiOperation({
    summary: "Papel da conta autenticada",
    description:
      "Responde cliente ou admin sem exigir perfil completo: conta sem perfil é cliente, e o admin do seed já é admin.",
  })
  @ApiOkResponse({ schema: responseSchema })
  read(@CurrentUser() user: AuthorizedUser): PapelResponse {
    return { papel: user.role === "admin" ? "admin" : "cliente" };
  }
}

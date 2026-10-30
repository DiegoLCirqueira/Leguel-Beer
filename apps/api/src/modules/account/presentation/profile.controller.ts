import { Body, Controller, Get, HttpCode, Post, Res } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  type SchemaObject,
} from "@nestjs/swagger";
import {
  criarPerfilRequestSchema,
  perfilResponseSchema,
  type PerfilResponse,
} from "@leguele/shared";
import type { Response } from "express";
import { z } from "zod";
import { zodDto } from "../../../common/validation/zod-dto.js";
import { CreateProfile } from "../application/create-profile.js";
import { GetProfile } from "../application/get-profile.js";
import type { AuthorizedUser } from "../application/authorize-request.js";
import type { Profile } from "../domain/profile.js";
import { Authenticated, CurrentUser } from "./access.decorators.js";

class CriarPerfilDto extends zodDto(criarPerfilRequestSchema) {}

const jsonSchema = (schema: z.ZodType, io: "input" | "output"): SchemaObject =>
  z.toJSONSchema(schema, { io, unrepresentable: "any" }) as SchemaObject;

function toResponse(profile: Profile): PerfilResponse {
  return {
    id: profile.id,
    email: profile.email,
    nome: profile.nome,
    telefone: profile.telefone,
    papel: profile.role === "admin" ? "admin" : "cliente",
    aceite: {
      termosVersao: profile.aceite.termosVersao,
      privacidadeVersao: profile.aceite.privacidadeVersao,
      aceitoEm: profile.aceite.aceitoEm.toISOString(),
    },
  };
}

@ApiTags("perfil")
@Authenticated()
@Controller("me/profile")
export class ProfileController {
  constructor(
    private readonly createProfile: CreateProfile,
    private readonly getProfile: GetProfile,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: "Cria o perfil da conta autenticada (idempotente)",
    description:
      "Id e e-mail vêm do token. Se o perfil já existe, responde 200 com o existente, sem alterar nada.",
  })
  @ApiBody({ schema: jsonSchema(criarPerfilRequestSchema, "input") })
  @ApiCreatedResponse({
    description: "Perfil criado.",
    schema: jsonSchema(perfilResponseSchema, "output"),
  })
  @ApiOkResponse({
    description: "O perfil já existia.",
    schema: jsonSchema(perfilResponseSchema, "output"),
  })
  @ApiBadRequestResponse({ description: "VALIDATION_ERROR, com o campo em details." })
  async create(
    @CurrentUser() user: AuthorizedUser,
    @Body() body: CriarPerfilDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PerfilResponse> {
    const { profile, created } = await this.createProfile.execute({
      user: { id: user.id, email: user.email, emailVerified: user.emailVerified },
      ...body,
    });
    if (!created) res.status(200);
    return toResponse(profile);
  }

  @Get()
  @ApiOperation({ summary: "Perfil da conta autenticada" })
  @ApiOkResponse({ schema: jsonSchema(perfilResponseSchema, "output") })
  @ApiNotFoundResponse({ description: "A conta ainda não criou o perfil." })
  async read(@CurrentUser() user: AuthorizedUser): Promise<PerfilResponse> {
    return toResponse(await this.getProfile.execute(user.id));
  }
}

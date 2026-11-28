import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from "@nestjs/swagger";
import {
  cervejaDoAdminSchema,
  consultaDeCervejasDoAdminSchema,
  criarCervejaSchema,
  editarCervejaSchema,
  listaDeCervejasDoAdminSchema,
  type CervejaDoAdmin,
  type ListaDeCervejasDoAdmin,
} from "@leguele/shared";
import { NotFoundError } from "../../../common/errors/not-found-error.js";
import { zodDto } from "../../../common/validation/zod-dto.js";
import { Roles } from "../../account/presentation/access.decorators.js";
import type { AdminBeer, AdminBeerRepository } from "../domain/admin-beer.js";
import { Inject } from "@nestjs/common";
import { ADMIN_BEER_REPOSITORY } from "../catalog.tokens.js";
import { withAdminBeerErrors } from "./admin-beer-http-errors.js";

class CriarCervejaDto extends zodDto(criarCervejaSchema) {}
class EditarCervejaDto extends zodDto(editarCervejaSchema) {}
class ConsultaDto extends zodDto(consultaDeCervejasDoAdminSchema) {}

function toResponse(beer: AdminBeer): CervejaDoAdmin {
  return cervejaDoAdminSchema.parse({
    id: beer.id,
    slug: beer.slug,
    nome: beer.name,
    categoria: { slug: beer.categorySlug, nome: beer.categoryName },
    estilo: beer.style,
    descricao: beer.description,
    precoCentavos: beer.priceCents,
    precoAnteriorCentavos: beer.previousPriceCents,
    volumeMl: beer.volumeMl,
    teorAlcoolico: beer.abv,
    ibu: beer.ibu,
    estoqueFisico: beer.stock,
    estoqueMinimo: beer.minStock,
    destaque: beer.featured,
    ativa: beer.active,
    imagemUrl: beer.imageUrl,
    cadastradaEm: beer.createdAt.toISOString(),
  });
}

@ApiTags("admin-cervejas")
@Roles("admin")
@Controller("admin/cervejas")
export class AdminBeerController {
  constructor(@Inject(ADMIN_BEER_REPOSITORY) private readonly beers: AdminBeerRepository) {}

  @Get()
  @ApiOperation({ summary: "Lista todas as cervejas, ativas e inativas, com busca e filtro" })
  @ApiOkResponse({ description: "Formato `listaDeCervejasDoAdminSchema`." })
  async list(@Query() query: ConsultaDto): Promise<ListaDeCervejasDoAdmin> {
    const beers = await this.beers.list({ busca: query.busca, estado: query.estado });
    return listaDeCervejasDoAdminSchema.parse({ cervejas: beers.map(toResponse) });
  }

  @Get(":id")
  @ApiOperation({ summary: "Lê uma cerveja pelo id" })
  @ApiOkResponse({ description: "Formato `cervejaDoAdminSchema`." })
  @ApiNotFoundResponse({ description: "Cerveja inexistente." })
  async get(@Param("id", ParseUUIDPipe) id: string): Promise<CervejaDoAdmin> {
    const beer = await this.beers.find(id);
    if (!beer) throw new NotFoundError();
    return toResponse(beer);
  }

  @Post()
  @ApiOperation({
    summary: "Cadastra uma cerveja",
    description:
      "O slug sai do nome e não muda depois. No máximo 4 cervejas ativas por categoria (409 `CATEGORY_FULL`); nome repetido responde 409 `BEER_NAME_TAKEN`.",
  })
  @ApiCreatedResponse({ description: "Formato `cervejaDoAdminSchema`." })
  @ApiBadRequestResponse({ description: "Corpo fora do contrato." })
  @ApiConflictResponse({ description: "CATEGORY_FULL ou BEER_NAME_TAKEN." })
  @ApiUnprocessableEntityResponse({ description: "CATEGORY_NOT_FOUND." })
  async create(@Body() body: CriarCervejaDto): Promise<CervejaDoAdmin> {
    return toResponse(await withAdminBeerErrors(() => this.beers.create(body)));
  }

  @Put(":id")
  @ApiOperation({
    summary: "Edita uma cerveja",
    description:
      "Não muda o slug nem o estoque físico (o estoque muda só pela tela de Estoque); o corpo não leva estoque inicial.",
  })
  @ApiOkResponse({ description: "Formato `cervejaDoAdminSchema`." })
  @ApiBadRequestResponse({ description: "Corpo fora do contrato." })
  @ApiNotFoundResponse({ description: "Cerveja inexistente." })
  @ApiConflictResponse({ description: "CATEGORY_FULL ou BEER_NAME_TAKEN." })
  @ApiUnprocessableEntityResponse({ description: "CATEGORY_NOT_FOUND." })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: EditarCervejaDto,
  ): Promise<CervejaDoAdmin> {
    const beer = await withAdminBeerErrors(() => this.beers.update(id, body));
    if (!beer) throw new NotFoundError();
    return toResponse(beer);
  }
}

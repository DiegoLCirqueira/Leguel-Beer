import { Controller, Get, Param, Query } from "@nestjs/common";
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  type SchemaObject,
} from "@nestjs/swagger";
import {
  catalogoQuerySchema,
  catalogoResponseSchema,
  cervejaDetalheSchema,
  destaquesResponseSchema,
  type CatalogoResponse,
  type CervejaDetalhe,
  type DestaquesResponse,
} from "@leguele/shared";
import { z } from "zod";
import { zodDto } from "../../../common/validation/zod-dto.js";
import { Public } from "../../account/presentation/access.decorators.js";
import { GetBeer } from "../application/get-beer.js";
import { ListBeers } from "../application/list-beers.js";
import { ListFeaturedBeers } from "../application/list-featured-beers.js";
import { toCatalogoResponse, toCervejaDetalhe, toDestaquesResponse } from "./catalog.mapper.js";

class CatalogoQueryDto extends zodDto(catalogoQuerySchema) {}

const responseSchema = z.toJSONSchema(catalogoResponseSchema, {
  io: "output",
  unrepresentable: "any",
}) as SchemaObject;

const destaquesSchema = z.toJSONSchema(destaquesResponseSchema, {
  io: "output",
  unrepresentable: "any",
}) as SchemaObject;

const detalheSchema = z.toJSONSchema(cervejaDetalheSchema, {
  io: "output",
  unrepresentable: "any",
}) as SchemaObject;

@Public()
@ApiTags("catalogo")
@Controller("catalogo")
export class CatalogController {
  constructor(
    private readonly listBeers: ListBeers,
    private readonly listFeaturedBeers: ListFeaturedBeers,
    private readonly getBeer: GetBeer,
  ) {}

  @Get()
  @ApiOperation({
    summary: "Lista as cervejas ativas do catálogo",
    description:
      "Público. Filtros (categoria, teor, ibu, preco, disponiveis) e ordem (relevancia, menor-preco, maior-preco, mais-novas) na query; valor inválido é ignorado. As esgotadas vêm sempre no fim.",
  })
  @ApiOkResponse({ schema: responseSchema })
  async list(@Query() query: CatalogoQueryDto): Promise<CatalogoResponse> {
    return toCatalogoResponse(await this.listBeers.execute(query));
  }

  @Get("destaques")
  @ApiOperation({
    summary: "Cervejas em destaque da home",
    description:
      "Público. Até 6 cervejas ativas marcadas como destaque, pela ordem das categorias e depois pelo nome, com as esgotadas no fim. Sem destaques, `itens` vem vazio (a seção some na home).",
  })
  @ApiOkResponse({ schema: destaquesSchema })
  async featured(): Promise<DestaquesResponse> {
    return toDestaquesResponse(await this.listFeaturedBeers.execute());
  }

  /** Declarada depois de `destaques`: a rota fixa vem antes da parametrizada. */
  @Get(":slug")
  @ApiOperation({
    summary: "Detalhe de uma cerveja",
    description:
      "Público. Ficha da cerveja ativa com descrição, preço anterior e desconto calculado. Slug inexistente ou de cerveja inativa responde 404.",
  })
  @ApiOkResponse({ schema: detalheSchema })
  @ApiNotFoundResponse({ description: "Cerveja inexistente ou inativa." })
  async detail(@Param("slug") slug: string): Promise<CervejaDetalhe> {
    return toCervejaDetalhe(await this.getBeer.execute(slug));
  }
}

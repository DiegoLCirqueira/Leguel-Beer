import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags, type SchemaObject } from "@nestjs/swagger";
import {
  catalogoQuerySchema,
  catalogoResponseSchema,
  destaquesResponseSchema,
  type CatalogoResponse,
  type DestaquesResponse,
} from "@leguele/shared";
import { z } from "zod";
import { zodDto } from "../../../common/validation/zod-dto.js";
import { Public } from "../../account/presentation/access.decorators.js";
import { ListBeers } from "../application/list-beers.js";
import { ListFeaturedBeers } from "../application/list-featured-beers.js";
import { toCatalogoResponse, toDestaquesResponse } from "./catalog.mapper.js";

class CatalogoQueryDto extends zodDto(catalogoQuerySchema) {}

const responseSchema = z.toJSONSchema(catalogoResponseSchema, {
  io: "output",
  unrepresentable: "any",
}) as SchemaObject;

const destaquesSchema = z.toJSONSchema(destaquesResponseSchema, {
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
}

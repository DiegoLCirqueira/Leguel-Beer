import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags, type SchemaObject } from "@nestjs/swagger";
import {
  catalogoQuerySchema,
  catalogoResponseSchema,
  type CatalogoResponse,
} from "@leguele/shared";
import { z } from "zod";
import { zodDto } from "../../../common/validation/zod-dto.js";
import { Public } from "../../account/presentation/access.decorators.js";
import { ListBeers } from "../application/list-beers.js";
import { toCatalogoResponse } from "./catalog.mapper.js";

class CatalogoQueryDto extends zodDto(catalogoQuerySchema) {}

const responseSchema = z.toJSONSchema(catalogoResponseSchema, {
  io: "output",
  unrepresentable: "any",
}) as SchemaObject;

@Public()
@ApiTags("catalogo")
@Controller("catalogo")
export class CatalogController {
  constructor(private readonly listBeers: ListBeers) {}

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
}

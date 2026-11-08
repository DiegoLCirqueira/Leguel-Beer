import { Controller, Get } from "@nestjs/common";
import type { CatalogoResponse } from "@leguele/shared";
import { Public } from "../../account/presentation/access.decorators.js";

@Public()
@Controller("catalogo")
export class CatalogController {
  @Get()
  list(): CatalogoResponse {
    return { itens: [], total: 0, categorias: [] };
  }
}

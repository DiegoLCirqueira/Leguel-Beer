import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { resumoDoAdminSchema, type ResumoDoAdmin } from "@leguele/shared";
import { Roles } from "../../account/presentation/access.decorators.js";
import { GetAdminSummary } from "../application/get-admin-summary.js";

@ApiTags("admin")
@Roles("admin")
@Controller("admin/resumo")
export class AdminSummaryController {
  constructor(private readonly summary: GetAdminSummary) {}

  @Get()
  @ApiOperation({
    summary: "Alertas do início do admin",
    description:
      "Cervejas ativas com estoque baixo (disponível igual ou abaixo do mínimo) e pedidos pagos aguardando preparo.",
  })
  @ApiOkResponse({ description: "Formato `resumoDoAdminSchema`." })
  async get(): Promise<ResumoDoAdmin> {
    return resumoDoAdminSchema.parse(await this.summary.execute());
  }
}

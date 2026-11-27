import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "../../account/presentation/access.decorators.js";

@Public()
@ApiTags("health")
@Controller("live")
export class LiveController {
  @Get()
  @ApiOperation({ summary: "A função está de pé (sem consultar o banco)" })
  live(): { status: "ok" } {
    return { status: "ok" };
  }
}

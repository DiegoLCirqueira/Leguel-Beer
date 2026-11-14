import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { listaDeEnderecosSchema, type EnderecoResposta } from "@leguele/shared";
import type { AuthorizedUser } from "../../account/application/authorize-request.js";
import { Authenticated, CurrentUser } from "../../account/presentation/access.decorators.js";
import { ListAddresses } from "../application/list-addresses.js";
import { withAddressErrors } from "./address-http-errors.js";
import { toEnderecoResposta } from "./address.mapper.js";

/** Os endereços são sempre os do dono do token: as rotas não recebem id de cliente. */
@ApiTags("endereços")
@Authenticated()
@Controller("me/enderecos")
export class AddressController {
  constructor(private readonly listAddresses: ListAddresses) {}

  @Get()
  @ApiOperation({
    summary: "Endereços do cliente",
    description:
      "Lista os endereços do dono do token, do mais antigo para o mais recente, com as marcas de padrão e de fora da área.",
  })
  @ApiOkResponse({ description: "Lista de endereços (formato `listaDeEnderecosSchema`)." })
  async list(@CurrentUser() user: AuthorizedUser): Promise<EnderecoResposta[]> {
    const items = await withAddressErrors(() => this.listAddresses.execute(user.id));
    return listaDeEnderecosSchema.parse(items.map(toEnderecoResposta));
  }
}

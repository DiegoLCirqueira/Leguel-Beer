import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  enderecoFormSchema,
  enderecoRespostaSchema,
  listaDeEnderecosSchema,
  type EnderecoResposta,
} from "@leguele/shared";
import type { AuthorizedUser } from "../../account/application/authorize-request.js";
import { Authenticated, CurrentUser } from "../../account/presentation/access.decorators.js";
import { zodDto } from "../../../common/validation/zod-dto.js";
import { AddAddress } from "../application/add-address.js";
import { ListAddresses } from "../application/list-addresses.js";
import { withAddressErrors } from "./address-http-errors.js";
import { toAddressInput, toEnderecoResposta } from "./address.mapper.js";

class EnderecoFormDto extends zodDto(enderecoFormSchema) {}

/** Os endereços são sempre os do dono do token: as rotas não recebem id de cliente. */
@ApiTags("endereços")
@Authenticated()
@Controller("me/enderecos")
export class AddressController {
  constructor(
    private readonly listAddresses: ListAddresses,
    private readonly addAddress: AddAddress,
  ) {}

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

  @Post()
  @ApiOperation({
    summary: "Salva um endereço",
    description:
      "Calcula as coordenadas e a distância de rota na API; o corpo nunca leva coordenadas. O primeiro endereço vira o padrão. Até 5 por cliente.",
  })
  @ApiCreatedResponse({ description: "Endereço salvo (formato `enderecoRespostaSchema`)." })
  async create(
    @CurrentUser() user: AuthorizedUser,
    @Body() body: EnderecoFormDto,
  ): Promise<EnderecoResposta> {
    const created = await withAddressErrors(() =>
      this.addAddress.execute(user.id, toAddressInput(body)),
    );
    return enderecoRespostaSchema.parse(toEnderecoResposta(created));
  }
}

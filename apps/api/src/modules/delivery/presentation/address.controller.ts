import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
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
import { DeleteAddress } from "../application/delete-address.js";
import { UpdateAddress } from "../application/update-address.js";
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
    private readonly updateAddress: UpdateAddress,
    private readonly deleteAddress: DeleteAddress,
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

  @Put(":id")
  @ApiOperation({
    summary: "Edita um endereço",
    description:
      "Troca os dados do endereço do cliente. Mudar rua, número, bairro, cidade ou CEP recalcula coordenadas e distância; só apelido ou complemento não chama os mapas. Endereço de outro cliente responde 404.",
  })
  @ApiOkResponse({ description: "Endereço editado (formato `enderecoRespostaSchema`)." })
  async update(
    @CurrentUser() user: AuthorizedUser,
    @Param("id") id: string,
    @Body() body: EnderecoFormDto,
  ): Promise<EnderecoResposta> {
    const updated = await withAddressErrors(() =>
      this.updateAddress.execute(user.id, id, toAddressInput(body)),
    );
    return enderecoRespostaSchema.parse(toEnderecoResposta(updated));
  }

  @Delete(":id")
  @HttpCode(204)
  @ApiOperation({
    summary: "Exclui um endereço",
    description:
      "Excluir o padrão torna padrão o endereço salvo mais recentemente. Endereço de outro cliente responde 404.",
  })
  @ApiNoContentResponse({ description: "Endereço excluído." })
  async remove(@CurrentUser() user: AuthorizedUser, @Param("id") id: string): Promise<void> {
    await withAddressErrors(() => this.deleteAddress.execute(user.id, id));
  }
}

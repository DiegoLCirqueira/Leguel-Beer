import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import {
  cotacaoDeFreteSchema,
  enderecoFormSchema,
  enderecoRespostaSchema,
  listaDeEnderecosSchema,
  type CotacaoDeFrete,
  type EnderecoResposta,
} from "@leguele/shared";
import type { AuthorizedUser } from "../../account/application/authorize-request.js";
import { Authenticated, CurrentUser } from "../../account/presentation/access.decorators.js";
import {
  AccountRateLimit,
  AccountRateLimitGuard,
} from "../../../common/http/account-rate-limit.guard.js";
import { zodDto } from "../../../common/validation/zod-dto.js";
import { AddAddress } from "../application/add-address.js";
import { DeleteAddress } from "../application/delete-address.js";
import { QuoteShipping } from "../application/quote-shipping.js";
import { SetDefaultAddress } from "../application/set-default-address.js";
import { UpdateAddress } from "../application/update-address.js";
import { ListAddresses } from "../application/list-addresses.js";
import { withAddressErrors } from "./address-http-errors.js";
import { toAddressInput, toEnderecoResposta } from "./address.mapper.js";

/**
 * Salvar e editar gastam a cota do serviço de geocodificação e rota: 10 gravações por conta por
 * minuto, as duas rotas na mesma cota. Folgado para quem corrige o formulário várias vezes (5
 * endereços de no máximo algumas tentativas cada) e curto para quem tenta esgotar a cota.
 */
const WRITE_LIMIT = { group: "address-write", limit: 10, windowMs: 60_000 };

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
    private readonly setDefaultAddress: SetDefaultAddress,
    private readonly quoteShipping: QuoteShipping,
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
  @UseGuards(AccountRateLimitGuard)
  @AccountRateLimit(WRITE_LIMIT)
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

  @Get(":id/frete")
  @ApiOperation({
    summary: "Cota o frete de um endereço",
    description:
      "Recebe só o id do endereço do cliente. O subtotal vem da Geladeira da conta, revalidada pela API; qualquer valor enviado na consulta é ignorado. Devolve o frete e se é grátis, ou só a marca de fora da área. Endereço de outro cliente responde 404.",
  })
  @ApiOkResponse({ description: "Cotação (formato `cotacaoDeFreteSchema`)." })
  async quote(
    @CurrentUser() user: AuthorizedUser,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<CotacaoDeFrete> {
    const quote = await withAddressErrors(() => this.quoteShipping.execute(user.id, id));
    return cotacaoDeFreteSchema.parse(quote);
  }

  @Put(":id")
  @UseGuards(AccountRateLimitGuard)
  @AccountRateLimit(WRITE_LIMIT)
  @ApiOperation({
    summary: "Edita um endereço",
    description:
      "Troca os dados do endereço do cliente. Mudar rua, número, bairro, cidade ou CEP recalcula coordenadas e distância; só apelido ou complemento não chama os mapas. Endereço de outro cliente responde 404.",
  })
  @ApiOkResponse({ description: "Endereço editado (formato `enderecoRespostaSchema`)." })
  async update(
    @CurrentUser() user: AuthorizedUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: EnderecoFormDto,
  ): Promise<EnderecoResposta> {
    const updated = await withAddressErrors(() =>
      this.updateAddress.execute(user.id, id, toAddressInput(body)),
    );
    return enderecoRespostaSchema.parse(toEnderecoResposta(updated));
  }

  @Post(":id/padrao")
  @HttpCode(204)
  @ApiOperation({
    summary: "Torna um endereço o padrão",
    description:
      "Só o escolhido fica com o selo de padrão. Endereço de outro cliente responde 404.",
  })
  @ApiNoContentResponse({ description: "Endereço padrão trocado." })
  async makeDefault(
    @CurrentUser() user: AuthorizedUser,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<void> {
    await withAddressErrors(() => this.setDefaultAddress.execute(user.id, id));
  }

  @Delete(":id")
  @HttpCode(204)
  @ApiOperation({
    summary: "Exclui um endereço",
    description:
      "Excluir o padrão torna padrão o endereço salvo mais recentemente. Endereço de outro cliente responde 404.",
  })
  @ApiNoContentResponse({ description: "Endereço excluído." })
  async remove(
    @CurrentUser() user: AuthorizedUser,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<void> {
    await withAddressErrors(() => this.deleteAddress.execute(user.id, id));
  }
}

import type { EnderecoResposta } from "@leguele/shared";
import type { AddressListItem } from "../application/list-addresses.js";

/** Do domínio para o contrato do site: sem coordenadas, sem distância e sem dono. */
export function toEnderecoResposta(item: AddressListItem): EnderecoResposta {
  return {
    id: item.id,
    ...(item.nickname !== undefined && { apelido: item.nickname }),
    cep: item.zip,
    rua: item.street,
    numero: item.number,
    ...(item.complement !== undefined && { complemento: item.complement }),
    bairro: item.district,
    cidade: item.city,
    uf: item.state,
    padrao: item.isDefault,
    foraDaArea: item.outsideArea,
  };
}

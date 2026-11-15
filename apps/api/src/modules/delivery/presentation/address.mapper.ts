import type { EnderecoForm, EnderecoResposta } from "@leguele/shared";
import type { AddressInput } from "../domain/address.js";
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

/** Do formulário validado do site para o domínio. */
export function toAddressInput(form: EnderecoForm): AddressInput {
  return {
    nickname: form.apelido,
    zip: form.cep,
    street: form.rua,
    number: form.numero,
    complement: form.complemento,
    district: form.bairro,
    city: form.cidade,
    state: form.uf,
  };
}

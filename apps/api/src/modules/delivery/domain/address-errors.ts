import { LIMITE_DE_ENDERECOS } from "@leguele/shared";

/** O cliente já guarda o máximo de endereços. */
export class AddressLimitReachedError extends Error {
  constructor() {
    super(`Você pode guardar até ${LIMITE_DE_ENDERECOS} endereços.`);
    this.name = "AddressLimitReachedError";
  }
}

/** O serviço de mapas funcionou, mas não achou o endereço. */
export class AddressNotLocatedError extends Error {
  constructor() {
    super("Não encontramos este endereço. Confira a rua, o número e o CEP.");
    this.name = "AddressNotLocatedError";
  }
}

/** O endereço mudou de lugar enquanto era editado e as tentativas de reler acabaram. */
export class AddressConcurrentEditError extends Error {
  constructor() {
    super("O endereço foi alterado por outra requisição. Tente de novo.");
    this.name = "AddressConcurrentEditError";
  }
}

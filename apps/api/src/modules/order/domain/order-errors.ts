import type { AjusteDaGeladeira } from "@leguele/shared";

/** Erros de negócio da criação do pedido; a camada HTTP os traduz para os códigos do contrato. */
export class UnderageError extends Error {
  constructor() {
    super("Venda proibida para menores de 18 anos.");
    this.name = "UnderageError";
  }
}

export class BirthDateRequiredError extends Error {
  constructor() {
    super("Informe sua data de nascimento para finalizar a compra.");
    this.name = "BirthDateRequiredError";
  }
}

/** O cliente já tem um pedido aguardando pagamento dentro da validade. */
export class PendingOrderError extends Error {
  constructor(readonly orderId: string) {
    super("Você já tem um pedido aguardando pagamento.");
    this.name = "PendingOrderError";
  }
}

export class OutOfDeliveryAreaError extends Error {
  constructor() {
    super("Ainda não entregamos neste endereço.");
    this.name = "OutOfDeliveryAreaError";
  }
}

export class EmptyFridgeError extends Error {
  constructor() {
    super("A Geladeira está vazia.");
    this.name = "EmptyFridgeError";
  }
}

/** O total mudou desde que o cliente o viu: nada é criado. */
export class TotalChangedError extends Error {
  constructor(
    readonly adjustments: readonly AjusteDaGeladeira[],
    readonly currentTotalCents: number,
  ) {
    super("O total do pedido mudou.");
    this.name = "TotalChangedError";
  }
}

export class OutOfStockError extends Error {
  constructor(
    readonly beers: readonly { beerId: string; name: string }[],
    readonly adjustments: readonly AjusteDaGeladeira[],
  ) {
    super("Algumas cervejas não têm mais a quantidade pedida.");
    this.name = "OutOfStockError";
  }
}

/** A mesma chave de idempotência já criou um pedido com outro corpo. */
export class IdempotencyKeyReusedError extends Error {
  constructor() {
    super("Esta chave de idempotência já foi usada com outro pedido.");
    this.name = "IdempotencyKeyReusedError";
  }
}

/** O pedido não pode ter o pagamento confirmado: já mudou de status, venceu ou foi perdido numa corrida. */
export class PaymentNotConfirmableError extends Error {
  constructor() {
    super("Este pedido não está mais aguardando pagamento.");
    this.name = "PaymentNotConfirmableError";
  }
}

/** A validade do pedido já passou: ao tentar confirmar o pagamento, o pedido é expirado. */
export class OrderExpiredError extends Error {
  constructor() {
    super("O prazo de pagamento deste pedido terminou e ele foi cancelado.");
    this.name = "OrderExpiredError";
  }
}

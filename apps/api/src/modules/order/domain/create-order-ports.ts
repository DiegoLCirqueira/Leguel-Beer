import type { AjusteDaGeladeira, CotacaoDeFrete, PedidoCriado } from "@leguele/shared";

/** Dados do cliente que o pedido usa: maioridade e a cópia de nome e telefone. */
export interface OrderCustomer {
  nome: string;
  telefone: string;
  /** "AAAA-MM-DD", ou null enquanto o cliente não informou. */
  dataNascimento: string | null;
}

export interface CustomerSource {
  /** O perfil completo da conta, ou null se ela ainda não o criou. */
  find(ownerId: string): Promise<OrderCustomer | null>;
}

/** Cópia do endereço no momento da compra. */
export interface ShipTo {
  zip: string;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
}

export interface ShippingQuoter {
  /**
   * Cota o frete do endereço do cliente para o subtotal dado. Endereço que não é do cliente lança
   * `NotFoundError`. Sem rota, `quote.naArea` é falso.
   */
  quote(
    ownerId: string,
    addressId: string,
    subtotalCents: number,
  ): Promise<{ shipTo: ShipTo; quote: CotacaoDeFrete }>;
}

export interface FridgeLine {
  beerId: string;
  name: string;
  priceCents: number;
  quantity: number;
}

export interface FridgeSource {
  /** A Geladeira da conta revalidada com preço, estoque e situação atuais; grava os ajustes nela. */
  revalidated(ownerId: string): Promise<{ lines: FridgeLine[]; adjustments: AjusteDaGeladeira[] }>;
}

/** Forma de pagamento como o pedido a guarda: só o tipo e as parcelas (pagamento simulado, ADR-018). */
export type PaymentRecord = { tipo: "pix" } | { tipo: "cartao"; parcelas: number };

export interface NewOrder {
  id: string;
  number: string;
  ownerId: string;
  createdAt: Date;
  expiresAt: Date;
  payment: PaymentRecord;
  customer: { nome: string; telefone: string };
  shipTo: ShipTo;
  lines: FridgeLine[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
}

export interface StoredResponse {
  requestHash: string;
  body: PedidoCriado;
}

/**
 * O que roda dentro da transação serializada por cliente. Tudo o que o pedido grava (pedido,
 * itens, reservas, baixas pendentes, histórico e chave de idempotência) entra junto, ou nada entra.
 */
export interface CreateOrderUnit {
  /** A resposta guardada para a chave do cliente, se ainda vale (24 h) em `at`. */
  findStoredResponse(key: string, at: Date): Promise<StoredResponse | null>;
  /** O pedido aguardando pagamento do cliente ainda dentro da validade em `at`, se houver. */
  findPendingOrderId(at: Date): Promise<string | null>;
  /**
   * Trava as cervejas em ordem fixa (pelo id) e devolve a quantidade disponível de cada uma em
   * `at`: estoque físico menos as reservas válidas.
   */
  lockAvailability(beerIds: readonly string[], at: Date): Promise<Map<string, number>>;
  /** Grava o pedido e tudo o que vai com ele, com a chave e a resposta. */
  insert(
    order: NewOrder,
    idempotency: { key: string; hash: string; response: PedidoCriado },
  ): Promise<void>;
}

export interface OrderCreation {
  /** Serializa as criações do mesmo cliente e faz tudo ou nada: se `work` lançar, nada é gravado. */
  run<T>(ownerId: string, work: (unit: CreateOrderUnit) => Promise<T>): Promise<T>;
}

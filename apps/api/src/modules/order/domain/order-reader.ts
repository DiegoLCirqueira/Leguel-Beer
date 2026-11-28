import type { StatusDoPedido } from "@leguele/shared";

/** Posição na lista "Meus pedidos": do mais recente ao mais antigo, desempatando pelo id. */
export interface OrderCursor {
  createdAt: Date;
  id: string;
}

/** O que um card de "Meus pedidos" mostra. */
export interface OrderListRow {
  id: string;
  number: string;
  status: StatusDoPedido;
  createdAt: Date;
  itemCount: number;
  beerNames: string[];
  totalCents: number;
}

export interface OrderDetailRow {
  id: string;
  number: string;
  status: StatusDoPedido;
  createdAt: Date;
  expiresAt: Date;
  payment: { tipo: "pix" } | { tipo: "cartao"; parcelas: number };
  items: { beerId: string; name: string; priceCents: number; quantity: number }[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  shipTo: {
    zip: string;
    street: string;
    number: string;
    complement: string | null;
    district: string;
    city: string;
    state: string;
  };
  /** Do mais antigo ao mais recente. */
  history: { status: StatusDoPedido; at: Date }[];
}

/** Leitura dos pedidos de um cliente: nunca devolve pedido de outro. */
export interface OrderReader {
  /** Até `limit` pedidos do cliente, do mais recente ao mais antigo, depois do cursor. */
  listOwned(
    ownerId: string,
    page: { after: OrderCursor | null; limit: number },
  ): Promise<OrderListRow[]>;

  /** Um pedido do cliente; `null` se não existe ou é de outro. */
  findOwned(ownerId: string, orderId: string): Promise<OrderDetailRow | null>;

  /** Ids dos pedidos do cliente aguardando pagamento cuja validade já passou em `at`. */
  findDueOwnedIds(ownerId: string, at: Date): Promise<string[]>;
}

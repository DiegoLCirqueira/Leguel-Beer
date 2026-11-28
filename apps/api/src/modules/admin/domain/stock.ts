import type { AjusteDeEstoque, StatusDoPedido } from "@leguele/shared";

export interface StockItem {
  beerId: string;
  name: string;
  physical: number;
  reserved: number;
  available: number;
  minimum: number;
  low: boolean;
}

export type StockMovementKind = "entrada" | "perda" | "correcao" | "venda" | "cancelamento";

export interface StockMovement {
  id: string;
  kind: StockMovementKind;
  quantity: number;
  reason: string | null;
  balanceAfter: number;
  orderNumber: string | null;
  createdAt: Date;
}

/** O ajuste levaria o físico a menos que zero. */
export class StockNegativeError extends Error {
  constructor() {
    super("O estoque físico não pode ficar negativo.");
    this.name = "StockNegativeError";
  }
}

/** O ajuste levaria o físico abaixo do que está reservado por pedidos aguardando pagamento. */
export class StockBelowReservedError extends Error {
  constructor(readonly reserved: number) {
    super(`O estoque físico não pode ficar abaixo das ${reserved} unidades reservadas.`);
    this.name = "StockBelowReservedError";
  }
}

export type { StatusDoPedido };

export interface StockRepository {
  /** Cervejas ativas com físico, reservado (só reservas válidas em `at`) e o selo Baixo; Baixo primeiro, depois por nome. */
  list(at: Date): Promise<StockItem[]>;
  /** Histórico do mais recente ao mais antigo; `null` se a cerveja não existe. */
  movements(beerId: string): Promise<StockMovement[] | null>;
  /**
   * Aplica o ajuste sob a trava da cerveja (a mesma da criação do pedido) e grava o movimento.
   * `null` se a cerveja não existe; lança `StockNegativeError` ou `StockBelowReservedError`.
   */
  adjust(
    beerId: string,
    actorId: string,
    adjustment: AjusteDeEstoque,
    at: Date,
  ): Promise<StockMovement | null>;
}

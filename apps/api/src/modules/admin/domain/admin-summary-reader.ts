export interface AdminSummary {
  /** Cervejas ativas com o disponível (físico menos reservas válidas) igual ou abaixo do mínimo. */
  lowStockBeers: number;
  /** Pedidos "Pago", ainda sem preparo iniciado. */
  paidOrdersAwaitingPreparation: number;
}

export interface AdminSummaryReader {
  read(at: Date): Promise<AdminSummary>;
}

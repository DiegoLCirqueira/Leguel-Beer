/** Aplica a aprovação de um pagamento ao pedido (baixa de estoque e Geladeira). Implementada no LB-59. */
export interface ApprovalApplier {
  apply(orderId: string, approvedAt: Date): Promise<void>;
}

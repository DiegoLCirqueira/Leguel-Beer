/**
 * Subtotal da Geladeira da conta, calculado pelo servidor a partir dos preços e das quantidades
 * atuais (a Geladeira revalidada). Nunca vem do corpo de uma requisição.
 */
export interface FridgeSubtotalProvider {
  subtotalCents(ownerId: string): Promise<number>;
}

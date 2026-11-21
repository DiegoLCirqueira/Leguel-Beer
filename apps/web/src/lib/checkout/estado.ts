export const CHAVE_DO_CHECKOUT = "lb:checkout";
const EVENTO_DO_CHECKOUT = "lb:checkout-mudou";

/** Para `useSyncExternalStore`: o texto guardado (estável entre leituras) e o aviso de que mudou. */
export const estadoDoCheckoutBruto = () => {
  try {
    return sessionStorage.getItem(CHAVE_DO_CHECKOUT);
  } catch {
    return null;
  }
};
export const assinarEstadoDoCheckout = (aviso: () => void) => {
  window.addEventListener(EVENTO_DO_CHECKOUT, aviso);
  return () => window.removeEventListener(EVENTO_DO_CHECKOUT, aviso);
};

/** Só a escolha: o cartão (campos e parcelas) entra com as telas de pagamento e nunca é guardado aqui. */
export type EstadoDoCheckout = {
  enderecoId?: string;
  pagamento?: { tipo: "pix" };
};
export type EtapaDoCheckout = "entrega" | "pagamento" | "revisao";

/** A etapa em que o cliente deve estar: não dá para pular etapas pela URL. */
export function primeiraEtapaPendente(estado: EstadoDoCheckout): EtapaDoCheckout {
  if (!estado.enderecoId) return "entrega";
  if (!estado.pagamento) return "pagamento";
  return "revisao";
}

/** Lê da aba (sessionStorage); vazio ou inválido vira estado vazio. Nunca lança. */
export function lerEstadoDoCheckout(): EstadoDoCheckout {
  try {
    const bruto = sessionStorage.getItem(CHAVE_DO_CHECKOUT);
    if (!bruto) return {};
    const lido: unknown = JSON.parse(bruto);
    if (typeof lido !== "object" || lido === null) return {};
    const { enderecoId, pagamento } = lido as Record<string, unknown>;
    if (enderecoId !== undefined && (typeof enderecoId !== "string" || enderecoId === "")) {
      return {};
    }
    const tipo = (pagamento as { tipo?: unknown } | undefined)?.tipo;
    if (pagamento !== undefined && tipo !== "pix") return {};
    return {
      ...(enderecoId ? { enderecoId } : {}),
      ...(pagamento ? { pagamento: { tipo: "pix" as const } } : {}),
    };
  } catch {
    return {};
  }
}

/** Grava só os campos conhecidos (qualquer outro, como dado de cartão, é descartado). Nunca lança. */
export function gravarEstadoDoCheckout(estado: EstadoDoCheckout): void {
  try {
    const limpo: EstadoDoCheckout = {
      ...(estado.enderecoId ? { enderecoId: estado.enderecoId } : {}),
      ...(estado.pagamento ? { pagamento: { tipo: estado.pagamento.tipo } } : {}),
    };
    sessionStorage.setItem(CHAVE_DO_CHECKOUT, JSON.stringify(limpo));
    window.dispatchEvent(new Event(EVENTO_DO_CHECKOUT));
  } catch {
    // Aba sem armazenamento: o checkout segue, só não lembra ao recarregar.
  }
}

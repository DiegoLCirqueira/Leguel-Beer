const ETAPAS = ["Entrega", "Pagamento", "Revisão"];

/** Indicador "1. Entrega — 2. Pagamento — 3. Revisão" do checkout; `atual` é o índice da etapa aberta. */
export function EtapasDoCheckout({ atual }: { atual: 0 | 1 | 2 }) {
  return (
    <ol aria-label="Etapas do pedido" className="flex gap-2 text-sm">
      {ETAPAS.map((etapa, i) => (
        <li
          key={etapa}
          aria-current={i === atual ? "step" : undefined}
          className={i === atual ? "font-semibold text-primaria" : "text-texto-suave"}
        >
          {i + 1}. {etapa}
        </li>
      ))}
    </ol>
  );
}

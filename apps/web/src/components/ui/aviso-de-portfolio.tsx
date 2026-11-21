/** Aviso de projeto sem fins lucrativos (ADR-020): em destaque no alto de toda tela de pagamento, sem fechar. */
export function AvisoDePortfolio() {
  return (
    <p
      role="note"
      className="rounded-xl border border-primaria/60 bg-superficie px-3 py-2 text-sm font-semibold text-texto"
    >
      Este é um projeto sem fins lucrativos, feito para portfólio. Nenhum pagamento é real e nada é
      cobrado.
    </p>
  );
}

/** Divisor "—— ou ——" das telas de acesso: linha, o texto "ou" e outra linha. */
export function DivisorOu() {
  return (
    <div className="flex items-center gap-3 text-xs text-texto/80">
      <span aria-hidden="true" className="h-px flex-1 bg-arte-linha/60" />
      <p>ou</p>
      <span aria-hidden="true" className="h-px flex-1 bg-arte-linha/60" />
    </div>
  );
}

import type { CSSProperties, ReactNode } from "react";
import { ProdutoHeaderComContador } from "@/components/geladeira/cabecalhos-com-contador";
import { ALTURA_BARRA_FIXA_PX } from "@/components/ui";

// A barra fixa do botão publica a própria altura: o toast flutua acima dela e a página reserva o espaço.
const ESTILO = { "--altura-barra-loja": `${ALTURA_BARRA_FIXA_PX}px` } as CSSProperties;

/** Layout da página de produto: sem a barra inferior da loja (o botão fixo ocupa o lugar dela). */
export default function ProdutoLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={ESTILO}
      className="flex min-h-dvh flex-col pb-[calc(var(--altura-barra-loja)+env(safe-area-inset-bottom,0px))]"
    >
      <ProdutoHeaderComContador />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}

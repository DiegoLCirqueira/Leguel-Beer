import type { CSSProperties, ReactNode } from "react";
import { ALTURA_BARRA_FIXA_PX, ProdutoHeader } from "@/components/ui";

// O contador mostra 0 até a Geladeira persistida existir (LB-47).
const ITENS_NA_GELADEIRA = 0;

// A barra fixa do botão publica a própria altura: o toast flutua acima dela e a página reserva o espaço.
const ESTILO = { "--altura-barra-loja": `${ALTURA_BARRA_FIXA_PX}px` } as CSSProperties;

/** Layout da página de produto: sem a barra inferior da loja (o botão fixo ocupa o lugar dela). */
export default function ProdutoLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={ESTILO}
      className="flex min-h-dvh flex-col pb-[calc(var(--altura-barra-loja)+env(safe-area-inset-bottom,0px))]"
    >
      <ProdutoHeader count={ITENS_NA_GELADEIRA} />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}

import type { CSSProperties, ReactNode } from "react";
import { LojaHeaderComContador } from "@/components/geladeira/cabecalhos-com-contador";
import { LojaTabBar } from "@/components/ui";

// Alturas da barra e do header, publicadas em variável CSS: o que flutua acima da barra (toast) e a
// Geladeira (que ocupa o espaço entre os dois) leem daqui; fora da loja a barra é 0.
const ESTILO = {
  "--altura-barra-loja": "57px",
  "--altura-header-loja": "70px",
} as CSSProperties;

export default function LojaLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={ESTILO}
      className="flex min-h-dvh flex-col pb-[calc(var(--altura-barra-loja)+env(safe-area-inset-bottom,0px))]"
    >
      <LojaHeaderComContador />
      <div className="flex flex-1 flex-col">{children}</div>
      <LojaTabBar />
    </div>
  );
}

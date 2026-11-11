import type { CSSProperties, ReactNode } from "react";
import { LojaHeaderComContador } from "@/components/geladeira/cabecalhos-com-contador";
import { LojaTabBar } from "@/components/ui";

// Altura da barra, publicada em variável CSS: o que flutua acima dela (toast) lê daqui; fora da loja é 0.
const ESTILO = { "--altura-barra-loja": "57px" } as CSSProperties;

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

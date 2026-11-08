import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site/site-footer";
import { LojaHeader, LojaTabBar } from "@/components/ui";

// O contador mostra 0 até a Geladeira persistida existir (LB-47); a barra fixa ocupa 57 px (56 mais a borda).
const ITENS_NA_GELADEIRA = 0;

export default function LojaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col pb-[calc(57px+env(safe-area-inset-bottom,0px))]">
      <LojaHeader count={ITENS_NA_GELADEIRA} />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
      <LojaTabBar />
    </div>
  );
}

import { notFound } from "next/navigation";
import { ComponentShowcase } from "@/components/component-showcase";

// Lida a cada pedido (e não no build): em produção a vitrine só abre com VITRINE_E2E=1.
export const dynamic = "force-dynamic";

// Vitrine provisória para conferência visual dos tokens e componentes. Só existe em desenvolvimento;
// em produção é 404, exceto no E2E do CI, que roda contra o build e liga VITRINE_E2E=1 (ver playwright.config.ts).
export default function DevTokens() {
  if (process.env.NODE_ENV === "production" && process.env.VITRINE_E2E !== "1") notFound();

  return (
    <main className="flex min-h-dvh flex-col items-center gap-8 px-4 py-8">
      <h1 className="font-titulo text-4xl text-primaria">Tokens e componentes</h1>
      <ComponentShowcase />
    </main>
  );
}

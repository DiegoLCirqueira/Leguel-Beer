import { notFound } from "next/navigation";
import { ComponentShowcase } from "@/components/component-showcase";

// Vitrine provisória para conferência visual dos tokens e componentes; só existe em desenvolvimento.
export default function DevTokens() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="flex min-h-dvh flex-col items-center gap-8 px-4 py-8">
      <h1 className="font-titulo text-4xl text-primaria">Tokens e componentes</h1>
      <ComponentShowcase />
    </main>
  );
}

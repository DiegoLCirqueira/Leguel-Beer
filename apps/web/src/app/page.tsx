import { ComponentShowcase } from "@/components/component-showcase";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center gap-8 px-4 py-8">
      <h1 className="font-titulo text-4xl text-primaria">Leguelé Beer</h1>
      <ComponentShowcase />
    </main>
  );
}

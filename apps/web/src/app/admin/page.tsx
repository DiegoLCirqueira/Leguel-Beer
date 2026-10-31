import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administração | Leguelé Beer",
  robots: { index: false },
};

// Página mínima: cada tela de admin traz a própria rota e declara o acesso. O proxy só deixa chegar
// aqui quem a API diz ser admin; os dados desta área virão sempre da API com o Bearer da sessão.
export default function Admin() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col gap-6 px-6 pb-12 pt-14 text-texto">
      <h1 className="font-titulo text-balance text-4xl">Administração</h1>
    </main>
  );
}

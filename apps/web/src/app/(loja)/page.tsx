import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DestaquesServidor } from "@/components/home/destaques-servidor";
import { DestaquesSkeleton } from "@/components/home/destaques-skeleton";
import { COOKIE_ACESSO } from "@/lib/auth/cookies";
import { GUEST_COOKIE } from "@/lib/guest";
import { resolveHomeRoute } from "@/lib/home-route";

type Props = { searchParams?: Promise<{ aviso?: string }> };

export default async function Home({ searchParams }: Props = {}) {
  const aviso = (await searchParams)?.aviso;
  const jar = await cookies();
  const route = resolveHomeRoute({
    hasSession: Boolean(jar.get(COOKIE_ACESSO)?.value),
    isGuest: jar.get(GUEST_COOKIE)?.value === "1",
  });
  if (route !== "/") redirect(route);

  return (
    <>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-6 px-4 py-6">
        {aviso === "senha-alterada" ? (
          <p
            role="status"
            className="rounded-2xl border border-primaria bg-superficie/70 px-4 py-3 text-center text-texto"
          >
            Senha alterada. Você já está na sua conta.
          </p>
        ) : null}
        <h1 className="font-titulo text-4xl text-primaria">Leguelé Beer</h1>
        <Suspense fallback={<DestaquesSkeleton />}>
          <DestaquesServidor />
        </Suspense>
      </main>
    </>
  );
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site/site-footer";
import { GUEST_COOKIE } from "@/lib/guest";
import { resolveHomeRoute } from "@/lib/home-route";

export default async function Home() {
  const jar = await cookies();
  // Ainda não há login (LB-25): ninguém tem sessão.
  const route = resolveHomeRoute({
    hasSession: false,
    isGuest: jar.get(GUEST_COOKIE)?.value === "1",
  });
  if (route !== "/") redirect(route);

  return (
    <>
      <main className="flex min-h-dvh items-center justify-center p-6">
        <h1 className="font-titulo text-4xl text-primaria">Leguelé Beer</h1>
      </main>
      <SiteFooter />
    </>
  );
}

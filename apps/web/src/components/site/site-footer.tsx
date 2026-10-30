import Link from "next/link";
import { AVISOS_RODAPE } from "@/lib/avisos";

const LINKS = [
  { href: "/termos", rotulo: "Termos de Uso" },
  { href: "/privacidade", rotulo: "Política de Privacidade" },
  { href: "/entregas", rotulo: "Entregas" },
];

export function SiteFooter() {
  return (
    <footer className="relative flex flex-col items-center gap-4 border-t border-borda bg-fundo px-6 py-8 pb-[max(2rem,env(safe-area-inset-bottom,0px))] text-center text-sm text-texto-suave">
      <div className="flex flex-col gap-1">
        {AVISOS_RODAPE.map((aviso) => (
          <p key={aviso}>{aviso}</p>
        ))}
      </div>
      <nav aria-label="Páginas legais">
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-1">
          {LINKS.map(({ href, rotulo }) => (
            <li key={href}>
              <Link
                href={href}
                className="inline-flex min-h-11 items-center text-texto underline underline-offset-4 hover:text-primaria focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
              >
                {rotulo}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p className="max-w-sm text-xs">
        Leguelé Beer Cervejaria Artesanal Ltda. (empresa fictícia) · CNPJ 00.000.000/0001-00
        (fictício) · Maceió, AL
      </p>
    </footer>
  );
}

import Link from "next/link";
import { AVISOS_RODAPE } from "@/lib/avisos";

const LINKS = [
  { href: "/termos", rotulo: "Termos de Uso" },
  { href: "/privacidade", rotulo: "Política de Privacidade" },
  { href: "/entregas", rotulo: "Entregas" },
];

/** Rodapé discreto, só um detalhe: texto de 12 px, links em linha e cor texto-suave. */
export function SiteFooter() {
  return (
    <footer className="relative flex flex-col items-center border-t border-borda bg-fundo px-3 py-1 pb-[max(0.25rem,env(safe-area-inset-bottom,0px))] text-center text-xs leading-4 text-texto-suave">
      <p>
        {AVISOS_RODAPE.map((aviso, indice) => (
          <span key={aviso}>
            {indice > 0 ? " " : null}
            {aviso}
          </span>
        ))}
      </p>
      <nav aria-label="Páginas legais">
        <ul className="flex flex-wrap items-center justify-center">
          {LINKS.map(({ href, rotulo }, indice) => (
            <li key={href} className="flex items-center">
              {indice > 0 ? <span aria-hidden="true">·</span> : null}
              {/* Visual de 12 px; a área de toque de 24 px (WCAG 2.5.8) vem do padding. */}
              <Link
                href={href}
                className="inline-flex min-h-6 items-center px-2 underline underline-offset-2 hover:text-texto focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primaria"
              >
                {rotulo}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}

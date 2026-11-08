"use client";

import { House, LayoutGrid, Refrigerator, UserRound, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ABAS: { href: string; rotulo: string; Icone: LucideIcon }[] = [
  { href: "/", rotulo: "Início", Icone: House },
  { href: "/catalogo", rotulo: "Catálogo", Icone: LayoutGrid },
  { href: "/geladeira", rotulo: "Geladeira", Icone: Refrigerator },
  { href: "/conta", rotulo: "Perfil", Icone: UserRound },
];

const estaNaAba = (caminho: string, href: string) =>
  href === "/" ? caminho === "/" : caminho === href || caminho.startsWith(`${href}/`);

/** Barra inferior da loja: quatro abas com rótulo sempre visível e alvos de pelo menos 44 px. */
export function LojaTabBar({ className }: { className?: string }) {
  const caminho = usePathname();
  return (
    <nav
      aria-label="Menu da loja"
      className={cn(
        "fixed inset-x-0 bottom-0 z-20 border-t border-borda bg-fundo/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-sm",
        className,
      )}
    >
      <ul className="mx-auto flex max-w-md">
        {ABAS.map(({ href, rotulo, Icone }) => {
          const atual = estaNaAba(caminho, href);
          return (
            <li key={href} className="min-w-0 flex-1">
              <Link
                href={href}
                aria-current={atual ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-semibold leading-tight focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primaria",
                  atual ? "text-primaria" : "text-texto-suave",
                )}
              >
                <Icone aria-hidden="true" className="size-6 shrink-0" />
                <span className="max-w-full truncate">{rotulo}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

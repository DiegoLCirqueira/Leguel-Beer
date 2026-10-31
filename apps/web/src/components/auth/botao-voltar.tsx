import { ChevronLeft } from "lucide-react";
import Link from "next/link";

/**
 * Botão de voltar do canto da tela de acesso. Fica sobre a folhagem, então tem fundo quase opaco
 * (arte-vidro) e borda de 2 px no verde da marca, para não se perder atrás das folhas.
 */
export function BotaoVoltar({ href = "/boas-vindas" }: { href?: string }) {
  return (
    <Link
      href={href}
      aria-label="Voltar"
      className="absolute left-4 top-12 flex size-11 items-center justify-center rounded-full border-2 border-primaria bg-arte-vidro/90 text-primaria backdrop-blur-sm transition-colors hover:bg-arte-vidro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
    >
      <ChevronLeft aria-hidden="true" className="size-6" />
    </Link>
  );
}

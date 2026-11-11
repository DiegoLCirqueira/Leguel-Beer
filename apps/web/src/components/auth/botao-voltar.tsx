import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { ESTILO_BOTAO_VOLTAR } from "@/components/ui";

export function BotaoVoltar({ href = "/boas-vindas" }: { href?: string }) {
  return (
    <Link
      href={href}
      aria-label="Voltar"
      className={`absolute left-4 top-12 ${ESTILO_BOTAO_VOLTAR}`}
    >
      <ChevronLeft aria-hidden="true" className="size-6" />
    </Link>
  );
}

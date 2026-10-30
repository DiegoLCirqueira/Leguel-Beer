import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { ATUALIZADO_EM, PRIVACIDADE } from "@/content/legal";

export const metadata: Metadata = {
  title: "Política de Privacidade | Leguelé Beer",
};

export default function Privacidade() {
  return (
    <LegalPage titulo="Política de Privacidade" atualizadoEm={ATUALIZADO_EM} secoes={PRIVACIDADE} />
  );
}

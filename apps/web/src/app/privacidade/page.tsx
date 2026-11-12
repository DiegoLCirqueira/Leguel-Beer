import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { PRIVACIDADE_ATUALIZADA_EM, PRIVACIDADE } from "@/content/legal";

export const metadata: Metadata = {
  title: "Política de Privacidade | Leguelé Beer",
};

export default function Privacidade() {
  return (
    <LegalPage
      titulo="Política de Privacidade"
      atualizadoEm={PRIVACIDADE_ATUALIZADA_EM}
      secoes={PRIVACIDADE}
    />
  );
}

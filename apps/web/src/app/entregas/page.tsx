import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { ENTREGAS_ATUALIZADO_EM, ENTREGAS } from "@/content/legal";

export const metadata: Metadata = {
  title: "Entregas | Leguelé Beer",
};

export default function Entregas() {
  return (
    <LegalPage
      titulo="Entregas"
      atualizadoEm={ENTREGAS_ATUALIZADO_EM}
      secoes={ENTREGAS}
      semRodape
    />
  );
}

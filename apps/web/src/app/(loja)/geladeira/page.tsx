import type { Metadata } from "next";
import { GeladeiraTela } from "@/components/geladeira/geladeira-tela";

export const metadata: Metadata = {
  title: "Geladeira | Leguelé Beer",
};

export default function Geladeira() {
  return <GeladeiraTela />;
}

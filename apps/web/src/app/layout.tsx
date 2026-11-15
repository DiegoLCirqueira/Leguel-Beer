import type { Metadata, Viewport } from "next";
import { Figtree, Kaushan_Script } from "next/font/google";
import type { ReactNode } from "react";
import {
  buscarGeladeiraDaContaAction,
  enviarGeladeiraParaContaAction,
  validarGeladeiraAction,
} from "@/app/geladeira/actions";
import { GeladeiraProvider } from "@/components/geladeira/geladeira-provider";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
});

const kaushan = Kaushan_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-kaushan",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Leguelé Beer",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${kaushan.variable} ${figtree.variable}`}>
      <body>
        <GeladeiraProvider
          conta={{
            buscar: buscarGeladeiraDaContaAction,
            enviar: enviarGeladeiraParaContaAction,
            validar: validarGeladeiraAction,
          }}
        >
          {children}
        </GeladeiraProvider>
      </body>
    </html>
  );
}

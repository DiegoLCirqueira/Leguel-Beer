import type { Metadata, Viewport } from "next";
import { Figtree, Kaushan_Script } from "next/font/google";
import type { ReactNode } from "react";
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
      <body>{children}</body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Kaushan_Script, Outfit } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-outfit",
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
    <html lang="pt-BR" className={`${outfit.variable} ${kaushan.variable}`}>
      <body>{children}</body>
    </html>
  );
}

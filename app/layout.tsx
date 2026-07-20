import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Star Fuçando",
  description: "Consulta simplificada de dados corporativos via CNPJ.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

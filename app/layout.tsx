import type { Metadata } from "next";
import { AppLayout } from "@/presentation/shared/app-layout";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Star Seg - Gestão de Recibos & Benefícios",
  description: "Sistema integrado para gestão de colaboradores, benefícios e geração de recibos.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased selection:bg-amber-500 selection:text-stone-950">
        <AppLayout>{children}</AppLayout>
        <Toaster richColors position="top-right" theme="dark" />
      </body>
    </html>
  );
}

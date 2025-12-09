export const dynamic = "force-dynamic";

import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import I18nProvider from "@/lib/i18n/I18nProvider";

export const metadata: Metadata = {
  title: "Sony Partner Dashboard",
  description: "Bestellungen, Projekte, Support und Cashback",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <I18nProvider>
          <main>{children}</main>

          <Toaster
            position="top-right"
            richColors
            expand
            closeButton
            duration={1500}
          />
        </I18nProvider>
      </body>
    </html>
  );
}

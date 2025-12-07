  import "./globals.css";
  import type { Metadata } from "next";
  import { Toaster } from "sonner";
  import { cookies, headers } from "next/headers";

  export const metadata: Metadata = {
    title: "Sony Partner Dashboard",
    description: "Bestellungen, Projekte, Support und Cashback",
  };

  // Sprache erkennen
  async function detectLang(): Promise<string> {
    const cookieStore = await cookies();
    const cookieLang = cookieStore.get("lang")?.value;

    if (cookieLang) return cookieLang;

    const headersList = await headers();
    const acceptLang = headersList.get("accept-language");

    if (acceptLang?.startsWith("fr")) return "fr";
    if (acceptLang?.startsWith("it")) return "it";
    if (acceptLang?.startsWith("rm")) return "rm"; // Rätoromanisch
    if (acceptLang?.startsWith("en")) return "en";

    return "de"; // Fallback
  }

  export default async function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const lang = await detectLang();

    return (
      <html lang={lang}>
        <head>
          {/* 👇 WICHTIG: sorgt für korrekte Umlaute */}
          <meta charSet="UTF-8" />
        </head>
        <body className="min-h-screen bg-gray-50 text-gray-900">
          <main>{children}</main>
          <Toaster
            position="top-right"
            richColors
            expand
            closeButton
            duration={1500}
          />
        </body>
      </html>
    );
  }

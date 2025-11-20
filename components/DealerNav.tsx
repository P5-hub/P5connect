"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { Globe, ArrowLeft, UserCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { createClient } from "@/utils/supabase/client";

export default function DealerNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { t, lang, setLang } = useI18n();

  const [open, setOpen] = useState(false);
  const [dealerName, setDealerName] = useState<string | null>(null);

  const dealerIdParam = searchParams.get("dealer_id");

  // ðŸŽ¨ Farben pro Bereich
  const colorMap: Record<string, string> = {
    "/bestellung": "text-blue-600",
    "/verkauf": "text-green-600",
    "/projekt": "text-purple-600",
    "/support": "text-orange-600",
    "/sofortrabatt": "text-pink-600",
  };

  const activeColor = useMemo(() => {
    const match = Object.keys(colorMap).find((key) => pathname.startsWith(key));
    return match ? colorMap[match] : "text-gray-800";
  }, [pathname]);

  // ðŸ§© Navigationseinträge
  const baseNavItems = [
    { href: "/bestellung", key: "nav.order", color: "text-blue-600" },
    { href: "/verkauf", key: "nav.sales", color: "text-green-600" },
    { href: "/projekt", key: "nav.project", color: "text-purple-600" },
    { href: "/support", key: "nav.support", color: "text-orange-600" },
    { href: "/sofortrabatt", key: "nav.instantDiscount", color: "text-pink-600" },
    { href: "/infos", key: "nav.info", color: "text-gray-600" },
  ];

  // ðŸ”— dealer_id an alle Links anhängen (bei Impersonation)
  const navItems = baseNavItems.map((item) => ({
    ...item,
    href: dealerIdParam ? `${item.href}?dealer_id=${dealerIdParam}` : item.href,
  }));

  // ðŸšª Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // ðŸ”™ Zurück zum Dashboard (Admin)
  const handleBackToAdmin = () => {
    if (typeof window !== "undefined" && window.opener) {
      window.close();
    } else {
      router.push("/admin");
    }
  };


  // ðŸ“¦ Händlername für Anzeige laden (nur bei Impersonation)
  useEffect(() => {
    if (!dealerIdParam) return;

    const loadDealerName = async () => {
      const dealerId = Number(dealerIdParam);

      const { data, error } = await supabase
        .from("dealers")
        .select("name")          // <- kein Alias mehr!
        .eq("dealer_id", dealerId)
        .maybeSingle();

      if (error) {
        console.warn("loadDealerName error:", error);
        setDealerName(`#${dealerIdParam}`);
        return;
      }

      setDealerName(data?.name ?? `#${dealerIdParam}`); // <- hier name verwenden
    };

    loadDealerName();
  }, [dealerIdParam, supabase]);


  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="flex justify-between items-center px-6 py-3">
        {/* ðŸŒˆ Titel */}
        <Link
          href={dealerIdParam ? `/bestellung?dealer_id=${dealerIdParam}` : "/"}
          className="font-semibold text-gray-800 text-lg flex items-center"
        >
          <span className="text-black">P</span>
          <span className={`${activeColor} transition-colors`}>5</span>
          <span className="text-black">connect Dashboard</span>
        </Link>

        {/* ðŸ”¹ Navigation */}
        <nav className="flex gap-5 items-center">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href.split("?")[0]);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  isActive ? `${item.color} font-semibold` : "text-gray-800 hover:text-black"
                }`}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        {/* ðŸŒ Sprache, Zurück & Logout */}
        <div className="flex items-center gap-4">
          {/* ðŸ‘€ Infozeile für Admin-Impersonation */}
          {dealerIdParam && (
            <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
              <UserCircle2 className="w-4 h-4 text-gray-500" />
              <span>
                Admin agiert als{" "}
                <span className="font-semibold text-gray-800">
                  {dealerName || `Händler #${dealerIdParam}`}
                </span>
              </span>
            </div>
          )}

          {/* ðŸ”™ Zurück-Button nur bei dealer_id */}
          {dealerIdParam && (
            <button
              onClick={handleBackToAdmin}
              className="flex items-center gap-1 text-sm text-gray-700 hover:text-black border px-2 py-1 rounded-md"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("nav.backToDashboard") || "Zurück zum Dashboard"}
            </button>
          )}

          {/* ðŸŒ Sprache */}
          <div className="relative">
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-1 text-sm text-gray-800 hover:text-black"
            >
              <Globe className="w-4 h-4" />
              {languages.find((l) => l.code === lang)?.label || "Language"}
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-36 bg-white border rounded shadow-md z-50">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code as any);
                      setOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                      l.code === lang ? "font-semibold text-gray-900" : "text-gray-700"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Passwort ändern */}
          <Link
            href={dealerIdParam ? `/passwort?dealer_id=${dealerIdParam}` : "/passwort"}
            className="text-sm text-gray-800 hover:text-black"
          >
            {t("nav.password")}
          </Link>

          {/* Logout */}
          <button
            className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded transition-colors"
            onClick={handleLogout}
          >
            {t("nav.logout")}
          </button>
        </div>
      </div>
    </header>
  );
}

// ðŸŒ Sprachen (außerhalb der Komponente, damit sich die Referenz nicht ändert)
const languages = [
  { code: "de", label: "Deutsch" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
  { code: "rm", label: "Rumantsch" },
];



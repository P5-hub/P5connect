"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useRef } from "react";
import { Globe, ShoppingCart, Menu, X } from "lucide-react";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { createClient } from "@/utils/supabase/client";
import { useCart } from "@/app/(dealer)/GlobalCartProvider";
import { useDealer, useDealerMeta } from "@/app/(dealer)/DealerContext";

type Dealer = {
  dealer_id: number;
  login_nr?: string | null;
  store_name?: string | null;
  company_name?: string | null;
  name?: string | null;
};

export default function DealerNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { t, lang, setLang } = useI18n();

  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { state, openCart } = useCart();
  const bestellungCount = state.bestellung.length;

  const dealer = useDealer() as Dealer | null;
  const { impersonating } = useDealerMeta();

  const langRef = useRef<HTMLDivElement | null>(null);

  const dealerDisplayName =
    dealer?.company_name ||
    dealer?.store_name ||
    dealer?.name ||
    dealer?.login_nr ||
    (dealer?.dealer_id ? `#${dealer.dealer_id}` : null);

  // Farben für aktiven Menüpunkt
  const colorMap: Record<string, string> = {
    "/bestellung": "text-blue-600",
    "/verkauf": "text-green-600",
    "/projekt": "text-purple-600",
    "/support": "text-orange-600",
    "/sofortrabatt": "text-pink-600",
    "/infos": "text-gray-600",
  };

  const activeColor = useMemo(() => {
    const match = Object.keys(colorMap).find((key) => pathname.startsWith(key));
    return match ? colorMap[match] : "text-gray-800";
  }, [pathname]);

  const navItems = [
    { href: "/bestellung", key: "nav.order", color: "text-blue-600" },
    { href: "/verkauf", key: "nav.sales", color: "text-green-600" },
    { href: "/projekt", key: "nav.project", color: "text-purple-600" },
    { href: "/support", key: "nav.support", color: "text-orange-600" },
    {
      href: "/sofortrabatt",
      key: "nav.instantDiscount",
      color: "text-pink-600",
    },
    { href: "/infos", key: "nav.info", color: "text-gray-600" },
  ];

  // Click outside Language dropdown (Desktop)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (href: string) => pathname.startsWith(href);

  const goPassword = () => {
    setMobileOpen(false);
    router.push("/password");
  };

  const doLogout = async () => {
    setMobileOpen(false);
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-[999] border-b">
        <div className="flex justify-between items-center px-3 md:px-6 py-2 md:py-3">
          {/* LOGO */}
          <Link
            href="/bestellung"
            className="font-semibold text-gray-800 text-base md:text-lg flex items-center"
          >
            <span className="text-black">P</span>
            <span className={`${activeColor} transition-colors`}>5</span>
            <span className="text-black hidden sm:inline">
              connect Dashboard
            </span>
            <span className="text-black sm:hidden">connect</span>
          </Link>

          {/* NAVIGATION (DESKTOP) */}
          <nav className="hidden md:flex gap-5 items-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  isActive(item.href)
                    ? `${item.color} font-semibold`
                    : "text-gray-800 hover:text-black"
                }`}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          {/* RIGHT (DESKTOP) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Cart */}
            <button onClick={() => openCart("bestellung")} className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-800 hover:text-black" />
              {bestellungCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
                  {bestellungCount}
                </span>
              )}
            </button>

            {/* Sprache */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen((o) => !o)}
                className="flex items-center gap-1 text-sm text-gray-800 hover:text-black"
              >
                <Globe className="w-4 h-4" />
                {lang.toUpperCase()}
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white border rounded shadow-md z-50">
                  {["de", "fr", "en", "it", "rm"].map((code) => (
                    <button
                      key={code}
                      onClick={() => {
                        setLang(code as any);
                        setLangOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      {code.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Passwort */}
            <button
              onClick={goPassword}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {t("nav.password")}
            </button>

            {/* Logout */}
            <button
              className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded"
              onClick={doLogout}
            >
              {t("nav.logout")}
            </button>
          </div>

          {/* RIGHT (MOBILE) */}
          <div className="flex md:hidden items-center gap-2">
            {/* Cart */}
            <button
              onClick={() => openCart("bestellung")}
              className="relative p-2 rounded hover:bg-gray-100"
              aria-label="Warenkorb öffnen"
            >
              <ShoppingCart className="w-5 h-5 text-gray-800" />
              {bestellungCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full px-1.5 py-0.5">
                  {bestellungCount}
                </span>
              )}
            </button>

            {/* Menü */}
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded hover:bg-gray-100"
              aria-label="Menü öffnen"
            >
              <Menu className="w-5 h-5 text-gray-800" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[1000]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="font-semibold text-gray-900">
                {t("nav.menu") ?? "Menü"}
              </div>
              <button
                className="p-2 rounded hover:bg-gray-100"
                onClick={() => setMobileOpen(false)}
                aria-label="Schliessen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto">
              {/* Impersonation Hinweis */}
              {impersonating && dealer && (
                <div className="rounded border bg-blue-50 p-3 text-sm text-blue-900">
                  Admin arbeitet als{" "}
                  <span className="font-semibold">
                    {dealerDisplayName ?? `#${dealer.dealer_id}`}
                  </span>
                </div>
              )}

              {/* Navigation */}
              <div className="rounded border p-3">
                <div className="text-sm font-medium text-gray-800 mb-2">
                  Navigation
                </div>
                <div className="flex flex-col gap-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`px-3 py-2 rounded text-sm ${
                        isActive(item.href)
                          ? "bg-gray-900 text-white"
                          : "text-gray-800 hover:bg-gray-50"
                      }`}
                    >
                      {t(item.key)}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Sprache */}
              <div className="rounded border p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-2">
                  <Globe className="w-4 h-4" />
                  Sprache
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {["de", "fr", "en", "it", "rm"].map((code) => (
                    <button
                      key={code}
                      onClick={() => setLang(code as any)}
                      className={`px-3 py-2 rounded text-sm border ${
                        code === lang
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-800 hover:bg-gray-50"
                      }`}
                    >
                      {code.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Passwort ändern */}
              <button
                onClick={goPassword}
                className="w-full text-sm px-3 py-2 rounded border text-blue-700 border-blue-200 hover:bg-blue-50"
              >
                {t("nav.password")}
              </button>

              {/* Logout */}
              <button
                className="w-full bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-2 rounded"
                onClick={doLogout}
              >
                {t("nav.logout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import {
  Globe,
  ShoppingCart,
} from "lucide-react";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { createClient } from "@/utils/supabase/client";

// 🆕 GlobalCart statt DealerCart
import { useCart } from "@/app/(dealer)/GlobalCartProvider";

// ❗ CartContainer wird NICHT mehr hier geladen
// import CartContainer from "@/app/(dealer)/components/CartContainer";

export default function DealerNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { t, lang, setLang } = useI18n();

  const [langOpen, setLangOpen] = useState(false);

  // 🆕 GLOBAL CART
  const { state, openCart } = useCart();

  // Anzahl Produkte im Bestell-Warenkorb
  const bestellungCount = state.bestellung.length;

  const [dealerName, setDealerName] = useState<string | null>(null);
  const dealerIdParam = searchParams.get("dealer_id");

  // Farben für aktiven Menüpunkt
  const colorMap: Record<string, string> = {
    "/bestellung": "text-blue-600",
    "/verkauf": "text-green-600",
    "/projekt": "text-purple-600",
    "/support": "text-orange-600",
    "/sofortrabatt": "text-pink-600",
  };

  const activeColor = useMemo(() => {
    const match = Object.keys(colorMap).find((key) =>
      pathname.startsWith(key)
    );
    return match ? colorMap[match] : "text-gray-800";
  }, [pathname]);

  const baseNavItems = [
    { href: "/bestellung", key: "nav.order", color: "text-blue-600" },
    { href: "/verkauf", key: "nav.sales", color: "text-green-600" },
    { href: "/projekt", key: "nav.project", color: "text-purple-600" },
    { href: "/support", key: "nav.support", color: "text-orange-600" },
    { href: "/sofortrabatt", key: "nav.instantDiscount", color: "text-pink-600" },
    { href: "/infos", key: "nav.info", color: "text-gray-600" },
  ];

  const navItems = baseNavItems.map((item) => ({
    ...item,
    href: dealerIdParam ? `${item.href}?dealer_id=${dealerIdParam}` : item.href,
  }));

  // Händlername laden, falls Impersonation
  useEffect(() => {
    if (!dealerIdParam) return;

    (async () => {
      const id = Number(dealerIdParam);
      const { data } = await supabase
        .from("dealers")
        .select("name")
        .eq("dealer_id", id)
        .maybeSingle();

      setDealerName(data?.name ?? `#${dealerIdParam}`);
    })();
  }, [dealerIdParam]);

  return (
    <>
      {/* ❌ Entfernt: CartContainer wird im Layout geladen */}
      {/* <CartContainer /> */}

      <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-[999]">
        <div className="flex justify-between items-center px-6 py-3">

          {/* LOGO */}
          <Link
            href={dealerIdParam ? `/bestellung?dealer_id=${dealerIdParam}` : "/"}
            className="font-semibold text-gray-800 text-lg flex items-center"
          >
            <span className="text-black">P</span>
            <span className={`${activeColor} transition-colors`}>5</span>
            <span className="text-black">connect Dashboard</span>
          </Link>

          {/* NAVIGATION */}
          <nav className="flex gap-5 items-center">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href.split("?")[0]);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm transition-colors ${
                    isActive
                      ? `${item.color} font-semibold`
                      : "text-gray-800 hover:text-black"
                  }`}
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>

          {/* RECHTE LEISTE */}
          <div className="flex items-center gap-4">

            {/* 🛒 Globaler Warenkorb Button */}
            <button onClick={() => openCart("bestellung")} className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-800 hover:text-black" />

              {bestellungCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
                  {bestellungCount}
                </span>
              )}
            </button>

            {/* Sprache */}
            <div className="relative">
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

            {/* Logout */}
            <button
              className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded"
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/login");
              }}
            >
              {t("nav.logout")}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

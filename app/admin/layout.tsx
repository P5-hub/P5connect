"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useMemo, useState, useEffect } from "react";
import I18nProvider, { useI18n } from "@/lib/i18n/I18nProvider";
import { createClient } from "@/utils/supabase/client";
import { Globe, LogOut, UserRound, Search } from "lucide-react";

function AdminLayoutInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const [dealers, setDealers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // 🔹 Händler laden
  useEffect(() => {
    const loadDealers = async () => {
      const { data } = await supabase
        .from("dealers")
        .select("dealer_id, name, email")
        .order("name", { ascending: true });
      if (data) setDealers(data);
    };
    loadDealers();
  }, [supabase]);

  // 🔹 Gefilterte Händlerliste
  const filteredDealers = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return dealers.filter((d) => {
      const name = d.name?.toLowerCase?.() || "";
      const email = d.email?.toLowerCase?.() || "";
      return name.includes(lower) || email.includes(lower);
    });
  }, [dealers, searchTerm]);

  // 🔹 Navigation Items (ohne Cashback)
  const navItems = [
    { href: "/admin/promotions", label: t("admin.promotions") || "Promotionen", color: "text-blue-600" },
    { href: "/admin/sofortrabatt", label: t("admin.instantDiscount") || "Sofortrabatt", color: "text-pink-600" },
    { href: "/admin/projekte", label: t("admin.projects") || "Projekte", color: "text-indigo-600" },
    { href: "/admin/bestellungen", label: t("admin.orders") || "Bestellungen", color: "text-green-600" },
    { href: "/admin/support", label: t("admin.support") || "Support", color: "text-orange-600" },
    { href: "/admin/aktionen", label: t("admin.monthlyOffers") || "Monatsaktionen", color: "text-teal-600" },
    { href: "/admin/reports", label: t("admin.reports") || "Berichte / Datenauswertung", color: "text-gray-600" },
    { href: "/admin/infos", label: t("admin.info") || "Wichtige Infos", color: "text-gray-500" },
  ];

  // 🔹 Aktive Farbe
  const activeColor = useMemo(() => {
    const match = navItems.find((item) => pathname.startsWith(item.href));
    return match ? match.color : "text-gray-800";
  }, [pathname]);

  // 🔹 Händler-Impersonation
  const handleImpersonate = (dealerId: string) => {
    if (!dealerId) return;
    window.open(`/bestellung?dealer_id=${dealerId}`, "_blank");
  };

  // 🔹 Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 🔹 Header */}
      <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50 border-b">
        <div className="flex justify-between items-center px-6 py-3">
          {/* Titel */}
          <Link href="/admin" className="font-semibold text-gray-800 text-lg flex items-center">
            <span className="text-black">P</span>
            <span className={`${activeColor} transition-colors`}>5</span>
            <span className="text-black">connect Admin Dashboard</span>
          </Link>

          {/* Aktionen rechts */}
          <div className="flex items-center gap-5">
            {/* 🔹 Händler-Impersonation mit Suche */}
            <div className="relative flex items-center gap-2">
              <UserRound className="w-5 h-5 text-blue-600" />

              {/* Suchfeld */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Händler suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-sm border border-blue-200 bg-blue-50 text-blue-800 rounded-md focus:ring-1 focus:ring-blue-300 outline-none w-52"
                />
              </div>

              {/* Dropdown */}
              <select
                onChange={(e) => handleImpersonate(e.target.value)}
                className="border border-blue-200 bg-blue-50 text-blue-800 text-sm rounded-md px-2 py-1.5 hover:bg-blue-100 transition-all w-52"
              >
                <option value="">{t("admin.actAsDealer") || "Als Händler agieren"}</option>
                {filteredDealers.map((d) => (
                  <option key={d.dealer_id} value={d.dealer_id}>
                    {d.name || "Unbenannter Händler"} ({d.email || "keine E-Mail"})
                  </option>
                ))}
              </select>
            </div>

            {/* Sprache */}
            <div className="relative">
              <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-1 text-sm text-gray-800 hover:text-black"
              >
                <Globe className="w-4 h-4" />
                {lang === "de"
                  ? "Deutsch"
                  : lang === "fr"
                  ? "Français"
                  : lang === "it"
                  ? "Italiano"
                  : lang === "rm"
                  ? "Rumantsch"
                  : "English"}
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-36 bg-white border rounded shadow-md z-50">
                  {["de", "en", "fr", "it", "rm"].map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        setLang(l as any);
                        setOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                        l === lang ? "font-semibold text-gray-900" : "text-gray-700"
                      }`}
                    >
                      {l === "de"
                        ? "Deutsch"
                        : l === "fr"
                        ? "Français"
                        : l === "it"
                        ? "Italiano"
                        : l === "rm"
                        ? "Rumantsch"
                        : "English"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* 🔹 Navigation Tabs */}
        <nav className="flex gap-6 px-6 py-2 bg-white border-t shadow-sm overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? `${item.color} font-semibold border-b-2 border-current pb-1`
                    : "text-gray-700 hover:text-black"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Hauptinhalt */}
      <main className="flex-1 p-6 pt-28">{children}</main>
    </div>
  );
}

/** Wrapper mit I18nProvider */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </I18nProvider>
  );
}

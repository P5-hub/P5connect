"use client";

import { ReactNode, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

import DealerNav from "@/app/(dealer)/components/DealerNav";
import CartContainer from "@/app/(dealer)/components/CartContainer"; // ✅ HIER IMPORT
import RecentActivityPanel from "@/app/(dealer)/components/RecentActivityPanel";

import I18nProvider, { useI18n } from "@/lib/i18n/I18nProvider";
import { ThemeProvider } from "@/lib/theme/ThemeContext";

import { DealerProvider } from "./DealerContext";
import { GlobalCartProvider } from "@/app/(dealer)/GlobalCartProvider";

type Dealer = {
  dealer_id: number;
  login_nr: string;
  store_name?: string | null;
  company_name?: string | null;
  address?: string | null;
  zip?: string | null;
  city?: string | null;
  email?: string | null;
  phone?: string | null;
};

// Mapping: URL → Formular-Typ
const pathFormTypeMap: Record<string, any> = {
  "/bestellung": "bestellung",
  "/verkauf": "verkauf",
  "/projekt": "projekt",
  "/support": "support",
  "/sofortrabatt": "sofortrabatt",
};

function DealerShell({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [loading, setLoading] = useState(true);

  const impersonatingDealerId = searchParams.get("dealer_id");

  // HÄNDLERDATEN LADEN
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);

      // ADMIN IMPERSONATION
      if (impersonatingDealerId) {
        const { data: row } = await supabase
          .from("dealers")
          .select("*")
          .eq("dealer_id", Number(impersonatingDealerId))
          .maybeSingle();

        if (mounted && row) {
          setDealer({
            dealer_id: row.dealer_id,
            login_nr: row.login_nr,
            store_name: row.store_name,
            company_name: row.company_name,
            address: row.address,
            zip: row.plz ?? row.zip,
            city: row.city,
            email: row.email,
            phone: row.phone,
          });
          setLoading(false);
          return;
        }
      }

      // NORMALER LOGIN
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (mounted && user?.user_metadata?.login_nr) {
        const { data: row } = await supabase
          .from("dealers")
          .select("*")
          .eq("login_nr", user.user_metadata.login_nr)
          .maybeSingle();

        if (row) {
          setDealer({
            dealer_id: row.dealer_id,
            login_nr: row.login_nr,
            store_name: row.store_name,
            company_name: row.company_name,
            address: row.address,
            zip: row.plz ?? row.zip,
            city: row.city,
            email: row.email,
            phone: row.phone,
          });
        }
      }

      if (mounted) setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [impersonatingDealerId, pathname]);

  const exitImpersonation = () => router.push("/admin");

  function getFormTypeFromPath(): any | null {
    const match = Object.keys(pathFormTypeMap).find((key) =>
      pathname.includes(key)
    );
    return match ? pathFormTypeMap[match] : null;
  }

  const detectedFormType = getFormTypeFromPath();

  // RENDER UI
  return (
    <DealerProvider dealer={dealer} setDealer={setDealer}>
      <GlobalCartProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">

          {/* NAVIGATION */}
          <DealerNav />

          {/* 🛒 CART CONTAINER – MUSS DIREKT UNTER NAV STEHEN */}
          <CartContainer />  {/* ✅ FIX – CART WIRD ENDLICH GERENDET */}

          {/* ADMIN IMPERSONATION INFO */}
          {impersonatingDealerId && dealer && (
            <div className="bg-blue-50 text-blue-700 border-b border-blue-200 px-4 py-2 flex items-center justify-between text-sm mt-[56px]">
              <span>
                Admin arbeitet als{" "}
                <strong>
                  {dealer.company_name || dealer.store_name || dealer.login_nr}
                </strong>
              </span>

              <button
                onClick={exitImpersonation}
                className="px-3 py-1 bg-white border border-blue-300 rounded text-blue-700 font-medium hover:bg-blue-100"
              >
                Impersonation verlassen
              </button>
            </div>
          )}

          {/* HAUPTBEREICH */}
          <main className="flex-1 p-6 pt-28 relative z-0">
            {loading ? (
              <p className="text-gray-500">{t("dealer.loading")}</p>
            ) : dealer ? (
              <>
                {/* Händlerkarte + Verlauf */}
                <div className="flex flex-col lg:flex-row gap-6 mb-6">

                  {/* Händlerkarte */}
                  <div className="flex-1 min-w-[320px]">
                    <div className="h-full flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm p-3 text-[14px] leading-snug">
                      <h2 className="text-base font-semibold mb-2">
                        {t("dealer.infoTitle")}
                      </h2>

                      <div className="space-y-1 flex-1">
                        {dealer.store_name && (
                          <p><strong>{t("dealer.shop")}:</strong> {dealer.store_name}</p>
                        )}
                        {dealer.company_name && (
                          <p><strong>{t("dealer.company")}:</strong> {dealer.company_name}</p>
                        )}
                        {dealer.address && (
                          <p><strong>{t("dealer.address")}:</strong> {dealer.address}</p>
                        )}
                        {(dealer.zip || dealer.city) && (
                          <p><strong>{t("dealer.city")}:</strong> {dealer.zip} {dealer.city}</p>
                        )}
                        {dealer.email && (
                          <p><strong>{t("dealer.email")}:</strong> {dealer.email}</p>
                        )}
                        {dealer.phone && (
                          <p><strong>{t("dealer.phone")}:</strong> {dealer.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recent Activities */}
                  {detectedFormType && (
                    <div className="w-full lg:max-w-[520px]">
                      <RecentActivityPanel
                        dealerId={dealer.dealer_id}
                        formType={detectedFormType}
                        limit={2}
                        excelLast={100}
                      />
                    </div>
                  )}
                </div>

                {/* FORMULAR-INHALT */}
                {children}
              </>
            ) : (
              <p className="text-red-500">{t("dealer.notfound")}</p>
            )}
          </main>
        </div>
      </GlobalCartProvider>
    </DealerProvider>
  );
}

export default function DealerLayout({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <ThemeProvider>
        <DealerShell>{children}</DealerShell>
      </ThemeProvider>
    </I18nProvider>
  );
}

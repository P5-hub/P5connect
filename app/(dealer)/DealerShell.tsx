"use client";

import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

import DealerNav from "@/app/(dealer)/components/DealerNav";
import CartContainer from "@/app/(dealer)/components/CartContainer";
import RecentActivityPanel from "@/app/(dealer)/components/RecentActivityPanel";
import SofortrabattActivityPanel from "@/app/(dealer)/components/SofortrabattActivityPanel";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { useDealer, useDealerMeta } from "./DealerContext";
import { GlobalCartProvider } from "@/app/(dealer)/GlobalCartProvider";

type Dealer = {
  dealer_id: number;
  login_nr: string;
  store_name?: string | null;
  company_name?: string | null;
  address?: string | null;
  zip?: string | null;
  plz?: string | null;
  city?: string | null;
  email?: string | null;
  phone?: string | null;
  contact_person?: string | null;
  kam_name?: string | null;
  kam_email_sony?: string | null;
};

const pathFormTypeMap: Record<string, any> = {
  "/bestellung": "bestellung",
  "/verkauf": "verkauf",
  "/projekt": "projekt",
  "/support": "support",
  "/sofortrabatt": "sofortrabatt",
};

export default function DealerShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();

  const dealer = useDealer() as Dealer | null;
  const { impersonating } = useDealerMeta();

  const exitImpersonation = async () => {
    try {
      await fetch("/api/acting-as/reset", {
        method: "POST",
      });
    } catch {
      // trotzdem weiter navigieren
    }

    router.push("/admin");
    router.refresh();
  };

  function getFormTypeFromPath(): any | null {
    const match = Object.keys(pathFormTypeMap).find((key) =>
      pathname.includes(key)
    );
    return match ? pathFormTypeMap[match] : null;
  }

  const detectedFormType = getFormTypeFromPath();

  return (
    <GlobalCartProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <DealerNav />
        <CartContainer />

        {impersonating && dealer && (
          <div className="bg-blue-50 text-blue-700 border-b border-blue-200 px-3 md:px-4 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
            <span>
              Admin arbeitet als{" "}
              <strong>
                {dealer.company_name || dealer.store_name || dealer.login_nr}
              </strong>
              {" · "}
              ID <strong>{dealer.dealer_id}</strong>
            </span>

            <button
              onClick={exitImpersonation}
              className="w-full sm:w-auto px-3 py-1 bg-white border border-blue-300 rounded text-blue-700 font-medium hover:bg-blue-100"
            >
              Händlermodus beenden
            </button>
          </div>
        )}

        <main
          className="
            flex-1 relative z-0
            px-3 md:px-6
            pt-16 md:pt-24
            pb-6
          "
        >
          {!dealer ? (
            <p className="text-red-500">{t("dealer.notfound")}</p>
          ) : (
            <>
              <div className="flex flex-col lg:flex-row gap-4 md:gap-6 mb-4 md:mb-6">
                <div className="flex-1 min-w-0">
                  <div className="h-full flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm p-3 text-[14px] leading-snug">
                    <h2 className="text-base font-semibold mb-2">
                      {t("dealer.infoTitle")}
                    </h2>

                    <div className="space-y-1 flex-1">
                      {dealer.store_name && (
                        <p>
                          <strong>{t("dealer.shop")}:</strong>{" "}
                          {dealer.store_name}
                        </p>
                      )}
                      {dealer.company_name && (
                        <p>
                          <strong>{t("dealer.company")}:</strong>{" "}
                          {dealer.company_name}
                        </p>
                      )}
                      {dealer.address && (
                        <p>
                          <strong>{t("dealer.address")}:</strong>{" "}
                          {dealer.address}
                        </p>
                      )}
                      {(dealer.zip || dealer.plz || dealer.city) && (
                        <p>
                          <strong>{t("dealer.city")}:</strong>{" "}
                          {dealer.plz ?? dealer.zip} {dealer.city}
                        </p>
                      )}
                      {dealer.email && (
                        <p>
                          <strong>{t("dealer.email")}:</strong>{" "}
                          {dealer.email}
                        </p>
                      )}
                      {dealer.phone && (
                        <p>
                          <strong>{t("dealer.phone")}:</strong>{" "}
                          {dealer.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full lg:max-w-[520px] flex flex-col gap-4 md:gap-6">
                  {detectedFormType && detectedFormType !== "sofortrabatt" && (
                    <RecentActivityPanel
                      dealerId={dealer.dealer_id}
                      formType={detectedFormType}
                      limit={2}
                      excelLast={100}
                    />
                  )}

                  {detectedFormType === "sofortrabatt" && (
                    <SofortrabattActivityPanel
                      dealerId={dealer.dealer_id}
                      limit={2}
                    />
                  )}
                </div>
              </div>

              {children}
            </>
          )}
        </main>
      </div>
    </GlobalCartProvider>
  );
}
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HandCoins, Megaphone, CalendarDays, FileText } from "lucide-react";

import ProductList from "@/app/(dealer)/components/ProductList";
import ProductCardSupport from "@/app/(dealer)/components/ProductCardSupport";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { useTheme } from "@/lib/theme/ThemeContext";
import { useDealer } from "@/app/(dealer)/DealerContext";
import { useCart } from "@/app/(dealer)/GlobalCartProvider";

type SupportType = "sellout" | "marketing" | "event" | "other";

export default function SupportForm() {
  const { t } = useI18n();
  const theme = useTheme();
  const dealer = useDealer();

  const { addItem, openCart, setOrderDetails, orderDetails } = useCart();

  // Dealer aus URL (dein bestehendes Verhalten)
  const searchParams = useSearchParams();
  const dealerIdFromUrl = searchParams.get("dealer_id");
  const effectiveDealerId = dealerIdFromUrl
    ? Number(dealerIdFromUrl)
    : (dealer as any)?.dealer_id ?? null;

  const [details, setDetails] = useState({
    type: "sellout" as SupportType,
    comment: "",
    totalCost: 0,
    sonyShare: 0,
  });

  const [loading, setLoading] = useState(false);

  const activeBtn = `${theme.color.replace("text-", "bg-")} text-white`;
  const inactiveBtn = `border ${theme.border} hover:${theme.bgLight}`;

  const sonyAmount = (details.totalCost * details.sonyShare) / 100;

  const selectedFileName =
    (orderDetails?.support_files?.length ?? 0) > 0
      ? orderDetails.support_files[0].name
      : null;

  /* -------------------------------------------------------
     NON-SELLOUT SUBMIT (ohne Produkte)
     -> sendet FormData (payload + optional file)
  ------------------------------------------------------- */
  const submitNonSelloutSupport = async () => {
    if (!effectiveDealerId) {
      alert("Kein Händler gefunden (URL)");
      return;
    }

    if (!details.totalCost || !details.sonyShare) {
      alert("Bitte Kosten und Beteiligung eingeben");
      return;
    }

    const files = orderDetails?.support_files ?? [];
    if (files.length > 1) {
      alert("Bitte nur 1 Beleg anhängen (aktuell).");
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();

      fd.append(
        "payload",
        JSON.stringify({
          dealer_id: effectiveDealerId,
          type: details.type,
          comment: details.comment || null,
          totalCost: details.totalCost,
          sonyShare: details.sonyShare,
          sonyAmount,
          items: [],
        })
      );

      if (files[0] instanceof File) {
        fd.append("file", files[0]);
      }

      const res = await fetch("/api/support", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Support konnte nicht gespeichert werden");
      }

      alert("Support erfolgreich eingereicht");

      // Reset
      setDetails({
        type: "sellout",
        comment: "",
        totalCost: 0,
        sonyShare: 0,
      });

      setOrderDetails((prev) => ({ ...prev, support_files: [] }));
    } catch (err: any) {
      alert(err?.message || "Fehler beim Absenden");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-10 px-6">
      <h2 className="text-2xl font-semibold">
        {t("support.heading", { defaultValue: "Support-Antrag" })}
      </h2>

      {/* SUPPORT ART */}
      <Card className={theme.border}>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold text-sm text-gray-700">Support-Art</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ["sellout", "Sell-Out", HandCoins],
              ["marketing", "Werbung", Megaphone],
              ["event", "Event", CalendarDays],
              ["other", "Sonstiges", FileText],
            ].map(([key, label, Icon]: any) => (
              <Button
                key={key}
                size="sm"
                onClick={() =>
                  setDetails((d) => ({ ...d, type: key as SupportType }))
                }
                className={details.type === key ? activeBtn : inactiveBtn}
              >
                <Icon className="w-4 h-4 mr-1" />
                {label}
              </Button>
            ))}
          </div>

          <div>
            <label className="text-sm text-gray-600">Beschreibung / Kommentar</label>
            <textarea
              rows={3}
              className="border rounded-md px-3 py-2 w-full mt-1"
              value={details.comment}
              onChange={(e) =>
                setDetails((d) => ({
                  ...d,
                  comment: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">
              Beleg / Nachweis (PDF, JPG, PNG)
            </label>
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setOrderDetails((prev) => ({
                  ...prev,
                  support_files: f ? [f] : [],
                }));
              }}
            />

            {selectedFileName && (
              <p className="text-xs text-gray-500 mt-1">
                Ausgewählt: <span className="font-medium">{selectedFileName}</span>
              </p>
            )}

            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => openCart("support")}
              >
                Support-Cart öffnen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SELLOUT */}
      {details.type === "sellout" && (
        <Card className={theme.border}>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-sm text-gray-700 mb-4">
              Produkte auswählen
            </h3>

            <ProductList
              CardComponent={ProductCardSupport}
              cardProps={{
                onAddToCart: (item: any) => {
                  // ✅ globaler Support Cart
                  addItem("support", item);
                  openCart("support");
                },
              }}
              supportType="sellout"
            />
          </CardContent>
        </Card>
      )}

      {/* NON-SELLOUT */}
      {details.type !== "sellout" && (
        <Card className={theme.border}>
          <CardContent className="pt-6">
            <div className="max-w-lg space-y-4">
              <h3 className="font-semibold text-sm text-gray-700">
                Kostenbeteiligung
              </h3>

              <Input
                type="number"
                placeholder="Gesamtkosten (CHF)"
                value={details.totalCost || ""}
                onChange={(e) =>
                  setDetails((d) => ({
                    ...d,
                    totalCost: Number(e.target.value),
                  }))
                }
              />

              <Input
                type="number"
                placeholder="Sony Beteiligung (%)"
                value={details.sonyShare || ""}
                onChange={(e) =>
                  setDetails((d) => ({
                    ...d,
                    sonyShare: Number(e.target.value),
                  }))
                }
              />

              <div className="flex justify-between border rounded-md px-3 py-2 bg-gray-50 text-sm">
                <span>Sony Support (CHF)</span>
                <span className="font-semibold">
                  {sonyAmount.toLocaleString("de-CH", {
                    style: "currency",
                    currency: "CHF",
                  })}
                </span>
              </div>

              <Button
                className={`${activeBtn} mt-2`}
                onClick={submitNonSelloutSupport}
                disabled={loading}
              >
                {loading ? "Wird gesendet…" : "Support absenden"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
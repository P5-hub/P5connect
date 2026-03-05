"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  HandCoins,
  Megaphone,
  CalendarDays,
  FileText,
  ShoppingCart,
} from "lucide-react";

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

  const {
    addItem,
    openCart,
    setOrderDetails,
    orderDetails,
    getItems,
    supportMeta,
    setSupportMeta,
  } = useCart();

  const supportItems = getItems("support") ?? [];
  const supportCount = supportItems.length;

  const supportTotal = useMemo(() => {
    return supportItems.reduce((s: number, i: any) => {
      const qty = Number(i.quantity) || 1;
      const betrag = Number(i.supportbetrag) || 0;
      return s + qty * betrag;
    }, 0);
  }, [supportItems]);

  // Dealer aus URL (dein bestehendes Verhalten)
  const searchParams = useSearchParams();
  const dealerIdFromUrl = searchParams.get("dealer_id");
  const effectiveDealerId = dealerIdFromUrl
    ? Number(dealerIdFromUrl)
    : (dealer as any)?.dealer_id ?? null;

  // ✅ Non-sellout Werte lokal
  const [nonSellout, setNonSellout] = useState({
    totalCost: 0,
    sonyShare: 0,
  });

  const [loading, setLoading] = useState(false);

  const activeBtn = `${theme.color.replace("text-", "bg-")} text-white`;
  const inactiveBtn = `border ${theme.border} hover:${theme.bgLight}`;

  const sonyAmount = (nonSellout.totalCost * nonSellout.sonyShare) / 100;

  const selectedFileName =
    (orderDetails?.support_files?.length ?? 0) > 0
      ? orderDetails.support_files[0].name
      : null;

  const submitNonSelloutSupport = async () => {
    if (!effectiveDealerId) {
      alert("Kein Händler gefunden (URL)");
      return;
    }

    if (!supportMeta.type) {
      alert("Bitte Support-Art auswählen");
      return;
    }

    if (!nonSellout.totalCost || !nonSellout.sonyShare) {
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
          type: supportMeta.type, // ✅ global
          comment: supportMeta.comment || null, // ✅ global
          totalCost: nonSellout.totalCost,
          sonyShare: nonSellout.sonyShare,
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
      setNonSellout({ totalCost: 0, sonyShare: 0 });
      setSupportMeta({ type: "", comment: "" });
      setOrderDetails((prev) => ({ ...prev, support_files: [] }));
    } catch (err: any) {
      alert(err?.message || "Fehler beim Absenden");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-10 px-6 pb-24">
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
                  setSupportMeta((m) => ({ ...m, type: key as SupportType }))
                }
                className={supportMeta.type === key ? activeBtn : inactiveBtn}
              >
                <Icon className="w-4 h-4 mr-1" />
                {label}
              </Button>
            ))}
          </div>

          <div>
            <label className="text-sm text-gray-600">
              Beschreibung / Kommentar
            </label>
            <textarea
              rows={3}
              className="border rounded-md px-3 py-2 w-full mt-1"
              value={supportMeta.comment}
              onChange={(e) =>
                setSupportMeta((m) => ({
                  ...m,
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
                Ausgewählt:{" "}
                <span className="font-medium">{selectedFileName}</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SELLOUT */}
      {supportMeta.type === "sellout" && (
        <Card className={theme.border}>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-sm text-gray-700 mb-4">
              Produkte auswählen
            </h3>

            <ProductList
              CardComponent={ProductCardSupport}
              cardProps={{
                onAddToCart: (item: any) => {
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
      {supportMeta.type !== "sellout" && supportMeta.type !== "" && (
        <Card className={theme.border}>
          <CardContent className="pt-6">
            <div className="max-w-lg space-y-4">
              <h3 className="font-semibold text-sm text-gray-700">
                Kostenbeteiligung
              </h3>

              <Input
                type="number"
                placeholder="Gesamtkosten (CHF)"
                value={nonSellout.totalCost || ""}
                onChange={(e) =>
                  setNonSellout((d) => ({
                    ...d,
                    totalCost: Number(e.target.value),
                  }))
                }
              />

              <Input
                type="number"
                placeholder="Sony Beteiligung (%)"
                value={nonSellout.sonyShare || ""}
                onChange={(e) =>
                  setNonSellout((d) => ({
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

      {/* ✅ FLOATING SUPPORT CART BUTTON (rechts unten) */}
      <button
        type="button"
        onClick={() => openCart("support")}
        className="fixed bottom-6 right-6 z-50 shadow-lg rounded-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 flex items-center gap-2"
        title="Support-Cart öffnen"
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="font-semibold">Support</span>

        {supportCount > 0 && (
          <span className="ml-1 text-xs bg-white/20 rounded-full px-2 py-1">
            {supportCount} ·{" "}
            {supportTotal.toLocaleString("de-CH", {
              style: "currency",
              currency: "CHF",
            })}
          </span>
        )}
      </button>
    </div>
  );
}
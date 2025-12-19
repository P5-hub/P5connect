"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  HandCoins,
  Megaphone,
  CalendarDays,
  FileText,
} from "lucide-react";

import UnifiedCart from "@/app/(dealer)/components/cart/UnifiedCart";
import ProductList from "@/app/(dealer)/components/ProductList";
import ProductCardSupport from "@/app/(dealer)/components/ProductCardSupport";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { useTheme } from "@/lib/theme/ThemeContext";
import { useDealer } from "@/app/(dealer)/DealerContext";
import { createClient } from "@/utils/supabase/client";

type SupportType = "sellout" | "marketing" | "event" | "other";

const supabase = createClient();

/* -------------------------------------------------------
   FILE UPLOAD
------------------------------------------------------- */
async function uploadSupportFile(file: File, dealerId: string) {
  const ext = file.name.split(".").pop();
  const path = `support/${dealerId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("support-documents")
    .upload(path, file, { upsert: false });

  if (error) throw new Error(error.message);
  return path;
}

export default function SupportForm() {
  const { t } = useI18n();
  const theme = useTheme();
  const dealer = useDealer();

  const [details, setDetails] = useState({
    type: "sellout" as SupportType,
    comment: "",
    file: null as File | null,
    totalCost: 0,
    sonyShare: 0,
  });

  const [cart, setCart] = useState<any[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const activeBtn = `${theme.color.replace("text-", "bg-")} text-white`;
  const inactiveBtn = `border ${theme.border} hover:${theme.bgLight}`;

  const sonyAmount =
    (details.totalCost * details.sonyShare) / 100;

  const sonySupportAmount =
  (details.totalCost * details.sonyShare) / 100;
  

  /* -------------------------------------------------------
     NON-SELLOUT SUBMIT
  ------------------------------------------------------- */
  const submitNonSelloutSupport = async () => {
    if (!dealer?.dealer_id) {
      alert("Kein Händler gefunden");
      return;
    }

    if (!details.totalCost || !details.sonyShare) {
      alert("Bitte Kosten und Beteiligung eingeben");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // 🔹 Payload (JSON!)
      formData.append(
        "payload",
        JSON.stringify({
          dealer_id: dealer.dealer_id,
          type: details.type,                 // marketing | event | other
          comment: details.comment || null,
          totalCost: details.totalCost,
          sonyShare: details.sonyShare,
          sonyAmount: (details.totalCost * details.sonyShare) / 100,
          items: [],                           // Non-Sell-Out → keine Items
        })
      );

      // 🔹 FILE / CSV / PDF
      if (details.file) {
        formData.append("file", details.file);
      }

      const res = await fetch("/api/support", {
        method: "POST",
        body: formData, // ❗️ KEIN Content-Type setzen
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Support konnte nicht gespeichert werden");
      }

      alert("Support erfolgreich eingereicht");

      setDetails({
        type: "sellout",
        comment: "",
        file: null,
        totalCost: 0,
        sonyShare: 0,
      });
    } catch (err: any) {
      alert(err.message || "Fehler beim Absenden");
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
          <h3 className="font-semibold text-sm text-gray-700">
            Support-Art
          </h3>

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
                  setDetails((d) => ({ ...d, type: key }))
                }
                className={
                  details.type === key ? activeBtn : inactiveBtn
                }
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
              onChange={(e) =>
                setDetails((d) => ({
                  ...d,
                  file: e.target.files?.[0] ?? null,
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* SELLOUT */}
      {details.type === "sellout" && (
        <>
          <Card className={theme.border}>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-sm text-gray-700 mb-4">
                Produkte auswählen
              </h3>

              <ProductList
                CardComponent={ProductCardSupport}
                cardProps={{
                  onAddToCart: (item: any) => {
                    setCart((prev) => [...prev, item]);
                    setCartOpen(true);
                  },
                }}
                supportType="sellout"
              />
            </CardContent>
          </Card>

          <UnifiedCart
            mode="support"
            cart={cart}
            setCart={setCart}
            open={cartOpen}
            setOpen={setCartOpen}
            details={{
              type: details.type,
              comment: details.comment,
            }}
            onSuccess={() => setCart([])}
          />
        </>
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

"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DealerInfoCompact from "@/app/(dealer)/components/DealerInfoCompact";
import { useCart } from "@/app/(dealer)/GlobalCartProvider";
import { useDealer } from "@/app/(dealer)/DealerContext";
import { useState } from "react";
import { Tag } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/lib/theme/ThemeContext";

/* -------------------------------------------------- */
/* 🧠 Rabatt-Logik (NUR Anzeige!)                     */
/* -------------------------------------------------- */
const hasCategory = (items: any[], keywords: string[]) =>
  items.some((i) =>
    keywords.some((k) =>
      (i.category || i.gruppe || "").toLowerCase().includes(k)
    )
  );

const getRabattLevel = (items: any[]) => {
  const hasTV = hasCategory(items, ["tv"]);
  const hasSoundbar = hasCategory(items, ["soundbar"]);
  const hasSub = hasCategory(items, ["sub"]);

  if (hasTV && hasSoundbar && hasSub) return 3;
  if (hasTV && hasSoundbar) return 2;
  if (hasTV) return 1;
  return 0;
};

export default function CartSofortrabatt() {
  const dealer = useDealer();
  const theme = useTheme();

  const {
    state,
    getItems,
    removeItem,
    clearCart,
    addItem,
    closeCart,
  } = useCart();

  const items = getItems("sofortrabatt");
  const open = state.open && state.currentForm === "sofortrabatt";

  const rabattLevel = getRabattLevel(items);

  const getRabattForItem = (item: any): number => {
    const isTV =
      (item.category || item.gruppe || "").toLowerCase().includes("tv");

    if (!isTV) return 0;

    switch (rabattLevel) {
      case 1:
        return Number(item.sofortrabatt_amount || 0);
      case 2:
        return Number(item.sofortrabatt_double_amount || 0);
      case 3:
        return Number(item.sofortrabatt_triple_amount || 0);
      default:
        return 0;
    }
  };

  const totalRabatt = items.reduce(
    (sum, item) => sum + getRabattForItem(item),
    0
  );

  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const canSubmit = rabattLevel > 0 && !!invoiceFile;

  const updateSerial = (index: number, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], seriennummer: value };

    clearCart("sofortrabatt");
    updated.forEach((it) => addItem("sofortrabatt", it));
  };

  /* -------------------------------------------------- */
  /* 🚀 ABSENDEN → NUR FormData an API                  */
  /* -------------------------------------------------- */
  const handleSubmit = async () => {
    if (!dealer?.dealer_id) {
      toast.error("Kein Händler gefunden.");
      return;
    }

    if (!invoiceFile) {
      toast.error("Bitte Rechnungsdatei hochladen.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("dealer_id", dealer.dealer_id.toString());
      formData.append("items", JSON.stringify(items));
      formData.append("invoice", invoiceFile);

      const res = await fetch("/api/sofortrabatt/submit", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Sofortrabatt fehlgeschlagen");
      }

      setSuccess(true);
      clearCart("sofortrabatt");
      toast.success("Sofortrabatt erfolgreich gespeichert");
    } catch (err: any) {
      toast.error("Fehler beim Speichern", {
        description: err.message,
      });
    }

    setLoading(false);
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && closeCart()}>
      <SheetContent side="right" className="w-full sm:w-[600px] flex flex-col">
        <SheetHeader>
          <SheetTitle className={`flex items-center gap-2 ${theme.color}`}>
            <Tag className="w-5 h-5" />
            Sofortrabatt beantragen
          </SheetTitle>
        </SheetHeader>

        {dealer && (
          <div className="mb-4">
            <DealerInfoCompact dealer={dealer} />
          </div>
        )}

        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <p className={`${theme.color} font-semibold text-lg`}>
              🎉 Sofortrabatt erfolgreich gespeichert!
            </p>
            <p className="text-sm">
              Gesamtbetrag: <b>{totalRabatt} CHF</b>
            </p>
            <SheetClose asChild>
              <Button className={`${theme.bg} ${theme.bgHover} text-white`}>
                Schließen
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item: any, index: number) => (
                <div
                  key={index}
                  className={`border rounded-xl p-3 bg-white shadow space-y-2 ${theme.border}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">
                        {item.product_name || item.sony_article}
                      </p>
                      <p className="text-xs text-gray-500">EAN: {item.ean}</p>
                    </div>
                    <button
                      onClick={() => removeItem("sofortrabatt", index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>

                  <p>
                    Rabatt:{" "}
                    <b className={theme.color}>
                      {getRabattForItem(item)} CHF
                    </b>
                  </p>

                  <Input
                    placeholder="Seriennummer"
                    value={item.seriennummer || ""}
                    onChange={(e) =>
                      updateSerial(index, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <label className="text-sm font-medium">Rechnung hochladen</label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  setInvoiceFile(e.target.files?.[0] || null)
                }
              />
            </div>

            <div className="border-t pt-4 space-y-3">
              <p className="text-sm">
                Gesamt-Rabatt:{" "}
                <b className={theme.color}>{totalRabatt} CHF</b>
              </p>

              <Button
                onClick={handleSubmit}
                disabled={loading || !canSubmit}
                className={`w-full ${theme.bg} ${theme.bgHover} text-white font-semibold`}
              >
                {loading ? "Wird gesendet…" : "Sofortrabatt absenden"}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

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
import { toast } from "sonner";
import { useState } from "react";
import { BarChart3 } from "lucide-react";

export default function CartVerkauf() {
  const dealer = useDealer();
  const { state, getItems, removeItem, clearCart, closeCart } = useCart();

  const items = getItems("verkauf");
  const open = state.open && state.currentForm === "verkauf";

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Pflichtfelder
  const [inhouseShare, setInhouseShare] = useState<number>(100);
  const [calendarWeek, setCalendarWeek] = useState<number>(() => {
    const now = new Date();
    const onejan = new Date(now.getFullYear(), 0, 1);
    return Math.ceil(
      ((now.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7
    );
  });

  const submitSales = async () => {
    if (!dealer?.dealer_id) {
      toast.error("Kein Händler gefunden.");
      return;
    }

    if (items.length === 0) {
      toast.error("Keine Produkte im Warenkorb.");
      return;
    }

    if (!inhouseShare || inhouseShare <= 0) {
      toast.error("Bitte gültigen Inhouse-Share eingeben.");
      return;
    }

    if (!calendarWeek || calendarWeek < 1 || calendarWeek > 53) {
      toast.error("Bitte gültige Kalenderwoche eingeben.");
      return;
    }

    for (const it of items) {
      if (!it.quantity || it.quantity <= 0) {
        toast.error("Ungültige Menge.", {
          description: `${it.product_name}`,
        });
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/verkauf-upload", {
        method: "POST",
        body: JSON.stringify({
          dealer_id: dealer.dealer_id,
          items,
          sony_share: inhouseShare,
          calendar_week: calendarWeek,
        }),
      });

      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Undefinierter Serverfehler");
      }

      setSuccess(true);
      toast.success("Verkaufsdaten gespeichert");

      clearCart("verkauf");
    } catch (err: any) {
      toast.error("Fehler beim Speichern", {
        description: err.message,
      });
    }
    setLoading(false);
  };

  const totalQty = items.reduce((s, i) => s + (i.quantity || 0), 0);
  const totalAmount = items.reduce(
    (s, i) => s + (i.quantity || 0) * (i.price || 0),
    0
  );

  return (
    <Sheet open={open} onOpenChange={closeCart}>
      <SheetContent side="right" className="w-full sm:w-[600px] flex flex-col">

        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            Verkaufsdaten melden
          </SheetTitle>
        </SheetHeader>

        {dealer && (
          <div className="mb-4">
            <DealerInfoCompact dealer={dealer} />
          </div>
        )}

        {success ? (
          <div className="flex-1 flex flex-col justify-center items-center gap-4">
            <p className="text-green-600 font-semibold text-lg">
              Verkaufsdaten erfolgreich gespeichert!
            </p>

            <SheetClose asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Schließen
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            {/* PRODUKTE */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.length === 0 ? (
                <p className="text-gray-500 text-center">
                  Noch keine Produkte ausgewählt.
                </p>
              ) : (
                items.map((item, index) => (
                  <div
                    key={index}
                    className="border rounded-xl p-3 space-y-2 bg-white shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">
                          {item.product_name || item.sony_article}
                        </p>
                        <p className="text-xs text-gray-500">EAN: {item.ean}</p>
                      </div>

                      <button
                        onClick={() => removeItem("verkauf", index)}
                        className="text-red-500 hover:text-red-700 font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Menge, Preis, Datum */}
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity ?? 1}
                        onChange={(e) => {
                          item.quantity = Math.max(1, Number(e.target.value));
                        }}
                        className="text-center"
                      />

                      <Input
                        type="number"
                        value={item.price ?? ""}
                        onChange={(e) => {
                          item.price = Math.max(0, Number(e.target.value));
                        }}
                        className="text-center"
                      />

                      <Input
                        type="date"
                        value={
                          item.date ??
                          new Date().toISOString().split("T")[0]
                        }
                        onChange={(e) => {
                          item.date = e.target.value;
                        }}
                        className="text-center"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* FOOTER */}
            {items.length > 0 && (
              <div className="border-t pt-4 space-y-3">
                {/* Pflichtfelder */}
                <div className="flex flex-wrap gap-4">
                  <div>
                    <label className="text-xs font-semibold">Inhouse-Share (%)</label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      className="w-24 text-center"
                      value={inhouseShare}
                      onChange={(e) =>
                        setInhouseShare(Number(e.target.value) || 0)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold">Kalenderwoche</label>
                    <Input
                      type="number"
                      min={1}
                      max={53}
                      className="w-24 text-center"
                      value={calendarWeek}
                      onChange={(e) => setCalendarWeek(Number(e.target.value))}
                    />
                  </div>
                </div>

                <p className="text-sm">
                  <b>Menge:</b> {totalQty} Stück
                </p>

                <p className="text-sm">
                  <b>Umsatz:</b>{" "}
                  {totalAmount.toLocaleString("de-CH", {
                    style: "currency",
                    currency: "CHF",
                  })}
                </p>

                <Button
                  onClick={submitSales}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  {loading ? "⏳ Wird gesendet…" : "Verkäufe melden"}
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

"use client";

import DealerInfoCompact from "@/components/DealerInfoCompact";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { BarChart3 } from "lucide-react";
import { Product } from "@/types/Product";
import { submitGroupedItems } from "@/lib/submitGroupedItems";

type CartItem = Product & {
  quantity: number;
  price?: number;
  date?: string;
};

type CartVerkaufProps = {
  dealer: any;
  cart: CartItem[];
  setCart: (fn: (prev: CartItem[]) => CartItem[]) => void;
  onSaleSuccess: () => void;
  open: boolean;
  setOpen: (o: boolean) => void;
};

export default function CartVerkauf({
  dealer,
  cart,
  setCart,
  onSaleSuccess,
  open,
  setOpen,
}: CartVerkaufProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [inhouseShare, setInhouseShare] = useState<number>(100);
  const [selectedWeek, setSelectedWeek] = useState<number>(() => {
    const now = new Date();
    const onejan = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil(
      ((now.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7
    );
    return week;
  });

  useEffect(() => {
    if (cart.length > 0) setSuccess(false);
  }, [cart]);

  const updateItem = (index: number, field: keyof CartItem, value: any) => {
    setCart((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!dealer?.dealer_id) {
      toast.error("❌ Kein Händler gefunden – bitte neu einloggen.");
      return;
    }

    if (cart.length === 0) {
      toast.error("Keine Produkte im Warenkorb.");
      return;
    }

    if (inhouseShare === null || isNaN(inhouseShare) || inhouseShare <= 0) {
      toast.error("Bitte geben Sie einen gültigen Inhouse Share ein.");
      return;
    }

    if (!selectedWeek || selectedWeek < 1 || selectedWeek > 53) {
      toast.error("Bitte geben Sie eine gültige Kalenderwoche ein.");
      return;
    }

    for (const item of cart) {
      if (!item.quantity || item.quantity <= 0) {
        toast.error("Ungültige Eingabe", {
          description: `Bitte eine gültige Menge für ${
            item.product_name ?? item.sony_article ?? "Produkt"
          } eingeben!`,
        });
        return;
      }
    }

    setLoading(true);
    try {
      console.log("🟢 Submitting sale payload:", {
        dealer_id: dealer.dealer_id,
        inhouse_share: inhouseShare,
        calendar_week: selectedWeek,
        items: cart,
      });

      const result = await submitGroupedItems({
        items: cart,
        dealer,
        typ: "verkauf",
        meta: {
          inhouse_share: inhouseShare,
          calendar_week: selectedWeek,
        },
      });


      if (!result || (result as any).error) {
        console.error("❌ Submit error:", result);
        throw new Error(
          (result as any).error?.message ||
            "Unbekannter Fehler beim Speichern."
        );
      }

      setCart(() => []);
      onSaleSuccess();
      setSuccess(true);
      toast.success("✅ Verkäufe gespeichert", {
        description: `${cart.length} Produkt(e) erfolgreich gemeldet.`,
      });

      // 🔁 Reset nach Erfolg
      setInhouseShare(0);
      const now = new Date();
      const onejan = new Date(now.getFullYear(), 0, 1);
      const week = Math.ceil(
        ((now.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) /
          7
      );
      setSelectedWeek(week);
    } catch (err: any) {
      console.error("❌ Sale API Error:", err);
      toast.error("Fehler beim Speichern", {
        description: err?.message || "Unbekannter Fehler (siehe Console).",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Summen berechnen
  const totalQuantity = cart.reduce((s, i) => s + (i.quantity || 0), 0);
  const totalAmount = cart.reduce(
    (s, i) => s + (i.quantity || 0) * (i.price || 0),
    0
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Floating Button unten rechts */}
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 border-green-600 text-green-700 hover:bg-green-50 shadow-lg"
          title="Verkaufsdaten öffnen"
        >
          <BarChart3 className="w-5 h-5" />
          <span className="font-medium">
            Verkaufsdaten {cart.length ? `(${cart.length})` : ""}
          </span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:w-[600px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            Verkaufsdaten melden
          </SheetTitle>
        </SheetHeader>

        <div className="mb-4">
          {dealer ? (
            <DealerInfoCompact dealer={dealer} />
          ) : (
            <p className="text-sm text-gray-500">
              ⚠️ Kein Händler geladen – bitte einloggen.
            </p>
          )}
        </div>

        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <p className="text-green-600 font-semibold text-lg">
              ✅ Verkäufe gespeichert!
            </p>
            <p className="text-gray-600">
              Deine Verkaufsdaten wurden erfolgreich gemeldet.
            </p>
            <SheetClose asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Schließen
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {cart.length === 0 ? (
                <p className="text-gray-500">Noch keine Produkte ausgewählt.</p>
              ) : (
                cart.map((item, index) => (
                  <div key={index} className="border rounded-xl p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">
                          {item.product_name ||
                            item.sony_article ||
                            "Unbekannt"}
                        </p>
                        <p className="text-xs text-gray-500">
                          EAN: {item.ean || "-"}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-red-500 hover:text-red-700 font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Anzahl
                        </label>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "quantity",
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          className="text-center"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Preis (optional)
                        </label>
                        <Input
                          type="number"
                          value={item.price ?? ""}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "price",
                              Math.max(0, parseFloat(e.target.value) || 0)
                            )
                          }
                          className="text-center"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Datum
                        </label>
                        <Input
                          type="date"
                          value={
                            item.date ?? new Date().toISOString().split("T")[0]
                          }
                          onChange={(e) =>
                            updateItem(index, "date", e.target.value)
                          }
                          className="text-center"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t pt-4 space-y-3">
                {/* 🔹 Globaler Inhouse Share & KW */}
                <div className="flex flex-wrap gap-6 items-center">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Inhouse Share (%){" "}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={inhouseShare}
                      onChange={(e) =>
                        setInhouseShare(
                          Math.max(0, parseFloat(e.target.value) || 0)
                        )
                      }
                      className="text-center w-24"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Kalenderwoche
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={53}
                      value={selectedWeek}
                      onChange={(e) =>
                        setSelectedWeek(Number(e.target.value))
                      }
                      className="text-center w-24"
                    />
                  </div>
                </div>

                <p className="text-sm mt-2 text-gray-600 italic">
                  Gilt automatisch für alle Produkte in dieser Meldung.
                </p>

                <p className="text-sm">
                  <span className="font-semibold">Gesamtmenge:</span>{" "}
                  {totalQuantity} Stück
                </p>

                <p className="text-sm">
                  <span className="font-semibold">Gesamtumsatz:</span>{" "}
                  {totalAmount.toLocaleString("de-CH", {
                    style: "currency",
                    currency: "CHF",
                  })}
                </p>

                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  {loading ? "⏳ Sende..." : "✅ Verkauf melden"}
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

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
import { HandCoins } from "lucide-react";
import { toast } from "sonner";
import { submitGroupedItems } from "@/lib/submitGroupedItems";

// Farb-Theme Support
const supportColor = {
  text: "text-teal-700",
  bg: "bg-teal-600",
  bgHover: "hover:bg-teal-700",
};

export default function CartSupport() {
  const dealer = useDealer();
  const { getItems, removeItem, clearCart, addItem, state, closeCart } =
    useCart();

  const items = getItems("support");
  const open = state.open && state.currentForm === "support";

  /** Lokale FormDetails (Provider speichert keine Details) */
  const [formDetails, setFormDetails] = useState<{
    type: string;
    comment: string;
  }>({
    type: "",
    comment: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /** Betrag berechnen */
  const totalBetrag = items.reduce(
    (s, i) =>
      s + (Number(i.supportbetrag) || 0) * (Number(i.quantity) || 1),
    0
  );

  /** Submit nur möglich wenn Typ gesetzt + Items vorhanden */
  const canSubmit = items.length > 0 && formDetails.type;

  /** ------------------------------------------------------------
   * Items aktualisieren wie bei Cashback (kein updateItem im Provider!)
   * ------------------------------------------------------------ */
  const updateLocalItem = (index: number, updatedItem: any) => {
    const list = [...items];
    list[index] = updatedItem;

    clearCart("support");
    list.forEach((i) => addItem("support", i));
  };

  /** ------------------------------------------------------------
   * Absenden
   * ------------------------------------------------------------ */
  const submitSupport = async () => {
    if (!dealer?.dealer_id) {
      toast.error("Kein Händler gefunden.");
      return;
    }
    if (!canSubmit) {
      toast.error("Bitte Support-Typ und Produkte auswählen.");
      return;
    }

    setLoading(true);

    try {
      await submitGroupedItems({
        typ: "support",
        dealer,
        items: items.map((i) => ({
          ...i,
          quantity: Number(i.quantity) || 1,
          supportbetrag: Number(i.supportbetrag) || 0,
        })),
        meta: {
          support_type: formDetails.type,
          comment: formDetails.comment || "",
        },
      });

      clearCart("support");
      setSuccess(true);
      toast.success("Support-Antrag erfolgreich gespeichert");
    } catch (err: any) {
      toast.error("Fehler beim Speichern", {
        description: err.message,
      });
    }

    setLoading(false);
  };

  return (
    <Sheet open={open} onOpenChange={closeCart}>
      <SheetContent side="right" className="w-full sm:w-[600px] flex flex-col">
        {/* HEADER */}
        <SheetHeader>
          <SheetTitle className={`flex items-center gap-2 ${supportColor.text}`}>
            <HandCoins className="w-5 h-5" />
            Support-Antrag
          </SheetTitle>
        </SheetHeader>

        {/* Händlerinfo */}
        {dealer && (
          <div className="mb-4">
            <DealerInfoCompact dealer={dealer} />
          </div>
        )}

        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
            <p className="text-teal-700 font-semibold text-lg">
              🎉 Support-Antrag gespeichert!
            </p>

            <p className="text-sm text-gray-700">
              Gesamtbetrag: <b>{totalBetrag} CHF</b>
            </p>

            <SheetClose asChild>
              <Button className={`${supportColor.bg} text-white`}>
                Schließen
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            {/* FORMDETAILS: Support-Typ + Kommentar */}
            <div className="border rounded-xl p-4 mb-4 bg-gray-50 space-y-3">
              <label className="text-sm font-semibold">Support-Typ</label>
              <select
                className="w-full border rounded px-2 py-1"
                value={formDetails.type}
                onChange={(e) =>
                  setFormDetails((d) => ({ ...d, type: e.target.value }))
                }
              >
                <option value="">Bitte wählen…</option>
                <option value="sellout">Sell-Out Support</option>
                <option value="custom">Individueller Support</option>
              </select>

              <label className="text-sm font-semibold">Kommentar</label>
              <Input
                type="text"
                value={formDetails.comment}
                onChange={(e) =>
                  setFormDetails((d) => ({ ...d, comment: e.target.value }))
                }
                placeholder="Optionaler Kommentar"
              />
            </div>

            {/* PRODUKTE */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.length === 0 ? (
                <p className="text-gray-500">Noch keine Support-Positionen.</p>
              ) : (
                items.map((item, index) => (
                  <div
                    key={index}
                    className="border rounded-xl p-3 bg-white shadow space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {item.product_name || item.sony_article}
                        </p>
                        <p className="text-xs text-gray-500">EAN: {item.ean}</p>
                      </div>

                      <button
                        onClick={() => removeItem("support", index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Menge & Betrag */}
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity ?? 1}
                        onChange={(e) =>
                          updateLocalItem(index, {
                            ...item,
                            quantity: Number(e.target.value),
                          })
                        }
                        className="text-center"
                      />

                      <Input
                        type="number"
                        min={0}
                        value={item.supportbetrag ?? 0}
                        onChange={(e) =>
                          updateLocalItem(index, {
                            ...item,
                            supportbetrag: Number(e.target.value),
                          })
                        }
                        className="text-center"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* SUMME + ABSENDEN */}
            {items.length > 0 && (
              <div className="border-t pt-4 space-y-3">
                <p className="text-sm">
                  <b>Supportbetrag gesamt:</b>{" "}
                  <span className={supportColor.text}>{totalBetrag} CHF</span>
                </p>

                <Button
                  onClick={submitSupport}
                  disabled={loading || !canSubmit}
                  className={`w-full ${supportColor.bg} ${supportColor.bgHover} text-white font-semibold`}
                >
                  {loading ? "Wird gesendet…" : "Support absenden"}
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

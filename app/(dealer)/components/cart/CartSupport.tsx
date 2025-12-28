"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { useCart } from "@/app/(dealer)/GlobalCartProvider";

type SupportItem = {
  product_id?: string;
  product_name?: string;
  sony_article?: string;
  ean?: string;
  quantity?: number;
  supportbetrag?: number;
};

export default function CartSupport() {
  const { state, getItems, updateItem, clearCart, closeCart } = useCart();

  const cart = getItems("support") as SupportItem[];
  const open = state.open && state.currentForm === "support";

  const [details, setDetails] = useState<{
    type: "sellout" | "custom" | "";
    comment: string;
  }>({ type: "", comment: "" });

  const [loading, setLoading] = useState(false);

  const totalBetrag = useMemo(
    () =>
      cart.reduce(
        (s, i) =>
          s +
          (Number(i.supportbetrag) || 0) *
            (Number(i.quantity) || 1),
        0
      ),
    [cart]
  );

  const handleSubmit = async () => {
    if (!details.type) {
      toast.error("Bitte Support-Typ auswählen.");
      return;
    }

    if (cart.length === 0) {
      toast.error("Keine Support-Positionen vorhanden.");
      return;
    }

    const invalid = cart.some(
      (i) =>
        !Number(i.quantity) ||
        Number(i.quantity) <= 0 ||
        !Number(i.supportbetrag) ||
        Number(i.supportbetrag) <= 0
    );

    if (invalid) {
      toast.error("Bitte Menge und Supportbetrag korrekt ausfüllen.");
      return;
    }

    setLoading(true);

    try {
      await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // ❗ dealer_id kommt NUR aus dem Cookie (acting_dealer_id)
          items: cart.map((i) => ({
            ...i,
            quantity: Number(i.quantity) || 1,
            supportbetrag: Number(i.supportbetrag) || 0,
          })),
          meta: {
            support_type: details.type,
            comment: details.comment || "",
          },
        }),
      });

      clearCart("support");
      toast.success("Support-Antrag erfolgreich gespeichert");
      closeCart();
    } catch (err: any) {
      toast.error("Fehler beim Speichern", {
        description: err?.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) closeCart();
      }}
    >
      <SheetContent side="right" className="w-full sm:w-[600px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Support senden</SheetTitle>
        </SheetHeader>

        {/* META */}
        <div className="border rounded-xl p-4 bg-gray-50 space-y-3 mt-4">
          <label className="text-sm font-semibold">Support-Typ</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={details.type}
            onChange={(e) =>
              setDetails((d) => ({
                ...d,
                type: e.target.value as "sellout" | "custom",
              }))
            }
          >
            <option value="">Bitte wählen…</option>
            <option value="sellout">Sell-Out Support</option>
            <option value="custom">Individueller Support</option>
          </select>

          <label className="text-sm font-semibold">Kommentar</label>
          <Input
            value={details.comment}
            onChange={(e) =>
              setDetails((d) => ({ ...d, comment: e.target.value }))
            }
            placeholder="Optionaler Kommentar"
          />
        </div>

        {/* ITEMS */}
        <div className="flex-1 overflow-y-auto space-y-4 mt-4">
          {cart.map((item, index) => (
            <div
              key={item.product_id ?? index}
              className="border rounded-xl p-3 bg-white shadow space-y-2"
            >
              <p className="font-semibold">
                {item.product_name || item.sony_article}
              </p>
              <p className="text-xs text-gray-500">EAN: {item.ean}</p>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  min={1}
                  value={item.quantity ?? 1}
                  onChange={(e) =>
                    updateItem("support", index, {
                      quantity: Number(e.target.value),
                    })
                  }
                />

                <Input
                  type="number"
                  min={0}
                  value={item.supportbetrag ?? 0}
                  onChange={(e) =>
                    updateItem("support", index, {
                      supportbetrag: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        {cart.length > 0 && (
          <div className="border-t pt-4 space-y-3">
            <p className="text-sm">
              <b>Supportbetrag gesamt:</b>{" "}
              {totalBetrag.toLocaleString("de-CH", {
                style: "currency",
                currency: "CHF",
              })}
            </p>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            >
              {loading ? "Wird gesendet…" : "Support absenden"}
            </Button>

            <SheetClose asChild>
              <Button variant="outline" onClick={closeCart}>
                Abbrechen
              </Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

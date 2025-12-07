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
import { ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { submitGroupedItems } from "@/lib/submitGroupedItems";

export default function CartProjekt() {
  const dealer = useDealer();
  const { state, getItems, removeItem, clearCart, closeCart } = useCart();

  const items = getItems("projekt");
  const open = state.open && state.currentForm === "projekt";

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Projekt-Stammdaten (werden idealerweise von außen gesetzt)
  const [details, setDetails] = useState({
    type: "",
    name: "",
    customer: "",
    location: "",
    start: "",
    end: "",
    comment: "",
  });

  // Falls zukünftig Form-Komponenten Details in den Cart schreiben sollen:
  const patchDetails = (patch: Partial<typeof details>) =>
    setDetails((prev) => ({ ...prev, ...patch }));

  const canSubmit =
    items.length > 0 &&
    details.type &&
    details.name &&
    details.customer &&
    details.location;

  const submitProject = async () => {
    if (!dealer?.dealer_id) {
      toast.error("Kein Händler geladen.");
      return;
    }

    if (!canSubmit) {
      toast.error("Bitte alle Pflichtfelder im Projektformular ausfüllen.");
      return;
    }

    setLoading(true);
    try {
      // 1) Projekt-Stammdaten speichern
      const res = await fetch("/api/projects", {
        method: "POST",
        body: JSON.stringify({
          dealer_id: dealer.dealer_id,
          login_nr: dealer.login_nr,
          project_type: details.type,
          project_name: details.name,
          customer: details.customer,
          location: details.location,
          start_date: details.start || null,
          end_date: details.end || null,
          comment: details.comment,
        }),
      });

      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Fehler beim Speichern des Projekts.");
      }

      const { id: project_id } = await res.json();

      // 2) Produkte speichern
      await submitGroupedItems({
        typ: "projekt",
        dealer,
        items: items.map((p: any) => ({
          ...p,
          quantity: Number(p.quantity) || 1,
          price: Number(p.price) || 0,
        })),
        meta: {
          project_id,
          ...details,
        },
      });

      setSuccess(true);
      clearCart("projekt");
      toast.success("Projekt erfolgreich gespeichert");
    } catch (err: any) {
      toast.error("Fehler beim Speichern", {
        description: err.message,
      });
    }

    setLoading(false);
  };

  const totalQuantity = items.reduce(
    (s: number, i: any) => s + (Number(i.quantity) || 0),
    0
  );
  const totalPrice = items.reduce(
    (s: number, i: any) =>
      s + (Number(i.quantity) || 0) * (Number(i.price) || 0),
    0
  );

  return (
    <Sheet open={open} onOpenChange={closeCart}>
      <SheetContent side="right" className="w-full sm:w-[600px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-purple-700">
            <ClipboardList className="w-5 h-5" />
            Projektanfrage absenden
          </SheetTitle>
        </SheetHeader>

        {/* Händlerinfo */}
        {dealer && (
          <div className="mb-4">
            <DealerInfoCompact dealer={dealer} />
          </div>
        )}

        {/* Erfolg */}
        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <p className="text-purple-700 font-semibold text-lg">
              🎉 Projekt gespeichert!
            </p>

            <div className="text-sm text-gray-700 space-y-1">
              {details.name && <p>🏗️ {details.name}</p>}
              {details.customer && <p>👤 {details.customer}</p>}
              {details.location && <p>📍 {details.location}</p>}
              {details.type && <p>📁 {details.type}</p>}
            </div>

            <SheetClose asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Schließen
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            {/* PRODUKTLISTE */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.length === 0 ? (
                <p className="text-gray-500">Noch keine Produkte im Projekt.</p>
              ) : (
                items.map((item: any, index: number) => (
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
                        onClick={() => removeItem("projekt", index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center">
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity ?? 1}
                        onChange={(e) =>
                          (item.quantity = Number(e.target.value))
                        }
                        className="text-center"
                      />

                      <Input
                        type="number"
                        value={item.price ?? ""}
                        onChange={(e) =>
                          (item.price = Number(e.target.value))
                        }
                        className="text-center"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* SUMMEN + ABSENDEN */}
            {items.length > 0 && (
              <div className="border-t pt-4 space-y-3">
                <p className="text-sm">
                  <b>Menge:</b> {totalQuantity}
                </p>
                <p className="text-sm">
                  <b>Preis Total:</b> CHF {totalPrice.toFixed(0)}
                </p>

                <Button
                  disabled={loading}
                  onClick={submitProject}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                >
                  {loading ? "Wird gesendet…" : "Projekt absenden"}
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

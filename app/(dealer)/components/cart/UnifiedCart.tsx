"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DealerInfoCompact from "@/app/(dealer)/components/DealerInfoCompact";
import { toast } from "sonner";
import { useDealer } from "@/app/(dealer)/DealerContext";
import { CheckCircle2, Trash2 } from "lucide-react";

/* -------------------------------------------------------
   UNIFIED CART PROPS — jetzt mit "extra"
------------------------------------------------------- */

export type UnifiedCartProps = {
  mode: "bestellung" | "projekt" | "verkauf" | "support" | "sofortrabatt";
  cart: any[];
  setCart: (fn: (prev: any[]) => any[]) => void;

  /** Form-spezifische Zusatzdaten (Projektinfos, Support-Details usw.) */
  details?: Record<string, any>;

  /** Verkaufsspezifische Zusatzinfos (KW, inHouseShare etc.) */
  extra?: Record<string, any>;

  /** Wird nach erfolgreichem Speichern ausgeführt */
  onSuccess: () => void;

  /** Sichtbarkeit */
  open: boolean;
  setOpen: (o: boolean) => void;
};

/* -------------------------------------------------------
   MODE → Anzeigeeinstellungen
------------------------------------------------------- */

const modeConfig = {
  bestellung: {
    title: "Bestellung abschicken",
    color: "text-blue-700",
    bg: "bg-blue-600 hover:bg-blue-700",
    btn: "border-blue-600 text-blue-700 hover:bg-blue-50",
  },
  projekt: {
    title: "Projektanfrage senden",
    color: "text-purple-700",
    bg: "bg-purple-600 hover:bg-purple-700",
    btn: "border-purple-600 text-purple-700 hover:bg-purple-50",
  },
  verkauf: {
    title: "Verkäufe melden",
    color: "text-green-700",
    bg: "bg-green-600 hover:bg-green-700",
    btn: "border-green-600 text-green-700 hover:bg-green-50",
  },
  support: {
    title: "Support senden",
    color: "text-amber-700",
    bg: "bg-amber-600 hover:bg-amber-700",
    btn: "border-amber-600 text-amber-700 hover:bg-amber-50",
  },
  sofortrabatt: {
    title: "Sofortrabatt beantragen",
    color: "text-red-700",
    bg: "bg-red-600 hover:bg-red-700",
    btn: "border-red-600 text-red-700 hover:bg-red-50",
  },
};

/* -------------------------------------------------------
   UNIFIED CART IMPLEMENTATION — mit extra
------------------------------------------------------- */

export default function UnifiedCart({
  mode,
  cart,
  setCart,
  details = {},
  extra = {},
  onSuccess,
  open,
  setOpen,
}: UnifiedCartProps) {
  const dealer = useDealer();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const cfg = modeConfig[mode];

  useEffect(() => {
    if (cart.length > 0) setSuccess(false);
  }, [cart.length]);

  /* ---------------------------------------
     UPDATE & REMOVE
  --------------------------------------- */

  const updateItem = (index: number, field: string, value: any) => {
    setCart((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const removeItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---------------------------------------
     MODE-SPEZIFISCHE SPEICHERLOGIK
     extra wird hier hinzugefügt!
  --------------------------------------- */

  const handleSubmit = async () => {
    if (!dealer?.dealer_id) {
      toast.error("Kein Händler gefunden – bitte neu einloggen.");
      return;
    }
    if (cart.length === 0) {
      toast.error("Keine Produkte im Warenkorb.");
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, any> = {
        dealer,
        items: cart,
        details,
      };

      if (mode === "verkauf") {
        payload.extra = extra; // 🔥 Verkauf nutzt jetzt "extra"
      }

      const endpoint = {
        bestellung: "/api/bestellung",
        projekt: "/api/projekt",
        verkauf: "/api/verkauf",
        support: "/api/support",
        sofortrabatt: "/api/sofortrabatt",
      }[mode];

      const res = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Einreichung fehlgeschlagen");

      setSuccess(true);
      onSuccess();
      setCart(() => []);
      toast.success("Erfolgreich gesendet!");
    } catch (err: any) {
      toast.error(err.message || "Fehler beim Speichern");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------
     RENDER
------------------------------------------------------- */

  const successUI = (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
      <CheckCircle2 className="w-12 h-12 text-green-600" />
      <p className="text-green-700 font-semibold text-lg">
        Erfolgreich gespeichert!
      </p>

      <SheetClose asChild>
        <Button className={`${cfg.bg} text-white`}>Schließen</Button>
      </SheetClose>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* FLOATING BUTTON */}
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 ${cfg.btn} shadow-lg`}
        >
          {cfg.title} {cart.length ? `(${cart.length})` : ""}
        </Button>
      </SheetTrigger>

      {/* PANEL */}
      <SheetContent
        side="right"
        className="w-full sm:w-[600px] flex flex-col"
      >
        <SheetHeader>
          <SheetTitle className={`flex items-center gap-2 ${cfg.color}`}>
            {cfg.title}
          </SheetTitle>
        </SheetHeader>

        {/* Händlerinfo */}
        {dealer && (
          <div className="mb-4">
            <DealerInfoCompact dealer={dealer} />
          </div>
        )}

        {/* Erfolgsscreen */}
        {success ? (
          successUI
        ) : (
          <>
            {/* CART ITEMS */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cart.length === 0 ? (
                <p className="text-gray-500">Noch keine Produkte ausgewählt.</p>
              ) : (
                cart.map((item, i) => (
                  <div
                    key={i}
                    className="border p-4 rounded-xl bg-white shadow-sm space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">
                          {item.product_name ?? item.sony_article}
                        </p>
                        <p className="text-xs text-gray-500">EAN: {item.ean}</p>
                      </div>
                      <button
                        onClick={() => removeItem(i)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Menge */}
                    {"quantity" in item && (
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity || 1}
                        onChange={(e) =>
                          updateItem(
                            i,
                            "quantity",
                            Math.max(1, parseInt(e.target.value))
                          )
                        }
                        className="text-center"
                      />
                    )}

                    {/* Preis / Target-Preis */}
                    {mode !== "verkauf" && "price" in item && (
                      <Input
                        type="number"
                        value={item.price ?? ""}
                        onChange={(e) =>
                          updateItem(
                            i,
                            "price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="Preis"
                        className="text-center"
                      />
                    )}

                    {/* Seriennummer (Sofortrabatt) */}
                    {mode === "sofortrabatt" && (
                      <Input
                        type="text"
                        placeholder="Seriennummer"
                        value={item.seriennummer ?? ""}
                        onChange={(e) =>
                          updateItem(i, "seriennummer", e.target.value)
                        }
                      />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* ABSENDEN */}
            {cart.length > 0 && (
              <div className="border-t pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`w-full ${cfg.bg} text-white font-semibold`}
                >
                  {loading ? "Bitte warten…" : cfg.title}
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

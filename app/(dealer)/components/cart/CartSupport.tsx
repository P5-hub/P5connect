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
import { FileText, Trash2 } from "lucide-react";

type SupportItem = {
  product_id?: string | number;
  product_name?: string;
  sony_article?: string;
  ean?: string;
  quantity?: number;
  supportbetrag?: number;
};

export default function CartSupport() {
  const {
    state,
    getItems,
    updateItem,
    clearCart,
    closeCart,
    orderDetails,
    setOrderDetails,
    clearOrderFiles,
  } = useCart();

  const cart = (getItems("support") as SupportItem[]) ?? [];
  const open = state.open && state.currentForm === "support";

  const files = orderDetails?.support_files ?? [];

  const [details, setDetails] = useState<{
    type: "sellout" | "marketing" | "event" | "other" | "";
    comment: string;
  }>({ type: "", comment: "" });

  const [loading, setLoading] = useState(false);

  const totalBetrag = useMemo(
    () =>
      cart.reduce(
        (s, i) =>
          s + (Number(i.supportbetrag) || 0) * (Number(i.quantity) || 1),
        0
      ),
    [cart]
  );

  const removeSupportFile = () => {
    setOrderDetails((prev) => ({ ...prev, support_files: [] }));
    toast.success("Beleg entfernt");
  };

  const handleSubmit = async () => {
    if (!details.type) {
      toast.error("Bitte Support-Typ auswählen.");
      return;
    }

    // Sellout braucht Items
    if (details.type === "sellout" && cart.length === 0) {
      toast.error("Keine Support-Positionen vorhanden.");
      return;
    }

    // Sellout validieren
    if (details.type === "sellout") {
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
    }

    // optional: aktuell 1 File
    if (files.length > 1) {
      toast.error("Bitte nur 1 Beleg anhängen (aktuell).");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        // dealer_id muss nicht zwingend, API nimmt Cookie
        items:
          details.type === "sellout"
            ? cart.map((i) => ({
                ...i,
                quantity: Number(i.quantity) || 1,
                supportbetrag: Number(i.supportbetrag) || 0,
              }))
            : [],
        meta: {
          support_type: details.type,
          comment: details.comment || "",
        },
      };

      const fd = new FormData();
      fd.append("payload", JSON.stringify(payload));

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

      clearCart("support");
      clearOrderFiles?.("support");
      setDetails({ type: "", comment: "" });

      toast.success("Support-Antrag erfolgreich gespeichert");
      closeCart();
    } catch (err: any) {
      toast.error("Fehler beim Speichern", {
        description: err?.message ?? "Unbekannter Fehler",
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
                type: e.target.value as any,
              }))
            }
          >
            <option value="">Bitte wählen…</option>
            <option value="sellout">Sell-Out</option>
            <option value="marketing">Werbung</option>
            <option value="event">Event</option>
            <option value="other">Sonstiges</option>
          </select>

          <label className="text-sm font-semibold">Kommentar</label>
          <Input
            value={details.comment}
            onChange={(e) =>
              setDetails((d) => ({ ...d, comment: e.target.value }))
            }
            placeholder="Optionaler Kommentar"
          />

          {/* FILE */}
          <div className="pt-2">
            <label className="text-sm font-semibold">Beleg / Nachweis</label>

            {files.length === 0 ? (
              <p className="text-xs text-gray-500 mt-1">Kein Beleg ausgewählt.</p>
            ) : (
              <div className="mt-2 text-sm border rounded-lg p-2 bg-white flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="truncate">{files[0].name}</span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={removeSupportFile}
                  title="Beleg entfernen"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ITEMS */}
        <div className="flex-1 overflow-y-auto space-y-4 mt-4">
          {details.type !== "sellout" ? (
            <div className="text-sm text-gray-600 border rounded-xl p-3 bg-white">
              Für <b>{details.type || "Non-Sellout"}</b> werden aktuell keine
              Produkte benötigt.
            </div>
          ) : cart.length === 0 ? (
            <p className="text-sm text-gray-500">Noch keine Produkte im Support.</p>
          ) : (
            cart.map((item, index) => (
              <div
                key={String(item.product_id ?? index)}
                className="border rounded-xl p-3 bg-white shadow space-y-2"
              >
                <p className="font-semibold">
                  {item.product_name || item.sony_article || "Unbekannt"}
                </p>
                <p className="text-xs text-gray-500">EAN: {item.ean || "-"}</p>

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity ?? 1}
                    onChange={(e) =>
                      updateItem("support", index, {
                        quantity: Number(e.target.value) || 1,
                      })
                    }
                  />

                  <Input
                    type="number"
                    min={0}
                    value={item.supportbetrag ?? 0}
                    onChange={(e) =>
                      updateItem("support", index, {
                        supportbetrag: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        {(cart.length > 0 || details.type !== "") && (
          <div className="border-t pt-4 space-y-3">
            {details.type === "sellout" && cart.length > 0 && (
              <p className="text-sm">
                <b>Supportbetrag gesamt:</b>{" "}
                {totalBetrag.toLocaleString("de-CH", {
                  style: "currency",
                  currency: "CHF",
                })}
              </p>
            )}

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
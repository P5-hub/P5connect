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
import { getSupabaseBrowser } from "@/lib/supabaseClient";

const sofortrabattColor = {
  text: "text-orange-700",
  bg: "bg-orange-600",
  bgHover: "hover:bg-orange-700",
  border: "border-orange-600",
};

export default function CartSofortrabatt() {
  const dealer = useDealer();
  const supabase = getSupabaseBrowser();

  const { state, getItems, removeItem, clearCart, addItem, closeCart } = useCart();

  const items = getItems("sofortrabatt");
  const open = state.open && state.currentForm === "sofortrabatt";

  /** ✔ Lokale Details (weil Provider keine globalen Formdetails hat) */
  const [details, setDetails] = useState({
    rabattLevel: 1,
  });

  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Rabatt abhängig vom Level
  const getRabattForItem = (item: any): number => {
    switch (details.rabattLevel) {
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

  const canSubmit = items.length > 0 && invoiceFile;

  /** --------------------------------------------------
   *  ✔ Seriennummer aktualisieren (Provider hat kein updateItem)
   * -------------------------------------------------- */
  const updateSerial = (index: number, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], seriennummer: value };

    clearCart("sofortrabatt");
    updated.forEach((it) => addItem("sofortrabatt", it));
  };

  /** --------------------------------------------------
   *  Absenden
   * -------------------------------------------------- */
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
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Kein User gefunden.");

      const filePath = `${user.id}/sofort-${Date.now()}-${invoiceFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("sofortrabatt-invoices")
        .upload(filePath, invoiceFile);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("sofortrabatt_claims").insert([
        {
          rabatt_level: details.rabattLevel,
          rabatt_betrag: totalRabatt,
          document_path: filePath,
          status: "pending",
          seriennummer: items.map((i: any) => i.seriennummer || null).join(","),
        },
      ]);

      if (insertError) throw insertError;

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

  // UI
  return (
    <Sheet open={open} onOpenChange={closeCart}>
      <SheetContent side="right" className="w-full sm:w-[600px] flex flex-col">
        <SheetHeader>
          <SheetTitle className={`flex items-center gap-2 ${sofortrabattColor.text}`}>
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
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
            <p className="text-orange-700 font-semibold text-lg">
              🎉 Sofortrabatt erfolgreich gespeichert!
            </p>
            <p className="text-sm text-gray-600">
              Gesamtbetrag: <b>{totalRabatt} CHF</b>
            </p>

            <SheetClose asChild>
              <Button className={`${sofortrabattColor.bg} text-white`}>Schließen</Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.length === 0 ? (
                <p className="text-gray-500">Noch keine Produkte ausgewählt.</p>
              ) : (
                items.map((item: any, index: number) => (
                  <div key={index} className="border rounded-xl p-3 bg-white shadow space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {item.product_name || item.sony_article || "-"}
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
                      <b className={sofortrabattColor.text}>{getRabattForItem(item)} CHF</b>
                    </p>

                    <Input
                      type="text"
                      placeholder="Seriennummer"
                      value={item.seriennummer || ""}
                      onChange={(e) => updateSerial(index, e.target.value)}
                    />
                  </div>
                ))
              )}
            </div>

            <div className="border-t pt-4 space-y-2">
              <label className="block text-sm font-medium mb-2">Rechnung hochladen</label>

              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
              />
            </div>

            {items.length > 0 && (
              <div className="border-t pt-4 space-y-3">
                <p className="text-sm">
                  Gesamt-Rabatt:{" "}
                  <b className={sofortrabattColor.text}>{totalRabatt} CHF</b>
                </p>

                <Button
                  onClick={handleSubmit}
                  disabled={loading || !canSubmit}
                  className={`w-full ${sofortrabattColor.bg} ${sofortrabattColor.bgHover} text-white font-semibold`}
                >
                  {loading ? "Wird gesendet…" : "Sofortrabatt absenden"}
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

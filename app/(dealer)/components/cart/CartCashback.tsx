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
import { BadgeDollarSign } from "lucide-react";
import { toast } from "sonner";
import { getSupabaseBrowser } from "@/lib/supabaseClient";

const cashbackColor = {
  text: "text-blue-700",
  bg: "bg-blue-600",
  bgHover: "hover:bg-blue-700",
};

export default function CartCashback() {
  const dealer = useDealer();
  const supabase = getSupabaseBrowser();

  const { state, getItems, removeItem, clearCart, addItem, closeCart } =
    useCart();

  const items = getItems("cashback");
  const open = state.open && state.currentForm === "cashback";

  /** Lokale FormDetails (Provider hat keine) */
  const [formDetails] = useState<{ cashbackType: "single" | "double" }>({
    cashbackType: "single",
  });

  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /** Cashback pro Produkt */
  const getCashbackForItem = (item: any) => {
    return formDetails.cashbackType === "single"
      ? Number(item.cashback_single || 0)
      : Number(item.cashback_double || 0);
  };

  const totalCashback = items.reduce(
    (sum, item) => sum + getCashbackForItem(item),
    0
  );

  /** Update eines Items (Provider hat kein updateItem) */
  const updateLocalItem = (index: number, updatedItem: any) => {
    const list = [...items];
    list[index] = updatedItem;

    clearCart("cashback");
    list.forEach((i) => addItem("cashback", i));
  };

  /** Absenden */
  const handleSubmit = async () => {
    if (!dealer?.dealer_id) {
      toast.error("Kein Händler gefunden.");
      return;
    }

    if (!documentFile) {
      toast.error("Bitte Kaufbeleg hochladen.");
      return;
    }

    if (items.length === 0) {
      toast.error("Keine Produkte ausgewählt.");
      return;
    }

    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error("Kein User gefunden.");

      const userId = userData.user.id;

      // Datei speichern
      const filePath = `${userId}/cashback-${Date.now()}-${documentFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("cashback-documents")
        .upload(filePath, documentFile);

      if (uploadError) throw uploadError;

      /** REQUIRED: gemeinsame submission_id */
      const submissionId = Date.now();

      // Für jedes Produkt einen Cashback-Claim anlegen
      for (const item of items) {
        const cashback = getCashbackForItem(item);

        const { error: insertError } = await supabase
          .from("cashback_claims")
          .insert([
            {
              submission_id: submissionId, // 📌 REQUIRED FIX

              cashback_betrag: cashback,
              cashback_type: formDetails.cashbackType,
              status: "pending",
              document_path: filePath,

              // Produktspezifisch
              seriennummer: item.seriennummer || null,
              soundbar_ean:
                formDetails.cashbackType === "double"
                  ? item.soundbar_ean || null
                  : null,
              seriennummer_sb:
                formDetails.cashbackType === "double"
                  ? item.seriennummer_sb || null
                  : null,
            },
          ]);

        if (insertError) throw insertError;
      }

      setSuccess(true);
      clearCart("cashback");
      toast.success("Cashback-Antrag erfolgreich gespeichert.");
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
        <SheetHeader>
          <SheetTitle className={`flex items-center gap-2 ${cashbackColor.text}`}>
            <BadgeDollarSign className="w-5 h-5" />
            Cashback beantragen
          </SheetTitle>
        </SheetHeader>

        {dealer && (
          <div className="mb-4">
            <DealerInfoCompact dealer={dealer} />
          </div>
        )}

        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
            <p className="text-blue-600 font-semibold text-lg">
              🎉 Cashback-Antrag gespeichert!
            </p>
            <p className="text-sm text-gray-700">
              Gesamt: <b>{totalCashback} CHF</b>
            </p>

            <SheetClose asChild>
              <Button className={`${cashbackColor.bg} text-white`}>Schließen</Button>
            </SheetClose>
          </div>
        ) : (
          <>
            {/* PRODUKT-LISTE */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.length === 0 ? (
                <p className="text-gray-500">Noch keine Produkte ausgewählt.</p>
              ) : (
                items.map((item, index) => (
                  <div
                    key={index}
                    className="border rounded-xl p-3 bg-white shadow space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {item.product_name || item.sony_article || "-"}
                        </p>
                        <p className="text-xs text-gray-500">EAN: {item.ean}</p>
                      </div>

                      <button
                        onClick={() => removeItem("cashback", index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Cashback-Wert */}
                    <p className="text-sm">
                      Cashback:{" "}
                      <b className={cashbackColor.text}>
                        {getCashbackForItem(item)} CHF
                      </b>
                    </p>

                    {/* Seriennummer */}
                    <Input
                      type="text"
                      placeholder="Seriennummer"
                      value={item.seriennummer || ""}
                      onChange={(e) =>
                        updateLocalItem(index, {
                          ...item,
                          seriennummer: e.target.value,
                        })
                      }
                    />
                  </div>
                ))
              )}
            </div>

            {/* Datei Upload */}
            <div className="border-t pt-4 space-y-2">
              <label className="text-sm font-medium">Kaufbeleg hochladen</label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
              />
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t pt-4 space-y-3">
                <p className="text-sm">
                  Gesamt: <b className={cashbackColor.text}>{totalCashback} CHF</b>
                </p>

                <Button
                  disabled={!documentFile || loading}
                  onClick={handleSubmit}
                  className={`w-full ${cashbackColor.bg} ${cashbackColor.bgHover} text-white font-semibold`}
                >
                  {loading ? "Wird gesendet…" : "Cashback absenden"}
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

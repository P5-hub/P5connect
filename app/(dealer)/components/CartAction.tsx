"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useDealer } from "@/app/(dealer)/DealerContext";
import { CheckCircle2, Trash2, Loader2 } from "lucide-react";

interface CartActionProps {
  cart: any[];
  setCart: (items: any[]) => void;
  onSubmitSuccess: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function CartAction({
  cart,
  setCart,
  onSubmitSuccess,
  open,
  setOpen,
}: CartActionProps) {
  const supabase = createClient();
  const dealer = useDealer();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRemove = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!dealer) {
      alert("Kein Händler erkannt – bitte neu anmelden.");
      return;
    }
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const { data: submission, error } = await supabase
        .from("submissions")
        .insert([
          {
            dealer_id: dealer.dealer_id,
            typ: "aktion",
            status: "neu",
            kommentar: "Teilnahme an Monatsaktion / Promotion",
          },
        ])
        .select("submission_id")
        .single();

      if (error) throw error;

      const submissionId = submission.submission_id;

      const items = cart.map((offer) => ({
        submission_id: submissionId,
        product_id: offer.product_id || offer.id,
        menge: 1,
        preis: offer.promotion_price || 0,
        kommentar: offer.title || "Aktionsteilnahme",
      }));

      const { error: itemsError } = await supabase
        .from("submission_items")
        .insert(items);

      if (itemsError) throw itemsError;

      setSuccess(true);
      setCart([]);
      onSubmitSuccess();

      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
      }, 2000);
    } catch (e: any) {
      console.error("❌ Fehler beim Speichern der Aktion:", e);
      alert("Aktion konnte nicht gespeichert werden.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-lg font-semibold mb-3">🛒 Aktionen-Warenkorb</h3>

        {cart.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Noch keine Aktionen ausgewählt.
          </p>
        ) : (
          <ul className="divide-y">
            {cart.map((item, i) => (
              <li
                key={i}
                className="flex justify-between items-center py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{item.title || item.name}</p>
                  {item.promotion_price && (
                    <p className="text-gray-500">
                      Aktionspreis: CHF {item.promotion_price.toFixed(2)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(i)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => setOpen(false)}
            className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
          >
            Schließen
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || cart.length === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 text-sm rounded-md disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" /> Wird gesendet...
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Gespeichert!
              </>
            ) : (
              "Teilnahme senden"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import DealerInfoCompact from "@/app/(dealer)/components/DealerInfoCompact";
import { toast } from "sonner";
import { Tag } from "lucide-react";
import { Product } from "@/types/Product";
import { useDealer } from "@/app/(dealer)/DealerContext";
import { getThemeByForm } from "@/lib/theme/ThemeContext";

type CartItem = Product & {
  seriennummer?: string;
  sofortrabatt_amount?: number;
  sofortrabatt_double_amount?: number;
  sofortrabatt_triple_amount?: number;
};

export default function CartSofortrabatt({
  cart,
  setCart,
  onSuccess,
  open,
  setOpen,
}: {
  cart: CartItem[];
  setCart: (fn: (prev: CartItem[]) => CartItem[]) => void;
  onSuccess: () => void;
  open: boolean;
  setOpen: (o: boolean) => void;
}) {
  const dealer = useDealer();
  const supabase = getSupabaseBrowser();
  const theme = getThemeByForm("sofortrabatt");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

  // -------------------------------------------------------
  // Rabatt-Level bestimmen
  // -------------------------------------------------------
  const getRabattLevel = (): 1 | 2 | 3 => {
    const len = cart.length;
    if (len === 1) return 1;
    if (len === 2) return 2;
    return 3;
  };

  const getItemRabatt = (item: CartItem): number => {
    const level = getRabattLevel();
    switch (level) {
      case 1:
        return item.sofortrabatt_amount ?? 0;
      case 2:
        return item.sofortrabatt_double_amount ?? 0;
      case 3:
        return item.sofortrabatt_triple_amount ?? 0;
      default:
        return 0;
    }
  };

  const getGesamtRabatt = () =>
    cart.reduce((sum, item) => sum + getItemRabatt(item), 0);

  // -------------------------------------------------------
  // Absenden
  // -------------------------------------------------------
  const handleSubmit = async () => {
    if (!dealer?.dealer_id) {
      toast.error("❌ Kein Händler gefunden – bitte neu einloggen.");
      return;
    }
    if (!invoiceFile) {
      toast.error("❌ Bitte lade die Rechnungsdatei hoch.");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Kein eingeloggter User gefunden.");

      // Datei speichern
      const filePath = `${user.id}/sofort-${Date.now()}-${invoiceFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("sofortrabatt-invoices")
        .upload(filePath, invoiceFile);

      if (uploadError) throw uploadError;

      // Eintrag speichern
      const { error: insertError } = await supabase.from("sofortrabatt_claims").insert([
        {
          dealer_id: dealer.dealer_id,
          invoice_file_url: filePath,
          rabatt_level: getRabattLevel(),
          rabatt_betrag: getGesamtRabatt(),
          status: "pending",
          products: cart.map((c) => ({
            product_id: c.product_id,
            seriennummer: c.seriennummer || null,
          })),
        },
      ]);

      if (insertError) throw insertError;

      setSuccess(true);
      onSuccess();
      toast.success("Sofortrabatt-Antrag erfolgreich gespeichert");
    } catch (err: any) {
      console.error("❌ Sofortrabatt API Error:", err);
      toast.error("Fehler beim Speichern", {
        description: err?.message || "Unbekannter Fehler.",
      });
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // UI
  // -------------------------------------------------------
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:w-[650px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Tag className={`w-5 h-5 ${theme.color}`} />
            <span className={theme.color}>Sofortrabatt beantragen</span>
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
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <p className="text-green-600 font-semibold text-lg">
              🎉 Sofortrabatt-Antrag gespeichert!
            </p>
            <SheetClose asChild>
              <Button
                onClick={() => {
                  setSuccess(false);
                  setCart(() => []);
                  setInvoiceFile(null);
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Schließen
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            {/* Warenkorb */}
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {cart.length === 0 ? (
                <p className="text-gray-500">Noch keine Produkte ausgewählt.</p>
              ) : (
                cart.map((item, i) => (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-xl p-3 space-y-2"
                  >
                    <p className="font-semibold">{item.sony_article}</p>
                    <p className="text-xs text-gray-500">EAN: {item.ean}</p>

                    <p className="text-sm">
                      Rabatt:{" "}
                      <span className={`font-semibold ${theme.color}`}>
                        {getItemRabatt(item)} CHF
                      </span>
                    </p>

                    <Input
                      type="text"
                      placeholder="Seriennummer"
                      value={item.seriennummer || ""}
                      onChange={(e) =>
                        setCart((prev) =>
                          prev.map((p, idx) =>
                            idx === i ? { ...p, seriennummer: e.target.value } : p
                          )
                        )
                      }
                    />
                  </div>
                ))
              )}
            </div>

            {/* Datei Upload */}
            <div className="border-t pt-4 space-y-2">
              <label className="block text-sm font-medium mb-2">
                Rechnung hochladen (PDF / JPG / PNG)
              </label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  setInvoiceFile(e.target.files ? e.target.files[0] : null)
                }
              />
            </div>

            {/* Gesamt + Absenden */}
            {cart.length > 0 && (
              <div className="border-t pt-4 space-y-3">
                <p className="text-sm">
                  Gesamt-Rabatt:{" "}
                  <span className={`font-semibold ${theme.color}`}>
                    {getGesamtRabatt()} CHF
                  </span>
                </p>

                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`${theme.bg} ${theme.bgHover} text-white w-full font-semibold`}
                >
                  {loading ? "⏳ Wird gesendet…" : "📩 Sofortrabatt absenden"}
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

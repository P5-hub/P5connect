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
import DealerInfoCompact from "@/components/DealerInfoCompact";
import { toast } from "sonner";
import { Tag } from "lucide-react";
import { Product } from "@/types/Product";
import { useDealer } from "@/app/(dealer)/DealerContext";
import { getThemeByForm } from "@/lib/theme/ThemeContext";

// 🧩 erweitertes CartItem-Typing mit Rabattfeldern
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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const supabase = getSupabaseBrowser();
  const theme = getThemeByForm("sofortrabatt");

  const getRabattLevel = (): 1 | 2 | 3 => {
    if (cart.length === 1) return 1;
    if (cart.length === 2) return 2;
    if (cart.length >= 3) return 3;
    return 1;
  };

  const getItemRabatt = (item: CartItem): number => {
    const level = getRabattLevel();
    if (level === 1) return item.sofortrabatt_amount ?? 0;
    if (level === 2) return item.sofortrabatt_double_amount ?? 0;
    if (level === 3) return item.sofortrabatt_triple_amount ?? 0;
    return 0;
  };

  const getGesamtRabatt = () =>
    cart.reduce((sum, item) => sum + getItemRabatt(item), 0);

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

      const filePath = `${user.id}/${Date.now()}_${invoiceFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("sofortrabatt-invoices")
        .upload(filePath, invoiceFile);

      if (uploadError) throw uploadError;

      const { error } = await supabase.from("sofortrabatt_claims").insert([
        {
          dealer_id: dealer.dealer_id,
          invoice_file_url: filePath,
          rabatt_level: getRabattLevel(),
          rabatt_betrag: getGesamtRabatt(),
          status: "pending",
          products: cart.map((c) => ({
            product_id: c.product_id,
            seriennummer: c.seriennummer,
          })),
        },
      ]);

      if (error) throw error;

      onSuccess();
      setSuccess(true);
      toast.success("✅ Sofortrabatt-Antrag gespeichert");
    } catch (err) {
      console.error("Sofortrabatt API Error:", err);
      toast.error("❌ Fehler beim Speichern", {
        description:
          (err as any)?.message || JSON.stringify(err, null, 2) || "Unbekannter Fehler",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:w-[650px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Tag className={`w-5 h-5 ${theme.color}`} />
            <span className={theme.color}>Sofortrabatt beantragen</span>
          </SheetTitle>
        </SheetHeader>

        {dealer?.dealer_id && (
          <div className="mb-4">
            <DealerInfoCompact dealer={dealer} />
          </div>
        )}

        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <p className="text-green-600 font-semibold text-lg">
              ✅ Sofortrabatt-Antrag gespeichert!
            </p>
            <SheetClose asChild>
              <Button
                variant="default"
                onClick={() => {
                  setSuccess(false);
                  setCart(() => []);
                  setInvoiceFile(null);
                }}
              >
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
                cart.map((item, i) => (
                  <div
                    key={i}
                    className={`border rounded-xl p-3 space-y-2 ${theme.border}`}
                  >
                    <p className="font-semibold">{item.sony_article}</p>
                    <p className="text-xs text-gray-500">EAN: {item.ean}</p>
                    <p className="text-sm text-gray-700">
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
                            idx === i
                              ? { ...p, seriennummer: e.target.value }
                              : p
                          )
                        )
                      }
                    />
                  </div>
                ))
              )}
            </div>

            <div className="border-t pt-4 space-y-2">
              <label className="block text-sm font-medium mb-2">
                Rechnung hochladen (PDF oder JPG)
              </label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  setInvoiceFile(e.target.files ? e.target.files[0] : null)
                }
              />
            </div>

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
                  className={`w-full ${theme.color.replace("text-", "bg-")} hover:${theme.color
                    .replace("text-", "bg-")
                    .replace("600", "700")} text-white`}
                >
                  {loading ? "⏳ Sende..." : "📩 Sofortrabatt absenden"}
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

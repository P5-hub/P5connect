"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { ClipboardList, CheckCircle2, Trash2, Upload } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useDealer } from "@/app/(dealer)/DealerContext";
import { submitGroupedItems } from "@/lib/submitGroupedItems";
import { getThemeByForm } from "@/lib/theme/ThemeContext";

import {
  useSupportCart,
} from "@/app/(dealer)/components/SupportCartContext";

// -------------------------------------------------------------
// TYPES (unverändert)
// -------------------------------------------------------------
export type SupportCartItem = {
  product_id?: number | string;
  sony_article?: string;
  product_name?: string;
  ean?: string;
  quantity: number;
  supportbetrag: number;
  comment?: string;
  support_type?: string;
};

// -------------------------------------------------------------
// COMPONENT — jetzt 100% Provider-basiert
// -------------------------------------------------------------
export default function CartSupport({ onSuccess }: { onSuccess: () => void }) {
  const {
    cart,
    setCart,
    open,
    setOpen,
    details,
  } = useSupportCart();

  const supabase = getSupabaseBrowser();
  const dealer = useDealer();
  const { t } = useI18n();
  const theme = getThemeByForm("support");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

  // Reset success when items change
  useEffect(() => {
    if (cart.length > 0) setSuccess(false);
  }, [cart.length]);

  // Helpers
  const updateItem = (
    index: number,
    field: keyof SupportCartItem,
    value: any
  ) => {
    setCart((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const toInt = (v: any): number =>
    Number.isFinite(+v) ? Math.max(0, Math.round(+v)) : 0;

  // Totals
  const totalQuantity = cart.reduce(
    (s: number, i: SupportCartItem) => s + toInt(i.quantity),
    0
  );

  const totalSupport = cart.reduce(
    (s: number, i: SupportCartItem) =>
      s + toInt(i.quantity) * toInt(i.supportbetrag),
    0
  );

  // Submit
  const handleSubmit = async () => {
    if (!dealer?.dealer_id) {
      toast.error("❌ Kein Händler gefunden – bitte neu einloggen.");
      return;
    }
    if (cart.length === 0) {
      toast.error("❌ Kein Produkt im Supportkorb.");
      return;
    }

    setLoading(true);
    try {
      // Upload file
      let fileUrl: string | null = null;
      if (invoiceFile) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) throw new Error("Kein Benutzer authentifiziert.");

        const path = `${user.id}/${Date.now()}_${invoiceFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from("support-invoices")
          .upload(path, invoiceFile);

        if (uploadError) throw uploadError;

        fileUrl = path;
      }

      // Prepare JSON
      const produkteJson = cart.map((item: SupportCartItem) => ({
        product_name: item.product_name ?? item.sony_article ?? "Unbekannt",
        quantity: toInt(item.quantity),
        supportbetrag: toInt(item.supportbetrag),
      }));

      // Insert into database
      const { data: claim, error: insertError } = await supabase
        .from("support_claims")
        .insert([
          {
            dealer_id: dealer.dealer_id,
            submission_date: new Date().toISOString(),
            support_typ: details.type,
            produkte: produkteJson,
            invoice_file_url: fileUrl,
            status: "pending",
            comment: details.comment || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // Reporting für Google Drive
      await submitGroupedItems({
        typ: "support",
        dealer,
        items: cart.map((i: SupportCartItem) => ({
          ...i,
          quantity: toInt(i.quantity),
          price: toInt(i.supportbetrag),
          support_type: details.type,
          comment: details.comment,
        })),
        meta: {
          support_claim_id: claim?.claim_id,
          support_typ: details.type,
          comment: details.comment,
        },
      });

      // Reset
      setCart([]);
      setInvoiceFile(null);
      setSuccess(true);
      onSuccess();
      toast.success("✅ Support erfolgreich übermittelt!");
    } catch (err: any) {
      console.error("❌ Fehler beim Speichern des Supports:", err);
      toast.error("Fehler beim Speichern des Supports", {
        description: err?.message ?? "Unbekannter Fehler beim Insert.",
      });
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 border ${theme.border} ${theme.color} hover:${theme.bgLight} shadow-lg`}
          title={t("support.submit")}
        >
          <ClipboardList className={`w-5 h-5 ${theme.color}`} />
          <span className="font-medium">
            {t("support.submit")} {cart.length ? `(${cart.length})` : ""}
          </span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:w-[600px] flex flex-col">
        <SheetHeader>
          <SheetTitle className={`flex items-center gap-2 ${theme.color}`}>
            <ClipboardList className="w-5 h-5" />
            {t("support.submit")}
          </SheetTitle>
        </SheetHeader>

        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />

            <p className={`font-semibold text-lg ${theme.color}`}>
              {t("support.success")}
            </p>

            <div className="text-sm text-gray-600">
              {t("support.quantity")}: {totalQuantity} • CHF{" "}
              {totalSupport.toFixed(0)}
            </div>

            <SheetClose asChild>
              <Button
                className={`${theme.color.replace(
                  "text-",
                  "bg-"
                )} hover:${theme.color
                  .replace("text-", "bg-")
                  .replace("600", "700")} text-white mt-4`}
              >
                {t("support.close")}
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            {/* CART ITEMS */}
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center">
                  {t("support.emptycart")}
                </p>
              ) : (
                cart.map((item: SupportCartItem, index: number) => (
                  <div
                    key={index}
                    className="border rounded-xl p-3 space-y-2 bg-white shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-gray-800">
                        {item.product_name ||
                          item.sony_article ||
                          item.ean ||
                          "-"}
                      </p>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        min={1}
                        placeholder={t("support.quantity")}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "quantity",
                            toInt(e.target.value)
                          )
                        }
                        className="text-center"
                      />

                      <Input
                        type="number"
                        min={0}
                        placeholder={t("support.amountperunit")}
                        value={item.supportbetrag}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "supportbetrag",
                            toInt(e.target.value)
                          )
                        }
                        className="text-center"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* FILE UPLOAD */}
            <div className="border-t pt-4 space-y-2">
              <label className="block text-sm font-medium mb-1">
                {t("support.invoiceUpload")}
              </label>

              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    setInvoiceFile(e.target.files?.[0] ?? null)
                  }
                />
                <Upload className={`w-4 h-4 ${theme.color}`} />
              </div>
            </div>

            {/* FOOTER */}
            {cart.length > 0 && (
              <div className="border-t pt-4 space-y-3">
                <p className="text-sm">
                  <span className="font-semibold">
                    {t("support.quantity")}:
                  </span>{" "}
                  {totalQuantity}
                </p>

                <p className="text-sm">
                  <span className="font-semibold">CHF:</span>{" "}
                  {totalSupport.toFixed(0)}
                </p>

                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`w-full ${theme.color.replace(
                    "text-",
                    "bg-"
                  )} hover:${theme.color
                    .replace("text-", "bg-")
                    .replace("600", "700")} text-white font-semibold`}
                >
                  {loading
                    ? t("support.sending")
                    : t("support.submitbutton")}
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

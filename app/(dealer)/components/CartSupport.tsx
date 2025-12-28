"use client";

import { useEffect, useState } from "react";
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
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { getThemeByForm } from "@/lib/theme/ThemeContext";

import {
  useSupportCart,
} from "@/app/(dealer)/components/SupportCartContext";

// -------------------------------------------------------------
// TYPES
// -------------------------------------------------------------
export type SupportCartItem = {
  product_id?: number | string;
  sony_article?: string;
  product_name?: string;
  ean?: string;
  quantity: number;
  supportbetrag: number;
  comment?: string;
};

// -------------------------------------------------------------
// COMPONENT
// -------------------------------------------------------------
export default function CartSupport({ onSuccess }: { onSuccess: () => void }) {
  const { cart, setCart, open, setOpen, details } = useSupportCart();

  const supabase = createClient();
  const searchParams = useSearchParams();
  const dealerIdFromUrl = searchParams.get("dealer_id");

  const { t } = useI18n();
  const theme = getThemeByForm("support");

  const [dealer, setDealer] = useState<any>(null);
  const [loadingDealer, setLoadingDealer] = useState(true);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

  // -------------------------------------------------------------
  // 🔥 DEALER AUS URL LADEN (IDENTISCH ZU VERKAUF)
  // -------------------------------------------------------------
  useEffect(() => {
    const loadDealer = async () => {
      if (!dealerIdFromUrl) {
        setLoadingDealer(false);
        return;
      }

      const { data, error } = await supabase
        .from("dealers")
        .select("*")
        .eq("dealer_id", dealerIdFromUrl)
        .single();

      if (error || !data) {
        toast.error("Händler konnte nicht geladen werden.");
        setLoadingDealer(false);
        return;
      }

      setDealer(data);
      setLoadingDealer(false);
    };

    loadDealer();
  }, [dealerIdFromUrl]);

  // Reset success if cart changes
  useEffect(() => {
    if (cart.length > 0) setSuccess(false);
  }, [cart.length]);

  // Helpers
  const toInt = (v: any) =>
    Number.isFinite(+v) ? Math.max(0, Math.round(+v)) : 0;

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

  const totalQuantity = cart.reduce(
    (s: number, i: SupportCartItem) => s + toInt(i.quantity),
    0
  );

  const totalSupport = cart.reduce(
    (s: number, i: SupportCartItem) =>
      s + toInt(i.quantity) * toInt(i.supportbetrag),
    0
  );

  // -------------------------------------------------------------
  // SUBMIT
  // -------------------------------------------------------------
  const handleSubmit = async () => {
    if (!dealer?.dealer_id) {
      toast.error("Kein Händler gefunden.");
      return;
    }

    if (cart.length === 0) {
      toast.error("Kein Produkt im Supportkorb.");
      return;
    }

    setLoading(true);

    try {
      let fileUrl: string | null = null;

      if (invoiceFile) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) throw new Error("Nicht authentifiziert.");

        const path = `${user.id}/${Date.now()}_${invoiceFile.name}`;

        const { error } = await supabase.storage
          .from("support-invoices")
          .upload(path, invoiceFile);

        if (error) throw error;

        fileUrl = path;
      }

      // 🔥 INSERT SUPPORT (dealer_id EXPLIZIT)
      const { error } = await supabase.from("support_claims").insert([
        {
          dealer_id: dealer.dealer_id,
          submission_date: new Date().toISOString(),
          support_typ: details.type,
          produkte: cart.map((i) => ({
            product_name:
              i.product_name ?? i.sony_article ?? "Unbekannt",
            quantity: toInt(i.quantity),
            supportbetrag: toInt(i.supportbetrag),
          })),
          invoice_file_url: fileUrl,
          status: "pending",
          comment: details.comment || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setCart([]);
      setInvoiceFile(null);
      setSuccess(true);
      onSuccess();
      toast.success("Support erfolgreich übermittelt.");
    } catch (err: any) {
      console.error(err);
      toast.error("Fehler beim Speichern", {
        description: err?.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------
  if (loadingDealer) {
    return (
      <p className="p-4 text-gray-500">⏳ Händler wird geladen…</p>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 border ${theme.border} ${theme.color} hover:${theme.bgLight} shadow-lg`}
        >
          <ClipboardList className="w-5 h-5" />
          {t("support.submit")} {cart.length ? `(${cart.length})` : ""}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:w-[600px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            {t("support.submit")}
          </SheetTitle>
        </SheetHeader>

        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
            <p className="font-semibold text-lg">
              {t("support.success")}
            </p>

            <SheetClose asChild>
              <Button className="bg-green-600 text-white">
                {t("support.close")}
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {cart.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-xl p-3 bg-white shadow-sm space-y-2"
                >
                  <div className="flex justify-between">
                    <p className="font-semibold">
                      {item.product_name ||
                        item.sony_article ||
                        item.ean}
                    </p>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "quantity",
                          toInt(e.target.value)
                        )
                      }
                    />

                    <Input
                      type="number"
                      min={0}
                      value={item.supportbetrag}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "supportbetrag",
                          toInt(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-3">
              <Input
                type="file"
                accept=".pdf,.jpg,.png"
                onChange={(e) =>
                  setInvoiceFile(e.target.files?.[0] ?? null)
                }
              />

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-teal-600 text-white"
              >
                {loading
                  ? t("support.sending")
                  : t("support.submitbutton")}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

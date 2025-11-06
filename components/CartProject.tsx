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
import { ClipboardList, CheckCircle2, Trash2 } from "lucide-react";
import { submitGroupedItems } from "@/lib/submitGroupedItems";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function CartProject({
  dealer,
  cart,
  setCart,
  onSuccess,
  open,
  setOpen,
  details,
}: {
  dealer: any;
  cart: any[];
  setCart: (fn: (prev: any[]) => any[]) => void;
  onSuccess: () => void;
  open: boolean;
  setOpen: (o: boolean) => void;
  details: Record<string, any>;
}) {
  const supabase = getSupabaseBrowser();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (cart.length > 0) setSuccess(false);
  }, [cart.length]);

  const updateItem = (index: number, field: string, value: any) => {
    setCart((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const toInt = (v: any) => (Number.isFinite(+v) ? Math.round(+v) : 0);

  /** ✅ Projekt speichern */
  const handleSubmit = async () => {
    if (!dealer?.dealer_id) {
      toast.error(t("project.error.nodealer"));
      return;
    }
    if (cart.length === 0) {
      toast.error(t("project.error.noproducts"));
      return;
    }

    setLoading(true);
    try {
      // 🟣 Projekt-Stammdaten speichern
      const { data: projectRow, error: projectError } = await supabase
        .from("project_requests")
        .insert([
          {
            dealer_id: dealer.dealer_id,
            login_nr: dealer.login_nr,
            store_name: dealer.store_name,
            project_type: details.type,
            project_name: details.name,
            customer: details.customer,
            location: details.location,
            start_date: details.start || null,
            end_date: details.end || null,
            comment: details.comment,
            project_date: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (projectError) throw projectError;

      // 🟣 Projekt-Produkte speichern
      await submitGroupedItems({
        typ: "projekt",
        dealer,
        items: cart.map((i) => ({
          ...i,
          quantity: toInt(i.quantity),
          price: toInt(i.price ?? 0),
        })),
        meta: {
          project_id: projectRow.id,
          ...details,
        },
      });

      // 🟣 Erfolg
      setCart(() => []);
      onSuccess();
      setSuccess(true);
      toast.success(t("project.success"));
    } catch (err: any) {
      console.error("❌ Fehler beim Speichern des Projekts:", err);
      toast.error(t("project.error.save"), { description: err?.message });
    } finally {
      setLoading(false);
    }
  };

  const totalQuantity = cart.reduce((s, i) => s + toInt(i.quantity || 0), 0);
  const totalPrice = cart.reduce(
    (s, i) => s + toInt(i.quantity || 0) * toInt(i.price || 0),
    0
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* 🔹 Floating Button */}
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 border-purple-600 text-purple-700 hover:bg-purple-50 shadow-lg"
          title={t("project.submit")}
        >
          <ClipboardList className="w-5 h-5 text-purple-600" />
          <span className="font-medium">
            {t("project.submit")} {cart.length ? `(${cart.length})` : ""}
          </span>
        </Button>
      </SheetTrigger>

      {/* 🔹 Slide-Panel */}
      <SheetContent side="right" className="w-full sm:w-[600px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-purple-700">
            <ClipboardList className="w-5 h-5" />
            {t("project.submit")}
          </SheetTitle>
        </SheetHeader>

        {success ? (
          /* ✅ Erfolgsmeldung */
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
            <p className="text-purple-700 font-semibold text-lg">
              {t("project.success")}
            </p>
            <div className="text-sm text-gray-600">
              {t("project.quantity")}: {totalQuantity} • CHF{" "}
              {totalPrice.toFixed(0)}
            </div>

            {/* Projektinfos anzeigen */}
            <div className="mt-4 text-sm text-gray-700 space-y-1">
              {details.name && <p>🏗️ {details.name}</p>}
              {details.customer && <p>👤 {details.customer}</p>}
              {details.location && <p>📍 {details.location}</p>}
              {details.type && <p>📁 {t(`project.type.${details.type}`)}</p>}
            </div>

            <SheetClose asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white mt-4">
                {t("project.close")}
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            {/* 🛒 Produktliste */}
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center">
                  {t("project.emptycart")}
                </p>
              ) : (
                cart.map((item, index) => (
                  <div
                    key={index}
                    className="border rounded-xl p-3 space-y-2 bg-white shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {item.product_name || item.sony_article || "?"}
                        </p>
                        <p className="text-xs text-gray-500">
                          EAN: {item.ean || "-"}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-red-500 hover:text-red-700"
                        aria-label={t("project.remove") || "Remove"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        min={1}
                        placeholder={t("project.quantity")}
                        value={item.quantity || 1}
                        onChange={(e) =>
                          updateItem(index, "quantity", toInt(e.target.value))
                        }
                        className="text-center"
                      />
                      <Input
                        type="number"
                        placeholder={t("project.targetprice")}
                        value={item.price ?? ""}
                        onChange={(e) =>
                          updateItem(index, "price", toInt(e.target.value))
                        }
                        className="text-center"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 🧮 Summen & Absenden */}
            {cart.length > 0 && (
              <div className="border-t pt-4 space-y-3">
                <p className="text-sm">
                  <span className="font-semibold">
                    {t("project.quantity")}:
                  </span>{" "}
                  {totalQuantity}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">CHF:</span>{" "}
                  {totalPrice.toFixed(0)}
                </p>

                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                >
                  {loading ? t("project.sending") : t("project.submitbutton")}
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

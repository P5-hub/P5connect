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
import { Tag, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/lib/theme/ThemeContext";

/* -------------------------------------------------- */
/* 🧠 Rabatt Level Anzeige                            */
/* -------------------------------------------------- */
const hasCategory = (items: any[], keywords: string[]) =>
  items.some((i) =>
    keywords.some((k) =>
      (i.category || i.gruppe || "").toLowerCase().includes(k)
    )
  );

const getRabattLevel = (items: any[]) => {
  const hasTV = hasCategory(items, ["tv"]);
  const hasSoundbar = hasCategory(items, ["soundbar"]);
  const hasSub = hasCategory(items, ["sub"]);

  if (hasTV && hasSoundbar && hasSub) return 3;
  if (hasTV && hasSoundbar) return 2;
  if (hasTV) return 1;
  return 0;
};

export default function CartSofortrabatt() {
  const dealer = useDealer();
  const theme = useTheme();

  const {
    state,
    getItems,
    removeItem,
    clearCart,
    closeCart,
    orderDetails,
    setOrderDetails,
    clearOrderFiles,
  } = useCart();

  const items = getItems("sofortrabatt");
  const open = state.open && state.currentForm === "sofortrabatt";

  const rabattLevel = getRabattLevel(items);

  /* -------------------------------------------------- */
  /* 📎 FILE HANDLING                                  */
  /* -------------------------------------------------- */

  const files = orderDetails?.sofortrabatt_files ?? [];

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles = Array.from(fileList);

    setOrderDetails((prev) => ({
      ...prev,
      sofortrabatt_files: [...prev.sofortrabatt_files, ...newFiles],
    }));
  };

  const removeFile = (index: number) => {
    setOrderDetails((prev) => ({
      ...prev,
      sofortrabatt_files: prev.sofortrabatt_files.filter(
        (_, i) => i !== index
      ),
    }));
  };

  /* -------------------------------------------------- */
  /* 💰 Rabatt Berechnung                               */
  /* -------------------------------------------------- */

  const getRabattForItem = (item: any) => {
    const isTV =
      (item.category || item.gruppe || "")
        .toLowerCase()
        .includes("tv");

    if (!isTV) return 0;

    if (rabattLevel === 1)
      return Number(item.sofortrabatt_amount || 0);

    if (rabattLevel === 2)
      return Number(item.sofortrabatt_double_amount || 0);

    if (rabattLevel === 3)
      return Number(item.sofortrabatt_triple_amount || 0);

    return 0;
  };

  const totalRabatt = items.reduce(
    (sum, item) => sum + getRabattForItem(item),
    0
  );

  /* -------------------------------------------------- */
  /* 🚀 SUBMIT                                          */
  /* -------------------------------------------------- */

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const canSubmit =
    rabattLevel > 0 && files.length > 0 && !!dealer?.dealer_id;

  const handleSubmit = async () => {
    if (!dealer?.dealer_id) {
      toast.error("Kein Händler gefunden");
      return;
    }

    if (files.length === 0) {
      toast.error("Bitte Rechnung hochladen");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append(
        "dealer_id",
        dealer.dealer_id.toString()
      );

      formData.append("items", JSON.stringify(items));

      files.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch("/api/sofortrabatt/submit", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload fehlgeschlagen");
      }

      clearCart("sofortrabatt");
      clearOrderFiles("sofortrabatt");

      setSuccess(true);

      toast.success("Sofortrabatt erfolgreich eingereicht");
    } catch (err: any) {
      toast.error(err.message);
    }

    setLoading(false);
  };

  /* -------------------------------------------------- */
  /* UI                                                 */
  /* -------------------------------------------------- */

  return (
    <Sheet open={open} onOpenChange={(o) => !o && closeCart()}>
      <SheetContent side="right" className="w-full sm:w-[600px] flex flex-col">
        <SheetHeader>
          <SheetTitle className={`flex items-center gap-2 ${theme.color}`}>
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
          <div className="flex-1 flex flex-col justify-center items-center gap-4 text-center">
            <p className={`${theme.color} text-lg font-semibold`}>
              🎉 Antrag erfolgreich gesendet
            </p>

            <SheetClose asChild>
              <Button className={`${theme.bg} text-white`}>
                Schließen
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            {/* ITEMS */}
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {items.map((item: any, index: number) => (
                <div
                  key={index}
                  className={`border rounded-xl p-3 bg-white shadow ${theme.border}`}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        EAN: {item.ean}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        removeItem("sofortrabatt", index)
                      }
                      className="text-red-500"
                    >
                      ✕
                    </button>
                  </div>

                  <p className={`mt-2 ${theme.color}`}>
                    Rabatt: {getRabattForItem(item)} CHF
                  </p>
                </div>
              ))}
            </div>

            {/* FILE UPLOAD */}
            <div className="border-t pt-4 space-y-3">
              <label className="text-sm font-medium">
                Rechnungen hochladen
              </label>

              <Input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => addFiles(e.target.files)}
              />

              {/* FILE PREVIEW */}
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center border rounded p-2 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {file.name}
                      </div>

                      <button onClick={() => removeFile(i)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="border-t pt-4 space-y-3">
              <p>
                Gesamt-Rabatt:{" "}
                <b className={theme.color}>{totalRabatt} CHF</b>
              </p>

              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || loading}
                className={`w-full ${theme.bg} text-white`}
              >
                {loading
                  ? "Wird gesendet…"
                  : "Sofortrabatt absenden"}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
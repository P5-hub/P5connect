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
import { useMemo, useState } from "react";
import { Tag, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/lib/theme/ThemeContext";

type PromoType = "classic_fixed" | "tv55_soundbar_percent";

/* -------------------------------------------------- */
/* HELPERS                                            */
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

function getRole(item: any): "tv" | "soundbar" | "sub" | null {
  const c = (item.category || item.gruppe || "").toLowerCase();
  if (c.includes("tv")) return "tv";
  if (c.includes("soundbar")) return "soundbar";
  if (c.includes("sub")) return "sub";
  return null;
}

function parseTvInches(product: any): number {
  const direct =
    Number(product?.screen_size_inch) ||
    Number(product?.size_inch) ||
    Number(product?.inch) ||
    0;

  if (direct > 0) return direct;

  const source = [
    product?.sony_article,
    product?.product_name,
    product?.name,
    product?.title,
  ]
    .filter(Boolean)
    .join(" ");

  const match = source.match(/(\d{2,3})\s*(?:["]|zoll|inch)/i);
  if (match) return Number(match[1]);

  const sonyMatch = source.match(/(?:^|[^\d])(\d{2,3})(?:[A-Z]|$)/);
  if (sonyMatch) {
    const value = Number(sonyMatch[1]);
    if (value >= 32 && value <= 100) return value;
  }

  return 0;
}

function toNumber(value: any) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const normalized = String(value).replace(",", ".").trim();
  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
}

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
  const promoType: PromoType = orderDetails?.promo_type || "classic_fixed";

  const files = orderDetails?.sofortrabatt_files ?? [];
  const salesPrices = orderDetails?.sofortrabatt_sales_prices ?? {
    soundbar: "",
    subwoofer: "",
  };

  const tvItem = items.find((i: any) => getRole(i) === "tv");
  const soundbarItem = items.find((i: any) => getRole(i) === "soundbar");
  const subItem = items.find((i: any) => getRole(i) === "sub");

  const tvInches = tvItem ? parseTvInches(tvItem) : 0;

  /* -------------------------------------------------- */
  /* FILE HANDLING                                      */
  /* -------------------------------------------------- */
  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles = Array.from(fileList);

    setOrderDetails((prev: any) => ({
      ...prev,
      sofortrabatt_files: [...(prev?.sofortrabatt_files ?? []), ...newFiles],
    }));
  };

  const removeFile = (index: number) => {
    setOrderDetails((prev: any) => ({
      ...prev,
      sofortrabatt_files: (prev?.sofortrabatt_files ?? []).filter(
        (_: any, i: number) => i !== index
      ),
    }));
  };

  /* -------------------------------------------------- */
  /* PRICE HANDLING                                     */
  /* -------------------------------------------------- */
  const updateSalesPrice = (field: "soundbar" | "subwoofer", value: string) => {
    setOrderDetails((prev: any) => ({
      ...prev,
      sofortrabatt_sales_prices: {
        ...(prev?.sofortrabatt_sales_prices ?? {}),
        [field]: value,
      },
    }));
  };

  /* -------------------------------------------------- */
  /* RABATT                                             */
  /* -------------------------------------------------- */
  const getClassicRabattForItem = (item: any) => {
    const isTV = (item.category || item.gruppe || "").toLowerCase().includes("tv");
    if (!isTV) return 0;

    if (rabattLevel === 1) return Number(item.sofortrabatt_amount || 0);
    if (rabattLevel === 2) return Number(item.sofortrabatt_double_amount || 0);
    if (rabattLevel === 3) return Number(item.sofortrabatt_triple_amount || 0);

    return 0;
  };

  const rabattSummary = useMemo(() => {
    if (promoType === "classic_fixed") {
      const total = items.reduce(
        (sum: number, item: any) => sum + getClassicRabattForItem(item),
        0
      );

      return {
        total: Number(total.toFixed(2)),
        soundbarDiscount: 0,
        subDiscount: 0,
      };
    }

    const soundbarPrice = toNumber(salesPrices.soundbar);
    const subPrice = toNumber(salesPrices.subwoofer);

    const soundbarDiscount = soundbarItem ? Number((soundbarPrice * 0.3).toFixed(2)) : 0;
    const subDiscount = subItem ? Number((subPrice * 0.5).toFixed(2)) : 0;

    return {
      total: Number((soundbarDiscount + subDiscount).toFixed(2)),
      soundbarDiscount,
      subDiscount,
    };
  }, [promoType, items, rabattLevel, salesPrices, soundbarItem, subItem]);

  /* -------------------------------------------------- */
  /* SUBMIT                                             */
  /* -------------------------------------------------- */
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const percentPromoValid =
    promoType !== "tv55_soundbar_percent" ||
    (!!tvItem &&
      tvInches >= 55 &&
      !!soundbarItem &&
      toNumber(salesPrices.soundbar) > 0 &&
      (!subItem || toNumber(salesPrices.subwoofer) > 0));

  const canSubmit =
    rabattLevel > 0 &&
    files.length > 0 &&
    !!dealer?.dealer_id &&
    percentPromoValid;

  const handleSubmit = async () => {
    if (!dealer?.dealer_id) {
      toast.error("Kein Händler gefunden");
      return;
    }

    if (files.length === 0) {
      toast.error("Bitte Rechnung hochladen");
      return;
    }

    if (promoType === "tv55_soundbar_percent") {
      if (!tvItem) {
        toast.error("TV fehlt");
        return;
      }

      if (tvInches < 55) {
        toast.error("Die Promo gilt nur für TVs ab 55 Zoll");
        return;
      }

      if (!soundbarItem) {
        toast.error("Für diese Promo ist eine Soundbar erforderlich");
        return;
      }

      if (toNumber(salesPrices.soundbar) <= 0) {
        toast.error("Bitte Verkaufspreis der Soundbar eingeben");
        return;
      }

      if (subItem && toNumber(salesPrices.subwoofer) <= 0) {
        toast.error("Bitte Verkaufspreis des Subwoofers eingeben");
        return;
      }
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("dealer_id", dealer.dealer_id.toString());
      formData.append("items", JSON.stringify(items));
      formData.append("promo_type", promoType);
      formData.append(
        "sales_prices",
        JSON.stringify({
          soundbar: toNumber(salesPrices.soundbar),
          subwoofer: toNumber(salesPrices.subwoofer),
        })
      );

      files.forEach((file: File) => {
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

      setOrderDetails((prev: any) => ({
        ...prev,
        promo_type: "classic_fixed",
        sofortrabatt_files: [],
        sofortrabatt_sales_prices: {
          soundbar: "",
          subwoofer: "",
        },
      }));

      setSuccess(true);
      toast.success("Sofortrabatt erfolgreich eingereicht");
    } catch (err: any) {
      toast.error(err.message || "Fehler beim Absenden");
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
              <Button className={`${theme.bg} text-white`}>Schliessen</Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="mb-3 text-sm rounded-xl border p-3 bg-gray-50">
              <p className="font-semibold">
                Promotion:
                {" "}
                {promoType === "classic_fixed"
                  ? "Klassische Fixbetrag-Promo"
                  : "Neue 30% / 50%-Promo"}
              </p>

              {promoType === "tv55_soundbar_percent" && tvItem && (
                <p className="text-xs text-gray-500 mt-1">
                  TV-Grösse erkannt: {tvInches > 0 ? `${tvInches} Zoll` : "nicht erkannt"}
                </p>
              )}
            </div>

            {/* ITEMS */}
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {items.map((item: any, index: number) => {
                const role = getRole(item);

                return (
                  <div
                    key={index}
                    className={`border rounded-xl p-3 bg-white shadow ${theme.border}`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">
                          {item.product_name || item.sony_article || "Produkt"}
                        </p>
                        <p className="text-xs text-gray-500">EAN: {item.ean}</p>
                      </div>

                      <button
                        onClick={() => removeItem("sofortrabatt", index)}
                        className="text-red-500"
                      >
                        ✕
                      </button>
                    </div>

                    {promoType === "classic_fixed" ? (
                      <p className={`mt-2 ${theme.color}`}>
                        Rabatt: {getClassicRabattForItem(item)} CHF
                      </p>
                    ) : (
                      <div className="mt-2 text-sm space-y-1">
                        {role === "soundbar" && (
                          <>
                            <label className="block text-sm font-medium">
                              Verkaufspreis Soundbar (CHF)
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={salesPrices.soundbar}
                              onChange={(e) =>
                                updateSalesPrice("soundbar", e.target.value)
                              }
                              placeholder="z. B. 799.00"
                            />
                            <p className={`${theme.color}`}>
                              30% Rabatt: {rabattSummary.soundbarDiscount.toFixed(2)} CHF
                            </p>
                          </>
                        )}

                        {role === "sub" && (
                          <>
                            <label className="block text-sm font-medium">
                              Verkaufspreis Subwoofer (CHF)
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={salesPrices.subwoofer}
                              onChange={(e) =>
                                updateSalesPrice("subwoofer", e.target.value)
                              }
                              placeholder="z. B. 499.00"
                            />
                            <p className={`${theme.color}`}>
                              50% Rabatt: {rabattSummary.subDiscount.toFixed(2)} CHF
                            </p>
                          </>
                        )}

                        {role === "tv" && (
                          <p className="text-xs text-gray-500">
                            Der TV qualifiziert die Promo. Rabatt wird auf Soundbar/Subwoofer
                            berechnet.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* FILE UPLOAD */}
            <div className="border-t pt-4 space-y-3">
              <label className="text-sm font-medium">Rechnungen hochladen</label>

              <Input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => addFiles(e.target.files)}
              />

              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file: File, i: number) => (
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
                <b className={theme.color}>{rabattSummary.total.toFixed(2)} CHF</b>
              </p>

              {promoType === "tv55_soundbar_percent" && (
                <div className="text-xs text-gray-500 space-y-1">
                  {tvInches < 55 && (
                    <p className="text-red-500">
                      TV muss mindestens 55 Zoll haben
                    </p>
                  )}
                  {!soundbarItem && (
                    <p className="text-red-500">
                      Für diese Promo ist eine Soundbar Pflicht
                    </p>
                  )}
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || loading}
                className={`w-full ${theme.bg} text-white`}
              >
                {loading ? "Wird gesendet…" : "Sofortrabatt absenden"}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
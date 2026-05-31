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
import { useI18n } from "@/lib/i18n/I18nProvider";

type PromoType = "classic_fixed" | "tv55_soundbar_percent";

/* -------------------------------------------------- */
/* HELPERS                                            */
/* -------------------------------------------------- */
function normalizeText(value: any) {
  return String(value || "").trim().toLowerCase();
}

function getRole(item: any): "tv" | "soundbar" | "sub" | null {
  const category = normalizeText(item?.category);
  const ph2 = String(item?.ph2 || "").trim().toUpperCase();

  if (category === "soundbar" || category.includes("soundbar")) {
    return "soundbar";
  }

  if (
    category === "subwoofer" ||
    category.includes("subwoofer") ||
    category.includes("rear speaker") ||
    category.includes("rear") ||
    category.includes("rearspeaker")
  ) {
    return "sub";
  }

  if (
    ph2 === "TME" ||
    category === "lcd" ||
    category === "mini led" ||
    category === "rgb" ||
    category.includes("tv")
  ) {
    return "tv";
  }

  return null;
}

function getRabattLevel(items: any[]) {
  const hasTV = items.some((i) => getRole(i) === "tv");
  const hasSoundbar = items.some((i) => getRole(i) === "soundbar");
  const hasSub = items.some((i) => getRole(i) === "sub");

  if (hasTV && hasSoundbar && hasSub) return 3;
  if (hasTV && hasSoundbar) return 2;
  if (hasTV) return 1;
  return 0;
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
    product?.model,
    product?.name,
    product?.title,
    product?.ean,
  ]
    .filter(Boolean)
    .join(" ");

  const matches = source.match(/\d{2,3}/g);

  if (matches) {
    for (const raw of matches) {
      const value = Number(raw);
      if (value >= 32 && value <= 120) {
        return value;
      }
    }
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

function isTodayInDateRange(start?: any, end?: any) {
  const todayStr = new Date().toISOString().slice(0, 10);

  const startStr = start ? String(start).slice(0, 10) : null;
  const endStr = end ? String(end).slice(0, 10) : null;

  if (startStr && todayStr < startStr) return false;
  if (endStr && todayStr > endStr) return false;

  return true;
}

function getActiveTvSofortrabatt(item: any) {
  const start = item?.sofortrabatt_classic_start_date;
  const end = item?.sofortrabatt_classic_end_date;

  if (!isTodayInDateRange(start, end)) return 0;

  return Number(item?.sofortrabatt_amount || 0);
}

function cleanSerial(value: any) {
  return String(value || "").trim().toUpperCase();
}

function isValidSevenDigitSerial(value: any) {
  const serial = cleanSerial(value);
  return /^\d{7}$/.test(serial);
}

export default function CartSofortrabatt() {
  const dealer = useDealer();
  const theme = useTheme();
  const { t } = useI18n();

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

  const serials = orderDetails?.sofortrabatt_serials ?? {
    tv: "",
    soundbar: "",
    subwoofer: "",
  };
  const removeItemAndSerial = (index: number, item: any) => {
    const role = getRole(item);

    removeItem("sofortrabatt", index);

    if (role === "tv") updateSerial("tv", "");
    if (role === "soundbar") updateSerial("soundbar", "");
    if (role === "sub") updateSerial("subwoofer", "");
  };
  const tvItem = items.find((i: any) => getRole(i) === "tv");
  const soundbarItem = items.find((i: any) => getRole(i) === "soundbar");
  const subItem = items.find((i: any) => getRole(i) === "sub");

  const tvInches = tvItem ? parseTvInches(tvItem) : 0;

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

  const updateSalesPrice = (field: "soundbar" | "subwoofer", value: string) => {
    setOrderDetails((prev: any) => ({
      ...prev,
      sofortrabatt_sales_prices: {
        ...(prev?.sofortrabatt_sales_prices ?? {}),
        [field]: value,
      },
    }));
  };

  const updateSerial = (
    field: "tv" | "soundbar" | "subwoofer",
    value: string
  ) => {
    setOrderDetails((prev: any) => ({
      ...prev,
      sofortrabatt_serials: {
        ...(prev?.sofortrabatt_serials ?? {
          tv: "",
          soundbar: "",
          subwoofer: "",
        }),
        [field]: cleanSerial(value),
      },
    }));
  };

  const getClassicRabattForItem = (item: any) => {
    const isTV = getRole(item) === "tv";
    if (!isTV) return 0;

    if (
      !isTodayInDateRange(
        item?.sofortrabatt_classic_start_date,
        item?.sofortrabatt_classic_end_date
      )
    ) {
      return 0;
    }

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
        tvDiscount: total,
        soundbarDiscount: 0,
        subDiscount: 0,
      };
    }

    const soundbarPrice = toNumber(salesPrices.soundbar);
    const subPrice = toNumber(salesPrices.subwoofer);

    const tvDiscount = tvItem ? getActiveTvSofortrabatt(tvItem) : 0;

    const soundbarDiscount = soundbarItem
      ? Number((soundbarPrice * 0.3).toFixed(2))
      : 0;

    const subDiscount = subItem
      ? Number((subPrice * 0.5).toFixed(2))
      : 0;

    return {
      total: Number((tvDiscount + soundbarDiscount + subDiscount).toFixed(2)),
      tvDiscount,
      soundbarDiscount,
      subDiscount,
    };
  }, [promoType, items, rabattLevel, salesPrices, soundbarItem, subItem, tvItem]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const serialsValid =
    !!tvItem &&
    isValidSevenDigitSerial(serials.tv) &&
    (!soundbarItem || isValidSevenDigitSerial(serials.soundbar)) &&
    (!subItem || isValidSevenDigitSerial(serials.subwoofer));

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
    percentPromoValid &&
    serialsValid;

  const handleSubmit = async () => {
    if (!dealer?.dealer_id) {
      toast.error(t("sofortrabatt.toast.noDealer"));
      return;
    }

    if (!tvItem) {
      toast.error(t("sofortrabatt.toast.tvMissing"));
      return;
    }

    if (!isValidSevenDigitSerial(serials.tv)) {
      toast.error("Bitte eine gültige 7-stellige TV-Seriennummer eingeben");
      return;
    }

    if (soundbarItem && !isValidSevenDigitSerial(serials.soundbar)) {
      toast.error("Bitte eine gültige 7-stellige Soundbar-Seriennummer eingeben");
      return;
    }

    if (subItem && !isValidSevenDigitSerial(serials.subwoofer)) {
      toast.error("Bitte eine gültige 7-stellige Subwoofer-Seriennummer eingeben");
      return;
    }

    if (files.length === 0) {
      toast.error(t("sofortrabatt.toast.uploadInvoice"));
      return;
    }

    if (promoType === "tv55_soundbar_percent") {
      if (tvInches < 55) {
        toast.error(t("sofortrabatt.toast.only55"));
        return;
      }

      if (!soundbarItem) {
        toast.error(t("sofortrabatt.toast.needSoundbar"));
        return;
      }

      if (toNumber(salesPrices.soundbar) <= 0) {
        toast.error(t("sofortrabatt.toast.soundbarPriceRequired"));
        return;
      }

      if (subItem && toNumber(salesPrices.subwoofer) <= 0) {
        toast.error(t("sofortrabatt.toast.accessoryPriceRequired"));
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
      formData.append(
        "serials",
        JSON.stringify({
          tv: cleanSerial(serials.tv),
          soundbar: cleanSerial(serials.soundbar),
          subwoofer: cleanSerial(serials.subwoofer),
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
        sofortrabatt_serials: {
          tv: "",
          soundbar: "",
          subwoofer: "",
        },
      }));

      setSuccess(true);
      toast.success(t("sofortrabatt.toast.success"));
    } catch (err: any) {
      toast.error(err.message || t("sofortrabatt.toast.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && closeCart()}>
      <SheetContent side="right" className="w-full sm:w-[600px] flex flex-col">
        <SheetHeader>
          <SheetTitle className={`flex items-center gap-2 ${theme.color}`}>
            <Tag className="w-5 h-5" />
            {t("sofortrabatt.cart.title")}
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
              {t("sofortrabatt.cart.success")}
            </p>

            <SheetClose asChild>
              <Button className={`${theme.bg} text-white`}>
                {t("sofortrabatt.cart.close")}
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="mb-3 text-sm rounded-xl border p-3 bg-gray-50">
              <p className="font-semibold">
                {t("sofortrabatt.cart.promotion")}:{" "}
                {promoType === "classic_fixed"
                  ? t("sofortrabatt.cart.classicPromo")
                  : t("sofortrabatt.cart.percentPromo")}
              </p>

              {promoType === "tv55_soundbar_percent" && tvItem && (
                <p className="text-xs text-gray-500 mt-1">
                  {t("sofortrabatt.cart.tvSizeDetected")}:{" "}
                  {tvInches > 0
                    ? `${tvInches} Zoll`
                    : t("sofortrabatt.cart.tvSizeUnknown")}
                </p>
              )}
            </div>

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
                        <p className="text-xs text-gray-400">
                          Rolle: {role || "unbekannt"} | Kategorie:{" "}
                          {item.category || "-"} | PH2: {item.ph2 || "-"}
                        </p>
                      </div>

                      <button
                        onClick={() => removeItemAndSerial(index, item)}
                        className="text-red-500"
                      >
                        ✕
                      </button>
                    </div>

                    {role === "tv" && (
                      <div className="mt-3 space-y-2">
                        <label className="block text-sm font-medium">
                          TV Seriennummer
                        </label>
                        <Input
                          inputMode="numeric"
                          maxLength={7}
                          placeholder="7-stellige Seriennummer"
                          value={serials.tv}
                          onChange={(e) => updateSerial("tv", e.target.value)}
                        />

                        {!isValidSevenDigitSerial(serials.tv) && serials.tv && (
                          <p className="text-xs text-red-500">
                            Seriennummer muss genau 7 Ziffern haben.
                          </p>
                        )}
                      </div>
                    )}

                    {promoType === "classic_fixed" ? (
                      <p className={`mt-3 ${theme.color}`}>
                        {t("sofortrabatt.cart.total").replace(
                          "Gesamt-Rabatt",
                          "Rabatt"
                        )}
                        : {getClassicRabattForItem(item).toFixed(2)} CHF
                      </p>
                    ) : (
                      <div className="mt-3 text-sm space-y-3">
                        {role === "tv" && (
                          <p className={`${theme.color}`}>
                            TV-Sofortrabatt:{" "}
                            {getActiveTvSofortrabatt(item).toFixed(2)} CHF
                          </p>
                        )}

                        {role === "soundbar" && (
                          <>
                            <div className="space-y-2">
                              <label className="block text-sm font-medium">
                                {t("sofortrabatt.cart.salesPriceSoundbar")}
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
                            </div>

                            <div className="space-y-2">
                              <label className="block text-sm font-medium">
                                Soundbar Seriennummer
                              </label>
                              <Input
                                inputMode="numeric"
                                maxLength={7}
                                placeholder="7-stellige Seriennummer"
                                value={serials.soundbar}
                                onChange={(e) =>
                                  updateSerial("soundbar", e.target.value)
                                }
                              />

                              {!isValidSevenDigitSerial(serials.soundbar) &&
                                serials.soundbar && (
                                  <p className="text-xs text-red-500">
                                    Seriennummer muss genau 7 Ziffern haben.
                                  </p>
                                )}
                            </div>

                            <p className={`${theme.color}`}>
                              {t("sofortrabatt.cart.discount30")}:{" "}
                              {rabattSummary.soundbarDiscount.toFixed(2)} CHF
                            </p>
                          </>
                        )}

                        {role === "sub" && (
                          <>
                            <div className="space-y-2">
                              <label className="block text-sm font-medium">
                                {t("sofortrabatt.cart.salesPriceAccessory")}
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
                            </div>

                            <div className="space-y-2">
                              <label className="block text-sm font-medium">
                                Subwoofer Seriennummer
                              </label>
                              <Input
                                inputMode="numeric"
                                maxLength={7}
                                placeholder="7-stellige Seriennummer"
                                value={serials.subwoofer}
                                onChange={(e) =>
                                  updateSerial("subwoofer", e.target.value)
                                }
                              />

                              {!isValidSevenDigitSerial(serials.subwoofer) &&
                                serials.subwoofer && (
                                  <p className="text-xs text-red-500">
                                    Seriennummer muss genau 7 Ziffern haben.
                                  </p>
                                )}
                            </div>

                            <p className={`${theme.color}`}>
                              {t("sofortrabatt.cart.discount50")}:{" "}
                              {rabattSummary.subDiscount.toFixed(2)} CHF
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-4 space-y-3">
              <label className="text-sm font-medium">
                {t("sofortrabatt.cart.uploadInvoices")}
              </label>

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

            <div className="border-t pt-4 space-y-3">
              <p>
                {t("sofortrabatt.cart.total")}:{" "}
                <b className={theme.color}>
                  {rabattSummary.total.toFixed(2)} CHF
                </b>
              </p>

              {promoType === "tv55_soundbar_percent" && (
                <div className="text-xs text-gray-500 space-y-1">
                  {tvInches < 55 && (
                    <p className="text-red-500">
                      {t("sofortrabatt.cart.tvMustBe55")}
                    </p>
                  )}
                  {!soundbarItem && (
                    <p className="text-red-500">
                      {t("sofortrabatt.cart.soundbarMandatory")}
                    </p>
                  )}
                </div>
              )}

              {!serialsValid && (
                <p className="text-xs text-red-500">
                  Bitte alle erforderlichen Seriennummern 7-stellig erfassen.
                </p>
              )}

              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || loading}
                className={`w-full ${theme.bg} text-white`}
              >
                {loading
                  ? t("sofortrabatt.cart.sending")
                  : t("sofortrabatt.cart.submit")}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
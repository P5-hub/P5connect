"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DealerInfoCompact from "@/app/(dealer)/components/DealerInfoCompact";
import { toast } from "sonner";
import { useDealer } from "@/app/(dealer)/DealerContext";
import { CheckCircle2, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useI18n } from "@/lib/i18n/I18nProvider";

/* -------------------------------------------------------
   UNIFIED CART PROPS
------------------------------------------------------- */

export type UnifiedCartProps = {
  mode: "bestellung" | "projekt" | "verkauf" | "support" | "sofortrabatt";
  cart: any[];
  setCart: React.Dispatch<React.SetStateAction<any[]>>;
  details?: Record<string, any>;
  extra?: Record<string, any>;
  onSuccess: () => void;
  open: boolean;
  setOpen: (o: boolean) => void;
  children?: React.ReactNode;
};

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */

const num = (v: any) => {
  const n = typeof v === "string" ? Number(v.replace(",", ".")) : Number(v);
  return Number.isFinite(n) ? n : 0;
};

const money = (v: number) =>
  new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);

/* -------------------------------------------------------
   UNIFIED CART
------------------------------------------------------- */

export default function UnifiedCart({
  mode,
  cart,
  setCart,
  details = {},
  extra = {},
  onSuccess,
  open,
  setOpen,
}: UnifiedCartProps) {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const dealerIdFromUrl = searchParams.get("dealer_id");
  const contextDealer = useDealer();
  const { t } = useI18n();

  const [activeDealer, setActiveDealer] = useState<any | null>(null);
  const [loadingDealer, setLoadingDealer] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmSonyShare, setConfirmSonyShare] = useState(false);

  const modeConfig = {
    bestellung: {
      title: t("bestellung.cartSheet.title"),
      successClose: t("bestellung.common.close"),
      empty: t("bestellung.cartSheet.empty"),
      submit: t("bestellung.cartSheet.summary.send"),
      loading: t("bestellung.cartSheet.summary.sending"),
      color: "text-blue-700",
      bg: "bg-blue-600 hover:bg-blue-700",
      btn: "border-blue-600 text-blue-700 hover:bg-blue-50",
    },
    projekt: {
      title: t("project.cart.title"),
      successClose: t("project.cart.success.close"),
      empty: t("project.cart.noProducts"),
      submit: t("project.cart.submit"),
      loading: t("project.cart.sending"),
      color: "text-purple-700",
      bg: "bg-purple-600 hover:bg-purple-700",
      btn: "border-purple-600 text-purple-700 hover:bg-purple-50",
    },
    verkauf: {
      title: t("sales.cart.title"),
      successClose: t("sales.cart.close"),
      empty: t("sales.errors.emptyCart"),
      submit: t("sales.cart.submit"),
      loading: t("sales.cart.saving"),
      color: "text-green-700",
      bg: "bg-green-600 hover:bg-green-700",
      btn: "border-green-600 text-green-700 hover:bg-green-50",
    },
    support: {
      title: t("support.states.sendTitle"),
      successClose: t("support.actions.close"),
      empty: t("support.states.emptyCart"),
      submit: t("support.actions.submitButton"),
      loading: t("support.actions.sending"),
      color: "text-amber-700",
      bg: "bg-amber-600 hover:bg-amber-700",
      btn: "border-amber-600 text-amber-700 hover:bg-amber-50",
    },
    sofortrabatt: {
      title: t("sofortrabatt.cart.title"),
      successClose: t("sofortrabatt.cart.close"),
      empty: t("bestellung.cartSheet.empty"),
      submit: t("sofortrabatt.cart.submit"),
      loading: t("sofortrabatt.cart.sending"),
      color: "text-red-700",
      bg: "bg-red-600 hover:bg-red-700",
      btn: "border-red-600 text-red-700 hover:bg-red-50",
    },
  } as const;

  const cfg = modeConfig[mode];

  /* -------------------------------------------------------
     DEALER LADEN
  ------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    const loadDealer = async () => {
      setLoadingDealer(true);

      if (dealerIdFromUrl) {
        const { data } = await supabase
          .from("dealers")
          .select("*")
          .eq("dealer_id", dealerIdFromUrl)
          .maybeSingle();

        if (!cancelled) {
          setActiveDealer(data ?? contextDealer ?? null);
          setLoadingDealer(false);
        }
      } else {
        setActiveDealer(contextDealer ?? null);
        setLoadingDealer(false);
      }
    };

    loadDealer();

    return () => {
      cancelled = true;
    };
  }, [dealerIdFromUrl, supabase, contextDealer]);

  /* -------------------------------------------------------
     VERKAUF META
  ------------------------------------------------------- */

  const getIsoCalendarWeek = () => {
    const d = new Date();
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const [calendarWeekLocal, setCalendarWeekLocal] = useState<number>(
    num(extra?.calendarWeek) || getIsoCalendarWeek()
  );

  const [inhouseQtyShareLocal, setInhouseQtyShareLocal] = useState<number>(
    num(extra?.inhouseQtyShare) || 50
  );

  const [inhouseRevenueShareLocal, setInhouseRevenueShareLocal] = useState<number>(
    num(extra?.inhouseRevenueShare) || 50
  );

  useEffect(() => {
    if (!open) return;

    setCalendarWeekLocal(num(extra?.calendarWeek) || getIsoCalendarWeek());
    setInhouseQtyShareLocal(num(extra?.inhouseQtyShare) || 50);
    setInhouseRevenueShareLocal(num(extra?.inhouseRevenueShare) || 50);
    setConfirmSonyShare(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const pushExtra = (key: string, value: any) => {
    if (typeof extra?.set === "function") {
      extra.set(key, value);
    }
  };

  /* -------------------------------------------------------
     BERECHNUNGEN
  ------------------------------------------------------- */

  const sonyQty = useMemo(
    () => cart.reduce((s, i) => s + num(i.quantity ?? i.menge ?? 0), 0),
    [cart]
  );

  const sonyRevenue = useMemo(() => {
    return cart.reduce((s, i) => {
      const q = num(i.quantity ?? i.menge ?? 0);
      const p = num(i.price ?? i.verkaufspreis ?? 0);
      return s + q * p;
    }, 0);
  }, [cart]);

  const totalQty =
    mode === "verkauf" && inhouseQtyShareLocal > 0
      ? sonyQty / (inhouseQtyShareLocal / 100)
      : 0;

  const totalRevenue =
    mode === "verkauf" && inhouseRevenueShareLocal > 0
      ? sonyRevenue / (inhouseRevenueShareLocal / 100)
      : 0;

  /* -------------------------------------------------------
     CART HELPERS
  ------------------------------------------------------- */

  const updateItem = (index: number, field: string, value: any) => {
    setCart((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const removeItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  /* -------------------------------------------------------
     SUBMIT
  ------------------------------------------------------- */

  const handleSubmit = async () => {
    if (!activeDealer?.dealer_id) {
      if (mode === "support") {
        toast.error(t("support.error.noDealer"));
      } else if (mode === "projekt") {
        toast.error(t("project.cart.validation.noDealer"));
      } else if (mode === "verkauf") {
        toast.error(t("sales.errors.noDealer"));
      } else {
        toast.error(t("bestellung.toast.noDealer"));
      }
      return;
    }

    if (cart.length === 0) {
      if (mode === "support") {
        toast.error(t("support.states.emptyCart"));
      } else if (mode === "projekt") {
        toast.error(t("project.cart.noProducts"));
      } else if (mode === "verkauf") {
        toast.error(t("sales.errors.emptyCart"));
      } else {
        toast.error(t("bestellung.cartSheet.empty"));
      }
      return;
    }

    if (mode === "verkauf" && !confirmSonyShare) {
      toast.error(t("sales.errors.confirmSonyShare"));
      return;
    }

    if (mode === "support") {
      const invalid = cart.some(
        (i) => !Number(i.supportbetrag) || Number(i.supportbetrag) <= 0
      );

      if (invalid) {
        toast.error(t("support.error.invalidValues"));
        return;
      }
    }

    setLoading(true);

    try {
      const payload: any = {
        dealer_id: activeDealer.dealer_id,
        items: cart,
      };

      payload.kommentar = details?.kommentar ?? details?.comment ?? null;

      if (mode === "verkauf") {
        payload.calendar_week = calendarWeekLocal;
        payload.sony_share_qty = inhouseQtyShareLocal;
        payload.sony_share_revenue = inhouseRevenueShareLocal;
      }

      if (mode === "support") {
        const totalCost = num(details?.totalCost);
        const sonyShare = num(details?.sonyShare);

        payload.type = details?.type ?? "sellout";
        payload.comment = details?.comment ?? details?.kommentar ?? null;
        payload.totalCost = totalCost || null;
        payload.sonyShare = sonyShare || null;
        payload.sonyAmount =
          totalCost > 0 && sonyShare > 0 ? (totalCost * sonyShare) / 100 : null;
        payload.document_path = details?.document_path ?? null;
      }

      const endpoint = {
        bestellung: "/api/bestellung",
        projekt: "/api/projekt",
        verkauf: "/api/verkauf-upload",
        support: "/api/support",
        sofortrabatt: "/api/sofortrabatt",
      }[mode];

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Einreichung fehlgeschlagen");
      }

      setSuccess(true);
      setCart(() => []);
      onSuccess();

      if (mode === "support") {
        toast.success(t("support.success.submitted"));
      } else if (mode === "verkauf") {
        toast.success(t("sales.page.saved"));
      } else if (mode === "projekt") {
        toast.success(t("project.toast.saved"));
      } else if (mode === "sofortrabatt") {
        toast.success(t("sofortrabatt.toast.success"));
      } else {
        toast.success(t("bestellung.toast.orderSavedText"));
      }
    } catch (e: any) {
      const message =
        e?.message ||
        (mode === "support"
          ? t("support.error.save")
          : mode === "verkauf"
          ? t("sales.page.saveError")
          : mode === "projekt"
          ? t("project.toast.saveError")
          : mode === "sofortrabatt"
          ? t("sofortrabatt.toast.error")
          : t("bestellung.toast.orderSaveErrorText"));

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className={`fixed bottom-6 right-6 z-50 ${cfg.btn} shadow-lg`}
        >
          {cfg.title} {cart.length ? `(${cart.length})` : ""}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:w-[600px] flex flex-col">
        <SheetHeader>
          <SheetTitle className={cfg.color}>{cfg.title}</SheetTitle>
        </SheetHeader>

        {loadingDealer ? (
          <p className="text-sm text-gray-500 mt-2">{t("sales.loading.dealer")}</p>
        ) : activeDealer ? (
          <div className="mt-2">
            <DealerInfoCompact dealer={activeDealer} />
          </div>
        ) : (
          <p className="text-sm text-red-500 mt-2">{t("sales.errors.dealerNotFound")}</p>
        )}

        {success ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
            <SheetClose asChild>
              <Button className={cfg.bg}>{cfg.successClose}</Button>
            </SheetClose>
          </div>
        ) : (
          <>
            {mode === "verkauf" && (
              <div className="mt-4 border rounded-2xl p-4 bg-gray-50 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{t("sales.cart.title")}</h3>
                  <span className="text-xs text-gray-500">
                    {t("sales.page.noteForUpload")}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-600">
                      {t("sales.upload.calendarWeek")}
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={53}
                      value={calendarWeekLocal}
                      onChange={(e) => {
                        const v = num(e.target.value);
                        setCalendarWeekLocal(v);
                        pushExtra("calendarWeek", v);
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-600">
                      {t("sales.upload.sonyShareQty")}
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={inhouseQtyShareLocal}
                      onChange={(e) => {
                        const v = num(e.target.value);
                        setInhouseQtyShareLocal(v);
                        pushExtra("inhouseQtyShare", v);
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-600">
                      {t("sales.upload.sonyShareRevenue")}
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={inhouseRevenueShareLocal}
                      onChange={(e) => {
                        const v = num(e.target.value);
                        setInhouseRevenueShareLocal(v);
                        pushExtra("inhouseRevenueShare", v);
                      }}
                    />
                  </div>
                </div>

                <div className="border rounded-xl bg-white p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">{t("sales.upload.sonyQty")}</span>
                    <span>{sonyQty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t("sales.upload.totalQty")}</span>
                    <span>{Math.round(totalQty)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t("sales.upload.sonyRevenue")}</span>
                    <span>{money(sonyRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t("sales.upload.totalRevenue")}</span>
                    <span>{money(totalRevenue)}</span>
                  </div>
                </div>
              </div>
            )}

            {mode === "verkauf" && (
              <div className="border-t pt-3">
                <label className="flex items-start gap-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={confirmSonyShare}
                    onChange={(e) => setConfirmSonyShare(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>{t("sales.upload.confirmSonyShare")}</span>
                </label>
              </div>
            )}

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cart.length === 0 ? (
                <p className="text-sm text-gray-500">{cfg.empty}</p>
              ) : (
                cart.map((item, i) => {
                  const name =
                    item.product_name ??
                    item.sony_article ??
                    t("bestellung.common.unknownProduct");
                  const ean = item.ean ?? "-";
                  const serienWert = item.seriennummer ?? item.serial ?? "";

                  return (
                    <div
                      key={i}
                      className="border p-4 rounded-2xl bg-white shadow-sm space-y-3"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <p className="font-semibold">{name}</p>
                          <p className="text-xs text-gray-500">
                            {t("sales.card.ean")}: {ean}
                          </p>
                        </div>
                        <Trash2
                          className="w-4 h-4 text-red-500 cursor-pointer mt-1"
                          onClick={() => removeItem(i)}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-gray-600">
                            {mode === "support"
                              ? t("support.fields.quantity")
                              : t("sales.card.quantity")}
                          </label>
                          <Input
                            type="number"
                            min={1}
                            value={num(item.quantity ?? 1)}
                            onChange={(e) =>
                              updateItem(
                                i,
                                "quantity",
                                Math.max(1, num(e.target.value))
                              )
                            }
                          />
                        </div>

                        {mode !== "support" && (
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              {t("sales.card.price")}
                            </label>
                            <Input
                              type="number"
                              value={item.price ?? ""}
                              onChange={(e) =>
                                updateItem(i, "price", num(e.target.value))
                              }
                              placeholder="z.B. 499"
                            />
                          </div>
                        )}

                        {mode === "support" && (
                          <div className="space-y-1">
                            <label className="text-xs text-gray-600">
                              {t("support.fields.amountPerUnit")}
                            </label>
                            <Input
                              type="number"
                              min={0}
                              value={item.supportbetrag ?? ""}
                              onChange={(e) =>
                                updateItem(i, "supportbetrag", num(e.target.value))
                              }
                              placeholder="z.B. 50"
                            />
                          </div>
                        )}

                        {mode === "verkauf" && (
                          <div className="space-y-1">
                            <label className="text-xs text-gray-600">
                              {t("sales.card.serialNumber")}
                            </label>
                            <Input
                              type="text"
                              value={serienWert}
                              onChange={(e) => {
                                updateItem(i, "seriennummer", e.target.value);
                              }}
                              placeholder={t("sales.card.serialPlaceholder")}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <Button
                onClick={handleSubmit}
                disabled={loading || (mode === "verkauf" && !confirmSonyShare)}
                className={`w-full ${cfg.bg} text-white font-semibold`}
              >
                {loading ? cfg.loading : cfg.submit}
              </Button>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
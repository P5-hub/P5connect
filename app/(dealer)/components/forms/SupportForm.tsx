"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  HandCoins,
  Megaphone,
  CalendarDays,
  FileText,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import ProductList from "@/app/(dealer)/components/ProductList";
import ProductCardSupport from "@/app/(dealer)/components/ProductCardSupport";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { useTheme } from "@/lib/theme/ThemeContext";
import { useDealer } from "@/app/(dealer)/DealerContext";
import { useCart } from "@/app/(dealer)/GlobalCartProvider";

type SupportType = "sellout" | "marketing" | "event" | "other";

const MAX_FILES = 5;

function mergeFiles(existing: File[], incoming: File[]) {
  const map = new Map<string, File>();

  [...existing, ...incoming].forEach((file) => {
    const key = `${file.name}__${file.size}__${file.lastModified}`;
    if (!map.has(key)) {
      map.set(key, file);
    }
  });

  return Array.from(map.values()).slice(0, MAX_FILES);
}

export default function SupportForm() {
  const { t } = useI18n();
  const theme = useTheme();
  const dealer = useDealer();

  const {
    addItem,
    openCart,
    setOrderDetails,
    orderDetails,
    getItems,
    supportMeta,
    setSupportMeta,
  } = useCart();

  const supportItems = getItems("support") ?? [];
  const supportCount = supportItems.length;

  const supportTotal = useMemo(() => {
    return supportItems.reduce((s: number, i: any) => {
      const qty = Number(i.quantity) || 1;
      const betrag = Number(i.supportbetrag) || 0;
      return s + qty * betrag;
    }, 0);
  }, [supportItems]);

  const searchParams = useSearchParams();
  const dealerIdFromUrl = searchParams.get("dealer_id");
  const effectiveDealerId = dealerIdFromUrl
    ? Number(dealerIdFromUrl)
    : (dealer as any)?.dealer_id ?? null;

  const [nonSellout, setNonSellout] = useState({
    totalCost: 0,
    sonyShare: 0,
  });

  const [loading, setLoading] = useState(false);

  const activeBtn = `${theme.color.replace("text-", "bg-")} text-white`;
  const inactiveBtn = `border ${theme.border} hover:${theme.bgLight}`;

  const sonyAmount = (nonSellout.totalCost * nonSellout.sonyShare) / 100;
  const selectedFiles = orderDetails?.support_files ?? [];

  const handleSupportFilesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const incomingFiles = Array.from(e.target.files ?? []);

    setOrderDetails((prev) => {
      const merged = mergeFiles(prev.support_files ?? [], incomingFiles);

      if ((prev.support_files?.length ?? 0) + incomingFiles.length > MAX_FILES) {
        toast.error(
          t("support.error.tooManyFiles") || `Maximal ${MAX_FILES} Belege erlaubt`
        );
      }

      return {
        ...prev,
        support_files: merged,
      };
    });

    // damit dieselbe Datei später nochmals gewählt werden kann
    e.target.value = "";
  };

  const removeSupportFileAtIndex = (index: number) => {
    setOrderDetails((prev) => ({
      ...prev,
      support_files: prev.support_files.filter((_, i) => i !== index),
    }));

    toast.success(t("support.files.removed"));
  };

  const submitNonSelloutSupport = async () => {
    if (!effectiveDealerId) {
      toast.error(t("support.error.missingDealerFromUrl"));
      return;
    }

    if (!supportMeta.type) {
      toast.error(t("support.error.missingSupportType"));
      return;
    }

    if (!nonSellout.totalCost || !nonSellout.sonyShare) {
      toast.error(t("support.error.missingCosts"));
      return;
    }

    const files = orderDetails?.support_files ?? [];
    if (files.length > MAX_FILES) {
      toast.error(
        t("support.error.tooManyFiles") || `Maximal ${MAX_FILES} Belege erlaubt`
      );
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();

      fd.append(
        "payload",
        JSON.stringify({
          dealer_id: effectiveDealerId,
          type: supportMeta.type,
          comment: supportMeta.comment || null,
          totalCost: nonSellout.totalCost,
          sonyShare: nonSellout.sonyShare,
          sonyAmount,
          items: [],
        })
      );

      files.forEach((file) => {
        if (file instanceof File) {
          fd.append("files", file);
        }
      });

      const res = await fetch("/api/support", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || t("support.error.submitFailed"));
      }

      toast.success(t("support.success.submitted"));

      setNonSellout({ totalCost: 0, sonyShare: 0 });
      setSupportMeta({ type: "", comment: "" });
      setOrderDetails((prev) => ({ ...prev, support_files: [] }));
    } catch (err: any) {
      toast.error(err?.message || t("support.error.unknown"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-10 px-6 pb-24">
      <h2 className="text-2xl font-semibold">{t("support.heading")}</h2>

      <Card className={theme.border}>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold text-sm text-gray-700">
            {t("support.fields.supportType")}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ["sellout", t("support.type.sellout"), HandCoins],
              ["marketing", t("support.type.werbung"), Megaphone],
              ["event", t("support.type.event"), CalendarDays],
              ["other", t("support.type.sonstiges"), FileText],
            ].map(([key, label, Icon]: any) => (
              <Button
                key={key}
                size="sm"
                type="button"
                onClick={() =>
                  setSupportMeta((m) => ({ ...m, type: key as SupportType }))
                }
                className={supportMeta.type === key ? activeBtn : inactiveBtn}
              >
                <Icon className="w-4 h-4 mr-1" />
                {label}
              </Button>
            ))}
          </div>

          <div>
            <label className="text-sm text-gray-600">
              {t("support.fields.comment")}
            </label>
            <textarea
              rows={3}
              className="border rounded-md px-3 py-2 w-full mt-1"
              value={supportMeta.comment}
              onChange={(e) =>
                setSupportMeta((m) => ({
                  ...m,
                  comment: e.target.value,
                }))
              }
              placeholder={t("support.hints.optionalComment")}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">
              {t("support.fields.receipt")}
            </label>

            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={handleSupportFilesChange}
            />

            {selectedFiles.length > 0 ? (
              <div className="mt-2 space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                    className="text-sm border rounded-lg p-2 bg-white flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="truncate">{file.name}</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => removeSupportFileAtIndex(index)}
                      title={t("support.hints.removeReceipt")}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}

                <p className="text-xs text-gray-500">
                  {selectedFiles.length} / {MAX_FILES} {t("support.fields.receipt")}
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                {t("support.states.noReceipt")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {supportMeta.type === "sellout" && (
        <Card className={theme.border}>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-sm text-gray-700 mb-4">
              {t("support.states.selectProducts")}
            </h3>

            <ProductList
              CardComponent={ProductCardSupport}
              cardProps={{
                onAddToCart: (item: any) => {
                  addItem("support", item);
                  openCart("support");
                },
              }}
              supportType="sellout"
            />
          </CardContent>
        </Card>
      )}

      {supportMeta.type !== "sellout" && supportMeta.type !== "" && (
        <Card className={theme.border}>
          <CardContent className="pt-6">
            <div className="max-w-lg space-y-4">
              <h3 className="font-semibold text-sm text-gray-700">
                {t("support.states.costSharing")}
              </h3>

              <Input
                type="number"
                placeholder={t("support.fields.totalCost")}
                value={nonSellout.totalCost || ""}
                onChange={(e) =>
                  setNonSellout((d) => ({
                    ...d,
                    totalCost: Number(e.target.value),
                  }))
                }
              />

              <Input
                type="number"
                placeholder={t("support.fields.sonyShare")}
                value={nonSellout.sonyShare || ""}
                onChange={(e) =>
                  setNonSellout((d) => ({
                    ...d,
                    sonyShare: Number(e.target.value),
                  }))
                }
              />

              <div className="flex justify-between border rounded-md px-3 py-2 bg-gray-50 text-sm">
                <span>{t("support.fields.sonyAmount")}</span>
                <span className="font-semibold">
                  {sonyAmount.toLocaleString("de-CH", {
                    style: "currency",
                    currency: "CHF",
                  })}
                </span>
              </div>

              <Button
                className={`${activeBtn} mt-2`}
                onClick={submitNonSelloutSupport}
                disabled={loading}
                type="button"
              >
                {loading
                  ? t("support.actions.sending")
                  : t("support.actions.submitButton")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <button
        type="button"
        onClick={() => openCart("support")}
        className="fixed bottom-6 right-6 z-50 shadow-lg rounded-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 flex items-center gap-2"
        title={t("support.actions.openCart")}
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="font-semibold">{t("support.states.cartLabel")}</span>

        {supportCount > 0 && (
          <span className="ml-1 text-xs bg-white/20 rounded-full px-2 py-1">
            {supportCount} ·{" "}
            {supportTotal.toLocaleString("de-CH", {
              style: "currency",
              currency: "CHF",
            })}
          </span>
        )}
      </button>
    </div>
  );
}
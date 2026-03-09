"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/app/(dealer)/GlobalCartProvider";
import { useDealer } from "@/app/(dealer)/DealerContext";
import { FileText, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

type SupportItem = {
  product_id?: string | number;
  product_name?: string;
  sony_article?: string;
  ean?: string;
  quantity?: number;
  supportbetrag?: number;
};

const MAX_FILES = 5;

function getActingDealerIdFromCookie(): number | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("acting_dealer_id="));
  if (!match) return null;
  const v = Number(match.split("=")[1]);
  return Number.isFinite(v) ? v : null;
}

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

export default function CartSupport() {
  const { t } = useI18n();
  const dealer = useDealer();
  const actingDealerId = getActingDealerIdFromCookie();
  const dealerId = actingDealerId ?? (dealer as any)?.dealer_id ?? null;

  const {
    state,
    getItems,
    updateItem,
    removeItem,
    clearCart,
    closeCart,
    orderDetails,
    setOrderDetails,
    clearOrderFiles,
    supportMeta,
    setSupportMeta,
    resetSupportMeta,
  } = useCart();

  const cart = (getItems("support") as SupportItem[]) ?? [];
  const open = state.open && state.currentForm === "support";
  const files = orderDetails?.support_files ?? [];

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cart.length > 0 && !supportMeta.type) {
      setSupportMeta((d) => ({ ...d, type: "sellout" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.length]);

  const totalBetrag = useMemo(
    () =>
      cart.reduce(
        (s, i) =>
          s + (Number(i.supportbetrag) || 0) * (Number(i.quantity) || 1),
        0
      ),
    [cart]
  );

  const handleSupportFilesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const incomingFiles = Array.from(e.target.files ?? []);

    setOrderDetails((prev: any) => {
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

    toast.success(t("support.states.selectedFile"));
    e.target.value = "";
  };

  const removeSupportFileAtIndex = (index: number) => {
    setOrderDetails((prev: any) => ({
      ...prev,
      support_files: prev.support_files.filter((_: File, i: number) => i !== index),
    }));
    toast.success(t("support.files.removed"));
  };

  const handleRemoveCartItem = (index: number) => {
    if (typeof removeItem !== "function") {
      toast.error("removeItem fehlt im GlobalCartProvider.");
      return;
    }

    removeItem("support", index);
    toast.success(t("support.product.removedFromCart") || "Position entfernt");
  };

  const handleSubmit = async () => {
    if (!dealerId || !Number.isFinite(Number(dealerId))) {
      toast.error(t("support.error.save"), {
        description: t("support.error.missingDealerId"),
      });
      return;
    }

    if (!supportMeta.type) {
      toast.error(t("support.error.missingSupportType"));
      return;
    }

    if (supportMeta.type === "sellout" && cart.length === 0) {
      toast.error(t("support.error.missingPositions"));
      return;
    }

    if (supportMeta.type === "sellout") {
      const invalid = cart.some(
        (i) =>
          !Number(i.quantity) ||
          Number(i.quantity) <= 0 ||
          !Number(i.supportbetrag) ||
          Number(i.supportbetrag) <= 0
      );

      if (invalid) {
        toast.error(t("support.error.invalidValues"));
        return;
      }
    }

    if (files.length > MAX_FILES) {
      toast.error(
        t("support.error.tooManyFiles") || `Maximal ${MAX_FILES} Belege erlaubt`
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        dealer_id: Number(dealerId),
        items:
          supportMeta.type === "sellout"
            ? cart.map((i) => ({
                ...i,
                quantity: Number(i.quantity) || 1,
                supportbetrag: Number(i.supportbetrag) || 0,
              }))
            : [],
        meta: {
          support_type: supportMeta.type,
          comment: supportMeta.comment || "",
        },
      };

      const fd = new FormData();
      fd.append("payload", JSON.stringify(payload));

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

      clearCart("support");
      clearOrderFiles?.("support");
      resetSupportMeta();

      toast.success(t("support.states.success"));
      closeCart();
    } catch (err: any) {
      toast.error(t("support.error.save"), {
        description: err?.message ?? t("support.error.unknown"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) closeCart();
      }}
    >
      <SheetContent side="right" className="w-full sm:w-[600px] flex flex-col">
        <SheetHeader>
          <SheetTitle>{t("support.states.sendTitle")}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-2">
          <div className="text-sm font-semibold">
            {t("support.states.positions")}
          </div>

          {cart.length === 0 ? (
            <div className="text-sm text-gray-500 border rounded-xl p-3 bg-white">
              {t("support.states.noSupportProducts")}
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item, index) => (
                <div
                  key={`${item.product_id ?? "x"}-${index}`}
                  className="border rounded-xl p-3 bg-white shadow space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {item.product_name ||
                          item.sony_article ||
                          t("support.product.unknown")}
                      </p>

                      <p className="text-xs text-gray-500">
                        {t("support.product.ean")}: {item.ean || "-"}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => handleRemoveCartItem(index)}
                      title={t("support.actions.remove") || "Entfernen"}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">
                        {t("support.fields.quantity")}
                      </div>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity ?? 1}
                        disabled={supportMeta.type !== "sellout"}
                        onChange={(e) =>
                          updateItem("support", index, {
                            quantity: Number(e.target.value) || 1,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">
                        {t("support.fields.amountPerUnit")}
                      </div>
                      <Input
                        type="number"
                        min={0}
                        value={item.supportbetrag ?? 0}
                        disabled={supportMeta.type !== "sellout"}
                        onChange={(e) =>
                          updateItem("support", index, {
                            supportbetrag: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>

                  {supportMeta.type !== "sellout" && (
                    <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                      {t("support.hints.selloutOnly")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border rounded-xl p-4 bg-gray-50 space-y-3 mt-4">
          <label className="text-sm font-semibold">
            {t("support.fields.supportType")}
          </label>

          <select
            className="w-full border rounded px-2 py-1"
            value={supportMeta.type}
            onChange={(e) =>
              setSupportMeta((d) => ({
                ...d,
                type: e.target.value as any,
              }))
            }
          >
            <option value="">{t("support.actions.choose")}</option>
            <option value="sellout">{t("support.type.sellout")}</option>
            <option value="marketing">{t("support.type.werbung")}</option>
            <option value="event">{t("support.type.event")}</option>
            <option value="other">{t("support.type.sonstiges")}</option>
          </select>

          <label className="text-sm font-semibold">
            {t("support.fields.comment")}
          </label>

          <Input
            value={supportMeta.comment}
            onChange={(e) =>
              setSupportMeta((d) => ({ ...d, comment: e.target.value }))
            }
            placeholder={t("support.hints.optionalComment")}
          />

          <div className="pt-2 space-y-2">
            <label className="text-sm font-semibold">
              {t("support.fields.receipt")}
            </label>

            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={handleSupportFilesChange}
            />

            {files.length === 0 ? (
              <p className="text-xs text-gray-500 mt-1">
                {t("support.states.noReceipt")}
              </p>
            ) : (
              <div className="mt-2 space-y-2">
                {files.map((file, index) => (
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
                      onClick={() => removeSupportFileAtIndex(index)}
                      title={t("support.hints.removeReceipt")}
                      type="button"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}

                <p className="text-xs text-gray-500">
                  {files.length} / {MAX_FILES} {t("support.fields.receipt")}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-4 space-y-3 mt-4">
          {supportMeta.type === "sellout" && cart.length > 0 && (
            <p className="text-sm">
              <b>{t("support.states.totalAmount")}:</b>{" "}
              {totalBetrag.toLocaleString("de-CH", {
                style: "currency",
                currency: "CHF",
              })}
            </p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            type="button"
          >
            {loading
              ? t("support.actions.sending")
              : t("support.actions.submitButton")}
          </Button>

          <SheetClose asChild>
            <Button
              variant="outline"
              onClick={closeCart}
              className="w-full"
              type="button"
            >
              {t("support.actions.cancel")}
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
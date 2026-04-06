"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BadgeInfo,
  CheckCircle2,
  Copy,
  FileUp,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingCart,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Trophy,
  Truck,
  User,
  ClipboardList,
  Store,
  ChevronRight,
} from "lucide-react";

import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { calcInvestByRule } from "@/lib/helpers/calcHelpers";
import ProjectFileUpload from "@/app/(dealer)/components/project/ProjectFileUpload";
import { useTheme } from "@/lib/theme/ThemeContext";
import { calcCampaignPrice } from "@/lib/helpers/campaignPricing";
import { getDealerIdFromUrl } from "@/lib/dealer/getDealerIdFromUrl";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useDealer } from "@/app/(dealer)/DealerContext";
import { useCart } from "@/app/(dealer)/GlobalCartProvider";

import type { CartItem } from "@/app/(dealer)/types/CartItem";

type Disti = {
  id: string;
  code: string;
  name: string;
  invest_rule: string | null;
};

type BonusTier = {
  tier_level: number;
  threshold_value: number;
  bonus_type: "amount" | "percent" | "credit" | "gift";
  bonus_value: number;
  label: string | null;
};

type CampaignUsageSummary = {
  display: number;
  messe: number;
  total: number;
};

/* ------------------------------------------------------------------
   💡 Hilfsfunktionen
------------------------------------------------------------------- */

const TOAST_DURATION = 4000;

const toInt = (v: any) => (Number.isFinite(+v) ? Math.round(+v) : 0);
const norm = (v: any) => (typeof v === "string" ? v.trim() : v ?? "");
const safeNum = (v: any) =>
  isFinite(v) && !isNaN(v) ? parseFloat(Number(v).toFixed(2)) : 0;

const formatNumberCH = (
  value: number | string | null | undefined,
  minimumFractionDigits = 0,
  maximumFractionDigits = 0
) =>
  Number(value ?? 0).toLocaleString("de-CH", {
    minimumFractionDigits,
    maximumFractionDigits,
  });

const formatCurrencyCH = (
  value: number | string | null | undefined,
  minimumFractionDigits = 0,
  maximumFractionDigits = 2
) =>
  `${Number(value ?? 0).toLocaleString("de-CH", {
    minimumFractionDigits,
    maximumFractionDigits,
  })} CHF`;

const mapRequestedDelivery = (m: "sofort" | "termin") =>
  m === "termin" ? "scheduled" : "immediately";

const normalizeRequestedDate = (
  mode: "sofort" | "termin",
  dateStr: string
) => {
  if (mode !== "termin") return null;
  const s = (dateStr || "").trim();
  if (!s) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
};

const getEkNormal = (item: CartItem) =>
  toInt(
    (item as any).dealer_invoice_price ??
      (item as any).product_price ??
      (item as any).ek_normal ??
      (item as any).ek ??
      0
  );

const pickPreferred = (item: CartItem, allowed: string[]) => {
  if (!allowed || allowed.length === 0) return "";
  const ph2 = ((item as any).ph2 ?? "").toLowerCase();

  if (ph2.includes("tv") || ph2.includes("tme")) {
    return allowed.find((a) => a.toLowerCase().includes("ep")) || allowed[0];
  }

  if (ph2.includes("ht") || ph2.includes("soundbar")) {
    return allowed.find((a) => a.toLowerCase().includes("ep")) || allowed[0];
  }

  if (ph2.includes("dim")) {
    return (
      allowed.find((a) => a.toLowerCase().includes("engel")) || allowed[0]
    );
  }

  if (ph2.includes("pds") || ph2.includes("pa")) {
    return allowed.find((a) => a.toLowerCase().includes("semi")) || allowed[0];
  }

  return allowed[0];
};

const getCartItemMode = (item: any): "display" | "messe" | "standard" => {
  const pricingMode = String(item?.pricing_mode ?? "").toLowerCase();

  if (item?.is_display_item || pricingMode === "display") return "display";
  if (pricingMode === "messe") return "messe";
  return "standard";
};

const getCampaignQtySummaryForProduct = (
  cart: CartItem[],
  productId: number,
  excludeIndex?: number
) => {
  return cart.reduce(
    (acc, cartItem, cartIndex) => {
      if (excludeIndex != null && cartIndex === excludeIndex) return acc;
      if (Number((cartItem as any).product_id) !== Number(productId)) return acc;
      if (!(cartItem as any).campaign_id) return acc;

      const qty = Number((cartItem as any).quantity ?? 0);
      const mode = getCartItemMode(cartItem);

      if (mode === "display") acc.display += qty;
      if (mode === "messe") acc.messe += qty;
      if (mode === "display" || mode === "messe") acc.total += qty;

      return acc;
    },
    { display: 0, messe: 0, total: 0 }
  );
};

const makeCampaignUsageKey = (
  campaignId: number | string,
  productId: number | string
) => `${Number(campaignId)}__${Number(productId)}`;

const getEmptyCampaignUsage = (): CampaignUsageSummary => ({
  display: 0,
  messe: 0,
  total: 0,
});

const buildStandardOverflowItem = (
  item: CartItem,
  overflowQty: number
): any => {
  const normalPrice = getEkNormal(item);

  return {
    ...item,
    quantity: overflowQty,
    price: normalPrice,
    pricing_mode: "standard",
    order_mode: "standard",
    is_display_item: false,

    campaign_id: null,
    campaign_name: null,
    campaign_name_snapshot: null,

    display_price_netto: null,
    messe_price_netto: null,
    display_discount_vs_hrp_percent: null,
    pricing_snapshot: null,

    max_qty_per_dealer: null,
    max_display_qty_per_dealer: null,
    max_messe_qty_per_dealer: null,
    max_total_qty_per_dealer: null,

    overflow_from_campaign: true,
  };
};

const clampMinZero = (value: number) => Math.max(0, Number(value || 0));

/* ------------------------------------------------------------------
   Kleine UI-Helfer
------------------------------------------------------------------- */

function SectionCard({
  title,
  icon,
  children,
  tone = "default",
  className = "",
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  tone?: "default" | "blue" | "green" | "amber" | "purple";
  className?: string;
}) {
  const toneMap = {
    default: "border-slate-200 bg-white",
    blue: "border-blue-200 bg-blue-50/40",
    green: "border-emerald-200 bg-emerald-50/40",
    amber: "border-amber-200 bg-amber-50/40",
    purple: "border-purple-200 bg-purple-50/50",
  };

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${toneMap[tone]} ${className}`}>
      <div className="mb-3 flex items-start gap-3">
        <div className="rounded-xl bg-white p-2 text-slate-700 shadow-sm ring-1 ring-black/5">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        </div>
      </div>
      {children}
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "green";
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        tone === "green"
          ? "border-emerald-200 bg-white"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function FieldLabel({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1 block text-[11px] font-medium text-slate-600">
      {children} {required ? <span className="text-red-500">*</span> : null}
    </label>
  );
}

/* ------------------------------------------------------------------
   🧱 PRODUKTKARTE
------------------------------------------------------------------- */

function ProductCard({
  item,
  index,
  cart,
  distis,
  campaignUsageMap,
  updateItem,
  addItem,
  removeFromCart,
}: {
  item: CartItem;
  index: number;
  cart: CartItem[];
  distis: Disti[];
  campaignUsageMap: Record<string, CampaignUsageSummary>;
  updateItem: (
    form:
      | "verkauf"
      | "bestellung"
      | "projekt"
      | "support"
      | "sofortrabatt"
      | "cashback",
    index: number,
    updates: Partial<any>
  ) => void;
  addItem: (
    form:
      | "verkauf"
      | "bestellung"
      | "projekt"
      | "support"
      | "sofortrabatt"
      | "cashback",
    item: any
  ) => void;
  removeFromCart: (index: number) => void;
}) {
  const allowed = Array.isArray((item as any).allowedDistis)
    ? (item as any).allowedDistis
    : [];

  const ek = getEkNormal(item);
  const price = toInt((item as any).price ?? 0);
  const quantity = toInt((item as any).quantity ?? 1);

  const showSavings = ek > 0 && price > 0 && price < ek;
  const savedCHF = showSavings ? ek - price : 0;
  const savedPercent = showSavings ? Math.round(((ek - price) / ek) * 100) : 0;

  const maxQtyPerDealer =
    (item as any).campaign_id && (item as any).max_qty_per_dealer != null
      ? Number((item as any).max_qty_per_dealer)
      : null;

  const maxTotalQtyPerDealer =
    (item as any).campaign_id &&
    (item as any).max_total_qty_per_dealer != null
      ? Number((item as any).max_total_qty_per_dealer)
      : null;

  const maxDisplayQtyPerDealer =
    (item as any).campaign_id &&
    (item as any).max_display_qty_per_dealer != null
      ? Number((item as any).max_display_qty_per_dealer)
      : null;

  const maxMesseQtyPerDealer =
    (item as any).campaign_id &&
    (item as any).max_messe_qty_per_dealer != null
      ? Number((item as any).max_messe_qty_per_dealer)
      : null;

  const campaignUsageKey =
    (item as any).campaign_id && (item as any).product_id
      ? makeCampaignUsageKey(
          Number((item as any).campaign_id),
          Number((item as any).product_id)
        )
      : null;

  const persistedSummary =
    (campaignUsageKey && campaignUsageMap[campaignUsageKey]) ||
    getEmptyCampaignUsage();

  const effectiveMode = getCartItemMode(item);
  const isCampaignItem = !!(item as any).campaign_id;
  const isDisplayItem = effectiveMode === "display";
  const isMesseItem = effectiveMode === "messe";

  const summaryOtherRows = getCampaignQtySummaryForProduct(
    cart,
    Number((item as any).product_id),
    index
  );

  const remainingGeneralCampaignQty =
    maxQtyPerDealer != null && maxQtyPerDealer > 0
      ? clampMinZero(
          maxQtyPerDealer - persistedSummary.total - summaryOtherRows.total
        )
      : null;

  const remainingDisplayCampaignQty =
    maxDisplayQtyPerDealer != null && maxDisplayQtyPerDealer > 0
      ? clampMinZero(
          maxDisplayQtyPerDealer -
            persistedSummary.display -
            summaryOtherRows.display
        )
      : null;

  const remainingMesseCampaignQty =
    maxMesseQtyPerDealer != null && maxMesseQtyPerDealer > 0
      ? clampMinZero(
          maxMesseQtyPerDealer - persistedSummary.messe - summaryOtherRows.messe
        )
      : null;

  const remainingTotalCampaignQty =
    maxTotalQtyPerDealer != null && maxTotalQtyPerDealer > 0
      ? clampMinZero(
          maxTotalQtyPerDealer - persistedSummary.total - summaryOtherRows.total
        )
      : null;

  const allowedCampaignQtyForThisRow = useMemo(() => {
    if (!isCampaignItem) return null;

    const candidates: number[] = [];

    if (
      remainingGeneralCampaignQty != null &&
      remainingGeneralCampaignQty >= 0
    ) {
      candidates.push(remainingGeneralCampaignQty);
    }

    if (isDisplayItem) {
      if (
        remainingDisplayCampaignQty != null &&
        remainingDisplayCampaignQty >= 0
      ) {
        candidates.push(remainingDisplayCampaignQty);
      }
    }

    if (isMesseItem) {
      if (
        remainingMesseCampaignQty != null &&
        remainingMesseCampaignQty >= 0
      ) {
        candidates.push(remainingMesseCampaignQty);
      }
    }

    if (
      remainingTotalCampaignQty != null &&
      remainingTotalCampaignQty >= 0
    ) {
      candidates.push(remainingTotalCampaignQty);
    }

    if (candidates.length === 0) return null;
    return Math.min(...candidates);
  }, [
    isCampaignItem,
    isDisplayItem,
    isMesseItem,
    remainingGeneralCampaignQty,
    remainingDisplayCampaignQty,
    remainingMesseCampaignQty,
    remainingTotalCampaignQty,
  ]);

  const upsertOverflowRow = useCallback(
    (targetQty: number) => {
      const existingOverflowIndex = cart.findIndex((cartItem, cartIndex) => {
        if (cartIndex === index) return false;
        if (
          Number((cartItem as any).product_id) !==
          Number((item as any).product_id)
        )
          return false;
        if ((cartItem as any).campaign_id) return false;
        if (!(cartItem as any).overflow_from_campaign) return false;
        return true;
      });

      if (targetQty <= 0) {
        if (existingOverflowIndex >= 0) {
          removeFromCart(existingOverflowIndex);
        }
        return;
      }

      if (existingOverflowIndex >= 0) {
        updateItem("bestellung", existingOverflowIndex, {
          quantity: targetQty,
          price: getEkNormal(item),
          pricing_mode: "standard",
          order_mode: "standard",
          is_display_item: false,
          overflow_from_campaign: true,
          campaign_id: null,
          campaign_name: null,
          campaign_name_snapshot: null,
          max_qty_per_dealer: null,
          max_display_qty_per_dealer: null,
          max_messe_qty_per_dealer: null,
          max_total_qty_per_dealer: null,
        });
        return;
      }

      addItem("bestellung", buildStandardOverflowItem(item, targetQty));
    },
    [cart, index, item, addItem, updateItem, removeFromCart]
  );

  const campaignLimitInfoLines = useMemo(() => {
    const lines: Array<{ text: string; color: string }> = [];

    if (maxDisplayQtyPerDealer != null && maxDisplayQtyPerDealer > 0) {
      lines.push({
        text: `Display max. ${maxDisplayQtyPerDealer} · bereits bestellt ${persistedSummary.display} · noch frei ${clampMinZero(
          maxDisplayQtyPerDealer - persistedSummary.display
        )}`,
        color: "text-indigo-600",
      });
    }

    if (maxMesseQtyPerDealer != null && maxMesseQtyPerDealer > 0) {
      lines.push({
        text: `Messe max. ${maxMesseQtyPerDealer} · bereits bestellt ${persistedSummary.messe} · noch frei ${clampMinZero(
          maxMesseQtyPerDealer - persistedSummary.messe
        )}`,
        color: "text-blue-600",
      });
    }

    if (maxQtyPerDealer != null && maxQtyPerDealer > 0) {
      lines.push({
        text: `Aktions max. ${maxQtyPerDealer} · bereits bestellt ${persistedSummary.total} · noch frei ${clampMinZero(
          maxQtyPerDealer - persistedSummary.total
        )}`,
        color: "text-amber-600",
      });
    }

    if (maxTotalQtyPerDealer != null && maxTotalQtyPerDealer > 0) {
      lines.push({
        text: `Total Aktion max. ${maxTotalQtyPerDealer} · bereits bestellt ${persistedSummary.total} · noch frei ${clampMinZero(
          maxTotalQtyPerDealer - persistedSummary.total
        )}`,
        color: "text-emerald-600",
      });
    }

    return lines;
  }, [
    maxQtyPerDealer,
    maxDisplayQtyPerDealer,
    maxMesseQtyPerDealer,
    maxTotalQtyPerDealer,
    persistedSummary,
  ]);

  const handleQuantityChange = (inputValue: string) => {
    const nextQty = Math.max(1, toInt(inputValue));

    if (!isCampaignItem) {
      updateItem("bestellung", index, {
        quantity: nextQty,
      });
      return;
    }

    const allowedQty =
      allowedCampaignQtyForThisRow != null
        ? clampMinZero(allowedCampaignQtyForThisRow)
        : nextQty;

    if (allowedQty >= nextQty) {
      updateItem("bestellung", index, {
        quantity: nextQty,
      });

      const existingOverflowIndex = cart.findIndex((cartItem, cartIndex) => {
        if (cartIndex === index) return false;
        if (
          Number((cartItem as any).product_id) !==
          Number((item as any).product_id)
        )
          return false;
        if ((cartItem as any).campaign_id) return false;
        if (!(cartItem as any).overflow_from_campaign) return false;
        return true;
      });

      if (existingOverflowIndex >= 0) {
        removeFromCart(existingOverflowIndex);
      }

      return;
    }

    const overflowQty = clampMinZero(nextQty - allowedQty);

    const productLabel =
      item.product_name || (item as any).sony_article || "dieses Produkt";

    const modeLabel = isDisplayItem
      ? "Display"
      : isMesseItem
      ? "Messe"
      : "Aktion";

    const alreadyOrderedCount = isDisplayItem
      ? persistedSummary.display
      : isMesseItem
      ? persistedSummary.messe
      : persistedSummary.total;

    if (allowedQty > 0) {
      updateItem("bestellung", index, {
        quantity: allowedQty,
      });

      upsertOverflowRow(overflowQty);

      toast.warning(`${modeLabel}-Limit erreicht`, {
        description: `Für ${productLabel} sind noch ${allowedQty} Stück zum ${modeLabel.toLowerCase()}preis möglich. Bereits bestellt: ${alreadyOrderedCount}. ${overflowQty} Stück wurden automatisch als separate Position zum Normalpreis übernommen.`,
        duration: TOAST_DURATION,
      });
      return;
    }

    upsertOverflowRow(nextQty);
    removeFromCart(index);

    toast.warning(`${modeLabel}-Kontingent ausgeschöpft`, {
      description: `Für ${productLabel} ist kein ${modeLabel.toLowerCase()}kontingent mehr frei. Bereits bestellt: ${alreadyOrderedCount}. Die gesamte Menge wurde automatisch zum Normalpreis übernommen.`,
      duration: TOAST_DURATION,
    });
  };

  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-slate-900">
              {item.product_name || (item as any).sony_article || "Unbekannt"}
            </p>

            {allowed.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                <Star className="h-3 w-3" />
                Spezialvertrieb
              </span>
            )}

            {(item as any).bonus_relevant === true &&
              !(item as any).overflow_from_campaign && (
                <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
                  <Sparkles className="h-3 w-3" />
                  Bonusrelevant
                </span>
              )}

            {(item as any).overflow_from_campaign && (
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                Normalpreis
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-slate-500">EAN: {item.ean || "-"}</p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeFromCart(index)}
          className="h-8 w-8 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600"
          title="Entfernen"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <FieldLabel>Anzahl</FieldLabel>

          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            className="h-10 text-center text-sm"
          />

          {campaignLimitInfoLines.map((line, idx) => (
            <p key={idx} className={`mt-1 text-[11px] ${line.color}`}>
              {line.text}
            </p>
          ))}

          {isCampaignItem &&
            allowedCampaignQtyForThisRow != null &&
            allowedCampaignQtyForThisRow >= 0 &&
            !(item as any).overflow_from_campaign && (
              <p className="mt-1 text-[11px] text-slate-500">
                {isDisplayItem ? (
                  <>
                    In dieser <span className="font-semibold">Display-Position</span> noch max.{" "}
                    <span className="font-semibold">{allowedCampaignQtyForThisRow}</span> Stück
                    zum Displaypreis möglich
                  </>
                ) : isMesseItem ? (
                  <>
                    In dieser <span className="font-semibold">Messe-Position</span> noch max.{" "}
                    <span className="font-semibold">{allowedCampaignQtyForThisRow}</span> Stück
                    zum Messepreis möglich
                  </>
                ) : (
                  <>
                    In dieser Position noch max.{" "}
                    <span className="font-semibold">{allowedCampaignQtyForThisRow}</span> Stück
                    zum Aktionspreis möglich
                  </>
                )}
              </p>
            )}
        </div>

        <div>
          <FieldLabel>Preis (CHF)</FieldLabel>

          <Input
            type="number"
            value={price}
            onChange={(e) =>
              updateItem("bestellung", index, {
                price: toInt(e.target.value),
              })
            }
            className="h-10 text-center text-sm"
          />

          <p className="mt-1 text-[11px] text-slate-500">
            EK normal:{" "}
            <span className="font-medium text-blue-600">
              {ek ? `${formatNumberCH(ek)} CHF` : "-"}
            </span>
          </p>

          {showSavings && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <Tag className="h-3.5 w-3.5" />
              {formatNumberCH(savedCHF)} CHF gespart ({savedPercent}%)
            </div>
          )}
        </div>
      </div>

      {((item as any).display_price_netto != null ||
        (item as any).messe_price_netto != null) &&
        !(item as any).overflow_from_campaign && (
          <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 text-xs">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-semibold text-indigo-900">Pricing-Modus</span>
              <span className="font-semibold text-indigo-700">
                {(item as any).pricing_mode === "display"
                  ? "Display"
                  : (item as any).pricing_mode === "messe"
                  ? "Messe"
                  : "Standard"}
              </span>
            </div>

            <div className="space-y-1.5">
              {(item as any).upe_brutto != null && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">UPE brutto</span>
                  <span className="font-medium">
                    {safeNum((item as any).upe_brutto).toFixed(2)} CHF
                  </span>
                </div>
              )}

              {(item as any).display_price_netto != null && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Displaypreis netto</span>
                  <span className="font-medium text-indigo-700">
                    {safeNum((item as any).display_price_netto).toFixed(2)} CHF
                  </span>
                </div>
              )}

              {(item as any).messe_price_netto != null && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Messepreis netto</span>
                  <span className="font-medium text-indigo-700">
                    {safeNum((item as any).messe_price_netto).toFixed(2)} CHF
                  </span>
                </div>
              )}

              {(item as any).display_discount_vs_hrp_percent != null && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Rabatt vs. HRP</span>
                  <span className="font-medium text-emerald-700">
                    {safeNum(
                      (item as any).display_discount_vs_hrp_percent
                    ).toFixed(2)}
                    %
                  </span>
                </div>
              )}
            </div>

            <label className="mt-3 flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-3 py-2">
              <input
                type="checkbox"
                checked={!!(item as any).is_display_item}
                onChange={(e) => {
                  const checked = e.target.checked;

                  const upeBrutto = Number(
                    (item as any).upe_brutto ?? (item as any).retail_price ?? 0
                  );
                  const dealerInvoicePrice = Number(
                    (item as any).dealer_invoice_price ?? 0
                  );
                  const vrgAmount = Number(
                    (item as any).vrg_amount ?? (item as any).vrg ?? 0
                  );
                  const displayFactorPercent = Number(
                    (item as any).display_factor_percent ?? 50
                  );
                  const messePriceNetto =
                    (item as any).messe_price_netto != null
                      ? Number((item as any).messe_price_netto)
                      : null;

                  const currentQty = Number((item as any).quantity ?? 1);

                  const nextDisplayQty =
                    persistedSummary.display +
                    summaryOtherRows.display +
                    currentQty;

                  const nextTotalQty =
                    persistedSummary.total + summaryOtherRows.total + currentQty;

                  if (
                    checked &&
                    maxDisplayQtyPerDealer != null &&
                    maxDisplayQtyPerDealer > 0 &&
                    nextDisplayQty > maxDisplayQtyPerDealer
                  ) {
                    const stillFree = clampMinZero(
                      maxDisplayQtyPerDealer -
                        persistedSummary.display -
                        summaryOtherRows.display
                    );

                    toast.error("Display-Limit erreicht", {
                      description: `Für ${
                        item.product_name ||
                        (item as any).sony_article ||
                        "dieses Produkt"
                      } sind maximal ${maxDisplayQtyPerDealer} Display-Stück gültig. Bereits bestellt: ${
                        persistedSummary.display
                      }. Noch frei für diese Position: ${stillFree}.`,
                      duration: TOAST_DURATION,
                    });
                    return;
                  }

                  if (
                    checked &&
                    maxTotalQtyPerDealer != null &&
                    maxTotalQtyPerDealer > 0 &&
                    nextTotalQty > maxTotalQtyPerDealer
                  ) {
                    const stillFree = clampMinZero(
                      maxTotalQtyPerDealer -
                        persistedSummary.total -
                        summaryOtherRows.total
                    );

                    toast.error("Gesamtlimit erreicht", {
                      description: `Für ${
                        item.product_name ||
                        (item as any).sony_article ||
                        "dieses Produkt"
                      } sind maximal ${maxTotalQtyPerDealer} Aktions-Stück total gültig. Bereits bestellt: ${
                        persistedSummary.total
                      }. Noch frei für diese Position: ${stillFree}.`,
                      duration: TOAST_DURATION,
                    });
                    return;
                  }

                  const nextPricingMode = checked
                    ? "display"
                    : (item as any).campaign_id
                    ? "messe"
                    : "standard";

                  const pricing = calcCampaignPrice({
                    upe_brutto: upeBrutto,
                    dealer_invoice_price: dealerInvoicePrice,
                    vrg_amount: vrgAmount,
                    mwst_rate: Number((item as any).mwst_rate ?? 8.1),
                    mode: nextPricingMode,
                    messe_price_netto: messePriceNetto,
                    display_factor_percent: displayFactorPercent,
                  });

                  updateItem("bestellung", index, {
                    is_display_item: checked,
                    pricing_mode: nextPricingMode,
                    price: pricing.final_unit_price,
                    upe_brutto: upeBrutto,
                    vrg_amount: vrgAmount,
                    upe_netto_excl_vrg: pricing.upe_netto_excl_vrg,
                    display_price_netto: pricing.display_price_netto,
                    display_discount_vs_hrp_percent:
                      pricing.display_discount_vs_hrp_percent,
                    pricing_snapshot: {
                      source: (item as any).campaign_id ? "campaign" : "standard",
                      campaign_id: (item as any).campaign_id ?? null,
                      campaign_name: (item as any).campaign_name ?? null,
                      order_mode: (item as any).order_mode ?? "standard",
                      pricing_mode: nextPricingMode,
                      upe_brutto: upeBrutto,
                      vrg_amount: vrgAmount,
                      mwst_rate: Number((item as any).mwst_rate ?? 8.1),
                      upe_netto_excl_vrg: pricing.upe_netto_excl_vrg,
                      display_factor_percent: displayFactorPercent,
                      display_price_netto: pricing.display_price_netto,
                      messe_price_netto: pricing.messe_price_netto,
                      final_unit_price: pricing.final_unit_price,
                      display_discount_vs_hrp_percent:
                        pricing.display_discount_vs_hrp_percent,
                      calculated_at: new Date().toISOString(),
                    },
                  });
                }}
                className="h-4 w-4"
              />
              <span className="text-sm text-slate-700">Als Display bestellen</span>
            </label>
          </div>
        )}

      <div className="mt-4 border-t border-slate-200 pt-4">
        <FieldLabel>Günstigster Anbieter</FieldLabel>

        <Select
          value={(item as any).lowest_price_source ?? ""}
          onValueChange={(val) => {
            updateItem("bestellung", index, {
              lowest_price_source: val,
              lowest_price_source_custom:
                val === "Andere"
                  ? (item as any).lowest_price_source_custom ?? ""
                  : null,
            });
          }}
        >
          <SelectTrigger className="h-10 text-sm">
            <SelectValue placeholder="Bitte auswählen" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="Digitec">Digitec</SelectItem>
            <SelectItem value="Mediamarkt">Mediamarkt</SelectItem>
            <SelectItem value="Interdiscount">Interdiscount</SelectItem>
            <SelectItem value="Fnac">Fnac</SelectItem>
            <SelectItem value="Brack">Brack</SelectItem>
            <SelectItem value="Fust">Fust</SelectItem>
            <SelectItem value="Andere">Andere</SelectItem>
          </SelectContent>
        </Select>

        {(item as any).lowest_price_source === "Andere" && (
          <div className="mt-3">
            <FieldLabel required>Bitte Namen des Anbieters angeben</FieldLabel>

            <Input
              placeholder="Name des Händlers"
              value={(item as any).lowest_price_source_custom ?? ""}
              onChange={(e) =>
                updateItem("bestellung", index, {
                  lowest_price_source_custom: e.target.value,
                })
              }
              className="h-10 border-amber-300 text-sm focus-visible:ring-amber-300"
            />

            <p className="mt-1 text-[11px] text-amber-600">
              Pflichtfeld bei Auswahl von „Andere“.
            </p>
          </div>
        )}

        <div className="mt-3">
          <FieldLabel>Günstigster Preis (inkl. MwSt.)</FieldLabel>

          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={(item as any).lowest_price_brutto ?? ""}
            onChange={(e) =>
              updateItem("bestellung", index, {
                lowest_price_brutto:
                  e.target.value === ""
                    ? null
                    : parseFloat(e.target.value) || null,
              })
            }
            className="h-10 text-sm"
          />
        </div>
      </div>

      {allowed.length > 0 && (
        <div className="mt-4">
          <FieldLabel required>Distributor</FieldLabel>

          <Select
            value={(item as any).overrideDistributor ?? ""}
            onValueChange={(val) =>
              updateItem("bestellung", index, { overrideDistributor: val })
            }
          >
            <SelectTrigger className="h-10 text-sm">
              <SelectValue placeholder="Bitte auswählen" />
            </SelectTrigger>

            <SelectContent>
              {distis
                .filter((d) =>
                  allowed.some(
                    (code: string) =>
                      code.toLowerCase() === d.code.toLowerCase()
                  )
                )
                .map((d) => (
                  <SelectItem key={d.code} value={d.code} className="text-sm">
                    {d.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   🧱 PRODUKTLISTE
------------------------------------------------------------------- */

function ProductList({
  cart,
  distis,
  campaignUsageMap,
  updateItem,
  addItem,
  removeFromCart,
}: {
  cart: CartItem[];
  distis: Disti[];
  campaignUsageMap: Record<string, CampaignUsageSummary>;
  updateItem: (
    form:
      | "verkauf"
      | "bestellung"
      | "projekt"
      | "support"
      | "sofortrabatt"
      | "cashback",
    index: number,
    updates: Partial<any>
  ) => void;
  addItem: (
    form:
      | "verkauf"
      | "bestellung"
      | "projekt"
      | "support"
      | "sofortrabatt"
      | "cashback",
    item: any
  ) => void;
  removeFromCart: (index: number) => void;
}) {
  if (cart.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
        Noch keine Produkte ausgewählt.
      </div>
    );
  }

  return (
    <>
      {cart.map((item, index) => (
        <ProductCard
          key={index}
          item={item}
          index={index}
          cart={cart}
          distis={distis}
          campaignUsageMap={campaignUsageMap}
          updateItem={updateItem}
          addItem={addItem}
          removeFromCart={removeFromCart}
        />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------
   🟦 HAUPTKOMPONENTE
------------------------------------------------------------------- */

export default function CartBestellung() {
  const dealer = useDealer();
  const searchParams = useSearchParams();
  const effectiveDealerId = getDealerIdFromUrl(
    searchParams,
    (dealer as any)?.dealer_id
  );

  const supabase = getSupabaseBrowser();
  useTheme();

  const {
    state,
    getItems,
    addItem,
    removeItem,
    clearCart,
    closeCart,
    updateItem,
    projectDetails,
    setProjectDetails,
    orderDetails,
    setOrderDetails,
  } = useCart();

  const rawCartItems = getItems("bestellung") as
    | (CartItem | undefined)[]
    | undefined;

  const cart = useMemo(() => {
    return (rawCartItems || []).filter((item): item is CartItem => Boolean(item));
  }, [rawCartItems]);

  const open = state.open && state.currentForm === "bestellung";

  const activeCampaignIdFromCart = useMemo(() => {
    const firstCampaignItem = cart.find((item: any) => !!item.campaign_id);
    return firstCampaignItem?.campaign_id ?? null;
  }, [cart]);

  const activeCampaignNameFromCart = useMemo(() => {
    const firstCampaignItem = cart.find((item: any) => !!item.campaign_id);
    return firstCampaignItem?.campaign_name ?? null;
  }, [cart]);

  const campaignUsageDepsKey = useMemo(() => {
    return JSON.stringify(
      cart
        .filter((item: any) => !!item?.campaign_id && !!item?.product_id)
        .map((item: any) => ({
          campaign_id: Number(item.campaign_id),
          product_id: Number(item.product_id),
        }))
        .sort((a, b) => {
          if (a.campaign_id !== b.campaign_id) {
            return a.campaign_id - b.campaign_id;
          }
          return a.product_id - b.product_id;
        })
    );
  }, [cart]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [distis, setDistis] = useState<Disti[]>([]);
  const [distributor, setDistributor] = useState<string>("ep");
  const [bonusTiers, setBonusTiers] = useState<BonusTier[]>([]);
  const [bookedRevenue, setBookedRevenue] = useState(0);
  const [campaignUsageMap, setCampaignUsageMap] = useState<
    Record<string, CampaignUsageSummary>
  >({});

  const [hasAltDelivery, setHasAltDelivery] = useState(false);
  const [deliveryName, setDeliveryName] = useState("");
  const [deliveryStreet, setDeliveryStreet] = useState("");
  const [deliveryZip, setDeliveryZip] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryCountry, setDeliveryCountry] = useState("Schweiz");
  const [deliveryEmail, setDeliveryEmail] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");

  const [deliveryMode, setDeliveryMode] =
    useState<"sofort" | "termin">("sofort");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [orderComment, setOrderComment] = useState("");
  const [dealerReference, setDealerReference] = useState("");

  const {
    dealerDisplayName,
    dealerLoginNr,
    dealerContact,
    dealerPhone,
    dealerKam,
    dealerEmail,
    dealerCityZip,
  } = useMemo(() => {
    const d = dealer as any;

    const displayName = norm(
      d?.store_name ?? d?.company_name ?? d?.name ?? ""
    );

    const loginNr = norm(d?.login_nr ?? d?.dealer_login_nr ?? "");
    const contact = norm(d?.contact_person ?? d?.dealer_contact_person ?? "");
    const phone = norm(d?.phone ?? d?.dealer_phone ?? "");
    const kam = norm(d?.kam_name ?? d?.kam ?? "");
    const email = norm(d?.mail_dealer ?? d?.email ?? "");
    const zip = norm(d?.zip ?? d?.plz ?? "");
    const city = norm(d?.city ?? "");

    return {
      dealerDisplayName: displayName,
      dealerLoginNr: loginNr,
      dealerContact: contact,
      dealerPhone: phone,
      dealerKam: kam,
      dealerEmail: email,
      dealerCityZip: zip || city ? [zip, city].filter(Boolean).join(" ") : "",
    };
  }, [dealer]);

  const totalQuantity = useMemo(
    () => cart.reduce((s, i) => s + toInt((i as any).quantity || 0), 0),
    [cart]
  );

  const totalPrice = useMemo(
    () =>
      cart.reduce(
        (s, i) =>
          s + toInt((i as any).quantity || 0) * toInt((i as any).price || 0),
        0
      ),
    [cart]
  );

  const totalSaved = useMemo(
    () =>
      cart.reduce((s, i) => {
        const ek = getEkNormal(i);
        const p = toInt((i as any).price ?? 0);
        if (ek > 0 && p > 0 && p < ek) {
          return s + (ek - p) * toInt((i as any).quantity || 1);
        }
        return s;
      }, 0),
    [cart]
  );

  const hasNormalProducts = useMemo(
    () =>
      cart.some(
        (item: any) => !item.allowedDistis || item.allowedDistis.length === 0
      ),
    [cart]
  );

  const codeToId = useMemo(() => {
    const m = new Map<string, string>();
    for (const d of distis) {
      if (d.code) m.set(d.code.toLowerCase(), d.id);
    }
    return m;
  }, [distis]);

  const bonusRelevantCartItems = useMemo(() => {
    return cart.filter((item: any) => {
      if (!item) return false;
      if (!item.campaign_id || !activeCampaignIdFromCart) return false;
      if (Number(item.campaign_id) !== Number(activeCampaignIdFromCart))
        return false;
      return item.bonus_relevant !== false;
    });
  }, [cart, activeCampaignIdFromCart]);

  const liveCartProgressValue = useMemo(() => {
    return bonusRelevantCartItems.reduce(
      (sum, item) =>
        sum + Number(item.quantity ?? 0) * Number(item.price ?? 0),
      0
    );
  }, [bonusRelevantCartItems]);

  const totalProgressAfterSubmit = useMemo(() => {
    return bookedRevenue + liveCartProgressValue;
  }, [bookedRevenue, liveCartProgressValue]);

  const liveNextBonusTier = useMemo(() => {
    if (!bonusTiers.length) return null;
    return (
      bonusTiers.find(
        (tier) => totalProgressAfterSubmit < tier.threshold_value
      ) ?? null
    );
  }, [bonusTiers, totalProgressAfterSubmit]);

  const liveReachedBonusTier = useMemo(() => {
    if (!bonusTiers.length) return null;
    const reached = bonusTiers.filter(
      (tier) => totalProgressAfterSubmit >= tier.threshold_value
    );
    return reached.length ? reached[reached.length - 1] : null;
  }, [bonusTiers, totalProgressAfterSubmit]);

  const liveRemainingToNextTier = useMemo(() => {
    if (!liveNextBonusTier) return 0;
    return Math.max(
      0,
      liveNextBonusTier.threshold_value - totalProgressAfterSubmit
    );
  }, [liveNextBonusTier, totalProgressAfterSubmit]);

  const sortedBonusThresholds = useMemo(() => {
    return [...bonusTiers]
      .map((tier) => Number(tier.threshold_value ?? 0))
      .filter((value) => value > 0)
      .sort((a, b) => a - b);
  }, [bonusTiers]);

  const currentBonusTargetValue = useMemo(() => {
    if (liveNextBonusTier) {
      return Number(liveNextBonusTier.threshold_value ?? 0);
    }

    if (liveReachedBonusTier) {
      return Number(liveReachedBonusTier.threshold_value ?? 0);
    }

    if (sortedBonusThresholds.length > 0) {
      return sortedBonusThresholds[0];
    }

    return 0;
  }, [liveNextBonusTier, liveReachedBonusTier, sortedBonusThresholds]);

  const previousBonusThresholdValue = useMemo(() => {
    if (!sortedBonusThresholds.length) return 0;

    const currentTarget = Number(currentBonusTargetValue ?? 0);
    const currentIndex = sortedBonusThresholds.findIndex(
      (value) => value === currentTarget
    );

    if (currentIndex <= 0) return 0;
    return sortedBonusThresholds[currentIndex - 1];
  }, [sortedBonusThresholds, currentBonusTargetValue]);

  const liveBonusProgressPercent = useMemo(() => {
    if (!currentBonusTargetValue || currentBonusTargetValue <= 0) return 0;

    if (!liveNextBonusTier) return 100;

    const rangeStart = previousBonusThresholdValue;
    const rangeEnd = currentBonusTargetValue;
    const span = Math.max(1, rangeEnd - rangeStart);
    const progressWithinTier = Math.max(
      0,
      totalProgressAfterSubmit - rangeStart
    );

    return Math.min(100, Math.round((progressWithinTier / span) * 100));
  }, [
    currentBonusTargetValue,
    liveNextBonusTier,
    previousBonusThresholdValue,
    totalProgressAfterSubmit,
  ]);

  const estimatedBonusValue = useMemo(() => {
    if (!liveReachedBonusTier) return 0;

    if (liveReachedBonusTier.bonus_type === "percent") {
      return (
        (totalProgressAfterSubmit * liveReachedBonusTier.bonus_value) / 100
      );
    }

    return liveReachedBonusTier.bonus_value;
  }, [liveReachedBonusTier, totalProgressAfterSubmit]);

  useEffect(() => {
    if (open && projectDetails && !projectDetails.project_id) {
      setProjectDetails(null);
    }
  }, [open, projectDetails, setProjectDetails]);

  useEffect(() => {
    if (cart.length > 0) setSuccess(false);
  }, [cart.length]);

  useEffect(() => {
    const loadDistis = async () => {
      const { data } = await supabase
        .from("distributors")
        .select("id, code, name, invest_rule")
        .eq("active", true)
        .order("name");

      if (data) setDistis(data as Disti[]);
    };

    loadDistis();
  }, [supabase]);

  useEffect(() => {
    const loadBonusData = async () => {
      if (!effectiveDealerId || !activeCampaignIdFromCart) {
        setBonusTiers([]);
        setBookedRevenue(0);
        return;
      }

      const { data: bonusRows, error: bonusError } = await supabase
        .from("campaign_bonus_tiers")
        .select("tier_level, threshold_value, bonus_type, bonus_value, label")
        .eq("campaign_id", activeCampaignIdFromCart)
        .or(`dealer_id.eq.${effectiveDealerId},dealer_id.is.null`)
        .order("tier_level", { ascending: true });

      if (bonusError) {
        console.error("Fehler beim Laden der Bonusstufen:", bonusError);
        setBonusTiers([]);
      } else {
        setBonusTiers(
          (bonusRows || []).map((row: any) => ({
            tier_level: Number(row.tier_level),
            threshold_value: Number(row.threshold_value ?? 0),
            bonus_type: row.bonus_type,
            bonus_value: Number(row.bonus_value ?? 0),
            label: row.label ?? null,
          }))
        );
      }

      const { data: revenueRows, error: revenueError } = await supabase
        .from("submission_items")
        .select(`
          menge,
          preis,
          bonus_relevant,
          campaign_id,
          submission:submission_id (
            dealer_id,
            typ,
            status
          )
        `)
        .eq("campaign_id", activeCampaignIdFromCart);

      if (revenueError) {
        console.error("Fehler beim Laden des gebuchten Kampagnenumsatzes:", revenueError);
        setBookedRevenue(0);
        return;
      }

      const revenue =
        (revenueRows || []).reduce((sum: number, row: any) => {
          const submission = Array.isArray(row?.submission)
            ? row.submission[0]
            : row?.submission;

          if (!submission) return sum;
          if (Number(submission.dealer_id) !== Number(effectiveDealerId)) return sum;
          if (submission.typ !== "bestellung") return sum;

          const status = String(submission.status || "").toLowerCase();
          if (["rejected", "cancelled", "canceled", "storno"].includes(status)) {
            return sum;
          }

          if (row?.bonus_relevant === false) return sum;

          return (
            sum +
            Number(row?.menge ?? 0) * Number(row?.preis ?? 0)
          );
        }, 0) || 0;

      setBookedRevenue(revenue);
    };

    loadBonusData();
  }, [supabase, effectiveDealerId, activeCampaignIdFromCart]);

  useEffect(() => {
    const loadAllowedDistis = async () => {
      for (const [index, item] of cart.entries()) {
        if (Array.isArray((item as any).allowedDistis)) continue;

        const { data } = await supabase
          .from("product_distributors")
          .select("distributors(code)")
          .eq("product_id", Number((item as any).product_id));

        if (!data || data.length === 0) continue;

        const allowed = data
          .map((d: any) => d.distributors?.code)
          .filter(Boolean) as string[];

        updateItem("bestellung", index, {
          allowedDistis: allowed,
          overrideDistributor:
            (item as any).overrideDistributor ||
            pickPreferred(item as CartItem, allowed),
        });
      }
    };

    if (cart.length > 0) loadAllowedDistis();
  }, [cart.length, supabase, updateItem]);

  useEffect(() => {
    let isCancelled = false;

    const loadCampaignUsage = async () => {
      const dealerId = effectiveDealerId;

      if (!dealerId || !campaignUsageDepsKey || campaignUsageDepsKey === "[]") {
        setCampaignUsageMap((prev) => {
          if (Object.keys(prev).length === 0) return prev;
          return {};
        });
        return;
      }

      const parsedItems = JSON.parse(campaignUsageDepsKey) as Array<{
        campaign_id: number;
        product_id: number;
      }>;

      const uniqueCampaignIds = Array.from(
        new Set(parsedItems.map((item) => item.campaign_id).filter(Boolean))
      );

      const uniqueProductIds = Array.from(
        new Set(parsedItems.map((item) => item.product_id).filter(Boolean))
      );

      if (uniqueCampaignIds.length === 0 || uniqueProductIds.length === 0) {
        setCampaignUsageMap((prev) => {
          if (Object.keys(prev).length === 0) return prev;
          return {};
        });
        return;
      }

      const { data, error } = await supabase
        .from("submission_items")
        .select(`
          product_id,
          menge,
          pricing_mode,
          is_display_item,
          campaign_id,
          submission:submission_id (
            submission_id,
            dealer_id,
            typ,
            status,
            campaign_id
          )
        `)
        .in("campaign_id", uniqueCampaignIds)
        .in("product_id", uniqueProductIds);

      if (isCancelled) return;

      if (error) {
        console.error("Fehler beim Laden der Campaign-Usage:", error);
        setCampaignUsageMap((prev) => {
          if (Object.keys(prev).length === 0) return prev;
          return {};
        });
        return;
      }

      const nextMap: Record<string, CampaignUsageSummary> = {};

      for (const row of data || []) {
        const submission = Array.isArray((row as any).submission)
          ? (row as any).submission[0]
          : (row as any).submission;

        if (!submission) continue;
        if (Number(submission.dealer_id) !== Number(dealerId)) continue;
        if (submission.typ !== "bestellung") continue;

        if (
          ["rejected", "cancelled", "canceled", "storno"].includes(
            String(submission.status || "").toLowerCase()
          )
        ) {
          continue;
        }

        const campaignId = Number(
          (row as any).campaign_id ?? submission.campaign_id
        );
        const productId = Number((row as any).product_id);
        const qty = Number((row as any).menge ?? 0);

        if (!campaignId || !productId || qty <= 0) continue;

        const key = makeCampaignUsageKey(campaignId, productId);

        if (!nextMap[key]) {
          nextMap[key] = getEmptyCampaignUsage();
        }

        const isDisplay =
          !!(row as any).is_display_item ||
          String((row as any).pricing_mode || "").toLowerCase() === "display";

        const isMesse =
          !isDisplay &&
          String((row as any).pricing_mode || "").toLowerCase() === "messe";

        if (isDisplay) nextMap[key].display += qty;
        if (isMesse) nextMap[key].messe += qty;
        if (isDisplay || isMesse) nextMap[key].total += qty;
      }

      setCampaignUsageMap((prev) => {
        const prevStr = JSON.stringify(prev);
        const nextStr = JSON.stringify(nextMap);
        return prevStr === nextStr ? prev : nextMap;
      });
    };

    loadCampaignUsage();

    return () => {
      isCancelled = true;
    };
  }, [campaignUsageDepsKey, effectiveDealerId, supabase]);

  const removeFromCart = useCallback(
    (index: number) => removeItem("bestellung", index),
    [removeItem]
  );

  const createOrderViaRpc = async (
    submissionPayload: Record<string, any>,
    itemPayloads: Record<string, any>[]
  ) => {
    const { data, error } = await supabase.rpc(
      "create_order_with_campaign_guard",
      {
        p_submission: submissionPayload,
        p_items: itemPayloads,
      }
    );

    if (error) {
      throw error;
    }

    return (data ?? {
      ok: false,
      message: "Unbekannter RPC-Fehler",
    }) as {
      ok: boolean;
      submission_id?: number;
      message?: string | null;
      code?: string;
      product_id?: number;
      campaign_id?: number;
    };
  };

  const handleSubmit = async () => {
    if (!effectiveDealerId) {
      toast.error("❌ Kein Händler gefunden – bitte neu einloggen.", {
        duration: TOAST_DURATION,
      });
      return;
    }

    const hasNormal = cart.some(
      (item: any) => !item.allowedDistis || item.allowedDistis.length === 0
    );
    if (hasNormal && !distributor) {
      toast.error("❌ Bitte Haupt-Distributor auswählen.", {
        duration: TOAST_DURATION,
      });
      return;
    }

    const requestedDate = normalizeRequestedDate(deliveryMode, deliveryDate);

    if (deliveryMode === "termin" && !requestedDate) {
      toast.error("Bitte gültiges Lieferdatum (YYYY-MM-DD) wählen.", {
        duration: TOAST_DURATION,
      });
      return;
    }

    if (deliveryMode === "sofort" && deliveryDate) {
      setDeliveryDate("");
    }

    for (const item of cart as any[]) {
      if (!item.quantity || item.quantity <= 0) {
        toast.error("Ungültige Eingabe", {
          description: `Bitte gültige Menge für ${
            item.product_name ?? item.sony_article ?? "Produkt"
          } eingeben!`,
          duration: TOAST_DURATION,
        });
        return;
      }

      if (item.allowedDistis?.length && !item.overrideDistributor) {
        toast.error("❌ Distributor fehlt", {
          description: `Bitte Distributor für ${
            item.product_name ?? item.sony_article ?? "Produkt"
          } auswählen.`,
          duration: TOAST_DURATION,
        });
        return;
      }

      if (
        item.lowest_price_source === "Andere" &&
        !item.lowest_price_source_custom?.trim()
      ) {
        toast.error("❌ Anbieter fehlt", {
          description: `Bitte Händlernamen für „Andere“ bei ${
            item.product_name ?? "Produkt"
          } angeben.`,
          duration: TOAST_DURATION,
        });
        return;
      }
    }

    const allCodes = new Set<string>();
    for (const item of cart as any[]) {
      const code = item.allowedDistis?.length
        ? (item.overrideDistributor as string)
        : distributor;
      if (code) allCodes.add(code.toLowerCase());
    }

    for (const code of allCodes) {
      if (!codeToId.get(code)) {
        toast.error("❌ Unbekannter Distributor-Code", {
          description: `Distributor "${code}" konnte nicht gefunden werden.`,
          duration: TOAST_DURATION,
        });
        return;
      }
    }

    setLoading(true);

    try {
      const itemsByCode: Record<string, CartItem[]> = {};

      for (const item of cart as any[]) {
        const code = item.allowedDistis?.length
          ? (item.overrideDistributor as string)
          : distributor;
        const key = (code || "").toLowerCase();
        if (!itemsByCode[key]) itemsByCode[key] = [];
        itemsByCode[key].push(item as CartItem);
      }

      for (const [codeLower, items] of Object.entries(itemsByCode)) {
        const distiUuid = codeToId.get(codeLower);
        if (!distiUuid) {
          throw new Error(`Distributor-Code "${codeLower}" nicht gefunden.`);
        }

        const { data: fullProducts, error: prodErr } = await supabase
          .from("products")
          .select("product_id, price_on_invoice, dealer_invoice_price")
          .in("product_id", items.map((i: any) => Number(i.product_id)));

        if (prodErr) {
          console.error("❌ Fehler beim Laden der Produktdaten", prodErr);
          throw prodErr;
        }

        const productMap = new Map(
          (fullProducts || []).map((p: any) => [p.product_id, p])
        );

        const today = new Date();
        const currentDateIso = today.toISOString().slice(0, 10);

        const submissionPayload = {
          dealer_id: effectiveDealerId,
          typ: "bestellung",
          datum: currentDateIso,
          kw: null,
          kommentar: null,
          bestellweg: "portal",
          status: "pending",
          distributor: codeLower,
          custom_distributor: null,
          project_id: projectDetails?.project_id ?? null,
          order_number: null,
          customer_number: dealerLoginNr || null,
          customer_name: dealerDisplayName || null,
          customer_contact: dealerContact || null,
          customer_phone: dealerPhone || null,
          requested_delivery: mapRequestedDelivery(deliveryMode),
          requested_delivery_date:
            deliveryMode === "termin" ? requestedDate : null,
          order_comment: orderComment || null,
          dealer_reference: dealerReference || null,
          sony_share: 100,
          calendar_week: null,
          week_start: null,
          week_end: null,
          delivery_name: hasAltDelivery ? deliveryName || null : null,
          delivery_street: hasAltDelivery ? deliveryStreet || null : null,
          delivery_zip: hasAltDelivery ? deliveryZip || null : null,
          delivery_city: hasAltDelivery ? deliveryCity || null : null,
          delivery_country: hasAltDelivery ? deliveryCountry || null : null,
          delivery_phone: hasAltDelivery ? deliveryPhone || null : null,
          delivery_email: hasAltDelivery ? deliveryEmail || null : null,
          sony_share_qty: null,
          sony_share_revenue: null,
          source: "manual",
          project_file_path: null,
          order_mode: (items[0] as any)?.order_mode ?? "standard",
          campaign_id: (items[0] as any)?.campaign_id ?? null,
          campaign_name_snapshot: (items[0] as any)?.campaign_name ?? null,
          is_admin_order: false,
          created_by_admin_user_id: null,
          display_order: items.some((x: any) => !!x.is_display_item),
          bonus_snapshot: null,
          target_value_snapshot: null,
          target_reached_snapshot: null,
          target_bonus_level_snapshot: null,
        };

        const itemPayloads = items.map((i: any) => {
          const productId = Number(i.product_id);
          const prod = productMap.get(productId);

          const brutto =
            typeof i.lowest_price_brutto === "number"
              ? safeNum(i.lowest_price_brutto)
              : null;

          const vrg = typeof i.vrg === "number" ? i.vrg : 0;

          const netto =
            brutto !== null && brutto > 0
              ? safeNum(brutto / 1.081 - vrg)
              : null;

          const poiAlt = safeNum(
            prod?.price_on_invoice ?? prod?.dealer_invoice_price ?? 0
          );

          const dealerPrice = safeNum(
            i.price != null && i.price > 0 ? i.price : poiAlt
          );

          const distiRow = distis.find(
            (d) => d.code.toLowerCase() === codeLower.toLowerCase()
          );

          const rule = (distiRow as any)?.invest_rule ?? "default";

          let investVal = 0;
          try {
            investVal = safeNum(calcInvestByRule(rule, dealerPrice, poiAlt));
          } catch (err) {
            console.warn("⚠️ Invest-Berechnung fehlgeschlagen:", err);
            investVal = 0;
          }

          return {
            product_id: productId,
            ean: i.ean || null,
            product_name: i.product_name || i.sony_article || null,
            sony_article: i.sony_article || null,
            menge: toInt(i.quantity),
            preis: dealerPrice,
            source: "manual",
            pricing_mode:
              i.is_display_item
                ? "display"
                : i.pricing_mode === "messe"
                ? "messe"
                : "standard",
            upe_brutto: i.upe_brutto != null ? safeNum(i.upe_brutto) : null,
            mwst_rate: i.mwst_rate != null ? safeNum(i.mwst_rate) : 8.1,
            vrg_amount:
              i.vrg_amount != null
                ? safeNum(i.vrg_amount)
                : typeof i.vrg === "number"
                ? safeNum(i.vrg)
                : 0,
            upe_netto_excl_vrg:
              i.upe_netto_excl_vrg != null
                ? safeNum(i.upe_netto_excl_vrg)
                : null,
            display_price_netto:
              i.display_price_netto != null
                ? safeNum(i.display_price_netto)
                : null,
            messe_price_netto:
              i.messe_price_netto != null
                ? safeNum(i.messe_price_netto)
                : null,
            campaign_id:
              i.campaign_id != null ? Number(i.campaign_id) : null,
            is_display_item: !!i.is_display_item,
            bonus_relevant:
              typeof i.bonus_relevant === "boolean" ? i.bonus_relevant : true,
            pricing_snapshot: i.pricing_snapshot ?? null,
            lowest_price_brutto: brutto,
            lowest_price_netto: netto,
            lowest_price_source: i.lowest_price_source?.trim() || null,
            lowest_price_source_custom:
              i.lowest_price_source === "Andere"
                ? i.lowest_price_source_custom?.trim() || null
                : null,
            margin_street:
              netto !== null && dealerPrice > 0
                ? safeNum(((netto - dealerPrice) / netto) * 100)
                : null,
            invest: investVal,
            distributor_id: distiUuid,
            calc_price_on_invoice:
              i.calc_price_on_invoice != null
                ? safeNum(i.calc_price_on_invoice)
                : null,
            netto_retail:
              i.netto_retail != null ? safeNum(i.netto_retail) : null,
            marge_alt: i.marge_alt != null ? safeNum(i.marge_alt) : null,
            marge_neu: i.marge_neu != null ? safeNum(i.marge_neu) : null,
            serial: i.serial || null,
            comment: i.comment || null,
            project_id: i.project_id || null,

            max_qty_per_dealer:
              i.max_qty_per_dealer != null
                ? Number(i.max_qty_per_dealer)
                : null,
            max_display_qty_per_dealer:
              i.max_display_qty_per_dealer != null
                ? Number(i.max_display_qty_per_dealer)
                : null,
            max_messe_qty_per_dealer:
              i.max_messe_qty_per_dealer != null
                ? Number(i.max_messe_qty_per_dealer)
                : null,
            max_total_qty_per_dealer:
              i.max_total_qty_per_dealer != null
                ? Number(i.max_total_qty_per_dealer)
                : null,
          };
        });

        const rpcResult = await createOrderViaRpc(
          submissionPayload,
          itemPayloads
        );

        if (!rpcResult?.ok || !rpcResult.submission_id) {
          toast.error("Bestellung nicht möglich", {
            description:
              rpcResult?.message ??
              "Die Bestellung konnte nicht gespeichert werden.",
            duration: TOAST_DURATION,
          });
          setLoading(false);
          return;
        }

        const submissionId = rpcResult.submission_id;

        if (orderDetails?.files?.length) {
          try {
            const formData = new FormData();
            formData.append("submissionId", String(submissionId));

            orderDetails.files.forEach((file: File) => {
              formData.append("files", file);
            });

            const res = await fetch("/api/orders/upload", {
              method: "POST",
              body: formData,
            });

            if (!res.ok) {
              let errorText = "Datei-Upload fehlgeschlagen";

              try {
                const contentType = res.headers.get("content-type") || "";

                if (contentType.includes("application/json")) {
                  const json = await res.json();
                  errorText =
                    json?.error ||
                    json?.message ||
                    `Upload fehlgeschlagen (${res.status})`;
                } else {
                  const text = await res.text();
                  errorText = text || `Upload fehlgeschlagen (${res.status})`;
                }
              } catch {
                errorText = `Upload fehlgeschlagen (${res.status})`;
              }

              throw new Error(errorText);
            }
          } catch (err: any) {
            console.error("❌ Fehler bei /api/orders/upload:", err);
            throw new Error(
              err?.message ||
                "Die Bestellung wurde gespeichert, aber der Datei-Upload ist fehlgeschlagen."
            );
          }
        }
      }

      clearCart("bestellung");
      setSuccess(true);
      setDistributor("ep");
      setDeliveryMode("sofort");
      setDeliveryDate("");
      setOrderComment("");
      setDealerReference("");
      setHasAltDelivery(false);
      setDeliveryName("");
      setDeliveryStreet("");
      setDeliveryZip("");
      setDeliveryCity("");
      setDeliveryCountry("Schweiz");
      setDeliveryEmail("");
      setDeliveryPhone("");
      setOrderDetails((prev) => ({ ...prev, files: [] }));

      toast.success("✅ Bestellung gespeichert", {
        description: "Die Bestellung wurde erfolgreich übermittelt.",
        duration: TOAST_DURATION,
      });
    } catch (err: any) {
      console.error("Order API Error:", err);

      const errorMessage =
        err?.message || err?.toString?.() || "Unbekannter Fehler";

      toast.error("❌ Fehler beim Speichern", {
        description: errorMessage,
        duration: TOAST_DURATION,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          closeCart();
        }
      }}
    >
      <SheetContent
        side="right"
        className="
          flex flex-col pt-20
          w-full
          sm:max-w-none
          sm:w-[780px]
          lg:w-[980px]
          xl:w-[1120px]
          2xl:w-[1280px]
        "
      >
        <SheetHeader className="border-b px-4 pb-3">
          <SheetTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            Bestellung zum Bestpreis
          </SheetTitle>
        </SheetHeader>

        {projectDetails?.project_id && (
          <div className="mx-4 mb-2 mt-3">
            <SectionCard
              title="Verknüpftes Projekt"
              tone="purple"
              icon={<ClipboardList className="h-4 w-4 text-purple-600" />}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {projectDetails.project_name || "–"}
                  </p>

                  {projectDetails.customer && (
                    <p className="mt-1 text-xs text-slate-600">
                      Kunde: {projectDetails.customer}
                    </p>
                  )}

                  {projectDetails.submission_id && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <span>Projekt:</span>

                      {projectDetails.project_id ? (
                        <Link
                          href={`/projekt-bestellung/${projectDetails.project_id}`}
                          className="font-mono font-semibold text-purple-700 hover:underline"
                          title="Projekt öffnen"
                        >
                          P-{projectDetails.submission_id}
                        </Link>
                      ) : (
                        <span className="font-mono font-semibold text-purple-700">
                          P-{projectDetails.submission_id}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `P-${projectDetails.submission_id}`
                          );
                          toast.success("Projekt-ID kopiert", {
                            duration: TOAST_DURATION,
                          });
                        }}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        title="Projekt-ID kopieren"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setProjectDetails(null);
                    clearCart("bestellung");
                  }}
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  Projekt entfernen
                </button>
              </div>
            </SectionCard>
          </div>
        )}

        <div className="mx-4 mt-1">
          <SectionCard
            title="Händlerinformationen"
            tone="default"
            icon={<Store className="h-4 w-4 text-blue-600" />}
          >
            <div className="grid grid-cols-1 gap-2 text-sm text-slate-700 md:grid-cols-2">
              <div className="font-semibold text-slate-900">
                {dealerDisplayName || "–"}
              </div>

              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-slate-400" />
                <span>
                  Kd-Nr.: <span className="font-medium">{dealerLoginNr || "–"}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                <span>
                  AP: <span className="font-medium">{dealerContact || "–"}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>
                  Tel.: <span className="font-medium">{dealerPhone || "–"}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>
                  E-Mail: <span className="font-medium">{dealerEmail || "–"}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span>
                  Ort: <span className="font-medium">{dealerCityZip || "–"}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <BadgeInfo className="h-4 w-4 text-slate-400" />
                <span>
                  KAM: <span className="font-medium">{dealerKam || "–"}</span>
                </span>
              </div>
            </div>
          </SectionCard>
        </div>

        {success ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-4 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            <p className="text-lg font-semibold text-emerald-700">
              Bestellung gespeichert!
            </p>
            <SheetClose asChild>
              <Button>Schließen</Button>
            </SheetClose>
          </div>
        ) : (
          <div className="mt-3 grid min-h-0 flex-1 grid-cols-1 gap-4 px-4 lg:grid-cols-2">
            <div className="order-2 min-h-0 space-y-4 overflow-y-auto pr-1 lg:order-1">
              {hasNormalProducts && (
                <SectionCard
                  title="Haupt-Distributor"
                  tone="blue"
                  icon={<Truck className="h-4 w-4 text-blue-600" />}
                >
                  <div className="space-y-2">
                    <Select onValueChange={(v) => setDistributor(v)} value={distributor}>
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue placeholder="Bitte auswählen" />
                      </SelectTrigger>

                      <SelectContent>
                        {distis.map((d) => (
                          <SelectItem key={d.code} value={d.code} className="text-sm">
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <p className="text-xs italic text-slate-500">
                      Standardmäßig über ElectronicPartner Schweiz AG.
                    </p>
                  </div>
                </SectionCard>
              )}

              {activeCampaignIdFromCart && bonusTiers.length > 0 && (
                <SectionCard
                  title="Bonus live im Warenkorb"
                  tone="green"
                  icon={<Sparkles className="h-4 w-4 text-emerald-600" />}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-900">
                        {activeCampaignNameFromCart || "Aktive Kampagne"}
                      </p>
                    </div>

                    <div className="text-right text-sm font-semibold text-emerald-900">
                      {formatCurrencyCH(totalProgressAfterSubmit, 0, 2)} /{" "}
                      {formatCurrencyCH(currentBonusTargetValue, 0, 2)}
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <div className="h-3 w-full overflow-hidden rounded-full bg-emerald-100">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all"
                        style={{ width: `${liveBonusProgressPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Von {formatCurrencyCH(previousBonusThresholdValue, 0, 2)}</span>
                      <span>Bis {formatCurrencyCH(currentBonusTargetValue, 0, 2)}</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <MiniStat
                      label="Bereits bestellt"
                      value={formatCurrencyCH(bookedRevenue, 0, 2)}
                      tone="green"
                    />
                    <MiniStat
                      label="Diese Bestellung"
                      value={formatCurrencyCH(liveCartProgressValue, 0, 2)}
                      tone="green"
                    />
                    <MiniStat
                      label="Nach Absenden"
                      value={formatCurrencyCH(totalProgressAfterSubmit, 0, 2)}
                      tone="green"
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <MiniStat
                      label="Aktuell erreichte Stufe"
                      value={
                        <div className="space-y-1">
                          <div>
                            {liveReachedBonusTier
                              ? liveReachedBonusTier.label ||
                                `Stufe ${liveReachedBonusTier.tier_level}`
                              : "Noch keine"}
                          </div>

                          {liveReachedBonusTier && (
                            <div className="text-xs text-emerald-700">
                              Bonus:{" "}
                              {liveReachedBonusTier.bonus_type === "percent"
                                ? `${liveReachedBonusTier.bonus_value}%`
                                : `${formatNumberCH(liveReachedBonusTier.bonus_value, 0, 2)} CHF`}
                            </div>
                          )}

                          {liveReachedBonusTier?.bonus_type === "percent" && (
                            <div className="text-xs text-slate-500">
                              ≈ {formatNumberCH(estimatedBonusValue, 0, 0)} CHF Bonus
                            </div>
                          )}
                        </div>
                      }
                    />

                    <MiniStat
                      label="Fortschritt zur nächsten Stufe"
                      value={`${liveBonusProgressPercent}%`}
                    />
                  </div>

                  {liveNextBonusTier ? (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
                      <div className="mb-2 flex items-center gap-2 text-amber-900">
                        <Trophy className="h-4 w-4" />
                        <p className="font-semibold">Nächste Bonusstufe</p>
                      </div>

                      <p className="text-amber-800">
                        {liveNextBonusTier.label ||
                          `Stufe ${liveNextBonusTier.tier_level}`}{" "}
                        ab {formatCurrencyCH(liveNextBonusTier.threshold_value, 0, 2)}
                      </p>

                      <p className="text-amber-800">
                        Bonus:{" "}
                        {liveNextBonusTier.bonus_type === "percent"
                          ? `${liveNextBonusTier.bonus_value}%`
                          : `${formatNumberCH(liveNextBonusTier.bonus_value, 0, 2)} CHF`}
                      </p>

                      <p className="mt-1 font-medium text-amber-900">
                        Es fehlen noch: {formatCurrencyCH(liveRemainingToNextTier, 0, 2)}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm">
                      <div className="flex items-center gap-2 text-indigo-900">
                        <Trophy className="h-4 w-4" />
                        <p className="font-semibold">Höchste Bonusstufe erreicht</p>
                      </div>
                    </div>
                  )}
                </SectionCard>
              )}

              <SectionCard
                title="Bestellangaben"
                tone="default"
                icon={<ClipboardList className="h-4 w-4 text-blue-600" />}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Lieferung</FieldLabel>

                    <Select
                      value={deliveryMode}
                      onValueChange={(v) => setDeliveryMode(v as "sofort" | "termin")}
                    >
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue placeholder="Bitte wählen" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="sofort">Sofort</SelectItem>
                        <SelectItem value="termin">Zum Termin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <FieldLabel>Lieferdatum (optional)</FieldLabel>

                    <Input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      disabled={deliveryMode !== "termin"}
                      className="h-10 text-sm"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <FieldLabel>Wichtige Infos zur Bestellung (Kommentar)</FieldLabel>

                  <textarea
                    value={orderComment}
                    onChange={(e) => setOrderComment(e.target.value)}
                    className="min-h-[110px] w-full rounded-xl border border-slate-300 p-3 text-sm outline-none ring-0 transition focus:border-slate-400"
                    rows={4}
                    placeholder="z. B. 'Muss zwingend bis 15.10. geliefert werden'…"
                  />
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Ihre Bestell-/Referenz-Nr.</FieldLabel>

                    <Input
                      value={dealerReference}
                      onChange={(e) => setDealerReference(e.target.value)}
                      placeholder="z. B. 45001234"
                      className="h-10 text-sm"
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Abweichende Lieferadresse / Direktlieferung"
                tone="default"
                icon={<Truck className="h-4 w-4 text-blue-600" />}
              >
                <label className="flex items-center gap-2 text-sm font-medium text-slate-900">
                  <input
                    id="altDelivery"
                    type="checkbox"
                    checked={hasAltDelivery}
                    onChange={(e) => setHasAltDelivery(e.target.checked)}
                    className="h-4 w-4"
                  />
                  Zusätzliche Lieferadresse verwenden
                </label>

                {hasAltDelivery && (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <FieldLabel>Name / Firma</FieldLabel>
                      <Input
                        value={deliveryName}
                        onChange={(e) => setDeliveryName(e.target.value)}
                        className="h-10 text-sm"
                      />
                    </div>

                    <div>
                      <FieldLabel>Straße / Nr.</FieldLabel>
                      <Input
                        value={deliveryStreet}
                        onChange={(e) => setDeliveryStreet(e.target.value)}
                        className="h-10 text-sm"
                      />
                    </div>

                    <div>
                      <FieldLabel>PLZ</FieldLabel>
                      <Input
                        value={deliveryZip}
                        onChange={(e) => setDeliveryZip(e.target.value)}
                        className="h-10 text-sm"
                      />
                    </div>

                    <div>
                      <FieldLabel>Ort</FieldLabel>
                      <Input
                        value={deliveryCity}
                        onChange={(e) => setDeliveryCity(e.target.value)}
                        className="h-10 text-sm"
                      />
                    </div>

                    <div>
                      <FieldLabel>Land</FieldLabel>
                      <Input
                        value={deliveryCountry}
                        onChange={(e) => setDeliveryCountry(e.target.value)}
                        className="h-10 text-sm"
                      />
                    </div>

                    <div>
                      <FieldLabel>Telefon (optional)</FieldLabel>
                      <Input
                        value={deliveryPhone}
                        onChange={(e) => setDeliveryPhone(e.target.value)}
                        className="h-10 text-sm"
                      />
                    </div>

                    <div>
                      <FieldLabel>E-Mail (optional)</FieldLabel>
                      <Input
                        value={deliveryEmail}
                        onChange={(e) => setDeliveryEmail(e.target.value)}
                        className="h-10 text-sm"
                      />
                    </div>
                  </div>
                )}
              </SectionCard>

              <SectionCard
                title="Dateien zur Bestellung"
                tone="blue"
                icon={<FileUp className="h-4 w-4 text-blue-600" />}
              >
                <ProjectFileUpload
                  files={orderDetails.files}
                  onChange={(files) =>
                    setOrderDetails((prev) => ({ ...prev, files }))
                  }
                />

                {orderDetails.files.length > 0 && (
                  <p className="mt-2 text-xs text-slate-500">
                    {orderDetails.files.length} Datei(en) angehängt
                  </p>
                )}
              </SectionCard>
            </div>

            <div className="order-1 flex min-h-0 flex-col lg:order-2">
              <div className="flex-1 overflow-y-auto pr-1 overscroll-contain">
                <ProductList
                  cart={cart}
                  distis={distis}
                  campaignUsageMap={campaignUsageMap}
                  updateItem={updateItem}
                  addItem={addItem}
                  removeFromCart={removeFromCart}
                />

                {cart.length > 0 && (
                  <div className="sticky bottom-0 -mx-2 bg-white/95 px-2 py-3 backdrop-blur sm:mx-0 sm:px-0">
                    <div className="rounded-2xl border border-emerald-300 bg-white p-4 shadow-sm">
                      <div className="mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4 text-slate-500" />
                        <p className="text-sm font-semibold text-slate-900">
                          Zusammenfassung
                        </p>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-600">Gesamt</span>
                          <span className="font-semibold text-slate-900">
                            {formatNumberCH(totalQuantity)} Stück
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-600">Gesamtpreis</span>
                          <span className="text-lg font-bold text-slate-900">
                            {formatNumberCH(totalPrice, 0, 0)} CHF
                          </span>
                        </div>

                        {bonusTiers.length > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-600">Bonus-Fortschritt</span>
                            <span className="font-semibold text-emerald-700">
                              {formatCurrencyCH(totalProgressAfterSubmit, 0, 2)}
                            </span>
                          </div>
                        )}
                      </div>

                      {totalSaved > 0 && (
                        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-sm font-medium text-emerald-700">
                          Gesamtersparnis: {formatNumberCH(totalSaved, 0, 0)} CHF
                        </div>
                      )}

                      {bonusTiers.length > 0 && liveNextBonusTier && (
                        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm font-medium text-amber-800">
                          Noch {formatCurrencyCH(liveRemainingToNextTier, 0, 2)} bis{" "}
                          {liveNextBonusTier.label || `Stufe ${liveNextBonusTier.tier_level}`}
                        </div>
                      )}

                      {bonusTiers.length > 0 && !liveNextBonusTier && liveReachedBonusTier && (
                        <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-center text-sm font-medium text-indigo-800">
                          Höchste Bonusstufe erreicht
                        </div>
                      )}

                      <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="mt-4 h-11 w-full gap-2 text-base"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sende…
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Bestellung absenden
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        className="mt-2 w-full gap-2"
                        onClick={closeCart}
                      >
                        <ChevronRight className="h-4 w-4" />
                        Weiter einkaufen
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
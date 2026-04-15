"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BadgePercent,
  CalendarRange,
  CheckCircle2,
  Flame,
  Loader2,
  Search,
  ShoppingCart,
  Sparkles,
  Store,
  Trophy,
  X,
} from "lucide-react";
import ProductList from "@/app/(dealer)/components/ProductList";
import ProductCard from "@/app/(dealer)/components/ProductCard";
import { useDealer } from "@/app/(dealer)/DealerContext";
import { useCart } from "@/app/(dealer)/GlobalCartProvider";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { calcCampaignPrice } from "@/lib/helpers/campaignPricing";
import { getDealerIdFromUrl } from "@/lib/dealer/getDealerIdFromUrl";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/I18nProvider";

type ActiveCampaign = {
  campaign_id: number;
  name: string;
  campaign_type: "messe" | "monatsaktion" | "promotion";
  allow_display_orders: boolean;
  start_date: string;
  end_date: string;
};

type CampaignProductRow = {
  id: number;
  campaign_id: number;
  campaign_name: string;
  campaign_type: "messe" | "monatsaktion" | "promotion";
  product_id: number;
  product_name: string | null;
  sony_article: string | null;
  ean: string | null;
  brand: string | null;
  gruppe: string | null;
  category: string | null;
  retail_price: number | null;
  dealer_invoice_price: number | null;
  price_on_invoice: number | null;
  vrg: number | null;
  pricing_mode: "standard" | "messe" | "display" | "mixed";
  messe_price_netto: number | null;
  display_discount_percent: number | null;
  display_price_netto: number | null;
  display_qty: number | null;

  matched_group_codes?: string[];
  matched_group_names?: string[];
  has_group_override?: boolean;

  bonus_relevant: boolean | null;
  max_qty_per_dealer: number | null;
  max_total_qty_per_dealer: number | null;
  max_display_qty_per_dealer: number | null;
  max_messe_qty_per_dealer: number | null;
  active: boolean;
};

type BonusTier = {
  tier_level: number;
  threshold_value: number;
  bonus_type: "amount" | "percent" | "credit" | "gift";
  bonus_value: number;
  label: string | null;
};

type AddMode = "standard" | "campaign";

type ProductLike = {
  product_id: number;
  product_name?: string | null;
  sony_article?: string | null;
  ean?: string | null;
  brand?: string | null;
  gruppe?: string | null;
  category?: string | null;
  retail_price?: number | null;
  dealer_invoice_price?: number | null;
  price_on_invoice?: number | null;
  vrg?: number | null;

  // 🔧 Manual price override
  price?: number;
  price_manual_override?: boolean;
  price_manual_override_value?: number | null;
};

type DealerPricingGroup = {
  pricing_group_id: number;
  code: string;
  name: string;
};

type CampaignGroupPriceRow = {
  campaign_id: number;
  product_id: number;
  pricing_group_id: number;
  messe_price_netto: number | null;
  display_price_netto: number | null;
  display_discount_percent: number | null;
  active: boolean;
};

const MWST_RATE = 8.1;
const TOAST_DURATION = 4000;

function safeNum(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? parseFloat(n.toFixed(2)) : 0;
}

function formatCurrency(value: number | null | undefined, min = 2, max = 2) {
  if (value == null) return "–";
  return `${Number(value).toLocaleString("de-CH", {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  })} CHF`;
}

function formatNumber(value: number | null | undefined, min = 0, max = 2) {
  if (value == null) return "–";
  return Number(value).toLocaleString("de-CH", {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  });
}

function InfoCard({
  icon,
  title,
  children,
  tone = "default",
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  tone?: "default" | "indigo" | "green" | "amber";
}) {
  const toneClasses = {
    default: "border-slate-200 bg-white",
    indigo: "border-indigo-200 bg-indigo-50/70",
    green: "border-emerald-200 bg-emerald-50/70",
    amber: "border-amber-200 bg-amber-50/70",
  };

  return (
    <div className={`rounded-2xl border px-3 py-3 shadow-sm ${toneClasses[tone]}`}>
      <div className="mb-2 flex items-start gap-2">
        <div className="mt-0.5 rounded-xl bg-white/80 p-1.5 shadow-sm ring-1 ring-black/5">
          {icon}
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold leading-tight text-slate-900">{title}</h2>
        </div>
      </div>
      {children}
    </div>
  );
}

function StatBox({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function CampaignValueRow({
  label,
  value,
  valueClassName = "font-medium text-slate-900",
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-slate-100 py-2 last:border-b-0">
      <span className="text-slate-500">{label}</span>
      <span className={`text-right ${valueClassName}`}>{value}</span>
    </div>
  );
}

function CampaignBadge({
  mode,
  t,
}: {
  mode: CampaignProductRow["pricing_mode"];
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const config =
    mode === "display"
      ? {
          label: t("bestellung.campaign.badge.display"),
          className: "border-sky-200 bg-sky-50 text-sky-700",
        }
      : mode === "mixed"
      ? {
          label: t("bestellung.campaign.badge.mixed"),
          className: "border-violet-200 bg-violet-50 text-violet-700",
        }
      : mode === "messe"
      ? {
          label: t("bestellung.campaign.badge.messe"),
          className: "border-emerald-200 bg-emerald-50 text-emerald-700",
        }
      : {
          label: t("bestellung.campaign.badge.standard"),
          className: "border-indigo-200 bg-indigo-50 text-indigo-700",
        };

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${config.className}`}
    >
      <BadgePercent className="mr-1 h-3 w-3" />
      {config.label}
    </span>
  );
}

export default function BestellungForm() {
  const { t } = useI18n();
  const dealer = useDealer();
  const searchParams = useSearchParams();
  const effectiveDealerId = getDealerIdFromUrl(searchParams, dealer?.dealer_id);

  const supabase = getSupabaseBrowser();
  const { state, addItem, openCart, getItems } = useCart();

  const [loadingCampaign, setLoadingCampaign] = useState(true);
  const [activeCampaign, setActiveCampaign] = useState<ActiveCampaign | null>(null);
  const [campaignProducts, setCampaignProducts] = useState<CampaignProductRow[]>([]);
  const [productViewMode, setProductViewMode] = useState<
    "all" | "campaign" | "standard"
  >("all");
  const [bonusTiers, setBonusTiers] = useState<BonusTier[]>([]);
  const [bookedRevenue, setBookedRevenue] = useState(0);

  const [campaignSearch, setCampaignSearch] = useState("");
  const [campaignGroupFilter, setCampaignGroupFilter] = useState("all");
  const [campaignCategoryFilter, setCampaignCategoryFilter] = useState("all");

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        setLoadingCampaign(true);

        const today = new Date().toISOString().slice(0, 10);

        const { data: campaign, error: campaignError } = await supabase
          .from("campaigns")
          .select(
            "campaign_id, name, campaign_type, allow_display_orders, start_date, end_date"
          )
          .eq("active", true)
          .eq("campaign_type", "messe")
          .lte("start_date", today)
          .gte("end_date", today)
          .order("start_date", { ascending: false })
          .maybeSingle();

        if (campaignError) {
          console.error("Fehler beim Laden der Kampagne:", campaignError);
          setActiveCampaign(null);
          setCampaignProducts([]);
          setBonusTiers([]);
          setBookedRevenue(0);
          return;
        }

        if (!campaign) {
          setActiveCampaign(null);
          setCampaignProducts([]);
          setBonusTiers([]);
          setBookedRevenue(0);
          return;
        }

        setActiveCampaign(campaign as ActiveCampaign);

        const { data: cpRows, error: cpError } = await supabase
          .from("v_campaign_products")
          .select(`
            id,
            campaign_id,
            campaign_name,
            campaign_type,
            product_id,
            product_name,
            sony_article,
            ean,
            brand,
            gruppe,
            category,
            retail_price,
            dealer_invoice_price,
            price_on_invoice,
            vrg,
            pricing_mode,
            messe_price_netto,
            display_discount_percent,
            display_price_netto,
            bonus_relevant,
            max_qty_per_dealer,
            max_total_qty_per_dealer,
            max_display_qty_per_dealer,
            max_messe_qty_per_dealer,
            active
          `)
          .eq("campaign_id", campaign.campaign_id)
          .eq("campaign_active", true)
          .eq("active", true);

        if (cpError) {
          console.error("Fehler beim Laden der Kampagnenprodukte:", cpError);
          setCampaignProducts([]);
        } else {
          let mergedProducts: CampaignProductRow[] = ((cpRows || []) as CampaignProductRow[]).map(
            (row): CampaignProductRow => ({
              ...row,
              matched_group_codes: [],
              matched_group_names: [],
              has_group_override: false,
            })
          );

          let dealerGroups: DealerPricingGroup[] = [];

          if (effectiveDealerId) {
            const { data: dealerGroupRows, error: dealerGroupError } = await supabase
              .from("dealer_pricing_group_memberships")
              .select(`
                pricing_group_id,
                dealer_pricing_groups (
                  pricing_group_id,
                  code,
                  name
                )
              `)
              .eq("dealer_id", effectiveDealerId)
              .eq("active", true);

            if (dealerGroupError) {
              console.error("Fehler beim Laden der Händlergruppen:", dealerGroupError);
            } else {
              dealerGroups = ((dealerGroupRows || []) as any[])
                .map((row) => {
                  const groupData = Array.isArray(row.dealer_pricing_groups)
                    ? row.dealer_pricing_groups[0]
                    : row.dealer_pricing_groups;

                  return {
                    pricing_group_id: Number(row.pricing_group_id),
                    code: groupData?.code ?? "",
                    name: groupData?.name ?? "",
                  };
                })
                .filter((row) => row.pricing_group_id && row.code);
            }
          }

          let groupPriceRows: CampaignGroupPriceRow[] = [];

          if (dealerGroups.length > 0) {
            const pricingGroupIds = dealerGroups.map((g) => g.pricing_group_id);

            const { data, error } = await supabase
              .from("campaign_product_group_prices")
              .select(`
                campaign_id,
                product_id,
                pricing_group_id,
                messe_price_netto,
                display_price_netto,
                display_discount_percent,
                active
              `)
              .eq("campaign_id", campaign.campaign_id)
              .eq("active", true)
              .in("pricing_group_id", pricingGroupIds);

            if (error) {
              console.error("Fehler beim Laden der Gruppenpreise:", error);
            } else {
              groupPriceRows = (data || []) as CampaignGroupPriceRow[];
            }
          }

          mergedProducts = mergedProducts.map((row) => {
            const matchingGroupPrices = groupPriceRows.filter(
              (gp) => Number(gp.product_id) === Number(row.product_id)
            );

            if (matchingGroupPrices.length === 0) {
              return {
                ...row,
                matched_group_codes: [],
                matched_group_names: [],
                has_group_override: false,
              };
            }

            const matchedGroups = matchingGroupPrices
              .map((gp) =>
                dealerGroups.find(
                  (g) => Number(g.pricing_group_id) === Number(gp.pricing_group_id)
                )
              )
              .filter(Boolean) as DealerPricingGroup[];

            const bestMessePrice =
              [
                row.messe_price_netto != null ? Number(row.messe_price_netto) : null,
                ...matchingGroupPrices.map((gp) =>
                  gp.messe_price_netto != null ? Number(gp.messe_price_netto) : null
                ),
              ]
                .filter((v): v is number => v != null && v > 0)
                .sort((a, b) => a - b)[0] ?? row.messe_price_netto;

            const computeDisplayPrice = (
              base: CampaignProductRow,
              gp?: CampaignGroupPriceRow
            ): number | null => {
              const explicitDisplayPrice =
                gp?.display_price_netto != null
                  ? Number(gp.display_price_netto)
                  : base.display_price_netto != null
                  ? Number(base.display_price_netto)
                  : null;

              if (explicitDisplayPrice != null && explicitDisplayPrice > 0) {
                return safeNum(explicitDisplayPrice);
              }

              const displayDiscountPercent =
                gp?.display_discount_percent != null
                  ? Number(gp.display_discount_percent)
                  : base.display_discount_percent != null
                  ? Number(base.display_discount_percent)
                  : null;

              const retailPrice =
                base.retail_price != null ? Number(base.retail_price) : null;
              const dealerInvoicePrice =
                base.dealer_invoice_price != null ? Number(base.dealer_invoice_price) : 0;
              const vrgAmount = base.vrg != null ? Number(base.vrg) : 0;
              const messePrice =
                gp?.messe_price_netto != null
                  ? Number(gp.messe_price_netto)
                  : base.messe_price_netto != null
                  ? Number(base.messe_price_netto)
                  : null;

              if (
                displayDiscountPercent == null ||
                displayDiscountPercent <= 0 ||
                retailPrice == null ||
                retailPrice <= 0
              ) {
                return null;
              }

              const pricing = calcCampaignPrice({
                upe_brutto: retailPrice,
                dealer_invoice_price: dealerInvoicePrice,
                vrg_amount: vrgAmount,
                mwst_rate: MWST_RATE,
                mode: "display",
                messe_price_netto: messePrice,
                display_factor_percent: displayDiscountPercent,
              });

              if (
                pricing.display_price_netto != null &&
                Number(pricing.display_price_netto) > 0
              ) {
                return safeNum(pricing.display_price_netto);
              }

              if (
                pricing.final_unit_price != null &&
                Number(pricing.final_unit_price) > 0
              ) {
                return safeNum(pricing.final_unit_price);
              }

              return null;
            };

            const bestDisplayPrice =
              [
                computeDisplayPrice(row),
                ...matchingGroupPrices.map((gp) => computeDisplayPrice(row, gp)),
              ]
                .filter((v): v is number => v != null && v > 0)
                .sort((a, b) => a - b)[0] ?? row.display_price_netto;

            const bestDisplayFactor =
              [
                row.display_discount_percent != null
                  ? Number(row.display_discount_percent)
                  : null,
                ...matchingGroupPrices.map((gp) =>
                  gp.display_discount_percent != null
                    ? Number(gp.display_discount_percent)
                    : null
                ),
              ]
                .filter((v): v is number => v != null && v > 0)
                .sort((a, b) => b - a)[0] ?? row.display_discount_percent;

            return {
              ...row,
              messe_price_netto:
                bestMessePrice != null ? safeNum(bestMessePrice) : row.messe_price_netto,
              display_price_netto:
                bestDisplayPrice != null
                  ? safeNum(bestDisplayPrice)
                  : row.display_price_netto,
              display_discount_percent:
                bestDisplayFactor != null
                  ? safeNum(bestDisplayFactor)
                  : row.display_discount_percent,
              matched_group_codes: matchedGroups.map((g) => g.code),
              matched_group_names: matchedGroups.map((g) => g.name),
              has_group_override: true,
            };
          });

          setCampaignProducts(mergedProducts);
        }

        if (!effectiveDealerId) {
          setBonusTiers([]);
          setBookedRevenue(0);
          return;
        }

        const { data: bonusRows, error: bonusError } = await supabase
          .from("campaign_bonus_tiers")
          .select("tier_level, threshold_value, bonus_type, bonus_value, label")
          .eq("campaign_id", campaign.campaign_id)
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
          .eq("campaign_id", campaign.campaign_id);

        if (revenueError) {
          console.error("Fehler beim Laden des gebuchten Kampagnenumsatzes:", revenueError);
          setBookedRevenue(0);
        } else {
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

              return sum + Number(row?.menge ?? 0) * Number(row?.preis ?? 0);
            }, 0) || 0;

          setBookedRevenue(revenue);
        }
      } finally {
        setLoadingCampaign(false);
      }
    };

    loadCampaign();
  }, [supabase, effectiveDealerId]);

  const campaignProductMap = useMemo(() => {
    const map = new Map<number, CampaignProductRow>();
    for (const row of campaignProducts) {
      map.set(Number(row.product_id), row);
    }
    return map;
  }, [campaignProducts]);

  const currentCartItems = useMemo(() => {
    return (getItems("bestellung") as any[]) || [];
  }, [state, getItems]);

  const bonusRelevantCartItems = useMemo(() => {
    return currentCartItems.filter((item) => {
      if (!item || !activeCampaign) return false;
      if (!item.campaign_id) return false;
      if (Number(item.campaign_id) !== Number(activeCampaign.campaign_id)) return false;
      return item.bonus_relevant !== false;
    });
  }, [currentCartItems, activeCampaign]);

  const liveCartProgressValue = useMemo(() => {
    return bonusRelevantCartItems.reduce(
      (sum, item) => sum + Number(item.quantity ?? 0) * Number(item.price ?? 0),
      0
    );
  }, [bonusRelevantCartItems]);

  const totalProgressAfterSubmit = useMemo(() => {
    return bookedRevenue + liveCartProgressValue;
  }, [bookedRevenue, liveCartProgressValue]);

  const liveNextBonusTier = useMemo(() => {
    if (!bonusTiers.length) return null;
    return (
      bonusTiers.find((tier) => totalProgressAfterSubmit < tier.threshold_value) ?? null
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
    return Math.max(0, liveNextBonusTier.threshold_value - totalProgressAfterSubmit);
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
    const progressWithinTier = Math.max(0, totalProgressAfterSubmit - rangeStart);

    return Math.min(100, Math.round((progressWithinTier / span) * 100));
  }, [
    currentBonusTargetValue,
    liveNextBonusTier,
    previousBonusThresholdValue,
    totalProgressAfterSubmit,
  ]);

  const campaignGroups = useMemo(() => {
    return [...new Set(campaignProducts.map((p) => p.gruppe).filter(Boolean))].sort();
  }, [campaignProducts]);

  const campaignCategories = useMemo(() => {
    return [...new Set(campaignProducts.map((p) => p.category).filter(Boolean))].sort();
  }, [campaignProducts]);

  const filteredCampaignProducts = useMemo(() => {
    const search = campaignSearch.trim().toLowerCase();

    return campaignProducts.filter((cp) => {
      const matchesSearch =
        !search ||
        [
          cp.product_name,
          cp.sony_article,
          cp.ean,
          cp.brand,
          cp.gruppe,
          cp.category,
          ...(cp.matched_group_names || []),
          ...(cp.matched_group_codes || []),
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search));

      const matchesGroup =
        campaignGroupFilter === "all" || cp.gruppe === campaignGroupFilter;

      const matchesCategory =
        campaignCategoryFilter === "all" || cp.category === campaignCategoryFilter;

      return matchesSearch && matchesGroup && matchesCategory;
    });
  }, [campaignProducts, campaignSearch, campaignGroupFilter, campaignCategoryFilter]);

  const getCurrentQtyInCart = (productId: number, mode?: AddMode) => {
    const items = (getItems("bestellung") as any[]) || [];

    return items
      .filter((item) => {
        if (Number(item?.product_id) !== Number(productId)) return false;

        if (mode === "campaign") return !!item?.campaign_id;
        if (mode === "standard") return !item?.campaign_id;

        return true;
      })
      .reduce((sum, item) => sum + Number(item?.quantity ?? 0), 0);
  };

  const getDerivedDisplayPriceNetto = (cp: CampaignProductRow): number | null => {
    if (cp.display_price_netto != null) {
      return safeNum(cp.display_price_netto);
    }

    const hasDisplayOption =
      cp.pricing_mode === "display" || cp.pricing_mode === "mixed";

    if (!hasDisplayOption) return null;
    if (cp.display_discount_percent == null) return null;
    if (cp.retail_price == null) return null;

    const pricing = calcCampaignPrice({
      upe_brutto: Number(cp.retail_price ?? 0),
      dealer_invoice_price: Number(cp.dealer_invoice_price ?? 0),
      vrg_amount: Number(cp.vrg ?? 0),
      mwst_rate: MWST_RATE,
      mode: "display",
      messe_price_netto:
        cp.messe_price_netto != null ? Number(cp.messe_price_netto) : null,
      display_factor_percent: Number(cp.display_discount_percent),
    });

    if (pricing.display_price_netto != null) {
      return safeNum(pricing.display_price_netto);
    }

    if (pricing.final_unit_price != null && Number(pricing.final_unit_price) > 0) {
      return safeNum(pricing.final_unit_price);
    }

    return null;
  };

  const addCampaignAwareItem = (
    product: ProductLike,
    options?: {
      mode?: AddMode;
      pricingModeOverride?: "standard" | "messe" | "display";
    }
  ) => {
    const requestedMode = options?.mode ?? "standard";
    const campaignRow = campaignProductMap.get(Number(product.product_id));

    const canUseCampaign = Boolean(activeCampaign && campaignRow);
    const useCampaign = requestedMode === "campaign" && canUseCampaign;

    const orderMode: "standard" | "messe" | "monatsaktion" =
      useCampaign && activeCampaign?.campaign_type === "messe" ? "messe" : "standard";

    const derivedPricingMode: "standard" | "messe" | "display" = useCampaign
      ? campaignRow?.pricing_mode === "display"
        ? "display"
        : campaignRow?.pricing_mode === "messe" || campaignRow?.pricing_mode === "mixed"
        ? "messe"
        : "standard"
      : "standard";

    const pricingMode = options?.pricingModeOverride ?? derivedPricingMode;

    const upeBrutto = safeNum(product.retail_price ?? 0);
    const dealerInvoicePrice = safeNum(product.dealer_invoice_price ?? 0);
    const vrgAmount = safeNum(product.vrg ?? 0);
    const manualOverride = product.price_manual_override === true;
    const manualPrice =
      product.price_manual_override_value != null
        ? safeNum(product.price_manual_override_value)
        : product.price != null
        ? safeNum(product.price)
        : null;

    const messePriceNetto =
      useCampaign && campaignRow?.messe_price_netto != null
        ? safeNum(campaignRow.messe_price_netto)
        : null;

    const displayFactorPercent =
      useCampaign && campaignRow?.display_discount_percent != null
        ? safeNum(campaignRow.display_discount_percent)
        : 50;

    const explicitDisplayPriceNetto =
      useCampaign && campaignRow?.display_price_netto != null
        ? safeNum(campaignRow.display_price_netto)
        : null;

    const maxQtyPerDealer =
      useCampaign && campaignRow?.max_qty_per_dealer != null
        ? Number(campaignRow.max_qty_per_dealer)
        : null;

    const currentQtyInCart = getCurrentQtyInCart(
      Number(product.product_id),
      useCampaign ? "campaign" : "standard"
    );

    if (
      useCampaign &&
      maxQtyPerDealer != null &&
      maxQtyPerDealer > 0 &&
      currentQtyInCart >= maxQtyPerDealer
    ) {
      toast.error(t("bestellung.toast.maxCampaignQtyTitle"), {
        description: t("bestellung.toast.maxCampaignQtyText", {
          product:
            product.product_name ||
            product.sony_article ||
            t("bestellung.common.unknownProduct"),
          count: maxQtyPerDealer,
        }),
        duration: TOAST_DURATION,
      });
      return;
    }

    const pricing = calcCampaignPrice({
      upe_brutto: upeBrutto,
      dealer_invoice_price: dealerInvoicePrice,
      vrg_amount: vrgAmount,
      mwst_rate: MWST_RATE,
      mode: pricingMode,
      messe_price_netto: messePriceNetto,
      display_factor_percent: displayFactorPercent,
    });

    const finalUnitPrice =
      manualOverride && manualPrice != null
        ? manualPrice
        : pricingMode === "standard"
        ? dealerInvoicePrice
        : pricingMode === "display" && explicitDisplayPriceNetto != null
        ? explicitDisplayPriceNetto
        : pricingMode === "messe" && messePriceNetto != null
        ? messePriceNetto
        : safeNum(pricing.final_unit_price ?? 0);

    const finalDisplayPriceNetto =
      explicitDisplayPriceNetto != null
        ? explicitDisplayPriceNetto
        : pricing.display_price_netto != null
        ? safeNum(pricing.display_price_netto)
        : null;

    const finalMessePriceNetto =
      messePriceNetto != null
        ? messePriceNetto
        : pricing.messe_price_netto != null
        ? safeNum(pricing.messe_price_netto)
        : null;

    addItem("bestellung", {
      ...product,
      quantity: 1,
      price: safeNum(finalUnitPrice > 0 ? finalUnitPrice : 0),
      price_manual_override: manualOverride,
      price_manual_override_value: manualPrice,

      order_mode: orderMode,
      pricing_mode: pricingMode,

      campaign_id: useCampaign ? activeCampaign?.campaign_id ?? null : null,
      campaign_name: useCampaign ? activeCampaign?.name ?? null : null,
      campaign_name_snapshot: useCampaign ? activeCampaign?.name ?? null : null,

      is_display_item: pricingMode === "display",
      bonus_relevant:
        useCampaign && typeof campaignRow?.bonus_relevant === "boolean"
          ? campaignRow.bonus_relevant
          : true,

      max_qty_per_dealer:
        useCampaign && campaignRow?.max_qty_per_dealer != null
          ? Number(campaignRow.max_qty_per_dealer)
          : null,

      max_total_qty_per_dealer:
        useCampaign && campaignRow?.max_total_qty_per_dealer != null
          ? Number(campaignRow.max_total_qty_per_dealer)
          : null,

      max_display_qty_per_dealer:
        useCampaign && campaignRow?.max_display_qty_per_dealer != null
          ? Number(campaignRow.max_display_qty_per_dealer)
          : null,

      max_messe_qty_per_dealer:
        useCampaign && campaignRow?.max_messe_qty_per_dealer != null
          ? Number(campaignRow.max_messe_qty_per_dealer)
          : null,

      upe_brutto: upeBrutto,
      retail_price: upeBrutto,
      dealer_invoice_price: dealerInvoicePrice,
      product_price: dealerInvoicePrice,
      ek_normal: dealerInvoicePrice,
      vrg: vrgAmount,
      vrg_amount: vrgAmount,
      mwst_rate: MWST_RATE,
      upe_netto_excl_vrg:
        pricing.upe_netto_excl_vrg != null
          ? safeNum(pricing.upe_netto_excl_vrg)
          : null,

      display_factor_percent: displayFactorPercent,
      display_price_netto: finalDisplayPriceNetto,
      messe_price_netto: finalMessePriceNetto,

      display_discount_vs_hrp_percent:
        useCampaign && pricing.display_discount_vs_hrp_percent != null
          ? safeNum(pricing.display_discount_vs_hrp_percent)
          : null,

      matched_group_codes: useCampaign ? campaignRow?.matched_group_codes || [] : [],
      matched_group_names: useCampaign ? campaignRow?.matched_group_names || [] : [],
      has_group_override: useCampaign ? campaignRow?.has_group_override || false : false,

      pricing_snapshot: {
        source: useCampaign ? "campaign" : "standard",
        campaign_id: useCampaign ? activeCampaign?.campaign_id ?? null : null,
        campaign_name: useCampaign ? activeCampaign?.name ?? null : null,
        order_mode: orderMode,
        pricing_mode: pricingMode,
        upe_brutto: upeBrutto,
        vrg_amount: vrgAmount,
        mwst_rate: MWST_RATE,
        upe_netto_excl_vrg:
          pricing.upe_netto_excl_vrg != null
            ? safeNum(pricing.upe_netto_excl_vrg)
            : null,
        display_factor_percent: displayFactorPercent,
        display_price_netto: finalDisplayPriceNetto,
        messe_price_netto: finalMessePriceNetto,
        final_unit_price: safeNum(finalUnitPrice),
        display_discount_vs_hrp_percent:
          useCampaign && pricing.display_discount_vs_hrp_percent != null
            ? safeNum(pricing.display_discount_vs_hrp_percent)
            : null,
        matched_group_codes: useCampaign ? campaignRow?.matched_group_codes || [] : [],
        matched_group_names: useCampaign ? campaignRow?.matched_group_names || [] : [],
        has_group_override: useCampaign ? campaignRow?.has_group_override || false : false,
        calculated_at: new Date().toISOString(),
      },
    });

    openCart("bestellung");

    toast.success(t("bestellung.toast.productAddedTitle"), {
      description: t("bestellung.toast.productAddedText", {
        product:
          product.product_name ||
          product.sony_article ||
          t("bestellung.common.unknownProduct"),
      }),
      duration: TOAST_DURATION,
    });
  };

  const resetCampaignFilters = () => {
    setCampaignSearch("");
    setCampaignGroupFilter("all");
    setCampaignCategoryFilter("all");
  };

  if (!dealer) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-500 shadow-sm">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          <span>{t("bestellung.loading.dealerData")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {activeCampaign && (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
          <InfoCard
            tone="indigo"
            icon={<Store className="h-4 w-4 text-indigo-600" strokeWidth={2} />}
            title={t("bestellung.campaign.activeTradefairCampaign")}
          >
            <div className="flex h-full flex-col justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {activeCampaign.name}
                </p>

                <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                  <CalendarRange className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    {t("bestellung.campaign.validFromTo", {
                      start: activeCampaign.start_date,
                      end: activeCampaign.end_date,
                    })}
                  </span>
                </div>
              </div>


            </div>
          </InfoCard>

          {bonusTiers.length > 0 && (
            <InfoCard
              tone="green"
              icon={<Sparkles className="h-4 w-4 text-emerald-600" strokeWidth={2} />}
              title={t("bestellung.campaign.progress.title")}
            >
              <div className="flex h-full flex-col justify-between gap-1">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">
                      {t("bestellung.campaign.progress.afterSubmit")}
                    </p>
                    <p className="text-base font-bold text-emerald-900">
                      {formatCurrency(totalProgressAfterSubmit)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-500">
                      {t("bestellung.campaign.progress.progress")}
                    </p>
                    <p className="text-sm font-semibold text-emerald-700">
                      {liveBonusProgressPercent}%
                    </p>
                  </div>
                </div>

                <div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-emerald-100">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                      style={{ width: `${liveBonusProgressPercent}%` }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{formatCurrency(previousBonusThresholdValue)}</span>
                    <span>{formatCurrency(currentBonusTargetValue)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg border border-emerald-200 bg-white px-2 py-2">
                    <div className="text-slate-500">
                      {t("bestellung.campaign.progress.already")}
                    </div>
                    <div className="font-semibold text-slate-900">
                      {formatCurrency(bookedRevenue, 0, 2)}
                    </div>
                  </div>
                  <div className="rounded-lg border border-emerald-200 bg-white px-2 py-2">
                    <div className="text-slate-500">
                      {t("bestellung.campaign.progress.cart")}
                    </div>
                    <div className="font-semibold text-slate-900">
                      {formatCurrency(liveCartProgressValue, 0, 2)}
                    </div>
                  </div>
                  <div className="rounded-lg border border-emerald-200 bg-white px-2 py-2">
                    <div className="text-slate-500">
                      {t("bestellung.campaign.progress.total")}
                    </div>
                    <div className="font-semibold text-slate-900">
                      {formatCurrency(totalProgressAfterSubmit, 0, 2)}
                    </div>
                  </div>
                </div>
              </div>
            </InfoCard>
          )}

          <InfoCard
            tone="amber"
            icon={<Trophy className="h-4 w-4 text-amber-600" strokeWidth={2} />}
            title={t("bestellung.campaign.progress.nextTier")}
          >
            {liveNextBonusTier ? (
              <div className="flex h-full flex-col justify-between gap-1">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {liveNextBonusTier.label ||
                      t("bestellung.campaign.progress.level", {
                        level: liveNextBonusTier.tier_level,
                      })}
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    ab {formatCurrency(liveNextBonusTier.threshold_value)}
                  </p>

                  <p className="mt-2 text-xs text-amber-800">
                    {t("bestellung.campaign.progress.bonus")}:{" "}
                    {liveNextBonusTier.bonus_type === "percent"
                      ? `${liveNextBonusTier.bonus_value}%`
                      : `${formatNumber(liveNextBonusTier.bonus_value, 0, 2)} CHF`}
                  </p>
                </div>

                <div className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-amber-900">
                  {t("bestellung.campaign.progress.missingToNext", {
                    amount: formatCurrency(liveRemainingToNextTier),
                  })}
                </div>
              </div>
            ) : liveReachedBonusTier ? (
              <div className="flex h-full flex-col justify-between gap-2">
                <div className="flex items-center gap-2 text-indigo-900">
                  <CheckCircle2 className="h-4 w-4" />
                  <p className="text-sm font-semibold">
                    {t("bestellung.campaign.progress.highestTierReached")}
                  </p>
                </div>

                <div className="rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm">
                  <div className="font-semibold text-slate-900">
                    {liveReachedBonusTier.label ||
                      t("bestellung.campaign.progress.level", {
                        level: liveReachedBonusTier.tier_level,
                      })}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    {t("bestellung.campaign.progress.bonus")}:{" "}
                    {liveReachedBonusTier.bonus_type === "percent"
                      ? `${liveReachedBonusTier.bonus_value}%`
                      : `${formatNumber(liveReachedBonusTier.bonus_value, 0, 2)} CHF`}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500">
                {t("bestellung.campaign.progress.noTierAvailable")}
              </div>
            )}
          </InfoCard>
        </div>
      )}

      {loadingCampaign && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-500 shadow-sm">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            <span>{t("bestellung.loading.campaign")}</span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={productViewMode === "all" ? "default" : "outline"}
          className={
            productViewMode === "all"
              ? "rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              : "rounded-xl"
          }
          onClick={() => setProductViewMode("all")}
        >
          {t("bestellung.viewMode.both")}
        </Button>

        <Button
          type="button"
          variant={productViewMode === "campaign" ? "default" : "outline"}
          className={
            productViewMode === "campaign"
              ? "rounded-xl bg-sky-600 text-white hover:bg-sky-700"
              : "rounded-xl"
          }
          onClick={() => setProductViewMode("campaign")}
        >
          {t("bestellung.viewMode.campaignOnly")}
        </Button>

        <Button
          type="button"
          variant={productViewMode === "standard" ? "default" : "outline"}
          className={
            productViewMode === "standard"
              ? "rounded-xl bg-slate-700 text-white hover:bg-slate-800"
              : "rounded-xl"
          }
          onClick={() => setProductViewMode("standard")}
        >
          {t("bestellung.viewMode.standardOnly")}
        </Button>
      </div>

      {productViewMode !== "standard" && activeCampaign && campaignProducts.length > 0 && (
        <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-3 shadow-sm md:p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
                <Flame className="h-4 w-4 text-sky-600" strokeWidth={2} />
              </div>

              <div className="min-w-0">
                <h2 className="text-sm font-semibold leading-tight text-slate-900">
                  {t("bestellung.campaign.campaignProducts")}
                </h2>
                <p className="text-xs text-slate-600">
                  {t("bestellung.campaign.campaignProductsIntro")}
                </p>
              </div>
            </div>

            <div className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100">
              {filteredCampaignProducts.length} / {campaignProducts.length} Produkte
            </div>
          </div>

          

          <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_220px_220px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={campaignSearch}
                onChange={(e) => setCampaignSearch(e.target.value)}
                placeholder={t("bestellung.campaign.filters.searchPlaceholder")}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
              />
            </div>

            <select
              value={campaignGroupFilter}
              onChange={(e) => setCampaignGroupFilter(e.target.value)}
              className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
            >
              <option value="all">{t("bestellung.campaign.filters.allGroups")}</option>
              {campaignGroups.map((group) => (
                <option key={group} value={group ?? ""}>
                  {group}
                </option>
              ))}
            </select>

            <select
              value={campaignCategoryFilter}
              onChange={(e) => setCampaignCategoryFilter(e.target.value)}
              className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
            >
              <option value="all">
                {t("bestellung.campaign.filters.allCategories")}
              </option>
              {campaignCategories.map((category) => (
                <option key={category} value={category ?? ""}>
                  {category}
                </option>
              ))}
            </select>

            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              onClick={resetCampaignFilters}
            >
              <X className="mr-2 h-4 w-4" />
              {t("bestellung.common.reset")}
            </Button>
          </div>

          {filteredCampaignProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 px-4 py-10 text-center text-sm text-slate-500">
              {t("bestellung.campaign.noCampaignProducts")}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {filteredCampaignProducts.map((cp) => {
                const derivedDisplayPriceNetto = getDerivedDisplayPriceNetto(cp);
                const showDisplayPrice = derivedDisplayPriceNetto != null;

                return (
                  <div
                    key={cp.id}
                    className="h-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex h-full flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-semibold text-slate-900">
                            {cp.sony_article ||
                              cp.product_name ||
                              t("bestellung.common.unknownProduct")}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                            {cp.product_name || "–"}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {t("bestellung.cartSheet.product.ean")}: {cp.ean || "–"}
                          </p>
                        </div>

                        <div className="shrink-0">
                          <CampaignBadge mode={cp.pricing_mode} t={t} />
                        </div>
                      </div>

                      <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 text-[12px]">
                        <CampaignValueRow
                          label={t("bestellung.campaign.pricing.upeGross")}
                          value={formatCurrency(cp.retail_price)}
                        />
                        <CampaignValueRow
                          label={t("bestellung.campaign.pricing.dealerPrice")}
                          value={formatCurrency(cp.dealer_invoice_price)}
                        />
                        <CampaignValueRow
                          label={t("bestellung.campaign.pricing.messePriceNet")}
                          value={formatCurrency(cp.messe_price_netto)}
                          valueClassName="font-semibold text-sky-700"
                        />
                        {showDisplayPrice && (
                          <CampaignValueRow
                            label={t("bestellung.campaign.pricing.displayPriceNet")}
                            value={formatCurrency(derivedDisplayPriceNetto)}
                            valueClassName="font-semibold text-emerald-700"
                          />
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                        {cp.brand && (
                          <span className="rounded-full bg-sky-50 px-2 py-0.5 font-medium text-sky-700 ring-1 ring-sky-100">
                            {cp.brand}
                          </span>
                        )}
                        {cp.gruppe && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                            {cp.gruppe}
                          </span>
                        )}
                        {cp.category && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 ring-1 ring-emerald-100">
                            {cp.category}
                          </span>
                        )}
                      </div>

                      <div className="mt-auto pt-3">
                        <Button
                          type="button"
                          className="h-10 w-full rounded-xl bg-slate-900 text-white shadow-sm hover:bg-sky-600"
                          onClick={() =>
                            addCampaignAwareItem(
                              {
                                product_id: cp.product_id,
                                product_name: cp.product_name,
                                sony_article: cp.sony_article,
                                ean: cp.ean,
                                brand: cp.brand,
                                gruppe: cp.gruppe,
                                category: cp.category,
                                retail_price: cp.retail_price,
                                dealer_invoice_price: cp.dealer_invoice_price ?? 0,
                                price_on_invoice: cp.price_on_invoice ?? null,
                                vrg: cp.vrg,
                              },
                              { mode: "campaign" }
                            )
                          }
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {t("bestellung.common.addToCart")}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {productViewMode !== "campaign" && (
        <ProductList
          CardComponent={ProductCard}
          cardProps={{
            onAddToCart: (product: any) => {
              addCampaignAwareItem(product, { mode: "standard" });
            },
          }}
          sofortrabattOnly={false}
          supportType="sellout"
          showCSVButton={false}
        />
      )}

      {currentCartItems.length > 0 && (
        <InfoCard
          tone="default"
          icon={<CheckCircle2 className="h-4 w-4 text-slate-700" strokeWidth={2} />}
          title={t("bestellung.preview.title")}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatBox
              label={t("bestellung.preview.positions")}
              value={currentCartItems.length}
            />
            <StatBox
              label={t("bestellung.preview.quantityTotal")}
              value={currentCartItems.reduce(
                (sum, item) => sum + Number(item?.quantity ?? 0),
                0
              )}
            />
            <StatBox
              label={t("bestellung.preview.cartValue")}
              value={formatCurrency(
                currentCartItems.reduce(
                  (sum, item) =>
                    sum + Number(item?.quantity ?? 0) * Number(item?.price ?? 0),
                  0
                ),
                2,
                2
              )}
            />
          </div>

          <div className="mt-4">
            <Button type="button" onClick={() => openCart("bestellung")}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              {t("bestellung.common.cartOpen")}
            </Button>
          </div>
        </InfoCard>
      )}
    </div>
  );
}
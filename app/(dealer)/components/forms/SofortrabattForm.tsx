"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { useDealer } from "@/app/(dealer)/DealerContext";
import { useCart } from "@/app/(dealer)/GlobalCartProvider";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { getThemeByForm } from "@/lib/theme/ThemeContext";

type Product = any;
type PromoType = "classic_fixed" | "tv55_soundbar_percent";

type DbPromotion = {
  id: number;
  code: string;
  name: string;
  promo_type: PromoType;
  sales_start_date: string;
  sales_end_date: string;
  registration_end_date: string | null;
  premium_service: boolean;
  description: string | null;

  name_de: string | null;
  name_en: string | null;
  name_fr: string | null;
  name_it: string | null;
  name_rm: string | null;

  description_de: string | null;
  description_en: string | null;
  description_fr: string | null;
  description_it: string | null;
  description_rm: string | null;
};

type DbPromotionProduct = {
  product_id: number;
  single_amount: number | null;
  double_amount: number | null;
  triple_amount: number | null;
};

function normalizeText(value: any) {
  return String(value || "").trim().toLowerCase();
}

function normalizeArticle(value: any) {
  return String(value || "")
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/-/g, "")
    .replace(/\./g, "");
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
      if (value >= 32 && value <= 120) return value;
    }
  }

  return 0;
}

function getProductLabel(product: any) {
  return product?.sony_article || product?.product_name || "Unknown product";
}

function formatDateCH(value: any) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("de-CH");
}

function getPromotionDateText(
  product: any,
  promoType: PromoType,
  t: (key: string) => string
) {
  const start =
    promoType === "classic_fixed"
      ? formatDateCH(product?.sofortrabatt_classic_start_date)
      : formatDateCH(product?.sofortrabatt_percent_start_date);

  const end =
    promoType === "classic_fixed"
      ? formatDateCH(product?.sofortrabatt_classic_end_date)
      : formatDateCH(product?.sofortrabatt_percent_end_date);

  if (start && end) {
    return `${t("sofortrabatt.cart.validRange")}: ${start} – ${end}`;
  }

  if (start) return `${t("sofortrabatt.cart.validFrom")}: ${start}`;
  if (end) return `${t("sofortrabatt.cart.validUntil")}: ${end}`;

  return null;
}

function matchesSearch(product: any, search: string) {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  return (
    String(product?.sony_article || "").toLowerCase().includes(query) ||
    String(product?.product_name || "").toLowerCase().includes(query) ||
    String(product?.model || "").toLowerCase().includes(query) ||
    String(product?.ean || "").toLowerCase().includes(query) ||
    String(product?.gruppe || "").toLowerCase().includes(query) ||
    String(product?.category || "").toLowerCase().includes(query)
  );
}

function getSoundbarCompatibilityKey(product: any): string {
  const article = normalizeArticle(product?.sony_article || product?.product_name);

  if (article.includes("HTA7100KIT")) return "HTA7100KIT";
  if (article.includes("HTA8KIT")) return "HTA8KIT";
  if (article.includes("HTA3000")) return "HTA3000";
  if (article.includes("HTA5000")) return "HTA5000";
  if (article.includes("HTA7000")) return "HTA7000";
  if (article.includes("HTA8000")) return "HTA8000";
  if (article.includes("HTA9000")) return "HTA9000";
  if (article.includes("HTA9M2")) return "HTA9M2";
  if (article.includes("HTB600")) return "HTB600";
  if (article.includes("HTS60")) return "HTS60";

  return "DEFAULT";
}

const ALL_ACCESSORIES = [
  "SARS3",
  "SARS5",
  "SARS8",
  "SARS9",
  "SASW3",
  "SASW5",
  "SASW7",
  "SASW8",
  "SASW9",
];

const ACCESSORY_COMPATIBILITY: Record<string, string[]> = {
  HTA3000: ALL_ACCESSORIES,
  HTA5000: ALL_ACCESSORIES,
  HTA7000: ALL_ACCESSORIES,
  HTA7100KIT: ALL_ACCESSORIES,
  HTA8000: ALL_ACCESSORIES,
  HTA9000: ALL_ACCESSORIES,
  HTA9M2: ["SASW3", "SASW5", "SASW7", "SASW8", "SASW9"],
  HTB600: [],
  HTS60: [],
  HTA8KIT: ["SASW8", "SASW9"],
  DEFAULT: ALL_ACCESSORIES,
};

function isAccessoryCompatible(soundbar: any, accessory: any) {
  const soundbarKey = getSoundbarCompatibilityKey(soundbar);
  const allowedCodes =
    ACCESSORY_COMPATIBILITY[soundbarKey] ?? ACCESSORY_COMPATIBILITY.DEFAULT;

  const article = normalizeArticle(accessory?.sony_article || accessory?.product_name);

  return allowedCodes.some((code) => article.includes(code));
}

function sortTvList(items: Product[]) {
  return [...items].sort((a: any, b: any) => {
    const inchDiff = parseTvInches(b) - parseTvInches(a);
    if (inchDiff !== 0) return inchDiff;

    return getProductLabel(a).localeCompare(getProductLabel(b), undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });
}

function sortByLabel(items: Product[]) {
  return [...items].sort((a: any, b: any) =>
    getProductLabel(a).localeCompare(getProductLabel(b), undefined, {
      numeric: true,
      sensitivity: "base",
    })
  );
}

function getPromotionName(promotion: DbPromotion, lang: string) {
  const value =
    lang === "de"
      ? promotion.name_de
      : lang === "en"
      ? promotion.name_en
      : lang === "fr"
      ? promotion.name_fr
      : lang === "it"
      ? promotion.name_it
      : lang === "rm"
      ? promotion.name_rm
      : null;

  return value || promotion.name;
}

function getPromotionDescription(promotion: DbPromotion, lang: string) {
  const value =
    lang === "de"
      ? promotion.description_de
      : lang === "en"
      ? promotion.description_en
      : lang === "fr"
      ? promotion.description_fr
      : lang === "it"
      ? promotion.description_it
      : lang === "rm"
      ? promotion.description_rm
      : null;

  return value || promotion.description;
}

export default function SofortrabattForm() {
  const supabase = getSupabaseBrowser();
  const dealer = useDealer();
  const { t, lang } = useI18n();
  const theme = getThemeByForm("sofortrabatt");

  const { addItem, clearCart, openCart, setOrderDetails } = useCart();

  const [promoType, setPromoType] = useState<PromoType>("classic_fixed");

  const [selectedPromotionCode, setSelectedPromotionCode] =
    useState<string | null>(null);

  const [dbPromotions, setDbPromotions] = useState<DbPromotion[]>([]);
  const [selectedDbPromotion, setSelectedDbPromotion] =
    useState<DbPromotion | null>(null);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [tvList, setTvList] = useState<Product[]>([]);
  const [soundbarList, setSoundbarList] = useState<Product[]>([]);
  const [subwooferList, setSubwooferList] = useState<Product[]>([]);

  const [selectedTV, setSelectedTV] = useState<Product | null>(null);
  const [selectedSoundbar, setSelectedSoundbar] = useState<Product | null>(null);
  const [selectedSub, setSelectedSub] = useState<Product | null>(null);

  const [tvSearch, setTvSearch] = useState("");
  const [soundbarSearch, setSoundbarSearch] = useState("");
  const [accessorySearch, setAccessorySearch] = useState("");
  const [tvSizeFilter, setTvSizeFilter] = useState<"all" | "55plus">("all");
  const [showTvGrid, setShowTvGrid] = useState(true);

  const tvSectionRef = useRef<HTMLDivElement | null>(null);
  const soundbarSectionRef = useRef<HTMLDivElement | null>(null);
  const accessorySectionRef = useRef<HTMLDivElement | null>(null);

  const dealerId = (dealer as any)?.dealer_id ?? null;

  const getCompatibilityHint = (soundbar: any) => {
    const key = getSoundbarCompatibilityKey(soundbar);

    if (key === "HTA9M2") return t("sofortrabatt.hints.a9m2");
    if (key === "HTB600" || key === "HTS60") return t("sofortrabatt.hints.htb");
    if (key === "HTA8KIT") return t("sofortrabatt.hints.hta8kit");
    if (key === "HTA7100KIT") return t("sofortrabatt.hints.hta7100kit");

    return null;
  };

  const resetSelection = () => {
    setSelectedTV(null);
    setSelectedSoundbar(null);
    setSelectedSub(null);
    setShowTvGrid(true);
    setTvSearch("");
    setSoundbarSearch("");
    setAccessorySearch("");
  };

  const handlePromoChange = (nextPromo: PromoType) => {
    if (nextPromo === promoType && !selectedPromotionCode) return;

    setSelectedPromotionCode(null);
    setSelectedDbPromotion(null);

    setPromoType(nextPromo);
    resetSelection();
    clearCart("sofortrabatt");

    setOrderDetails((prev: any) => ({
      ...prev,
      promo_type: nextPromo,
      promotion_code: null,
      promotion_name: null,
      sofortrabatt_files: [],
      sofortrabatt_sales_prices: {
        soundbar: "",
        subwoofer: "",
      },
    }));
  };

  const handleDbPromotionChange = (promotion: DbPromotion) => {
    setPromoType("classic_fixed");
    setSelectedPromotionCode(promotion.code);
    setSelectedDbPromotion(promotion);

    resetSelection();
    clearCart("sofortrabatt");

    setOrderDetails((prev: any) => ({
      ...prev,
      promo_type: "classic_fixed",
      promotion_code: promotion.code,
      promotion_name: promotion.name,
      sofortrabatt_files: [],
      sofortrabatt_sales_prices: {
        soundbar: "",
        subwoofer: "",
      },
    }));
  };

  useEffect(() => {
    if (promoType === "tv55_soundbar_percent") {
      setTvSizeFilter("55plus");
    } else {
      setTvSizeFilter("all");
    }
  }, [promoType]);

  useEffect(() => {
    const loadPromotions = async () => {
      const { data, error } = await (supabase as any)
        .from("sofortrabatt_promotions")
        .select("*")
        .eq("active", true)
        .order("sales_start_date", { ascending: true });

      if (error) {
        console.error("Sofortrabatt promotions load error:", error);
        return;
      }

      setDbPromotions((data || []) as DbPromotion[]);
    };

    loadPromotions();
  }, [supabase]);

  useEffect(() => {
    const loadProducts = async () => {
      if (!dealerId) return;

      setLoadingProducts(true);

      try {
        let formatted: Product[] = [];

        // --------------------------------------------------
        // NEUE DB-BASIERTE PROMOTION
        // --------------------------------------------------
        if (selectedPromotionCode && selectedDbPromotion) {
    const { data: promoProducts, error: promoProductsError } =
      await (supabase as any)
        .from("sofortrabatt_promotion_products")
              .select(
                "product_id, single_amount, double_amount, triple_amount"
              )
              .eq("promotion_id", selectedDbPromotion.id)
              .eq("active", true);

          if (promoProductsError) {
            throw promoProductsError;
          }

          const productIds = (promoProducts || []).map(
            (row: any) => Number(row.product_id)
          );

          if (productIds.length === 0) {
            setTvList([]);
            setSoundbarList([]);
            setSubwooferList([]);
            return;
          }

          const { data, error } = await supabase
            .from("v_dealer_standard_prices")
            .select("*")
            .eq("dealer_id", dealerId)
            .in("product_id", productIds)
            .order("sony_article", { ascending: true });

          if (error) {
            throw error;
          }

          const promoProductMap = new Map<number, DbPromotionProduct>(
            (promoProducts || []).map((row: any) => [
              Number(row.product_id),
              {
                product_id: Number(row.product_id),
                single_amount: row.single_amount ?? null,
                double_amount: row.double_amount ?? null,
                triple_amount: row.triple_amount ?? null,
              },
            ])
          );

          formatted = (data || []).map((p: any) => {
            const promoProduct = promoProductMap.get(Number(p.product_id));

            return {
              ...p,
              product_id: Number(p.product_id),

              sofortrabatt_amount:
                promoProduct?.single_amount ?? 0,

              sofortrabatt_double_amount:
                promoProduct?.double_amount ?? null,

              sofortrabatt_triple_amount:
                promoProduct?.triple_amount ?? null,

              sofortrabatt_classic_start_date:
                selectedDbPromotion.sales_start_date,

              sofortrabatt_classic_end_date:
                selectedDbPromotion.sales_end_date,

              sofortrabatt_classic_registration_end_date:
                selectedDbPromotion.registration_end_date,

              sofortrabatt_promotion_code:
                selectedDbPromotion.code,

              sofortrabatt_promotion_name:
                selectedDbPromotion.name,

              sofortrabatt_premium_service:
                selectedDbPromotion.premium_service,
            };
          });
        }

        // --------------------------------------------------
        // BISHERIGE PROMOTIONEN
        // --------------------------------------------------
        else {
          const promoColumn =
            promoType === "classic_fixed"
              ? "active_sofortrabatt_classic"
              : "active_sofortrabatt_percent";

          const { data, error } = await supabase
            .from("v_dealer_standard_prices")
            .select("*")
            .eq("dealer_id", dealerId)
            .eq(promoColumn, true)
            .order("sony_article", { ascending: true });

          if (error) {
            throw error;
          }

          formatted = (data || []).map((p: any) => ({
            ...p,
            product_id: Number(p.product_id),
          }));
        }

        const tvs = formatted.filter(
          (p) => String(p.ph2 || "").trim().toUpperCase() === "TME"
        );

        const soundbars = formatted.filter(
          (p) => normalizeText(p.category) === "soundbar"
        );

        const accessories = formatted.filter((p) =>
          ["subwoofer", "rear speaker", "rear", "rearspeaker"].includes(
            normalizeText(p.category)
          )
        );

        setTvList(sortTvList(tvs));
        setSoundbarList(sortByLabel(soundbars));
        setSubwooferList(sortByLabel(accessories));

        setSelectedTV(null);
        setSelectedSoundbar(null);
        setSelectedSub(null);
        setShowTvGrid(true);
      } catch (error) {
        console.error("Sofortrabatt products load error:", error);

        toast.error(t("sofortrabatt.form.productsLoadError"));

        setTvList([]);
        setSoundbarList([]);
        setSubwooferList([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, [
    supabase,
    dealerId,
    promoType,
    selectedPromotionCode,
    selectedDbPromotion,
    t,
  ]);

  const filteredTvList = useMemo(() => {
    return tvList.filter((tv: any) => {
      const inches = parseTvInches(tv);
      const matchesSize = tvSizeFilter === "all" ? true : inches >= 55;

      return matchesSearch(tv, tvSearch) && matchesSize;
    });
  }, [tvList, tvSearch, tvSizeFilter]);

  const filteredSoundbarList = useMemo(() => {
    return soundbarList.filter((sb: any) => matchesSearch(sb, soundbarSearch));
  }, [soundbarList, soundbarSearch]);

  const compatibleAccessoryList = useMemo(() => {
    const base = selectedSoundbar
      ? subwooferList.filter((item: any) =>
          isAccessoryCompatible(selectedSoundbar, item)
        )
      : subwooferList;

    return base.filter((item: any) => matchesSearch(item, accessorySearch));
  }, [subwooferList, selectedSoundbar, accessorySearch]);

  const compatibilityHint = useMemo(() => {
    if (!selectedSoundbar) return null;
    return getCompatibilityHint(selectedSoundbar);
  }, [selectedSoundbar, t]);

  const handleAddToCart = () => {
    if (!selectedTV) {
      toast.error(t("sofortrabatt.toast.selectTv"));
      return;
    }

    if (promoType === "tv55_soundbar_percent") {
      const inches = parseTvInches(selectedTV);

      if (inches < 55) {
        toast.error(t("sofortrabatt.toast.only55"));
        return;
      }

      if (!selectedSoundbar) {
        toast.error(t("sofortrabatt.toast.needSoundbar"));
        return;
      }
    }

    clearCart("sofortrabatt");

    addItem("sofortrabatt", {
      ...selectedTV,
      product_id: selectedTV.product_id,
      sony_article: selectedTV.sony_article,
      product_name: selectedTV.product_name,
      model: selectedTV.model,
      ean: selectedTV.ean,
      ph2: selectedTV.ph2,
      ph3: selectedTV.ph3,
      ph4: selectedTV.ph4,
      category: selectedTV.category,
      gruppe: selectedTV.gruppe,
      active_sofortrabatt_classic: selectedTV.active_sofortrabatt_classic,
      active_sofortrabatt_percent: selectedTV.active_sofortrabatt_percent,
      sofortrabatt_classic_start_date:
        selectedTV.sofortrabatt_classic_start_date,
      sofortrabatt_classic_end_date:
        selectedTV.sofortrabatt_classic_end_date,
      sofortrabatt_classic_registration_end_date:
        selectedTV.sofortrabatt_classic_registration_end_date,
      sofortrabatt_percent_start_date:
        selectedTV.sofortrabatt_percent_start_date,
      sofortrabatt_percent_end_date:
        selectedTV.sofortrabatt_percent_end_date,
      sofortrabatt_amount: selectedTV.sofortrabatt_amount,
      sofortrabatt_double_amount: selectedTV.sofortrabatt_double_amount,
      sofortrabatt_triple_amount: selectedTV.sofortrabatt_triple_amount,
      sofortrabatt_promotion_code:
        selectedTV.sofortrabatt_promotion_code || null,

      sofortrabatt_promotion_name:
        selectedTV.sofortrabatt_promotion_name || null,

      sofortrabatt_premium_service:
        selectedTV.sofortrabatt_premium_service || false,
    });

    if (selectedSoundbar) {
      addItem("sofortrabatt", {
        ...selectedSoundbar,
        product_id: selectedSoundbar.product_id,
        sony_article: selectedSoundbar.sony_article,
        product_name: selectedSoundbar.product_name,
        model: selectedSoundbar.model,
        ean: selectedSoundbar.ean,
        ph2: selectedSoundbar.ph2,
        ph3: selectedSoundbar.ph3,
        ph4: selectedSoundbar.ph4,
        category: selectedSoundbar.category,
        gruppe: selectedSoundbar.gruppe,
        active_sofortrabatt_classic:
          selectedSoundbar.active_sofortrabatt_classic,
        active_sofortrabatt_percent:
          selectedSoundbar.active_sofortrabatt_percent,
        sofortrabatt_classic_start_date:
          selectedSoundbar.sofortrabatt_classic_start_date,
        sofortrabatt_classic_end_date:
          selectedSoundbar.sofortrabatt_classic_end_date,
        sofortrabatt_percent_start_date:
          selectedSoundbar.sofortrabatt_percent_start_date,
        sofortrabatt_percent_end_date:
          selectedSoundbar.sofortrabatt_percent_end_date,
      });
    }

    if (selectedSub) {
      addItem("sofortrabatt", {
        ...selectedSub,
        product_id: selectedSub.product_id,
        sony_article: selectedSub.sony_article,
        product_name: selectedSub.product_name,
        model: selectedSub.model,
        ean: selectedSub.ean,
        ph2: selectedSub.ph2,
        ph3: selectedSub.ph3,
        ph4: selectedSub.ph4,
        category: selectedSub.category,
        gruppe: selectedSub.gruppe,
        active_sofortrabatt_classic: selectedSub.active_sofortrabatt_classic,
        active_sofortrabatt_percent: selectedSub.active_sofortrabatt_percent,
        sofortrabatt_classic_start_date:
          selectedSub.sofortrabatt_classic_start_date,
        sofortrabatt_classic_end_date:
          selectedSub.sofortrabatt_classic_end_date,
        sofortrabatt_percent_start_date:
          selectedSub.sofortrabatt_percent_start_date,
        sofortrabatt_percent_end_date:
          selectedSub.sofortrabatt_percent_end_date,
      });
    }

    setOrderDetails((prev: any) => ({
      ...prev,
      promo_type: promoType,
      promotion_code: selectedPromotionCode,
      promotion_name: selectedDbPromotion?.name || null,
      sofortrabatt_files: [],
      sofortrabatt_sales_prices: {
        soundbar: "",
        subwoofer: "",
      },
    }));

    openCart("sofortrabatt");
  };

  const handleSelectTV = (tv: any) => {
    setSelectedTV(tv);
    setSelectedSoundbar(null);
    setSelectedSub(null);
    setShowTvGrid(false);

    setTimeout(() => {
      soundbarSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
  };

  const handleChangeTV = () => {
    setSelectedTV(null);
    setSelectedSoundbar(null);
    setSelectedSub(null);
    setShowTvGrid(true);

    setTimeout(() => {
      tvSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleSelectSoundbar = (sb: any) => {
    const nextSoundbar =
      selectedSoundbar?.product_id === sb.product_id ? null : sb;

    setSelectedSoundbar(nextSoundbar);
    setSelectedSub(null);

    if (nextSoundbar) {
      setTimeout(() => {
        accessorySectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);
    }
  };

  if (!dealer) {
    return <p className="text-gray-500">⏳ Händler wird geladen…</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className={`text-lg font-semibold mb-3 ${theme.color}`}>
          {t("sofortrabatt.promo.select")}
        </h3>

        <div className="max-w-xl rounded-2xl border bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium">
            {t("sofortrabatt.promo.select")}
          </label>

          <select
            value={selectedPromotionCode || promoType}
            onChange={(e) => {
              const value = e.target.value;

              if (value === "classic_fixed") {
                handlePromoChange("classic_fixed");
                return;
              }

              if (value === "tv55_soundbar_percent") {
                handlePromoChange("tv55_soundbar_percent");
                return;
              }

              const promotion = dbPromotions.find(
                (item) => item.code === value
              );

              if (promotion) {
                handleDbPromotionChange(promotion);
              }
            }}
            className="h-11 w-full rounded-lg border bg-white px-3 text-sm"
          >
            <option value="classic_fixed">
              {t("sofortrabatt.promo.classicTitle")}
            </option>

            <option value="tv55_soundbar_percent">
              {t("sofortrabatt.promo.percentTitle")}
            </option>

            {dbPromotions.map((promotion) => (
              <option key={promotion.id} value={promotion.code}>
                {getPromotionName(promotion, lang)}
              </option>
            ))}
          </select>

          <div className="mt-4 border-t pt-4">
            {selectedDbPromotion ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">
                    {getPromotionName(selectedDbPromotion, lang)}
                  </p>

                  {selectedDbPromotion.premium_service && (
                    <span className="rounded-full bg-pink-50 px-2.5 py-1 text-xs font-medium text-pink-600">
                      Premium Service
                    </span>
                  )}
                </div>

                {getPromotionDescription(selectedDbPromotion, lang) && (
                  <p className="mt-1 text-sm text-gray-500">
                    {getPromotionDescription(selectedDbPromotion, lang)}
                  </p>
                )}

                <p className="mt-2 text-xs text-gray-400">
                  {formatDateCH(selectedDbPromotion.sales_start_date)}
                  {" – "}
                  {formatDateCH(selectedDbPromotion.sales_end_date)}
                </p>
              </>
            ) : promoType === "classic_fixed" ? (
              <>
                <p className="font-semibold">
                  {t("sofortrabatt.promo.classicTitle")}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {t("sofortrabatt.promo.classicText")}
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold">
                  {t("sofortrabatt.promo.percentTitle")}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {t("sofortrabatt.promo.percentText")}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="sticky top-2 z-10">
        <div className="rounded-2xl border bg-white/95 backdrop-blur px-4 py-3 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-500">
                {t("sofortrabatt.summary.tv")}
              </p>
              <p className="font-medium truncate">
                {selectedTV
                  ? getProductLabel(selectedTV)
                  : t("sofortrabatt.summary.notSelected")}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                {t("sofortrabatt.summary.soundbar")}
              </p>
              <p className="font-medium truncate">
                {selectedSoundbar
                  ? getProductLabel(selectedSoundbar)
                  : t("sofortrabatt.summary.notSelected")}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                {t("sofortrabatt.summary.accessory")}
              </p>
              <p className="font-medium truncate">
                {selectedSub
                  ? getProductLabel(selectedSub)
                  : t("sofortrabatt.summary.optional")}
              </p>
            </div>

            <div className="flex items-end md:justify-end gap-2">
              {selectedTV && (
                <Button variant="outline" onClick={handleChangeTV}>
                  {t("sofortrabatt.actions.changeTv")}
                </Button>
              )}

              {selectedTV && (
                <Button onClick={handleAddToCart} className={theme.bg}>
                  {t("sofortrabatt.actions.addToCart")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div ref={tvSectionRef} className="space-y-4">
        <div className="space-y-3">
          <div>
            <h3 className={`text-lg font-semibold mb-1 ${theme.color}`}>
              {t("sofortrabatt.tv.select")}
            </h3>
            <p className="text-sm text-gray-500">
              {promoType === "classic_fixed"
                ? t("sofortrabatt.promo.classicText")
                : t("sofortrabatt.promo.percentText")}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <input
              type="text"
              value={tvSearch}
              onChange={(e) => setTvSearch(e.target.value)}
              placeholder={t("sofortrabatt.tv.search")}
              className="h-10 rounded-md border px-3 text-sm w-full md:w-[280px]"
            />

            <select
              value={tvSizeFilter}
              onChange={(e) =>
                setTvSizeFilter(e.target.value as "all" | "55plus")
              }
              disabled={promoType === "tv55_soundbar_percent"}
              className="h-10 rounded-md border px-3 text-sm w-full md:w-[190px] disabled:bg-gray-100"
            >
              <option value="all">{t("sofortrabatt.tv.filterAll")}</option>
              <option value="55plus">
                {t("sofortrabatt.tv.filter55Plus")}
              </option>
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setTvSearch("");
                setSoundbarSearch("");
                setAccessorySearch("");
              }}
            >
              {t("sofortrabatt.tv.reset")}
            </Button>
          </div>
        </div>

        {loadingProducts ? (
          <p className="text-sm text-gray-500">
            {t("sofortrabatt.form.loadingProducts")}
          </p>
        ) : selectedTV && !showTvGrid ? (
          <div className="rounded-xl border bg-gray-50 p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">
                  {t("sofortrabatt.tv.selected")}
                </p>
                <p className="font-semibold">{getProductLabel(selectedTV)}</p>
                <p className="text-xs text-gray-500">
                  EAN: {selectedTV.ean || "-"} · {parseTvInches(selectedTV)}"
                </p>

                {getPromotionDateText(selectedTV, promoType, t) && (
                  <p className="text-xs text-gray-500 mt-1">
                    {getPromotionDateText(selectedTV, promoType, t)}
                  </p>
                )}
              </div>

              <Button variant="outline" onClick={() => setShowTvGrid(true)}>
                {t("sofortrabatt.actions.showTvList")}
              </Button>
            </div>
          </div>
        ) : filteredTvList.length === 0 ? (
          <p className="text-sm text-gray-500">
            {t("sofortrabatt.tv.noneFound")}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredTvList.map((tv: any) => {
              const inches = parseTvInches(tv);

              return (
                <Card
                  key={tv.product_id}
                  onClick={() => handleSelectTV(tv)}
                  className={`p-4 cursor-pointer ${
                    selectedTV?.product_id === tv.product_id
                      ? `border-2 ${theme.border}`
                      : ""
                  }`}
                >
                  <p className="font-semibold">{getProductLabel(tv)}</p>
                  <p className="text-xs text-gray-500">EAN: {tv.ean}</p>

                  {inches > 0 && (
                    <p className="text-xs text-gray-500 mt-1">{inches}"</p>
                  )}

                  {getPromotionDateText(tv, promoType, t) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {getPromotionDateText(tv, promoType, t)}
                    </p>
                  )}

                  {promoType === "classic_fixed" && (
                    <p className="text-xs mt-2 text-pink-600">
                      {t("sofortrabatt.cart.tvDiscount")}:{" "}
                      {Number(tv.sofortrabatt_amount || 0).toFixed(2)} CHF
                    </p>
                  )}

                  {promoType === "tv55_soundbar_percent" && (
                    <p className="text-xs mt-2 text-green-600">
                      {t("sofortrabatt.tv.eligible")}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {selectedTV && !selectedPromotionCode && (
        <div ref={soundbarSectionRef} className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <h3 className={`text-lg font-semibold mb-1 ${theme.color}`}>
                {promoType === "tv55_soundbar_percent"
                  ? t("sofortrabatt.soundbar.required")
                  : t("sofortrabatt.soundbar.optional")}
              </h3>
              <p className="text-sm text-gray-500">
                {t("sofortrabatt.tv.selected")}:{" "}
                <span className="font-medium">{getProductLabel(selectedTV)}</span>
              </p>
            </div>

            {soundbarList.length > 0 && (
              <input
                type="text"
                value={soundbarSearch}
                onChange={(e) => setSoundbarSearch(e.target.value)}
                placeholder={t("sofortrabatt.soundbar.search")}
                className="h-10 rounded-md border px-3 text-sm w-full md:w-[280px]"
              />
            )}
          </div>

          {filteredSoundbarList.length === 0 ? (
            <p className="text-sm text-gray-500">
              {t("sofortrabatt.soundbar.noneFound")}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredSoundbarList.map((sb: any) => (
                <Card
                  key={sb.product_id}
                  onClick={() => handleSelectSoundbar(sb)}
                  className={`p-4 cursor-pointer ${
                    selectedSoundbar?.product_id === sb.product_id
                      ? `border-2 ${theme.border}`
                      : ""
                  }`}
                >
                  <p className="font-semibold">{getProductLabel(sb)}</p>
                  <p className="text-xs text-gray-500">EAN: {sb.ean}</p>

                  {getPromotionDateText(sb, promoType, t) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {getPromotionDateText(sb, promoType, t)}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedTV &&
        selectedSoundbar &&
        !selectedPromotionCode && (
        <div ref={accessorySectionRef} className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <h3 className={`text-lg font-semibold mb-1 ${theme.color}`}>
                {t("sofortrabatt.accessory.select")}
              </h3>
              <p className="text-sm text-gray-500">
                {t("sofortrabatt.accessory.compatible")}:{" "}
                <span className="font-medium">
                  {getProductLabel(selectedSoundbar)}
                </span>
              </p>

              {compatibilityHint && (
                <div className="mt-3 rounded-xl border bg-gray-50 p-3 text-sm text-gray-600">
                  {compatibilityHint}
                </div>
              )}
            </div>

            <input
              type="text"
              value={accessorySearch}
              onChange={(e) => setAccessorySearch(e.target.value)}
              placeholder={t("sofortrabatt.accessory.search")}
              className="h-10 rounded-md border px-3 text-sm w-full md:w-[280px]"
            />
          </div>

          {compatibleAccessoryList.length === 0 ? (
            <div className="rounded-xl border bg-gray-50 p-4 text-sm text-gray-500">
              {t("sofortrabatt.accessory.none")}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {compatibleAccessoryList.map((sw: any) => (
                <Card
                  key={sw.product_id}
                  onClick={() =>
                    setSelectedSub(
                      selectedSub?.product_id === sw.product_id ? null : sw
                    )
                  }
                  className={`p-4 cursor-pointer ${
                    selectedSub?.product_id === sw.product_id
                      ? `border-2 ${theme.border}`
                      : ""
                  }`}
                >
                  <p className="font-semibold">{getProductLabel(sw)}</p>
                  <p className="text-xs text-gray-500">EAN: {sw.ean}</p>

                  {getPromotionDateText(sw, promoType, t) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {getPromotionDateText(sw, promoType, t)}
                    </p>
                  )}

                  <p className="text-xs text-gray-500 mt-1">
                    {normalizeText(sw.category) === "subwoofer"
                      ? t("sofortrabatt.accessory.subwoofer")
                      : t("sofortrabatt.accessory.rearSpeaker")}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedTV && (
        <div className="md:hidden">
          <Button onClick={handleAddToCart} className={theme.bg}>
            {t("sofortrabatt.actions.addToCart")}
          </Button>
        </div>
      )}
    </div>
  );
}
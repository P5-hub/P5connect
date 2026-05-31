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

/* ------------------------------------------------------
   HELPERS
------------------------------------------------------ */
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

function getPromotionDateText(product: any, promoType: PromoType) {
  const start =
    promoType === "classic_fixed"
      ? formatDateCH(product?.sofortrabatt_classic_start_date)
      : formatDateCH(product?.sofortrabatt_percent_start_date);

  const end =
    promoType === "classic_fixed"
      ? formatDateCH(product?.sofortrabatt_classic_end_date)
      : formatDateCH(product?.sofortrabatt_percent_end_date);

  if (start && end) return `Gültig: ${start} – ${end}`;
  if (start) return `Gültig ab: ${start}`;
  if (end) return `Gültig bis: ${end}`;

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

/* ------------------------------------------------------
   COMPONENT
------------------------------------------------------ */
export default function SofortrabattForm() {
  const supabase = getSupabaseBrowser();
  const dealer = useDealer();
  const { t } = useI18n();
  const theme = getThemeByForm("sofortrabatt");

  const { addItem, clearCart, openCart, setOrderDetails } = useCart();

  const [promoType, setPromoType] = useState<PromoType>("classic_fixed");

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
    if (nextPromo === promoType) return;

    setPromoType(nextPromo);
    resetSelection();
    clearCart("sofortrabatt");

    setOrderDetails((prev: any) => ({
      ...prev,
      promo_type: nextPromo,
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
    const loadProducts = async () => {
      if (!dealerId) return;

      setLoadingProducts(true);

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
        console.error("Sofortrabatt products load error:", error);
        toast.error("Produkte konnten nicht geladen werden");
        setTvList([]);
        setSoundbarList([]);
        setSubwooferList([]);
        setLoadingProducts(false);
        return;
      }

      const formatted: Product[] = (data || []).map((p: any) => ({
        ...p,
        product_id: Number(p.product_id),
      }));

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
      setLoadingProducts(false);
    };

    loadProducts();
  }, [supabase, dealerId, promoType]);

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
      sofortrabatt_percent_start_date:
        selectedTV.sofortrabatt_percent_start_date,
      sofortrabatt_percent_end_date:
        selectedTV.sofortrabatt_percent_end_date,
      sofortrabatt_amount: selectedTV.sofortrabatt_amount,
      sofortrabatt_double_amount: selectedTV.sofortrabatt_double_amount,
      sofortrabatt_triple_amount: selectedTV.sofortrabatt_triple_amount,
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            onClick={() => handlePromoChange("classic_fixed")}
            className={`p-4 cursor-pointer ${
              promoType === "classic_fixed" ? `border-2 ${theme.border}` : ""
            }`}
          >
            <p className="font-semibold">
              {t("sofortrabatt.promo.classicTitle")}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {t("sofortrabatt.promo.classicText")}
            </p>
          </Card>

          <Card
            onClick={() => handlePromoChange("tv55_soundbar_percent")}
            className={`p-4 cursor-pointer ${
              promoType === "tv55_soundbar_percent"
                ? `border-2 ${theme.border}`
                : ""
            }`}
          >
            <p className="font-semibold">
              {t("sofortrabatt.promo.percentTitle")}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {t("sofortrabatt.promo.percentText")}
            </p>
          </Card>
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
              <option value="55plus">{t("sofortrabatt.tv.filter55Plus")}</option>
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setTvSearch("");
                setSoundbarSearch("");
                setAccessorySearch("");
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        {loadingProducts ? (
          <p className="text-sm text-gray-500">Produkte werden geladen…</p>
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
                {getPromotionDateText(selectedTV, promoType) && (
                  <p className="text-xs text-gray-500 mt-1">
                    {getPromotionDateText(selectedTV, promoType)}
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

                  {getPromotionDateText(tv, promoType) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {getPromotionDateText(tv, promoType)}
                    </p>
                  )}

                  {promoType === "classic_fixed" && (
                    <p className="text-xs mt-2 text-pink-600">
                      Sofortrabatt:{" "}
                      {Number(tv.sofortrabatt_amount || 0).toFixed(2)} CHF
                    </p>
                  )}

                  {promoType === "tv55_soundbar_percent" && (
                    <p className="text-xs mt-2 text-green-600">
                      55"+ TV für 30/50 Promotion
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {selectedTV && (
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
                placeholder="Soundbar suchen…"
                className="h-10 rounded-md border px-3 text-sm w-full md:w-[280px]"
              />
            )}
          </div>

          {filteredSoundbarList.length === 0 ? (
            <p className="text-sm text-gray-500">
              Keine Soundbar für diese Promotion gefunden.
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

                  {getPromotionDateText(sb, promoType) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {getPromotionDateText(sb, promoType)}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedTV && selectedSoundbar && (
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
              placeholder="Zubehör suchen…"
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

                  {getPromotionDateText(sw, promoType) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {getPromotionDateText(sw, promoType)}
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
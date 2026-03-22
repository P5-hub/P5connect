"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { useDealer } from "@/app/(dealer)/DealerContext";
import { useCart } from "@/app/(dealer)/GlobalCartProvider";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { getSupabaseBrowser } from "@/lib/supabaseClient";

import type { Product } from "@/types/Product";
import { getThemeByForm } from "@/lib/theme/ThemeContext";

type PromoType = "classic_fixed" | "tv55_soundbar_percent";

/* ------------------------------------------------------
   HELPERS
------------------------------------------------------ */
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
    product?.ean,
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

function getProductLabel(product: any) {
  return product?.sony_article || product?.product_name || "Unknown product";
}

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

  const [promoType, setPromoType] = useState<PromoType>("tv55_soundbar_percent");

  /* ---------- Produktauswahl ---------- */
  const [tvList, setTvList] = useState<Product[]>([]);
  const [soundbarList, setSoundbarList] = useState<Product[]>([]);
  const [subwooferList, setSubwooferList] = useState<Product[]>([]);

  const [selectedTV, setSelectedTV] = useState<Product | null>(null);
  const [selectedSoundbar, setSelectedSoundbar] = useState<Product | null>(null);
  const [selectedSub, setSelectedSub] = useState<Product | null>(null);

  const [tvSearch, setTvSearch] = useState("");
  const [tvSizeFilter, setTvSizeFilter] = useState<"all" | "55plus">("all");
  const [showTvGrid, setShowTvGrid] = useState(true);

  const tvSectionRef = useRef<HTMLDivElement | null>(null);
  const soundbarSectionRef = useRef<HTMLDivElement | null>(null);
  const accessorySectionRef = useRef<HTMLDivElement | null>(null);

  const getCompatibilityHint = (soundbar: any) => {
    const key = getSoundbarCompatibilityKey(soundbar);

    if (key === "HTA9M2") return t("sofortrabatt.hints.a9m2");
    if (key === "HTB600" || key === "HTS60") return t("sofortrabatt.hints.htb");
    if (key === "HTA8KIT") return t("sofortrabatt.hints.hta8kit");
    if (key === "HTA7100KIT") return t("sofortrabatt.hints.hta7100kit");

    return null;
  };

  /* ------------------------------------------------------
     LOAD PRODUCTS
  ------------------------------------------------------ */
  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active_sofortrabatt", true);

      if (error) {
        toast.error("Produkte konnten nicht geladen werden");
        return;
      }

      const formatted = (data || []).map((p) => ({
        ...p,
        product_id: String(p.product_id),
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
    };

    loadProducts();
  }, [supabase]);

  useEffect(() => {
    if (promoType === "tv55_soundbar_percent") {
      setTvSizeFilter("55plus");
    } else {
      setTvSizeFilter("all");
    }
  }, [promoType]);

  const filteredTvList = useMemo(() => {
    return tvList.filter((tv: any) => {
      const label = getProductLabel(tv).toLowerCase();
      const ean = String(tv?.ean || "").toLowerCase();
      const inches = parseTvInches(tv);

      const matchesSearch =
        !tvSearch.trim() ||
        label.includes(tvSearch.trim().toLowerCase()) ||
        ean.includes(tvSearch.trim().toLowerCase());

      const matchesSize = tvSizeFilter === "all" ? true : inches >= 55;

      return matchesSearch && matchesSize;
    });
  }, [tvList, tvSearch, tvSizeFilter]);

  const compatibleAccessoryList = useMemo(() => {
    if (!selectedSoundbar) return subwooferList;

    return subwooferList.filter((item: any) =>
      isAccessoryCompatible(selectedSoundbar, item)
    );
  }, [subwooferList, selectedSoundbar]);

  const compatibilityHint = useMemo(() => {
    if (!selectedSoundbar) return null;
    return getCompatibilityHint(selectedSoundbar);
  }, [selectedSoundbar, t]);

  /* ------------------------------------------------------
     ADD TO CART
  ------------------------------------------------------ */
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

    addItem("sofortrabatt", selectedTV);

    if (selectedSoundbar) addItem("sofortrabatt", selectedSoundbar);
    if (selectedSub) addItem("sofortrabatt", selectedSub);

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

  /* ------------------------------------------------------
     RENDER
  ------------------------------------------------------ */

  if (!dealer) {
    return <p className="text-gray-500">⏳ Händler wird geladen…</p>;
  }

  return (
    <div className="space-y-8">
      {/* PROMO AUSWAHL */}
      <div>
        <h3 className={`text-lg font-semibold mb-3 ${theme.color}`}>
          {t("sofortrabatt.promo.select")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            onClick={() => setPromoType("classic_fixed")}
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
            onClick={() => setPromoType("tv55_soundbar_percent")}
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

      {/* AUSWAHL ÜBERSICHT */}
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

      {/* TV */}
      <div ref={tvSectionRef} className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h3 className={`text-lg font-semibold mb-1 ${theme.color}`}>
              {t("sofortrabatt.tv.select")}
            </h3>
            <p className="text-sm text-gray-500">
              {t("sofortrabatt.tv.help")}
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
              onChange={(e) => setTvSizeFilter(e.target.value as "all" | "55plus")}
              className="h-10 rounded-md border px-3 text-sm w-full md:w-[190px]"
            >
              <option value="all">{t("sofortrabatt.tv.filterAll")}</option>
              <option value="55plus">{t("sofortrabatt.tv.filter55Plus")}</option>
            </select>
          </div>
        </div>

        {selectedTV && !showTvGrid ? (
          <div className="rounded-xl border bg-gray-50 p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">
                  {t("sofortrabatt.tv.selected")}
                </p>
                <p className="font-semibold">{getProductLabel(selectedTV)}</p>
                <p className="text-xs text-gray-500">
                  EAN: {selectedTV.ean || "-"} · {parseTvInches(selectedTV)}
                </p>
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
              const eligibleForNewPromo = inches >= 55;

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
                    <p className="text-xs text-gray-500 mt-1">{inches}</p>
                  )}

                  {promoType === "tv55_soundbar_percent" && (
                    <p
                      className={`text-xs mt-2 ${
                        eligibleForNewPromo ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {eligibleForNewPromo
                        ? t("sofortrabatt.tv.eligible")
                        : t("sofortrabatt.tv.notEligible")}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* SOUNDBAR */}
      {selectedTV && (
        <div ref={soundbarSectionRef} className="space-y-4">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {soundbarList.map((sb: any) => (
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
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ZUBEHÖR */}
      {selectedTV && selectedSoundbar && (
        <div ref={accessorySectionRef} className="space-y-4">
          <div>
            <h3 className={`text-lg font-semibold mb-1 ${theme.color}`}>
              {t("sofortrabatt.accessory.select")}
            </h3>
            <p className="text-sm text-gray-500">
              {t("sofortrabatt.accessory.compatible")}:{" "}
              <span className="font-medium">{getProductLabel(selectedSoundbar)}</span>
            </p>

            {compatibilityHint && (
              <div className="mt-3 rounded-xl border bg-gray-50 p-3 text-sm text-gray-600">
                {compatibilityHint}
              </div>
            )}
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

      {/* BUTTON FALLBACK UNTEN */}
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
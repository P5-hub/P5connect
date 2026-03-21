"use client";

import { useEffect, useState } from "react";
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
  return product?.sony_article || product?.product_name || "Unbekanntes Produkt";
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

  /* ---------- Produktauswahl ---------- */
  const [tvList, setTvList] = useState<Product[]>([]);
  const [soundbarList, setSoundbarList] = useState<Product[]>([]);
  const [subwooferList, setSubwooferList] = useState<Product[]>([]);

  const [selectedTV, setSelectedTV] = useState<Product | null>(null);
  const [selectedSoundbar, setSelectedSoundbar] = useState<Product | null>(null);
  const [selectedSub, setSelectedSub] = useState<Product | null>(null);

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

      setTvList(formatted.filter((p) => p.ph2 === "TME"));
      setSoundbarList(formatted.filter((p) => p.category === "Soundbar"));
      setSubwooferList(formatted.filter((p) => p.category === "Subwoofer"));
    };

    loadProducts();
  }, [supabase]);

  /* ------------------------------------------------------
     ADD TO CART
  ------------------------------------------------------ */
  const handleAddToCart = () => {
    if (!selectedTV) {
      toast.error("Bitte zuerst einen TV auswählen");
      return;
    }

    if (promoType === "tv55_soundbar_percent") {
      const inches = parseTvInches(selectedTV);

      if (inches < 55) {
        toast.error("Die Promo gilt nur für TVs ab 55 Zoll");
        return;
      }

      if (!selectedSoundbar) {
        toast.error("Für die neue Promo ist eine Soundbar erforderlich");
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
          Promotion auswählen
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            onClick={() => setPromoType("classic_fixed")}
            className={`p-4 cursor-pointer ${
              promoType === "classic_fixed" ? `border-2 ${theme.border}` : ""
            }`}
          >
            <p className="font-semibold">Klassische Sofortrabatt-Promo</p>
            <p className="text-sm text-gray-500 mt-1">
              Fixe Beträge gemäss hinterlegter Produkttabelle
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
            <p className="font-semibold">Neue Promo: 30% / 50%</p>
            <p className="text-sm text-gray-500 mt-1">
              TV ab 55 Zoll + Soundbar = 30% auf Soundbar, mit Subwoofer zusätzlich 50% auf den Subwoofer
            </p>
          </Card>
        </div>
      </div>

      {/* TV */}
      <div>
        <h3 className={`text-lg font-semibold mb-3 ${theme.color}`}>
          TV auswählen
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tvList.map((tv: any) => {
            const inches = parseTvInches(tv);
            const eligibleForNewPromo = inches >= 55;

            return (
              <Card
                key={tv.product_id}
                onClick={() => {
                  setSelectedTV(tv);
                  setSelectedSoundbar(null);
                  setSelectedSub(null);
                }}
                className={`p-4 cursor-pointer ${
                  selectedTV?.product_id === tv.product_id
                    ? `border-2 ${theme.border}`
                    : ""
                }`}
              >
                <p className="font-semibold">{getProductLabel(tv)}</p>
                <p className="text-xs text-gray-500">EAN: {tv.ean}</p>

                {inches > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{inches} Zoll</p>
                )}

                {promoType === "tv55_soundbar_percent" && (
                  <p
                    className={`text-xs mt-2 ${
                      eligibleForNewPromo ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {eligibleForNewPromo
                      ? "Für neue Promo geeignet"
                      : "Nicht für neue Promo geeignet"}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* SOUNDBAR */}
      {selectedTV && (
        <div>
          <h3 className={`text-lg font-semibold mb-3 ${theme.color}`}>
            {promoType === "tv55_soundbar_percent"
              ? "Soundbar auswählen (Pflicht)"
              : "Optional: Soundbar"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {soundbarList.map((sb: any) => (
              <Card
                key={sb.product_id}
                onClick={() =>
                  setSelectedSoundbar(
                    selectedSoundbar?.product_id === sb.product_id ? null : sb
                  )
                }
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

      {/* SUB */}
      {selectedTV && selectedSoundbar && (
        <div>
          <h3 className={`text-lg font-semibold mb-3 ${theme.color}`}>
            Optional: Subwoofer
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subwooferList.map((sw: any) => (
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
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* BUTTON */}
      {selectedTV && (
        <div>
          <Button onClick={handleAddToCart} className={theme.bg}>
            In den Sofortrabatt-Warenkorb
          </Button>
        </div>
      )}
    </div>
  );
}
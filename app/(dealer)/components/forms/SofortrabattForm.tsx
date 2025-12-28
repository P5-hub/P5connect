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

/* ------------------------------------------------------
   COMPONENT
------------------------------------------------------ */

export default function SofortrabattForm() {
  const supabase = getSupabaseBrowser();
  const dealer = useDealer();
  const { t } = useI18n();
  const theme = getThemeByForm("sofortrabatt");

  const { addItem, clearCart, openCart } = useCart();

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

      setTvList(formatted.filter((p) => p.ph2 === "TME")); // TV
      setSoundbarList(formatted.filter((p) => p.category === "Soundbar"));
      setSubwooferList(formatted.filter((p) => p.category === "Subwoofer"));
    };

    loadProducts();
  }, [supabase]);

  /* ------------------------------------------------------
     ADD TO CART (GlobalCartProvider)
  ------------------------------------------------------ */
  const handleAddToCart = () => {
    if (!selectedTV) {
      toast.error("Bitte zuerst einen TV auswählen");
      return;
    }

    // 🔥 Sofortrabatt-Cart immer frisch aufbauen
    clearCart("sofortrabatt");

    addItem("sofortrabatt", selectedTV);

    if (selectedSoundbar) addItem("sofortrabatt", selectedSoundbar);
    if (selectedSub) addItem("sofortrabatt", selectedSub);

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
      {/* -------------------------------------------------- */}
      {/* STEP 1 — TV auswählen                              */}
      {/* -------------------------------------------------- */}
      <div>
        <h3 className={`text-lg font-semibold mb-3 ${theme.color}`}>
          TV auswählen
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tvList.map((tv) => (
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
              <p className="font-semibold">{tv.sony_article}</p>
              <p className="text-xs text-gray-500">EAN: {tv.ean}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* STEP 2 — Soundbar (optional)                       */}
      {/* -------------------------------------------------- */}
      {selectedTV && (
        <div>
          <h3 className={`text-lg font-semibold mb-3 ${theme.color}`}>
            Optional: Soundbar
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {soundbarList.map((sb) => (
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
                <p className="font-semibold">{sb.sony_article}</p>
                <p className="text-xs text-gray-500">EAN: {sb.ean}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* STEP 3 — Subwoofer (optional)                      */}
      {/* -------------------------------------------------- */}
      {selectedTV && selectedSoundbar && (
        <div>
          <h3 className={`text-lg font-semibold mb-3 ${theme.color}`}>
            Optional: Subwoofer
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subwooferList.map((sw) => (
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
                <p className="font-semibold">{sw.sony_article}</p>
                <p className="text-xs text-gray-500">EAN: {sw.ean}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* STEP 4 — In den Sofortrabatt-Warenkorb             */}
      {/* -------------------------------------------------- */}
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

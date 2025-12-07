"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

import UnifiedCart from "@/app/(dealer)/components/cart/UnifiedCart";
import { useDealer } from "@/app/(dealer)/DealerContext";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { getSupabaseBrowser } from "@/lib/supabaseClient";

import type { Product } from "@/types/Product";
import { getThemeByForm } from "@/lib/theme/ThemeContext";

/* ------------------------------------------------------
   TYPES
------------------------------------------------------ */

type SofortrabattLevel = 1 | 2 | 3;

interface SofortrabattDetails {
  rabattLevel: SofortrabattLevel;
  invoiceFile?: File | null;
}

/* ------------------------------------------------------
   COMPONENT
------------------------------------------------------ */

export default function SofortrabattForm() {
  const supabase = getSupabaseBrowser();
  const dealer = useDealer();
  const { t } = useI18n();
  const theme = getThemeByForm("sofortrabatt");

  /* ---------- UI / Auswahl ---------- */
  const [tvList, setTvList] = useState<Product[]>([]);
  const [soundbarList, setSoundbarList] = useState<Product[]>([]);
  const [subwooferList, setSubwooferList] = useState<Product[]>([]);

  const [selectedTV, setSelectedTV] = useState<Product | null>(null);
  const [selectedSoundbar, setSelectedSoundbar] = useState<Product | null>(null);
  const [selectedSub, setSelectedSub] = useState<Product | null>(null);

  const [rabattLevel, setRabattLevel] = useState<SofortrabattLevel>(1);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

  /* ---------- Unified Cart ---------- */
  const [cart, setCart] = useState<any[]>([]);
  const [openCart, setOpenCart] = useState(false);

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
  }, []);

  /* ------------------------------------------------------
     CART LOGIC
  ------------------------------------------------------ */
  const addBundleToCart = () => {
    if (!selectedTV) {
      toast.error("Bitte TV auswählen");
      return;
    }

    const items = [selectedTV];

    if (rabattLevel >= 2 && selectedSoundbar) items.push(selectedSoundbar);
    if (rabattLevel === 3 && selectedSub) items.push(selectedSub);

    setCart(items);
    setOpenCart(true);
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
              onClick={() => setSelectedTV(tv)}
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
      {/* STEP 2 — Rabatt-Level auswählen                    */}
      {/* -------------------------------------------------- */}
      {selectedTV && (
        <div>
          <h3 className={`text-lg font-semibold mb-3 ${theme.color}`}>
            Rabatt-Level wählen
          </h3>

          <div className="flex gap-3">
            <Button
              variant={rabattLevel === 1 ? "default" : "outline"}
              onClick={() => setRabattLevel(1)}
            >
              Single (nur TV)
            </Button>
            <Button
              variant={rabattLevel === 2 ? "default" : "outline"}
              onClick={() => setRabattLevel(2)}
            >
              Double (TV + Soundbar)
            </Button>
            <Button
              variant={rabattLevel === 3 ? "default" : "outline"}
              onClick={() => setRabattLevel(3)}
            >
              Triple (TV + Soundbar + Subwoofer)
            </Button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* STEP 3 — Soundbar auswählen                        */}
      {/* -------------------------------------------------- */}
      {selectedTV && rabattLevel >= 2 && (
        <div>
          <h3 className={`text-lg font-semibold mb-3 ${theme.color}`}>
            Soundbar auswählen
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {soundbarList.map((sb) => (
              <Card
                key={sb.product_id}
                onClick={() => setSelectedSoundbar(sb)}
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
      {/* STEP 4 — Subwoofer auswählen                       */}
      {/* -------------------------------------------------- */}
      {selectedTV && rabattLevel === 3 && selectedSoundbar && (
        <div>
          <h3 className={`text-lg font-semibold mb-3 ${theme.color}`}>
            Subwoofer auswählen
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subwooferList.map((sw) => (
              <Card
                key={sw.product_id}
                onClick={() => setSelectedSub(sw)}
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
      {/* STEP 5 — Rechnung upload + In den Warenkorb        */}
      {/* -------------------------------------------------- */}
      {selectedTV && (
        <div className="space-y-3">
          <label className="block text-sm text-gray-600">
            Rechnung hochladen (PDF/JPG/PNG)
          </label>

          <Input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) =>
              setInvoiceFile(e.target.files ? e.target.files[0] : null)
            }
          />

          <Button onClick={addBundleToCart} className={theme.bg}>
            In den Warenkorb
          </Button>
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* UnifiedCart (ersetzt CartSofortrabatt)             */}
      {/* -------------------------------------------------- */}

      <UnifiedCart
        mode="sofortrabatt"
        cart={cart}
        setCart={setCart}
        open={openCart}
        setOpen={setOpenCart}
        onSuccess={() => {
          setCart([]);
          setSelectedTV(null);
          setSelectedSoundbar(null);
          setSelectedSub(null);
          setRabattLevel(1);
          setInvoiceFile(null);
        }}
        details={{
          rabattLevel,
          invoiceFile,
        }}
      />
    </div>
  );
}
  
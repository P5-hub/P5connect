"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  calcBestpriceEkFromMarketPrice,
  getBestpriceFactorFromDealerGroups,
  getBestpriceMwstFactor,
  parseMoneyInput,
  type DealerPricingGroupLike,
} from "@/lib/helpers/bestpriceGuarantee";

export default function ProductCardSonyPro({
  product,
  onAddToCart,
  dealerPricingGroups = [],
}: {
  product: any;
  onAddToCart: (item: any) => void;
  dealerPricingGroups?: DealerPricingGroupLike[];
}) {
  const { t } = useI18n();

  const initialPrice = Number(product.dealer_invoice_price ?? 0); 
  const bestpriceFactor = getBestpriceFactorFromDealerGroups(dealerPricingGroups);

  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(initialPrice);
  const [priceInput, setPriceInput] = useState(initialPrice.toFixed(2));
  const [grossPriceInput, setGrossPriceInput] = useState("");
  const [calculationMode, setCalculationMode] = useState<"manual" | "gross">(
    "manual"
  );

  useEffect(() => {
    setPrice(initialPrice);
    setPriceInput(initialPrice.toFixed(2));
    setGrossPriceInput("");
    setCalculationMode("manual");
    setQty(1);
  }, [product.product_id, initialPrice]);

  const retailPrice = product.retail_price ?? null;
  const dealerInvoice = product.dealer_invoice_price ?? null;

  const savingUnit = dealerInvoice && price ? dealerInvoice - price : 0;
  const savingTotal = savingUnit * qty;
  const savingPercent =
    dealerInvoice && price ? (savingUnit / dealerInvoice) * 100 : 0;

  const distributorText = (() => {
    if (!product.distri) return "EP";
    const parts = product.distri.split(",").map((p: string) => p.trim());
    return parts[0] ?? "EP";
  })();

  // verhindert doppelte AddToCart Calls
  const alreadyAddedRef = useRef(false);

  function AddToCartProgressButton() {
    const [state, setState] = useState<"idle" | "progress" | "added">("idle");
    const [progress, setProgress] = useState(0);

    const performAdd = () => {
      if (alreadyAddedRef.current) return;
      alreadyAddedRef.current = true;

      onAddToCart({
        ...product,
        quantity: qty,

        // 🔴 WICHTIG: finaler EK netto
        price: price,
        price_manual_override: true,
        price_manual_override_value: price,

        // Zusatzinfo, wie der Preis berechnet wurde
        price_calculation_mode: calculationMode,
        price_gross_input:
          calculationMode === "gross" ? parseMoneyInput(grossPriceInput) : null,
        price_calculation_factor:
          calculationMode === "gross" ? bestpriceFactor.factor : null,
        price_calculation_discount_percent:
          calculationMode === "gross" ? bestpriceFactor.discountPercent : null,
        price_calculation_mwst_factor:
          calculationMode === "gross" ? getBestpriceMwstFactor() : null,
        price_calculation_group_code:
          calculationMode === "gross" ? bestpriceFactor.groupCode : null,
        price_calculation_group_name:
          calculationMode === "gross" ? bestpriceFactor.groupName : null,
      });
    };

    const handleClick = () => {
      if (state !== "idle") return;

      setState("progress");
      setProgress(0);

      let t = 0;
      const duration = 1200;

      const interval = setInterval(() => {
        t += 16;

        const eased = Math.min(1, 1 - Math.pow(1 - t / duration, 3));
        const percent = Math.floor(eased * 100);

        setProgress(percent);

        if (percent >= 100) {
          clearInterval(interval);

          setTimeout(() => performAdd(), 0);

          setState("added");

          setTimeout(() => {
            setState("idle");
            setProgress(0);
            alreadyAddedRef.current = false;
          }, 1400);
        }
      }, 16);
    };

    const isAdded = state === "added";
    const isLoading = state === "progress";

    const bgClass =
      state === "idle"
        ? "bg-gradient-to-r from-blue-600 to-blue-700"
        : state === "progress"
        ? "bg-gradient-to-r from-blue-600 via-blue-500 to-green-500"
        : "bg-green-600";

    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`
          relative w-full h-10 rounded-xl overflow-hidden select-none
          text-white text-sm font-medium shadow-md
          transition-all duration-400 ease-out
          ${bgClass}
        `}
      >
        {isLoading && (
          <div
            className="absolute left-0 top-0 h-full bg-white/20 rounded-xl shadow-inner"
            style={{
              width: `${progress}%`,
              transition: "width 120ms ease-out",
            }}
          />
        )}

        <span className="relative z-10 flex items-center justify-center gap-2">
          {isAdded ? (
            <>
              <Check className="w-4 h-4" />
              Hinzugefügt
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              {t("productCard.addToCart")}
            </>
          )}
        </span>
      </button>
    );
  }

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.18 }}>
      <Card className="border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-gray-900 truncate">
                {product.product_name || product.sony_article}
              </h2>
              <p className="text-[11px] text-gray-500">EAN: {product.ean}</p>
            </div>

            <span
              className="
                px-2 py-0.5 rounded-full border border-gray-300
                text-[10px] text-gray-600 bg-gray-50
              "
            >
              Distributor: {distributorText}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* PRICE BLOCK */}
          <div className="grid grid-cols-2 bg-gray-50 border rounded-xl p-3 text-sm">
            <div>
              <span className="block text-[11px] text-gray-500">
                UVP brutto
              </span>
              <span className="font-medium">
                {retailPrice ? `${retailPrice.toFixed(2)} CHF` : "-"}
              </span>
            </div>

            <div className="text-right">
              <span className="block text-[11px] text-gray-500">
                EK normal
              </span>
              <span className="font-medium text-blue-600">
                {dealerInvoice ? `${dealerInvoice.toFixed(2)} CHF` : "-"}
              </span>
            </div>
          </div>

          {/* INPUTS */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label className="text-[11px] text-gray-500 mb-1 block">
                {t("productCard.amount")}
              </label>
              <Input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value) || 1)}
                className="text-center"
              />
            </div>

            <div>
              <label className="text-[11px] text-gray-500 mb-1 block">
                Bestpreisgarantie-Kalkulation
              </label>
              <Input
                value={grossPriceInput}
                placeholder="Marktpreis z.B. 999.00"
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9.,]/g, "");
                  setGrossPriceInput(cleaned);

                  const gross = parseMoneyInput(cleaned);
                  const calculatedEk = calcBestpriceEkFromMarketPrice({
                    marketPriceGross: gross,
                    factor: bestpriceFactor.factor,
                  });

                  if (calculatedEk > 0) {
                    setPrice(calculatedEk);
                    setPriceInput(calculatedEk.toFixed(2));
                    setCalculationMode("gross");
                  }
                }}
                onBlur={(e) => {
                  const gross = parseMoneyInput(e.target.value);

                  if (!gross || gross <= 0) {
                    setGrossPriceInput("");
                    setCalculationMode("manual");
                    return;
                  }

                  const calculatedEk = calcBestpriceEkFromMarketPrice({
                    marketPriceGross: gross,
                    factor: bestpriceFactor.factor,
                  });

                  setGrossPriceInput(gross.toFixed(2));
                  setPrice(calculatedEk);
                  setPriceInput(calculatedEk.toFixed(2));
                  setCalculationMode("gross");
                }}
                className="text-center"
              />
            </div>

            <div>
              <label className="text-[11px] text-gray-500 mb-1 block">
                {t("productCard.priceNet")}
              </label>
              <Input
                value={priceInput}
                onChange={(e) => {
                  setPriceInput(e.target.value.replace(/[^0-9.,]/g, ""));
                  setCalculationMode("manual");
                }}
                onBlur={(e) => {
                  const parsed = Number(e.target.value.replace(",", "."));
                  const valid = Number.isFinite(parsed) ? parsed : 0;

                  setPrice(valid);
                  setPriceInput(valid.toFixed(2));
                  setCalculationMode("manual");
                }}
                className="text-center"
              />
            </div>
          </div>

          {calculationMode === "gross" && grossPriceInput && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center text-xs text-blue-700 font-medium">
              Bestpreisgarantie berechnet aus Marktpreis {grossPriceInput} CHF:{" "}
              {price.toFixed(2)} CHF EK netto
              <span className="block text-[11px] font-normal text-blue-600">
                Kalkulationssatz: {bestpriceFactor.groupName} ·{" "}
                {bestpriceFactor.discountPercent}% / Faktor{" "}
                {bestpriceFactor.factor.toFixed(2)}
              </span>
            </div>
          )}

          {savingUnit > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center text-xs text-green-700 font-semibold">
              {savingTotal.toFixed(2)} CHF gespart ({savingPercent.toFixed(1)}%)
            </div>
          )}

          <AddToCartProgressButton />
        </CardContent>
      </Card>
    </motion.div>
  );
}
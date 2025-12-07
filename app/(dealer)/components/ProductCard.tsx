"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function ProductCardSonyPro({
  product,
  onAddToCart,
}: {
  product: any;
  onAddToCart: (item: any) => void;
}) {
  const { t } = useI18n();

  const initialPrice =
    typeof product.dealer_invoice_price === "number"
      ? product.dealer_invoice_price
      : 0;

  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(initialPrice);
  const [priceInput, setPriceInput] = useState(initialPrice.toFixed(2));

  useEffect(() => {
    setPrice(initialPrice);
    setPriceInput(initialPrice.toFixed(2));
    setQty(1);
  }, [product.product_id]);

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

  /* ---------------------------------------------------------
     💎 FIX: Add-to-Cart darf NIEMALS doppelt ausgeführt werden
  --------------------------------------------------------- */

  // → verhindert doppelte Ausführung trotz Render + Timer
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
        price,
      });
    };

    const handleClick = () => {
      if (state !== "idle") return;

      setState("progress");
      setProgress(0);

      let t = 0;
      const duration = 1200; // smooth timing

      const interval = setInterval(() => {
        t += 16; // ~60 FPS

        // Ease-out cubic curve → schöner Verlauf
        const eased = Math.min(1, 1 - Math.pow(1 - t / duration, 3));
        const percent = Math.floor(eased * 100);

        setProgress(percent);

        if (percent >= 100) {
          clearInterval(interval);

          // Add exactly once
          setTimeout(() => performAdd(), 0);

          // Show “added”
          setState("added");

          // Rückkehr zu Blau nach 1.4 Sekunden
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

    /* ===========================================
      🎨 Farblogik
      idle     → Blau (normal)
      progress → Blau → Grün Verlauf
      added    → Grün
      reset    → zurück zu Blau
    =========================================== */

    const bgClass =
      state === "idle"
        ? "bg-gradient-to-r from-blue-600 to-blue-700"
        : state === "progress"
        ? "bg-gradient-to-r from-blue-600 via-blue-500 to-green-500"
        : "bg-green-600"; // added

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
        {/* Smooth Progress Bar */}
        {isLoading && (
          <div
            className="absolute left-0 top-0 h-full bg-white/20 rounded-xl shadow-inner"
            style={{
              width: `${progress}%`,
              transition: "width 120ms ease-out",
            }}
          />
        )}

        {/* Button Label */}
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
              <span className="block text-[11px] text-gray-500">UVP brutto</span>
              <span className="font-medium">
                {retailPrice ? `${retailPrice.toFixed(2)} CHF` : "-"}
              </span>
            </div>

            <div className="text-right">
              <span className="block text-[11px] text-gray-500">EK normal</span>
              <span className="font-medium text-blue-600">
                {dealerInvoice ? `${dealerInvoice.toFixed(2)} CHF` : "-"}
              </span>
            </div>
          </div>

          {/* INPUT FIELDS */}
          <div className="grid grid-cols-2 gap-3">
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
                {t("productCard.priceNet")}
              </label>
              <Input
                value={priceInput}
                onChange={(e) =>
                  setPriceInput(e.target.value.replace(/[^0-9.,]/g, ""))
                }
                onBlur={(e) => {
                  const parsed = Number(e.target.value.replace(",", "."));
                  const valid = Number.isFinite(parsed) ? parsed : 0;
                  setPrice(valid);
                  setPriceInput(valid.toFixed(2));
                }}
                className="text-center"
              />
            </div>
          </div>

          {savingUnit > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center text-xs text-green-700 font-semibold">
              {savingTotal.toFixed(2)} CHF gespart ({savingPercent.toFixed(1)}%)
            </div>
          )}

          {/* 🚀 Premium Add-To-Cart */}
          <AddToCartProgressButton />
        </CardContent>
      </Card>
    </motion.div>
  );
}

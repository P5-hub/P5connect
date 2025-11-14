"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { ShoppingCart, Tag } from "lucide-react";
import { Product } from "@/types/Product";
import { motion, AnimatePresence } from "framer-motion";

import { useMarketPrices } from "@/lib/hooks/useMarketPrices";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product & { distri?: string | null };
  onAddToCart: (item: any) => void;
}) {
  const [quantity, setQuantity] = useState(1);

  const initialBestPrice =
    typeof product.dealer_invoice_price === "number"
      ? product.dealer_invoice_price
      : 0;

  const [bestPrice, setBestPrice] = useState<number>(initialBestPrice);
  const [priceInput, setPriceInput] = useState<string>(to2(initialBestPrice));

  useEffect(() => {
    setBestPrice(initialBestPrice);
    setPriceInput(to2(initialBestPrice));
  }, [product?.product_id]);

  useEffect(() => {
    setPriceInput(to2(bestPrice));
  }, [bestPrice]);

  const [added, setAdded] = useState(false);

  // Distributor Logik
  const allowedDistis = useMemo(() => {
    const raw = (product as any).distri as string | undefined;
    if (!raw) return [] as string[];
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }, [product]);

  const [selectedDisti, setSelectedDisti] = useState<string>(
    allowedDistis[0] ?? ""
  );

  useEffect(() => {
    setSelectedDisti(allowedDistis[0] ?? "");
  }, [allowedDistis]);

  // ⬅️ Bulk Market Prices (1 Request)
  const { shops, loading, error } = useMarketPrices(product.ean);

  const retailPrice =
    typeof product.retail_price === "number" ? product.retail_price : null;

  const dealerInvoice =
    typeof product.dealer_invoice_price === "number"
      ? product.dealer_invoice_price
      : null;

  const savingPerUnit =
    dealerInvoice && bestPrice ? dealerInvoice - bestPrice : 0;

  const savingTotal = savingPerUnit * quantity;

  const savingPercent =
    dealerInvoice && bestPrice ? (savingPerUnit / dealerInvoice) * 100 : 0;

  const handleAddToCart = () => {
    const payload: any = {
      ...product,
      quantity,
      price: Number.isFinite(bestPrice) ? bestPrice : 0,
    };

    if (allowedDistis.length > 0) {
      payload.allowedDistis = allowedDistis;
      payload.overrideDistributor = selectedDisti || allowedDistis[0];
    }

    onAddToCart(payload);

    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  // Letztes Marktpreis-Datum
  const lastChecked = useMemo(() => {
    if (!shops) return null;

    const dates = Object.values(shops)
      .map((s: any) => s?.lastChecked)
      .filter(Boolean)
      .map((d) => new Date(d as string).getTime());

    if (dates.length === 0) return null;

    const newest = new Date(Math.max(...dates));

    return newest.toLocaleString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [shops]);

  const MARKET_SHOPS = [
    "digitec",
    "mediamarkt",
    "interdiscount",
    "fnac",
    "brack",
    "fust",
  ];

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
    >
      <Card className="p-4 border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="p-0 mb-3 border-b pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-sm font-semibold text-gray-900 truncate">
                {product.product_name ||
                  (product as any).sony_article ||
                  "Unbekanntes Modell"}
              </CardTitle>

              {(product as any).brand && (
                <p className="text-xs text-gray-500 font-medium">
                  {(product as any).brand}
                </p>
              )}

              <p className="text-[11px] text-gray-400">
                EAN: {product.ean || "-"}
              </p>
            </div>

            {allowedDistis.length === 0 ? (
              <span className="inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-full text-[11px] border bg-gray-50">
                Haupt-Distributor:&nbsp;<strong>EP</strong>
              </span>
            ) : (
              <div className="min-w-[160px]">
                <label className="block text-[11px] text-gray-500 mb-1">
                  Distributor (Pflicht)
                </label>
                <Select
                  value={selectedDisti}
                  onValueChange={(v) => setSelectedDisti(v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Bitte wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedDistis.map((code) => (
                      <SelectItem key={code} value={code} className="text-xs">
                        {code.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Preise */}
          <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-2 rounded-lg border">
            <div>
              <span className="block text-[11px] text-gray-500">
                UVP (brutto)
              </span>
              <span className="font-medium">
                {retailPrice != null
                  ? `${retailPrice.toFixed(2)} CHF`
                  : "-"}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[11px] text-gray-500">
                EK normal
              </span>
              <span className="font-medium text-blue-600">
                {dealerInvoice != null
                  ? `${dealerInvoice.toFixed(2)} CHF`
                  : "-"}
              </span>
            </div>
          </div>

          {/* Marktpreise */}
          <div className="bg-gray-50 border rounded-lg p-2 text-xs text-gray-600 space-y-1">
            <p className="text-[11px] text-gray-500 font-medium mb-1">
              Marktpreise (aktuell):
            </p>

            {MARKET_SHOPS.map((shop) => {
              const s = shops?.[shop];

              return (
                <div key={shop} className="flex justify-between">
                  <span>{shop}:</span>

                  {loading ? (
                    <span className="text-gray-400">lädt…</span>
                  ) : s?.price ? (
                    <a
                      href={s.sourceUrl ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      CHF {s.price.toFixed(2)}
                    </a>
                  ) : (
                    <span className="text-gray-400">
                      {s?.error ?? "nicht verfügbar"}
                    </span>
                  )}
                </div>
              );
            })}

            {lastChecked && (
              <p className="pt-1 mt-1 text-[10px] text-gray-400 text-right border-t border-gray-100">
                Stand: {lastChecked}
              </p>
            )}
          </div>

          {/* Eingaben */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Anzahl</label>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value || "1", 10)))
                }
                className="text-center text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Preis (CHF, exkl. MwSt & VRG)
              </label>

              <Input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                placeholder="0.00"
                value={priceInput}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.,]/g, "");
                  setPriceInput(v);
                }}
                onBlur={(e) => {
                  const n = parseFloat(e.target.value.replace(",", "."));
                  const rounded =
                    Number.isFinite(n) ? Number(n.toFixed(2)) : 0;
                  setBestPrice(rounded);
                  setPriceInput(rounded.toFixed(2));
                }}
                className="text-center text-sm font-medium"
              />
            </div>
          </div>

          {savingPerUnit > 0 && (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 border border-green-200 p-1.5">
              <Tag className="w-4 h-4 text-green-600" />
              <p className="text-green-700 text-xs font-semibold">
                {savingTotal.toFixed(2)} CHF gespart (
                {savingPercent.toFixed(1)}%)
              </p>
            </div>
          )}

          <div className="relative h-9 mt-2">
            <AnimatePresence mode="wait">
              {added ? (
                <motion.div
                  key="added"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center 
                    text-green-600 font-semibold text-sm bg-green-50 rounded-lg"
                >
                  ✅ Produkt hinzugefügt
                </motion.div>
              ) : (
                <motion.div
                  key="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0"
                >
                  <Button
                    className="w-full h-9 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 
                      text-white text-sm font-medium hover:from-blue-700 hover:to-indigo-700 
                      transition-all duration-200 flex items-center justify-center gap-1"
                    onClick={handleAddToCart}
                    disabled={allowedDistis.length > 0 && !selectedDisti}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    In den Warenkorb
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function to2(v: unknown) {
  const n =
    typeof v === "string" ? parseFloat(v.replace(",", ".")) : Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { HandCoins } from "lucide-react";

export default function ProductCardSupport({ product, onAddToCart }: any) {
  const { t } = useI18n();
  const [quantity, setQuantity] = useState(1);
  const [supportAmount, setSupportAmount] = useState(0);

  const toInt = (v: any) => (Number.isFinite(+v) ? Math.max(0, Math.round(+v)) : 0);

  const handleAdd = () => {
    if (typeof onAddToCart !== "function") return;
    onAddToCart({
      ...product,
      quantity: toInt(quantity),
      supportbetrag: toInt(supportAmount),
    });
    // Reset Felder nach Hinzufügen
    setQuantity(1);
    setSupportAmount(0);
  };

  return (
    <Card className="border-amber-200 bg-white shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-base font-semibold text-gray-800 leading-tight">
            {product?.product_name || product?.sony_article || t("support.product.unknown")}
          </h3>
          <div className="text-xs text-gray-500 text-right">
            {product?.sony_article && <p>SKU: {product.sony_article}</p>}
            {product?.ean && <p>EAN: {product.ean}</p>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              {t("support.quantity")}
            </label>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(toInt(e.target.value))}
              className="text-center"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              {t("support.amountperunit")} (CHF)
            </label>
            <Input
              type="number"
              min={0}
              value={supportAmount}
              onChange={(e) => setSupportAmount(toInt(e.target.value))}
              className="text-center"
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <Button
          onClick={handleAdd}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
        >
          <HandCoins className="w-4 h-4" />
          {t("support.add")}
        </Button>
      </CardFooter>
    </Card>
  );
}

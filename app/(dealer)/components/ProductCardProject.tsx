"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Product } from "@/types/Product";
import { PlusCircle, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

// ✅ Eigener Typ, da ProductCardProps NICHT MEHR aus ProductList exportiert wird
type ProductCardProjectProps = {
  product: Product;
  onAddToCart: (item: any) => void;
};

export default function ProductCardProject({
  product,
  onAddToCart,
}: ProductCardProjectProps) {
  const { t } = useI18n();

  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [targetPrice, setTargetPrice] = useState(
    product.dealer_invoice_price ?? 0
  );

  const handleAddToCart = () => {
    onAddToCart({
      ...product,
      quantity,
      price: targetPrice,
    });

    setAdded(true);

    toast.success(t("project.added"), {
      description:
        product.product_name ||
        product.sony_article ||
        "Produkt",
    });

    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Card className="border border-purple-300 bg-white shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-900">
          {product.product_name || product.sony_article || "Unbekannt"}
        </CardTitle>

        {product.brand && (
          <p className="text-xs text-gray-500">{product.brand}</p>
        )}

        <p className="text-xs text-gray-400">EAN: {product.ean || "-"}</p>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Bild */}
        {product.product_image_url && (
          <div className="flex justify-center">
            <img
              src={product.product_image_url}
              alt={product.product_name || product.sony_article || ""}
              className="max-h-32 object-contain"
            />
          </div>
        )}

        {/* Menge & Zielpreis */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              {t("project.quantity")}
            </label>

            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) =>
                setQuantity(parseInt(e.target.value) || 1)
              }
              className="text-center"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              {t("project.targetprice")}
            </label>

            <Input
              type="number"
              value={Math.round(targetPrice)}
              onChange={(e) =>
                setTargetPrice(parseFloat(e.target.value) || 0)
              }
              className="text-center"
            />
          </div>
        </div>

        {/* Button */}
        <div className="flex justify-center">
          {added ? (
            <Button
              disabled
              className="w-full h-10 bg-purple-100 text-purple-700 border border-purple-300 flex items-center justify-center gap-1 cursor-default"
            >
              <CheckCircle2 className="w-4 h-4" />
              {t("project.added.short")}
            </Button>
          ) : (
            <Button
              onClick={handleAddToCart}
              className="w-full h-10 bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-1"
            >
              <PlusCircle className="w-4 h-4" />
              {t("project.add")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

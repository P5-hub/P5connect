"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Product } from "@/types/Product";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductCardVerkauf({
  product,
  onReportSale,
}: {
  product: Product;
  onReportSale: (item: any) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [serial, setSerial] = useState("");
  const [added, setAdded] = useState(false);

  const handleReport = () => {
    onReportSale({
      ...product,
      quantity,
      price,
      serial,
    });

    // ✅ Kurzzeit-Bestätigung in der Karte
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);

    // Eingaben zurücksetzen
    setQuantity(1);
    setPrice(undefined);
    setSerial("");
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <Card className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300">
        <CardContent className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {product.product_name || product.sony_article || "Unbekanntes Modell"}
            </h3>
            <p className="text-xs text-gray-500">{product.brand}</p>
            <p className="text-xs text-gray-400">EAN: {product.ean || "-"}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Anzahl</label>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="text-center text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Preis (CHF)</label>
              <Input
                type="number"
                value={price ?? ""}
                onChange={(e) =>
                  setPrice(e.target.value ? parseFloat(e.target.value) : undefined)
                }
                className="text-center text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Seriennr.</label>
              <Input
                type="text"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                placeholder="SN..."
                className="text-sm font-medium"
              />
            </div>
          </div>

          <div className="relative h-9">
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
                  ✅ Hinzugefügt
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
                    className="w-full h-9 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-all"
                    onClick={handleReport}
                  >
                    📊 Melden
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

"use client";

import ProductList from "@/app/(dealer)/components/ProductList";
import ProductCard from "@/app/(dealer)/components/ProductCard";
import { useDealer } from "@/app/(dealer)/DealerContext";

// 🆕 NEU: GlobalCartProvider
import { useCart } from "@/app/(dealer)/GlobalCartProvider";

export default function BestellungForm() {
  const dealer = useDealer();

  // NEU: globaler Warenkorb
  const { addItem, openCart } = useCart();

  if (!dealer) {
    return <p className="text-gray-500">⏳ Händlerdaten werden geladen...</p>;
  }

  return (
    <div className="space-y-6">
      <ProductList
        CardComponent={ProductCard}
        cardProps={{
          onAddToCart: (product) => {
            // Produkt in den Slot "bestellung" speichern
            addItem("bestellung", {
              ...product,
               });


          },
        }}
        sofortrabattOnly={false}
        supportType="sellout"
        showCSVButton={false}
      />
    </div>
  );
}

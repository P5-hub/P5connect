"use client";

import { useState } from "react";
import { useDealer } from "@/app/(dealer)/DealerContext";
import ProductList from "@/components/ProductList";
import ProductCard from "@/components/ProductCard";
import Cart from "@/components/Cart";

export default function BestellungForm() {
  const dealer = useDealer(); // ✅ globaler Händler
  console.log("🔍 dealer =", dealer);
  const [cart, setCart] = useState<any[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Produkt in Warenkorb legen (ohne Cart automatisch zu öffnen)
  const handleAddToCart = (product: any) => {
    setCart((prev) => [...prev, product]);
  };

  // Nach erfolgreicher Bestellung Warenkorb leeren
  const handleOrderSuccess = () => {
    setCart([]);
  };

  if (!dealer) {
    return <p className="text-gray-500">⏳ Händlerdaten werden geladen...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Produktliste */}
      <ProductList
        CardComponent={ProductCard}
        cardProps={{ onAddToCart: handleAddToCart }}
        sofortrabattOnly={false}
        supportType="sellout"        // ✅ Wichtig! Aktiviert Produktanzeige
        showCSVButton={false}        // optional: kein CSV-Upload bei Bestellung
      />

      {/* Warenkorb */}
      <Cart
        cart={cart}
        setCart={setCart}
        onOrderSuccess={handleOrderSuccess}
        open={cartOpen}
        setOpen={setCartOpen}
      />
    </div>
  );
}

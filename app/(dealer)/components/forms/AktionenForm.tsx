"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useDealer } from "@/app/(dealer)/DealerContext";
import ProductList from "@/app/(dealer)/components/ProductList";
import ProductCard from "@/app/(dealer)/components/ProductCard";
import CartAction from "@/app/(dealer)/components/CartAction";
import { Loader2 } from "lucide-react";

interface PromotionOffer {
  id: number;
  product_id: number | null;
  title: string | null;
  description: string | null;
  image_url: string | null;
  promotion_price: number | null;
  discount_amount: number | null;
  valid_from: string | null;
  valid_to: string | null;
  active: boolean;
  level: number | null;
  product_name?: string | null;
}

export default function AktionenForm() {
  const supabase = createClient();
  const dealer = useDealer();
  const [offers, setOffers] = useState<PromotionOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const loadOffers = async () => {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("promotion_offers")
        .select(
          `
            *,
            products!inner (
              product_name
            )
          `
        )
        .eq("active", true)
        .lte("valid_from", today)
        .gte("valid_to", today)
        .order("valid_from", { ascending: false });

      if (error) {
        console.error("❌ Fehler beim Laden der Aktionen:", error);
      } else {
        setOffers(data || []);
      }
      setLoading(false);
    };

    loadOffers();
  }, [supabase]);

  const handleAddToCart = (offer: any) => {
    setCart((prev) => [...prev, offer]);
  };

  const handleSubmitSuccess = () => {
    setCart([]);
  };

  if (!dealer) {
    return <p className="text-gray-500">⏳ Händlerdaten werden geladen...</p>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 text-gray-500">
        <Loader2 className="animate-spin w-5 h-5 mr-2" />
        Aktionen werden geladen...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 🔹 Aktionsliste */}
      <ProductList
        CardComponent={ProductCard}
        cardProps={{ onAddToCart: handleAddToCart }}
        customProducts={offers.map((offer) => ({
          id: offer.id,
          name: offer.title || offer.product_name || "Unbenannte Aktion",
          description: offer.description,
          image_url: offer.image_url,
          price: offer.promotion_price || 0,
          discount: offer.discount_amount || 0,
          valid_from: offer.valid_from,
          valid_to: offer.valid_to,
        }))}
        sofortrabattOnly={false}
        supportType="aktion"
        showCSVButton={false}
      />

      {/* 🔹 Warenkorb */}
      <CartAction
        cart={cart}
        setCart={setCart}
        onSubmitSuccess={handleSubmitSuccess}
        open={cartOpen}
        setOpen={setCartOpen}
      />
    </div>
  );
}

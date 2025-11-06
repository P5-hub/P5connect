"use client";

import RecentActivityPanel from "@/components/RecentActivityPanel";
import { useDealer } from "@/app/(dealer)/DealerContext";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CartSofortrabatt from "@/components/CartSofortrabatt";
import { Product } from "@/types/Product";
import { toast } from "sonner";

type SofortrabattLevel = 1 | 2 | 3;

export default function SofortrabattForm() {
  const supabase = getSupabaseBrowser();
  const dealer = useDealer();

  const [tvs, setTvs] = useState<Product[]>([]);
  const [soundbars, setSoundbars] = useState<Product[]>([]);
  const [subwoofers, setSubwoofers] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [openCart, setOpenCart] = useState(false);

  const [selectedTV, setSelectedTV] = useState<Product | null>(null);
  const [selectedSoundbar, setSelectedSoundbar] = useState<Product | null>(null);
  const [selectedSubwoofer, setSelectedSubwoofer] = useState<Product | null>(null);
  const [rabattLevel, setRabattLevel] = useState<SofortrabattLevel>(1);

  // Produkte laden
  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active_sofortrabatt", true);

      if (error) {
        console.error("❌ Fehler beim Laden Sofortrabatt-Produkte:", error);
        toast.error("Produkte konnten nicht geladen werden");
        return;
      }

      // ✅ product_id in String umwandeln, um Typkonflikte zu vermeiden
      const formatted = (data || []).map((p) => ({
        ...p,
        product_id: String(p.product_id),
      }));

      setTvs(formatted.filter((p) => p.ph2 === "TME"));
      setSoundbars(formatted.filter((p) => p.category === "Soundbar"));
      setSubwoofers(formatted.filter((p) => p.category === "Subwoofer"));
    };

    loadProducts();
  }, []);

  const addToCart = () => {
    if (!selectedTV) {
      toast.error("Bitte zuerst einen TV auswählen");
      return;
    }

    let items: Product[] = [selectedTV];
    if (rabattLevel >= 2 && selectedSoundbar) items.push(selectedSoundbar);
    if (rabattLevel === 3 && selectedSubwoofer) items.push(selectedSubwoofer);

    setCart(items);
    setOpenCart(true);
  };

  return (
    <div>
      {/* Schritt 1: TV */}
      <h2 className="text-lg font-semibold mb-2">1. TV auswählen</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {tvs.map((tv) => (
          <Card
            key={tv.product_id}
            className={`p-4 cursor-pointer ${
              selectedTV?.product_id === tv.product_id
                ? "border-2 border-pink-600"
                : ""
            }`}
            onClick={() => setSelectedTV(tv)}
          >
            <p className="font-semibold">{tv.sony_article}</p>
            <p className="text-sm text-gray-500">EAN: {tv.ean}</p>
          </Card>
        ))}
      </div>

      {/* Schritt 2: Rabatt-Level */}
      {selectedTV && (
        <>
          <h2 className="text-lg font-semibold mb-2">2. Rabatt-Level wählen</h2>
          <div className="flex gap-3 mb-6">
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
        </>
      )}

      {/* Schritt 3: Soundbar */}
      {selectedTV && rabattLevel >= 2 && (
        <>
          <h2 className="text-lg font-semibold mb-2">3. Soundbar auswählen</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {soundbars.map((sb) => (
              <Card
                key={sb.product_id}
                className={`p-4 cursor-pointer ${
                  selectedSoundbar?.product_id === sb.product_id
                    ? "border-2 border-pink-600"
                    : ""
                }`}
                onClick={() => setSelectedSoundbar(sb)}
              >
                <p className="font-semibold">{sb.sony_article}</p>
                <p className="text-sm text-gray-500">EAN: {sb.ean}</p>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Schritt 4: Subwoofer */}
      {selectedTV && rabattLevel === 3 && selectedSoundbar && (
        <>
          <h2 className="text-lg font-semibold mb-2">4. Subwoofer auswählen</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {subwoofers.map((sw) => (
              <Card
                key={sw.product_id}
                className={`p-4 cursor-pointer ${
                  selectedSubwoofer?.product_id === sw.product_id
                    ? "border-2 border-pink-600"
                    : ""
                }`}
                onClick={() => setSelectedSubwoofer(sw)}
              >
                <p className="font-semibold">{sw.sony_article}</p>
                <p className="text-sm text-gray-500">EAN: {sw.ean}</p>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Schritt 5 */}
      {selectedTV && (
        <Button
          onClick={addToCart}
          className="bg-pink-600 hover:bg-pink-700 text-white"
        >
          In den Warenkorb
        </Button>
      )}

      {/* Warenkorb */}
      <CartSofortrabatt
        cart={cart}
        setCart={setCart}
        onSuccess={() => setCart([])}
        open={openCart}
        setOpen={setOpenCart}
      />
    </div>
  );
}

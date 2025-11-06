"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import Image from "next/image";
import { Loader2, Tag } from "lucide-react";

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

export default function AktionenPage() {
  const supabase = createClient();
  const [offers, setOffers] = useState<PromotionOffer[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        🎯 Aktionen & Promotions
      </h1>
      <p className="text-gray-600">
        Hier finden Sie alle aktuellen Monatsaktionen, Sofortrabatt-Programme und Sonderangebote.
      </p>

      {loading ? (
        <div className="flex justify-center items-center h-40 text-gray-500">
          <Loader2 className="animate-spin w-5 h-5 mr-2" />
          Aktionen werden geladen...
        </div>
      ) : offers.length === 0 ? (
        <div className="border rounded-lg p-4 bg-white shadow text-gray-500 text-center">
          Aktuell sind keine Aktionen verfügbar.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="border rounded-lg bg-white shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
            >
              {/* Bild */}
              {offer.image_url ? (
                <Image
                  src={offer.image_url}
                  alt={offer.title || "Aktion"}
                  width={400}
                  height={250}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                  <Tag className="w-10 h-10" />
                </div>
              )}

              {/* Inhalt */}
              <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  {offer.title || offer.product_name || "Unbenannte Aktion"}
                </h2>

                {offer.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {offer.description}
                  </p>
                )}

                <div className="mt-auto">
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                    <span>
                      Gültig:{" "}
                      {offer.valid_from &&
                        format(new Date(offer.valid_from), "dd.MM.yyyy", {
                          locale: de,
                        })}{" "}
                      –{" "}
                      {offer.valid_to &&
                        format(new Date(offer.valid_to), "dd.MM.yyyy", {
                          locale: de,
                        })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    {offer.promotion_price ? (
                      <span className="text-lg font-bold text-green-600">
                        CHF {offer.promotion_price.toFixed(2)}
                      </span>
                    ) : offer.discount_amount ? (
                      <span className="text-lg font-bold text-blue-600">
                        - CHF {offer.discount_amount.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        Kein Preis angegeben
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

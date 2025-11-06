import { useEffect, useState } from "react";

export type MarketShop =
  | "digitec"
  | "mediamarkt"
  | "interdiscount"
  | "fnac"
  | "brack"
  | "fust";


type MarketPriceResult = {
  price: number | null;
  currency: string | null;
  lastChecked?: string;
  sourceUrl?: string;
  loading: boolean;
  error?: string | null;
};

/**
 * Holt Marktpreise aus /api/marketprice (serverseitig sicher gecacht)
 */
export function useMarketPrice(shop: MarketShop, id: string | number | null) {
  const [result, setResult] = useState<MarketPriceResult>({
    price: null,
    currency: null,
    loading: !!id,
    error: null,
  });

  useEffect(() => {
    if (!id) return;

    let active = true;

    async function load() {
      try {
        setResult((r) => ({ ...r, loading: true, error: null }));
        const res = await fetch(`/api/marketprice?shop=${shop}&id=${id}`);
        const json = await res.json();

        if (!active) return;

        if (res.ok && json.price) {
          setResult({
            price: json.price,
            currency: json.currency ?? "CHF",
            lastChecked: json.lastChecked,
            sourceUrl: json.sourceUrl,
            loading: false,
          });
        } else {
          setResult({
            price: null,
            currency: null,
            error: json.note || "Kein Preis gefunden",
            loading: false,
          });
        }
      } catch (err: any) {
        if (active) {
          setResult({
            price: null,
            currency: null,
            error: err.message ?? "Fehler beim Laden",
            loading: false,
          });
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [shop, id]);

  return result;
}

import { useState } from "react";

export function useMarketPriceLive() {
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState<any | null>(null);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function check(ean: string) {
    if (!ean) {
      setError("Keine EAN");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/marketprice/live?ean=${ean}`);
      const json = await res.json();

      if (!json.ok) {
        throw new Error(json.error);
      }

      setShops(json.shops);
      setCheckedAt(json.checkedAt);
    } catch (err: any) {
      setError(err.message ?? "Fehler beim Laden");
      setShops(null);
    }

    setLoading(false);
  }

  return { loading, shops, checkedAt, error, check };
}
    
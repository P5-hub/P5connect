import { useEffect, useState } from "react";

export function useMarketPrice(
  shop: string,
  id?: string | number | null
) {
  const [data, setData] = useState<{
    loading: boolean;
    price: number | null;
    sourceUrl: string | null;
    lastChecked: string | null;
    error: string | null;
  }>({
    loading: false,
    price: null,
    sourceUrl: null,
    lastChecked: null,
    error: null,
  });

  useEffect(() => {
    if (!id) {
      setData({
        loading: false,
        price: null,
        sourceUrl: null,
        lastChecked: null,
        error: "keine ID",
      });
      return;
    }

    let active = true;
    setData((d) => ({ ...d, loading: true }));

    async function load() {
      try {
        const resp = await fetch(
          `/api/marketprice?shop=${shop}&id=${id}`,
          { cache: "no-store" }
        );

        const json = await resp.json();

        if (!active) return;

        setData({
          loading: false,
          price: json.price,
          sourceUrl: json.sourceUrl,
          lastChecked: json.lastChecked,
          error: json.error || null,
        });
      } catch (err) {
        if (!active) return;
        setData({
          loading: false,
          price: null,
          sourceUrl: null,
          lastChecked: null,
          error: "Netzwerkfehler",
        });
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [shop, id]);

  return data;
}

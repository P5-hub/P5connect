import { useEffect, useState } from "react";

const cache = new Map<string, any>();

export function useMarketPrices(ean?: string | null) {
  const [data, setData] = useState<{
    loading: boolean;
    shops: Record<
      string,
      { price: number | null; sourceUrl: string | null; lastChecked: string | null; error?: string | null }
    >;
    error: string | null;
  }>({
    loading: false,
    shops: {},
    error: null,
  });

  useEffect(() => {
    if (!ean) {
      setData({
        loading: false,
        shops: {},
        error: "keine EAN",
      });
      return;
    }

    const key = `marketprices-${ean}`;

    // Falls cached → sofort anzeigen
    if (cache.has(key)) {
      setData({
        loading: false,
        shops: cache.get(key),
        error: null,
      });
      return;
    }

    let active = true;
    setData((d) => ({ ...d, loading: true }));

    async function load() {
      try {
        const res = await fetch(`/api/marketprice/bulk?ean=${ean}`, {
          cache: "no-store",
        });

        const json = await res.json();

        if (!active) return;

        if (json.error) {
          setData({
            loading: false,
            shops: {},
            error: json.error,
          });
          return;
        }

        // normalize: immer alle Shops garantieren
        const shops = {
          digitec: json.shops?.digitec ?? { price: null, sourceUrl: null, lastChecked: null, error: "Keine Daten" },
          mediamarkt: json.shops?.mediamarkt ?? { price: null, sourceUrl: null, lastChecked: null, error: "Keine Daten" },
          interdiscount: json.shops?.interdiscount ?? { price: null, sourceUrl: null, lastChecked: null, error: "Keine Daten" },
          fnac: json.shops?.fnac ?? { price: null, sourceUrl: null, lastChecked: null, error: "Keine Daten" },
          brack: json.shops?.brack ?? { price: null, sourceUrl: null, lastChecked: null, error: "Keine Daten" },
          fust: json.shops?.fust ?? { price: null, sourceUrl: null, lastChecked: null, error: "Keine Daten" },
        };

        // cache speichern
        cache.set(key, shops);

        setData({
          loading: false,
          shops,
          error: null,
        });
      } catch (err) {
        if (!active) return;

        setData({
          loading: false,
          shops: {},
          error: "Netzwerkfehler",
        });
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [ean]);

  return data;
}

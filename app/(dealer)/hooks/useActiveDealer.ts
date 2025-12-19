"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useDealer } from "@/app/(dealer)/DealerContext";

/**
 * useActiveDealer
 *
 * - Wenn ?dealer_id=... vorhanden → lädt diesen Händler explizit
 * - Sonst → fällt sauber auf DealerContext zurück
 *
 * Ergebnis:
 * - Immer der "aktive Händler"
 * - Nie versehentlich der Admin
 */
export function useActiveDealer() {
  const dealerFromContext = useDealer();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const dealerIdFromUrl = searchParams.get("dealer_id");

  const [activeDealer, setActiveDealer] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    const loadDealerById = async (dealerId: string) => {
      setLoading(true);

      const { data, error } = await supabase
        .from("dealers")
        .select("*")
        .eq("dealer_id", dealerId)
        .single();

      if (!cancelled) {
        if (!error && data) {
          setActiveDealer(data);
        } else {
          console.warn(
            "⚠️ useActiveDealer: Händler nicht gefunden, fallback auf Context",
            error
          );
          setActiveDealer(dealerFromContext ?? null);
        }
        setLoading(false);
      }
    };

    if (dealerIdFromUrl) {
      loadDealerById(dealerIdFromUrl);
    } else {
      // Kein Impersonation-Modus → normaler Händler
      setActiveDealer(dealerFromContext ?? null);
    }

    return () => {
      cancelled = true;
    };
  }, [dealerIdFromUrl, dealerFromContext, supabase]);

  return {
    dealer: activeDealer,
    loading,
    isImpersonated: Boolean(dealerIdFromUrl),
  };
}

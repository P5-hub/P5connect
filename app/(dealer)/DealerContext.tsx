"use client";

import { useEffect } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { createContext, useContext, useState, ReactNode } from "react";
import { useSearchParams } from "next/navigation";

export type Dealer = {
  dealer_id: number;
  login_nr: string;
  store_name?: string | null;
  company_name?: string | null;
  address?: string | null;
  zip?: string | null;
  city?: string | null;
  email?: string | null;
  phone?: string | null;
};

type DealerContextValue = {
  dealer: Dealer | null;
  setDealer: (dealer: Dealer | null) => void;
};

// 🧠 Context anlegen
const DealerContext = createContext<DealerContextValue>({
  dealer: null,
  setDealer: () => {},
});

// 💡 Provider-Komponente
export function DealerProvider({ children }: { children: ReactNode }) {
  const [dealer, setDealer] = useState<Dealer | null>(null);

useEffect(() => {
  const fetchDealer = async () => {
    try {
      const supabase = getSupabaseBrowser();
      const searchParams = new URLSearchParams(window.location.search);
      const dealerId = searchParams.get("dealer_id");

      if (dealerId) {
        // 🔹 Admin agiert als Händler
        const { data, error } = await supabase
          .from("dealers")
          .select("*")
          .eq("dealer_id", Number(dealerId))
          .maybeSingle();

        if (error) {
          console.error("❌ Fehler beim Laden des Händlers via dealer_id:", error);
          return;
        }

        if (!data) {
          console.warn("⚠️ Kein Händler gefunden für dealer_id", dealerId);
          return;
        }

        console.log("✅ Händler via dealer_id geladen:", data);
        setDealer(data);
        return;
      }

      // 🔹 Normaler Händler-Login
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        console.warn("⚠️ Kein Benutzer angemeldet.");
        return;
      }

      const { data, error } = await supabase
        .from("dealers")
        .select("*")
        .ilike("login_email", user.email)
        .maybeSingle();

      if (error) {
        console.error("❌ Fehler beim Laden des Händlers:", error.message);
        return;
      }

      if (!data) {
        console.warn("⚠️ Kein Händler gefunden für", user.email);
        return;
      }

      console.log("✅ Händler erfolgreich geladen:", data);
      setDealer(data);
    } catch (err) {
      console.error("❌ Unerwarteter Fehler beim Laden des Händlers:", err);
    }
  };

  fetchDealer();
}, []);



  return (
    <DealerContext.Provider value={{ dealer, setDealer }}>
      {children}
    </DealerContext.Provider>
  );
}


// 🎯 Hook zurückgibt direkt den Händler selbst
export function useDealer() {
  const context = useContext(DealerContext);
  return context.dealer; // <— nur den Händler, nicht das ganze Objekt
}

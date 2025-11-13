"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client"; // ✅ funktioniert mit deiner Struktur
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

// Typen für Items und Bestellungen
export type SubmissionItem = {
  item_id: number;
  product_id: number;
  menge: number;
  preis: number | null;
  invest: number | null;
  calc_price_on_invoice?: number | null;
  product_name?: string;
  ean?: string;
  retail_price?: number | null;
  vrg?: number | null;
  dealer_invoice_price?: number | null;
  price_on_invoice?: number | null;
  netto_retail?: number | null;
  marge_alt?: number | null;
  marge_neu?: number | null;
  invest_calc?: number | null;
  distributor_name?: string | null;
  distributor_code?: string | null;
  distributor_email?: string | null;
};

export type Bestellung = {
  submission_id: number;
  created_at: string;
  status: string | null;
  dealer_name?: string | null;
  dealer_email?: string | null;
  dealer_login_nr?: string | null;
  dealer_contact_person?: string | null;
  kam_name?: string | null;
  kam_email?: string | null;
  kam_email_sony?: string | null;

  delivery_name?: string | null;
  delivery_street?: string | null;
  delivery_zip?: string | null;
  delivery_city?: string | null;
  delivery_country?: string | null;
  
  submission_items: SubmissionItem[];
};

export function useBestellungen(statusFilter: string, searchQuery: string) {
  const supabase = createClient(); // ✅ ersetzt getSupabaseBrowser()
  const [bestellungen, setBestellungen] = useState<Bestellung[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // 🔹 Debounce für Suche
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // 🔹 Ladefunktion
  const fetchBestellungen = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bestellung_dashboard")
        .select("*, delivery_name, delivery_street, delivery_zip, delivery_city, delivery_country")
        .order("created_at", { ascending: false });


      if (error) throw error;
      if (!data) return setBestellungen([]);

      // 🔹 Gruppiere alle Zeilen pro submission_id
      const grouped: Record<number, Bestellung> = {};

      for (const row of data) {
        const id = row.submission_id;
        if (!grouped[id]) {
          grouped[id] = {
            submission_id: id,
            created_at: row.created_at,
            status: row.status,
            dealer_name: row.dealer_name,
            dealer_email: row.dealer_email,
            dealer_login_nr: row.dealer_login_nr,
            dealer_contact_person: row.dealer_contact_person,
            kam_name: row.kam_name,
            kam_email: row.kam_email,
            kam_email_sony: row.kam_email_sony,
            submission_items: [],
          };
        }
        grouped[id].submission_items.push({
          item_id: row.item_id,
          product_id: row.product_id,
          menge: row.menge,
          preis: row.preis ?? null,
          invest: row.invest ?? row.invest_calc ?? null,
          calc_price_on_invoice: row.calc_price_on_invoice,
          product_name: row.product_name,
          ean: row.ean,
          retail_price: row.retail_price,
          vrg: row.vrg,
          dealer_invoice_price: row.dealer_invoice_price,
          price_on_invoice: row.price_on_invoice,
          netto_retail: row.netto_retail,
          marge_alt: row.marge_alt,
          marge_neu: row.marge_neu,
          distributor_name: row.distributor_name,
          distributor_code: row.distributor_code,
          distributor_email: row.distributor_email,
        });
      }

      let parsed = Object.values(grouped);

      // 🔹 Filter nach Status
      if (statusFilter !== "alle") {
        parsed = parsed.filter((b) =>
          statusFilter === "pending"
            ? !b.status || b.status === "pending"
            : b.status === statusFilter
        );
      }

      // 🔹 Suchfilter
      const term = (debouncedSearch || "").toLowerCase();
      const filtered = parsed.filter((b) => {
        const baseText = [
          b.dealer_name,
          b.dealer_email,
          b.dealer_login_nr,
          b.dealer_contact_person,
          ...(b.submission_items || []).map(
            (i) => `${i.product_name ?? ""} ${i.ean ?? ""}`
          ),
        ]
          .join(" ")
          .toLowerCase();
        return baseText.includes(term);
      });

      setBestellungen(filtered);
    } catch (err: any) {
      console.error("❌ Fehler beim Laden der Bestellungen:", err.message || err);
      setBestellungen([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, statusFilter, debouncedSearch]);

  // 🔹 Initial-Load
  useEffect(() => {
    fetchBestellungen();
  }, [fetchBestellungen]);

  // 🔹 Realtime Updates
  useEffect(() => {
    const channel = supabase
      .channel("bestellungen-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "submissions",
        },
        async (payload: RealtimePostgresChangesPayload<any>) => {
          console.log("🔄 Realtime Update:", payload.eventType);
          await fetchBestellungen();
        }
      )
      .subscribe();

    console.log("✅ Realtime subscribed to 'submissions'");

    return () => {
      supabase.removeChannel(channel);
      console.log("❌ Realtime unsubscribed from 'submissions'");
    };
  }, [supabase, fetchBestellungen]);

  return { bestellungen, loading, fetchBestellungen };
}

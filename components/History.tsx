"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { useDealer } from "@/app/(dealer)/DealerContext";
import {
  ShoppingCart,
  Briefcase,
  LifeBuoy,
  Percent,
  Clock,
  History as HistoryIcon,
  BarChart3, // ✅ hinzugefügt für Verkauf
} from "lucide-react";

type HistoryEntry = {
  submission_id: string | null; // ✅ FIX
  typ: string;
  datum: string;
  kw: number;
  kommentar?: string;
  bestellweg?: string;
  status?: string;
  created_at: string;
  ean?: string;
  menge?: number;
  preis?: number;
  product_name?: string;
  brand?: string;
  gruppe?: string;
  model?: string;
  rabatt_level?: number;
  rabatt_betrag?: number;
};

// 🔹 Icons + Farben pro Typ
const typeConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  bestellung: {
    label: "Bestellung",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    icon: ShoppingCart,
  },
  projekt: {
    label: "Projekt",
    color: "text-purple-600 bg-purple-50 border-purple-200",
    icon: Briefcase,
  },
  support: {
    label: "Support",
    color: "text-green-600 bg-green-50 border-green-200",
    icon: LifeBuoy,
  },
  verkauf: {
    label: "Verkauf",
    color: "text-green-700 bg-green-50 border-green-200",
    icon: BarChart3,
  },
  sofortrabatt: {
    label: "Sofortrabatt",
    color: "text-orange-600 bg-orange-50 border-orange-200",
    icon: Percent,
  },
  default: {
    label: "Unbekannt",
    color: "text-gray-600 bg-gray-50 border-gray-200",
    icon: Clock,
  },
};

// 👉 Überschrift-Icon
const TitleIcon = HistoryIcon;

export default function History({ filterTyp }: { filterTyp?: string }) {
  const dealer = useDealer();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseBrowser();

  // 🔹 Verlauf laden
  const loadHistory = async () => {
    if (!dealer?.dealer_id) return;
    setLoading(true);

    let query = supabase
      .from("v_submission_history_full")
      .select("*")
      .eq("dealer_id", dealer.dealer_id)
      .order("created_at", { ascending: false })
      .limit(20);

    // 🔸 Optional nach Typ filtern (✅ Typkorrektur hier!)
    if (filterTyp && filterTyp !== "alle") {
      query = query.eq(
        "typ",
        filterTyp as
          | "order"
          | "project"
          | "support"
          | "bestellung"
          | "verkauf"
          | "projekt"
          | "cashback"
      );
    }

    const { data, error } = await query;

    if (!error && data) setHistory(data as HistoryEntry[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!dealer?.dealer_id) return;
    loadHistory();

    // 🔥 Echtzeit-Updates
    const channel = supabase
      .channel("history-submissions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "submissions",
          filter: `dealer_id=eq.${dealer.dealer_id}`,
        },
        () => {
          loadHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealer?.dealer_id, filterTyp]);

  // 🔹 Zustände anzeigen
  if (!dealer) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 text-gray-500 text-sm">
        ⏳ Händlerdaten werden geladen...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 text-gray-500 text-sm">
        ⏳ Verlauf wird geladen...
      </div>
    );
  }

  if (!history.length) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 text-gray-500 text-sm">
        Noch keine Einträge im Verlauf.
      </div>
    );
  }

  // 🔹 Ausgabe
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <TitleIcon className="w-5 h-5 text-gray-700" />
        Verlauf
      </h3>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {history.map((h, i) => {
          const cfg = typeConfig[h.typ] || typeConfig.default;
          const Icon = cfg.icon;

          return (
            <div
              key={`${h.submission_id}-${i}`}
              className={`flex gap-3 items-start border rounded-md p-3 shadow-sm ${cfg.color}`}
            >
              {/* Icon-Kreis */}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${cfg.color}`}
              >
                <Icon className="h-5 w-5" />
              </div>

              {/* Inhalt */}
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{cfg.label}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(h.created_at).toLocaleDateString("de-CH", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {h.typ === "sofortrabatt" ? (
                  <p className="text-sm text-gray-700 mt-1">
                    Sofortrabatt-Level {h.rabatt_level} –{" "}
                    <span className="font-semibold">
                      {h.rabatt_betrag} CHF
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-700 mt-1">
                    {h.product_name || h.model || "Unbekanntes Produkt"}{" "}
                    {h.brand ? `(${h.brand})` : ""}
                  </p>
                )}

                {h.typ !== "sofortrabatt" && (
                  <p className="text-xs text-gray-600">
                    {h.menge} Stück
                    {h.preis ? ` à ${h.preis.toFixed(2)} CHF` : ""}
                  </p>
                )}

                {h.kommentar && (
                  <p className="text-xs text-gray-500 italic mt-1">
                    💬 {h.kommentar}
                  </p>
                )}

                {h.status && (
                  <span
                    className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                      h.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : h.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {h.status}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

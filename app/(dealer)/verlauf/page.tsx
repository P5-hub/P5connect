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
  BarChart3,
  History as HistoryIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type HistoryEntry = {
  submission_id: string | null; // ✅ FIX
  typ: string;
  created_at: string;
  menge?: number;
  preis?: number;
  kommentar?: string;
  status?: string;
  product_name?: string;
  brand?: string;
  model?: string;
  rabatt_level?: number;
  rabatt_betrag?: number;
};

const typeConfig: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  verkauf: {
    label: "Verkauf",
    color: "text-green-700 bg-green-50 border-green-200",
    icon: BarChart3,
  },
  bestellung: {
    label: "Bestellung",
    color: "text-blue-700 bg-blue-50 border-blue-200",
    icon: ShoppingCart,
  },
  projekt: {
    label: "Projekt",
    color: "text-purple-700 bg-purple-50 border-purple-200",
    icon: Briefcase,
  },
  support: {
    label: "Support",
    color: "text-teal-700 bg-teal-50 border-teal-200",
    icon: LifeBuoy,
  },
  sofortrabatt: {
    label: "Sofortrabatt",
    color: "text-orange-700 bg-orange-50 border-orange-200",
    icon: Percent,
  },
  default: {
    label: "Unbekannt",
    color: "text-gray-600 bg-gray-50 border-gray-200",
    icon: Clock,
  },
};

const tabs = [
  { key: "alle", label: "Alle" },
  { key: "verkauf", label: "Verkauf" },
  { key: "bestellung", label: "Bestellung" },
  { key: "projekt", label: "Projekt" },
  { key: "support", label: "Support" },
  { key: "sofortrabatt", label: "Sofortrabatt" },
] as const;

type TabKey = typeof tabs[number]["key"];

// 🔹 NEU: Mapping zwischen Tabs und DB-Werten
const tabToDbType: Record<string, string> = {
  verkauf: "verkauf",
  bestellung: "bestellung",
  projekt: "projekt",
  support: "support",
  sofortrabatt: "cashback", // <--- das ist der wichtige Fix
};

export default function VerlaufPage() {
  const dealer = useDealer();
  const [activeTab, setActiveTab] = useState<TabKey>("alle");
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseBrowser();

  useEffect(() => {
    if (!dealer?.dealer_id) return;
    const load = async () => {
      setLoading(true);
      let query = supabase
        .from("v_submission_history_full")
        .select("*")
        .eq("dealer_id", dealer.dealer_id)
        .order("created_at", { ascending: false })
        .limit(50);

      // 🔹 Hier nutzt du das Mapping:
      if (activeTab !== "alle")
        query = query.eq(
          "typ",
          (tabToDbType[activeTab] || activeTab) as NonNullable<
            "order" | "project" | "support" | "bestellung" | "verkauf" | "projekt" | "cashback"
          >
        );


      const { data, error } = await query;
      if (!error && data) setEntries(data as HistoryEntry[]);
      setLoading(false);
    };
    load();
  }, [dealer?.dealer_id, activeTab, supabase]);

  return (
    <div className="space-y-6">
      {/* 🔹 Titel */}
      <div className="flex items-center gap-2">
        <HistoryIcon className="w-6 h-6 text-gray-700" />
        <h1 className="text-xl font-semibold">Gesamter Verlauf</h1>
      </div>

      {/* 🔹 Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              "px-4 py-1.5 rounded-t-lg text-sm font-medium border-b-2 transition-all",
              activeTab === t.key
                ? t.key === "verkauf"
                  ? "border-green-600 text-green-700"
                  : t.key === "bestellung"
                  ? "border-blue-600 text-blue-700"
                  : t.key === "projekt"
                  ? "border-purple-600 text-purple-700"
                  : t.key === "support"
                  ? "border-teal-600 text-teal-700"
                  : t.key === "sofortrabatt"
                  ? "border-orange-600 text-orange-700"
                  : "border-gray-400 text-gray-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 🔹 Liste */}
      {loading ? (
        <p className="text-gray-500">⏳ Verlauf wird geladen...</p>
      ) : entries.length === 0 ? (
        <p className="text-gray-500">Keine Einträge gefunden.</p>
      ) : (
        <div className="space-y-3">
          {entries.map((h, i) => {
            const cfg = typeConfig[h.typ] || typeConfig.default;
            const Icon = cfg.icon;
            return (
              <div
                key={`${h.submission_id}-${i}`}
                className={`flex items-start gap-3 border rounded-md p-3 shadow-sm ${cfg.color}`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${cfg.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>

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

                  <p className="text-sm text-gray-700 mt-1">
                    {h.product_name || h.model || "Unbekanntes Produkt"}{" "}
                    {h.brand ? `(${h.brand})` : ""}
                  </p>

                  {h.menge && (
                    <p className="text-xs text-gray-600">
                      {h.menge} Stück
                      {h.preis ? ` à ${h.preis.toFixed(2)} CHF` : ""}
                    </p>
                  )}

                  {h.kommentar && (
                    <p className="text-xs italic text-gray-500 mt-1">
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
      )}
    </div>
  );
}

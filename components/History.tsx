"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { useDealer } from "@/app/(dealer)/DealerContext";
import {
  ShoppingCart,
  Briefcase,
  LifeBuoy,
  Percent,
  Clock,
  History as HistoryIcon,
  BarChart3,
} from "lucide-react";

type HistoryEntry = {
  submission_id: string | null;
  dealer_id: number;
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
  project_id?: string | null;
  project_name?: string | null;
};

type ProjectLogRow = {
  project_id: string;
  action: string | null;
  created_at: string;
};

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

const TitleIcon = HistoryIcon;

export default function History({ filterTyp }: { filterTyp?: string }) {
  const dealer = useDealer();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestProjectActions, setLatestProjectActions] = useState<
    Record<string, string>
  >({});
  const supabase = getSupabaseBrowser();

  const loadLatestProjectActions = async (entries: HistoryEntry[]) => {
    const projectIds = entries
      .filter((h) => h.typ === "projekt" && h.project_id)
      .map((h) => h.project_id as string);

    if (projectIds.length === 0) {
      setLatestProjectActions({});
      return;
    }

    const uniqueProjectIds = [...new Set(projectIds)];

    const { data, error } = await supabase
      .from("project_logs")
      .select("project_id, action, created_at")
      .in("project_id", uniqueProjectIds)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Projekt-Logs laden fehlgeschlagen:", error);
      setLatestProjectActions({});
      return;
    }

    const latestMap: Record<string, string> = {};

    for (const row of (data ?? []) as ProjectLogRow[]) {
      if (!row.project_id) continue;
      if (latestMap[row.project_id]) continue;
      latestMap[row.project_id] = row.action ?? "";
    }

    setLatestProjectActions(latestMap);
  };

  const loadHistory = async () => {
    if (!dealer?.dealer_id) return;
    setLoading(true);

    let query = supabase
      .from("v_submission_history_full")
      .select("*")
      .eq("dealer_id", dealer.dealer_id)
      .order("created_at", { ascending: false })
      .limit(20);

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
          | "sofortrabatt"
      );
    }

    const { data, error } = await query;

    if (!error && data) {
      const loaded = data as HistoryEntry[];
      setHistory(loaded);

      if (!filterTyp || filterTyp === "projekt" || filterTyp === "alle") {
        await loadLatestProjectActions(loaded);
      } else {
        setLatestProjectActions({});
      }
    } else {
      console.error("Verlauf laden fehlgeschlagen:", error);
      setHistory([]);
      setLatestProjectActions({});
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!dealer?.dealer_id) return;
    loadHistory();

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
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_logs",
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

  const getDisplayStatus = (h: HistoryEntry) => {
    if (h.typ !== "projekt" || !h.project_id) {
      if (h.status === "approved") return "Genehmigt";
      if (h.status === "rejected") return "Abgelehnt";
      if (h.status === "pending") return "Offen";
      return h.status ?? "—";
    }

    const latestAction = latestProjectActions[h.project_id];

    if (h.status === "approved" && latestAction === "geändert und genehmigt") {
      return "Geändert und genehmigt";
    }

    if (h.status === "approved" && latestAction === "genehmigt") {
      return "Genehmigt";
    }

    if (h.status === "rejected" && latestAction === "abgelehnt") {
      return "Abgelehnt";
    }

    if (h.status === "pending") {
      return "Offen";
    }

    return h.status ?? "—";
  };

  const getStatusClass = (status?: string) => {
    if (status === "approved") {
      return "bg-green-100 text-green-700";
    }
    if (status === "rejected") {
      return "bg-red-100 text-red-700";
    }
    return "bg-gray-100 text-gray-600";
  };

  const visibleHistory = useMemo(() => history, [history]);

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

  if (!visibleHistory.length) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 text-gray-500 text-sm">
        Noch keine Einträge im Verlauf.
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <TitleIcon className="w-5 h-5 text-gray-700" />
        Verlauf
      </h3>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {visibleHistory.map((h, i) => {
          const cfg = typeConfig[h.typ] || typeConfig.default;
          const Icon = cfg.icon;
          const displayStatus = getDisplayStatus(h);

          return (
            <div
              key={`${h.submission_id}-${i}`}
              className={`flex gap-3 items-start border rounded-md p-3 shadow-sm ${cfg.color}`}
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

                {h.typ === "sofortrabatt" ? (
                  <p className="text-sm text-gray-700 mt-1">
                    Sofortrabatt-Level {h.rabatt_level} –{" "}
                    <span className="font-semibold">
                      {h.rabatt_betrag} CHF
                    </span>
                  </p>
                ) : h.typ === "projekt" ? (
                  <p className="text-sm text-gray-700 mt-1">
                    {h.project_name || h.product_name || h.model || "Projekt"}
                  </p>
                ) : (
                  <p className="text-sm text-gray-700 mt-1">
                    {h.product_name || h.model || "Unbekanntes Produkt"}{" "}
                    {h.brand ? `(${h.brand})` : ""}
                  </p>
                )}

                {h.typ !== "sofortrabatt" && (
                  <p className="text-xs text-gray-600">
                    {h.menge ?? 0} Stück
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
                    className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                      h.status
                    )}`}
                  >
                    {displayStatus}
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
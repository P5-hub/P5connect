"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { useActiveDealer } from "@/app/(dealer)/hooks/useActiveDealer";
import { cn } from "@/lib/utils";
import {
  ShoppingCart,
  FileSpreadsheet,
  LifeBuoy,
  Briefcase,
  Percent,
} from "lucide-react";

/* ======================================================
   TYPES
====================================================== */
type HistoryRow = {
  submission_id: string;
  dealer_id: number;
  typ: string;
  source: string;
  status: string | null;
  created_at: string;

  display_id: string;
  position_count: number;
  total_amount: number;
};

/* ======================================================
   TYPE CONFIG
====================================================== */
const typeConfig: Record<
  string,
  { label: string; icon: any; color: string }
> = {
  bestellung: {
    label: "Bestellung",
    icon: ShoppingCart,
    color: "border-blue-200 bg-blue-50 text-blue-800",
  },
  verkauf: {
    label: "Verkauf",
    icon: FileSpreadsheet,
    color: "border-green-200 bg-green-50 text-green-800",
  },
  projekt: {
    label: "Projekt",
    icon: Briefcase,
    color: "border-purple-200 bg-purple-50 text-purple-800",
  },
  support: {
    label: "Support",
    icon: LifeBuoy,
    color: "border-teal-200 bg-teal-50 text-teal-800",
  },
  sofortrabatt: {
    label: "Sofortrabatt",
    icon: Percent,
    color: "border-orange-200 bg-orange-50 text-orange-800",
  },
};

/* ======================================================
   ROUTE MAP
====================================================== */
function getTargetRoute(
  r: HistoryRow,
  dealerQuery: string
): string | null {
  if (r.typ === "verkauf" && r.source === "csv") {
    return `/verlauf/csv/${r.submission_id}${dealerQuery}`;
  }
  if (r.typ === "verkauf") {
    return `/verlauf/verkauf/${r.submission_id}${dealerQuery}`;
  }
  if (r.typ === "bestellung") {
    return `/verlauf/bestellung/${r.submission_id}${dealerQuery}`;
  }
  if (r.typ === "projekt") {
    return `/verlauf/projekt/${r.submission_id}${dealerQuery}`;
  }
  if (r.typ === "support") {
    return `/verlauf/support/${r.submission_id}${dealerQuery}`;
  }
  if (r.typ === "sofortrabatt") {
    return `/verlauf/sofortrabatt/${r.submission_id}${dealerQuery}`;
  }
  return null;
}

/* ======================================================
   DATE GROUPING
====================================================== */
function getGroupLabel(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();

  if (d.toDateString() === now.toDateString()) {
    return "Heute";
  }

  const diffDays =
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays < 7) {
    return "Diese Woche";
  }

  return d.toLocaleDateString("de-CH", {
    month: "long",
    year: "numeric",
  });
}

/* ======================================================
   COMPONENT
====================================================== */
export default function VerlaufPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabaseBrowser();

  const { dealer, loading: dealerLoading, isImpersonated } =
    useActiveDealer();

  const typFilter = searchParams.get("typ");
  const [search, setSearch] = useState("");

  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (dealerLoading) return;

    (async () => {
      setLoading(true);

      let query = supabase
        .from("v_submission_history_header")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (dealer?.dealer_id) {
        query = query.eq("dealer_id", dealer.dealer_id);
      }

      if (typFilter) {
        query = query.eq("typ", typFilter);
      }

      const { data, error } = await query;

      if (!error && data) {
        setRows(data as HistoryRow[]);
      } else {
        console.error("Verlauf laden fehlgeschlagen:", error);
      }

      setLoading(false);
    })();
  }, [dealer?.dealer_id, dealerLoading, supabase, typFilter]);

  if (dealerLoading || loading) {
    return <p className="text-gray-500">⏳ Verlauf wird geladen…</p>;
  }

  if (!rows.length) {
    return <p className="text-gray-500">Keine Einträge gefunden.</p>;
  }

  const dealerQuery =
    isImpersonated && dealer?.dealer_id
      ? `?dealer_id=${dealer.dealer_id}`
      : "";

  /* ================= SEARCH ================= */
  const filteredRows = rows.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();

    return (
      r.display_id.toLowerCase().includes(s) ||
      (r.status ?? "").toLowerCase().includes(s) ||
      r.total_amount.toString().includes(s)
    );
  });

  /* ================= GROUP ================= */
  const grouped = filteredRows.reduce(
    (acc: Record<string, HistoryRow[]>, r) => {
      const label = getGroupLabel(r.created_at);
      acc[label] = acc[label] || [];
      acc[label].push(r);
      return acc;
    },
    {}
  );

  /* ================= RENDER ================= */
  return (
    <div className="space-y-4">
      {/* SEARCH */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Suche (ID, Status, Betrag)…"
        className="w-full md:w-80 px-3 py-1.5 border rounded-md text-sm"
      />

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: null, label: "Alle" },
          { key: "bestellung", label: "Bestellung" },
          { key: "verkauf", label: "Verkauf" },
          { key: "projekt", label: "Projekt" },
          { key: "support", label: "Support" },
          { key: "sofortrabatt", label: "Sofortrabatt" },
        ].map((f) => {
          const active =
            typFilter === f.key || (!typFilter && f.key === null);

          const href =
            f.key === null
              ? isImpersonated && dealer?.dealer_id
                ? `/verlauf?dealer_id=${dealer.dealer_id}`
                : `/verlauf`
              : isImpersonated && dealer?.dealer_id
              ? `/verlauf?typ=${f.key}&dealer_id=${dealer.dealer_id}`
              : `/verlauf?typ=${f.key}`;

          return (
            <button
              key={f.label}
              onClick={() => router.push(href)}
              className={cn(
                "px-3 py-1 rounded-full text-sm border transition",
                active
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* LIST */}
      {Object.entries(grouped).map(([label, items]) => (
        <div key={label} className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-600 mt-4">
            {label}
          </h3>

          {items.map((r) => {
            const cfg = typeConfig[r.typ];
            if (!cfg) return null;

            const Icon = cfg.icon;
            const target = getTargetRoute(r, dealerQuery);

            return (
              <div
                key={`${r.typ}-${r.submission_id}`}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 shadow-sm cursor-pointer hover:shadow-md transition",
                  cfg.color
                )}
                onClick={() => target && router.push(target)}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border">
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">
                      {cfg.label} {r.display_id}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(r.created_at).toLocaleString("de-CH")}
                    </span>
                  </div>

                  <div className="text-sm mt-1">
                    {r.position_count} Position
                    {r.position_count !== 1 ? "en" : ""} ·{" "}
                    <strong>
                      {r.total_amount.toLocaleString("de-CH", {
                        style: "currency",
                        currency: "CHF",
                      })}
                    </strong>
                  </div>

                  <div className="mt-1">
                    <span
                      className={cn(
                        "inline-block text-xs px-2 py-0.5 rounded-full",
                        r.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : r.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      )}
                    >
                      {r.status ?? "—"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseClient";

type KPI = {
  count: number;
  amount: number;
};

function buildSubmissionSearchFilter(searchKey: string) {
  const value = searchKey.trim();

  if (!value) return "";

  const filters = [
    `display_id.ilike.%${value}%`,
    `dealer_name.ilike.%${value}%`,
    `product_names.ilike.%${value}%`,
  ];

  if (/^\d+$/.test(value)) {
    filters.push(`submission_id.eq.${Number(value)}`);
  }

  return filters.join(",");
}

function buildSalesSearchFilter(searchKey: string) {
  const value = searchKey.trim();

  if (!value) return "";

  return [
    `display_id.ilike.%${value}%`,
    `dealer_name.ilike.%${value}%`,
    `product_name.ilike.%${value}%`,
  ].join(",");
}

export default function AdminReportKPIs({
  typ,
  fromDate,
  toDate,
  search,
}: {
  typ?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}) {
  const supabase = getSupabaseBrowser();
  const [kpi, setKpi] = useState<KPI>({ count: 0, amount: 0 });

  // 🔒 stabilisieren (wichtig für useEffect!)
  const searchKey = useMemo(() => (search ?? "").trim(), [search]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      /* =========================================================
         🟢 VERKAUF → v_sales_unified (CSV + manuell sauber)
         ========================================================= */
      if (typ === "verkauf") {
        let query = supabase
          .from("v_sales_unified")
          .select("revenue", { count: "exact" });

        if (fromDate) {
          query = query.gte("created_at", `${fromDate}T00:00:00`);
        }
        if (toDate) {
          query = query.lte("created_at", `${toDate}T23:59:59`);
        }
        if (searchKey) {
          const searchFilter = buildSalesSearchFilter(searchKey);

          if (searchFilter) {
            query = query.or(searchFilter);
          }
        }

        const { data, count, error } = await query;
        if (cancelled) return;

        if (!error) {
          setKpi({
            count: count ?? 0,
            amount: (data ?? []).reduce(
              (sum, r: any) => sum + Number(r.revenue ?? 0),
              0
            ),
          });
        }

        return;
      }

      /* =========================================================
         🔵 ALLE ANDEREN TYPEN → v_submission_history_header
         ========================================================= */
      let query = supabase
        .from("v_submission_history_header")
        .select("total_amount", { count: "exact" });

      if (typ) {
        query = query.eq("typ", typ);
      }
      if (typ === "bestellung") {
        query = query.eq("status", "approved");
      }
      if (fromDate) {
        query = query.gte("created_at", `${fromDate}T00:00:00`);
      }
      if (toDate) {
        query = query.lte("created_at", `${toDate}T23:59:59`);
      }
      if (searchKey) {
        const searchFilter = buildSubmissionSearchFilter(searchKey);

        if (searchFilter) {
          query = query.or(searchFilter);
        }
      }

      const { data, count, error } = await query;
      if (cancelled) return;

      if (!error) {
        setKpi({
          count: count ?? 0,
          amount: (data ?? []).reduce(
            (sum, r: any) => sum + Number(r.total_amount ?? 0),
            0
          ),
        });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [typ, fromDate, toDate, searchKey, supabase]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="text-xs text-gray-500">Vorgänge</div>
        <div className="text-xl font-semibold">{kpi.count}</div>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="text-xs text-gray-500">Gesamtbetrag</div>
        <div className="text-xl font-semibold">
          {kpi.amount.toLocaleString("de-CH", {
            style: "currency",
            currency: "CHF",
          })}
        </div>
      </div>
    </div>
  );
}

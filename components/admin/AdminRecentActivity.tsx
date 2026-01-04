"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import {
  ShoppingCart,
  FileSpreadsheet,
  Briefcase,
  LifeBuoy,
} from "lucide-react";

/* ================= TYPES ================= */

type Row = {
  id: string;
  display_id: string;
  typ: string;
  status: string | null;
  created_at: string;
  total_amount: number;
};

/* ================= ICONS ================= */

const ICONS: Record<string, any> = {
  bestellung: ShoppingCart,
  verkauf: FileSpreadsheet,
  projekt: Briefcase,
  support: LifeBuoy,
};

/* ================= COMPONENT ================= */

export default function AdminRecentActivity({
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
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔒 stabiler Suchbegriff
  const searchKey = useMemo(() => (search ?? "").trim(), [search]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      /* ======================================================
         🟢 VERKÄUFE → v_sales_unified (ITEM-BASIERT)
         ====================================================== */
      if (typ === "verkauf") {
        let query = supabase
          .from("v_sales_unified")
          .select(
            "display_id, created_at, source, revenue"
          );

        if (fromDate) {
          query = query.gte("created_at", `${fromDate}T00:00:00`);
        }
        if (toDate) {
          query = query.lte("created_at", `${toDate}T23:59:59`);
        }
        if (searchKey) {
          query = query.or(
            `display_id.ilike.%${searchKey}%,
            product_name.ilike.%${searchKey}%,
            dealer_name.ilike.%${searchKey}%,
            dealer_login_nr.ilike.%${searchKey}%,
            dealer_id::text.ilike.%${searchKey}%`
          );

        }

        const { data, error } = await query;
        if (cancelled) return;

        if (error) {
          console.error("AdminRecentActivity verkauf:", error);
          setRows([]);
        } else {
          const grouped: Record<string, Row> = {};

        (data ?? []).forEach((r: any) => {
          const key = r.display_id;

          if (!grouped[key]) {
            grouped[key] = {
              id: key,
              display_id: key,
              typ: "verkauf",
              status: r.source ?? null,
              created_at: r.created_at,
              total_amount: 0,
            };
          }

          // 🔑 wichtig: neuestes Datum behalten
          if (new Date(r.created_at) > new Date(grouped[key].created_at)) {
            grouped[key].created_at = r.created_at;
          }

          grouped[key].total_amount += Number(r.revenue ?? 0);
        });


          setRows(
            Object.values(grouped).sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
          );
        }

        setLoading(false);
        return;
      }

      /* ======================================================
         🔵 ANDERE TYPEN → HEADER VIEW
         ====================================================== */
      let query = supabase
        .from("v_submission_history_header")
        .select(
          "submission_id, display_id, typ, status, created_at, total_amount"
        );

      if (typ) query = query.eq("typ", typ);
      if (fromDate) {
        query = query.gte("created_at", `${fromDate}T00:00:00`);
      }
      if (toDate) {
        query = query.lte("created_at", `${toDate}T23:59:59`);
      }
      if (searchKey) {
        query = query.or(
          `display_id.ilike.%${searchKey}%,dealer_name.ilike.%${searchKey}%,product_names.ilike.%${searchKey}%`
        );
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (!cancelled) {
        if (error) {
          console.error("AdminRecentActivity header:", error);
          setRows([]);
        } else {
          setRows(
            ((data ?? []) as any[]).map((r) => ({
              id: String(r.submission_id),
              display_id: r.display_id,
              typ: r.typ,
              status: r.status,
              created_at: r.created_at,
              total_amount: Number(r.total_amount ?? 0),
            }))
          );
        }
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [typ, fromDate, toDate, searchKey, supabase]);

  if (loading) {
    return <p className="text-sm text-gray-500">Lade Aktivitäten…</p>;
  }

  if (!rows.length) {
    return (
      <p className="text-sm text-gray-500">
        Keine Einträge für den gewählten Zeitraum.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-gray-700">
        Letzte Aktivitäten
      </h2>

      {rows.map((r) => {
        const Icon = ICONS[r.typ] ?? ShoppingCart;

        return (
          <div
            key={r.id}
            className="flex items-center justify-between border rounded-md px-3 py-2 bg-white text-sm"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full border flex items-center justify-center bg-gray-50">
                <Icon className="w-4 h-4 text-gray-700" />
              </div>

              <div>
                <div className="font-semibold">{r.display_id}</div>
                <div className="text-xs text-gray-500">
                  {new Date(r.created_at).toLocaleString("de-CH")}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-medium">
                {r.total_amount.toLocaleString("de-CH", {
                  style: "currency",
                  currency: "CHF",
                })}
              </div>
              <div className="text-xs text-gray-500">
                {r.status ?? "—"}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

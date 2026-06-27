"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import {
  Briefcase,
  ExternalLink,
  FileSpreadsheet,
  LifeBuoy,
  ShoppingCart,
} from "lucide-react";

type Row = {
  id: string;
  display_id: string;
  typ: string;
  status: string | null;
  created_at: string;
  total_amount: number;
  dealer_id?: number | null;
  dealer_name?: string | null;
  product_names?: string | null;
  source?: string | null;
};

const ICONS: Record<string, any> = {
  bestellung: ShoppingCart,
  verkauf: FileSpreadsheet,
  projekt: Briefcase,
  support: LifeBuoy,
};

function formatCurrency(value: number) {
  return value.toLocaleString("de-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("de-CH", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function getIsoWeekFromDate(value: string) {
  const input = new Date(value);
  const date = new Date(
    Date.UTC(input.getFullYear(), input.getMonth(), input.getDate())
  );

  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));

  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );

  return {
    year: date.getUTCFullYear(),
    week,
  };
}

function getTitle(typ?: string) {
  switch (typ) {
    case "bestellung":
      return "Letzte Bestellungen";
    case "verkauf":
      return "Letzte Verkaufsmeldungen";
    case "projekt":
      return "Letzte Projektmeldungen";
    case "support":
      return "Letzte Support-Fälle";
    default:
      return "Letzte Vorgänge";
  }
}

function getEmptyText(typ?: string) {
  switch (typ) {
    case "bestellung":
      return "Keine Bestellungen für diese Filter gefunden.";
    case "verkauf":
      return "Keine Verkaufsmeldungen für diese Filter gefunden.";
    case "projekt":
      return "Keine Projektmeldungen für diese Filter gefunden.";
    case "support":
      return "Keine Support-Fälle für diese Filter gefunden.";
    default:
      return "Keine Vorgänge für diese Filter gefunden.";
  }
}

function getStatusLabel(status: string | null | undefined) {
  const value = String(status ?? "").toLowerCase();

  if (value === "approved") return "Approved";
  if (value === "rejected") return "Rejected";
  if (value === "pending") return "Pending";
  if (value === "csv") return "CSV";
  if (value === "manual") return "Manual";
  if (!value) return "Unbekannt";

  return status ?? "Unbekannt";
}

function getStatusClass(status: string | null | undefined) {
  const value = String(status ?? "").toLowerCase();

  if (value === "approved") {
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (value === "rejected") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (value === "pending") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (value === "csv") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (value === "manual") {
    return "border-purple-200 bg-purple-50 text-purple-700";
  }

  return "border-gray-200 bg-gray-50 text-gray-600";
}

function getOrderStatusParam(status: string | null | undefined) {
  const value = String(status ?? "").toLowerCase();

  if (value === "approved") return "approved";
  if (value === "rejected") return "rejected";
  if (value === "pending") return "pending";

  return "all";
}

function getRowHref(row: Row) {
  const searchValue = encodeURIComponent(row.display_id || "");

  if (row.typ === "verkauf") {
    const { year, week } = getIsoWeekFromDate(row.created_at);

    const params = new URLSearchParams();
    params.set("year", String(year));
    params.set("week", String(week));
    params.set("tab", "products");

    if (row.dealer_id) {
      params.set("dealer_id", String(row.dealer_id));
    }

    if (row.display_id) {
      params.set("source", row.display_id);
    }

    return `/admin/reports/sellout?${params.toString()}`;
  }

  if (row.typ === "bestellung") {
    const status = getOrderStatusParam(row.status);
    return `/admin/bestellungen?status=${status}&search=${searchValue}`;
  }

  if (row.typ === "projekt") {
    return `/admin/projekte?status=${getOrderStatusParam(row.status)}&search=${searchValue}`;
  }

  if (row.typ === "support") {
    return `/admin/support?status=${getOrderStatusParam(row.status)}&search=${searchValue}`;
  }

  return "/admin/reports";
}

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

  const searchKey = useMemo(() => (search ?? "").trim(), [search]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      if (typ === "verkauf") {
        let query = supabase
          .from("v_sales_unified")
          .select(
            "display_id, created_at, source, revenue, dealer_id, dealer_name, product_name"
          );

        if (fromDate) query = query.gte("created_at", `${fromDate}T00:00:00`);
        if (toDate) query = query.lte("created_at", `${toDate}T23:59:59`);

        if (searchKey) {
          query = query.or(
            `display_id.ilike.%${searchKey}%,product_name.ilike.%${searchKey}%,dealer_name.ilike.%${searchKey}%`
          );
        }

        query = query.order("created_at", { ascending: false }).limit(250);

        const { data, error } = await query;

        if (cancelled) return;

        if (error) {
          console.error("AdminRecentActivity verkauf:", error);
          setRows([]);
          setLoading(false);
          return;
        }

        const grouped: Record<string, Row & { productSet?: Set<string> }> = {};

        (data ?? []).forEach((r: any) => {
          const key = r.display_id || "Verkauf";

          if (!grouped[key]) {
            grouped[key] = {
              id: key,
              display_id: key,
              typ: "verkauf",
              status: r.source ?? null,
              source: r.source ?? null,
              created_at: r.created_at,
              total_amount: 0,
              dealer_id: r.dealer_id ?? null,
              dealer_name: r.dealer_name ?? null,
              product_names: "",
              productSet: new Set<string>(),
            };
          }

          grouped[key].total_amount += Number(r.revenue ?? 0);

          if (r.product_name) {
            grouped[key].productSet?.add(String(r.product_name));
          }

          if (new Date(r.created_at) > new Date(grouped[key].created_at)) {
            grouped[key].created_at = r.created_at;
          }
        });

        const mappedRows = Object.values(grouped)
          .map((row) => ({
            ...row,
            product_names: row.productSet
              ? Array.from(row.productSet).slice(0, 3).join(", ")
              : null,
            productSet: undefined,
          }))
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .slice(0, 50);

        setRows(mappedRows);
        setLoading(false);
        return;
      }

      let query = supabase
        .from("v_submission_history_header")
        .select(
          "submission_id, display_id, typ, status, created_at, total_amount, dealer_name, product_names"
        );

      if (typ) query = query.eq("typ", typ);
      if (fromDate) query = query.gte("created_at", `${fromDate}T00:00:00`);
      if (toDate) query = query.lte("created_at", `${toDate}T23:59:59`);

      if (searchKey) {
        query = query.or(
          `display_id.ilike.%${searchKey}%,dealer_name.ilike.%${searchKey}%,product_names.ilike.%${searchKey}%`
        );
      }

      query = query.order("created_at", { ascending: false }).limit(50);

      const { data, error } = await query;

      if (cancelled) return;

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
            dealer_name: r.dealer_name ?? null,
            product_names: r.product_names ?? null,
          }))
        );
      }

      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [typ, fromDate, toDate, searchKey, supabase]);

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-gray-500">
        Aktivitäten werden geladen...
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-gray-500">
        {getEmptyText(typ)}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">
            {getTitle(typ)}
          </h2>
          <p className="text-xs text-gray-500">
            Maximal 50 Einträge gemäss aktuellem Filter.
          </p>
        </div>

        {typ === "verkauf" ? (
          <Link
            href="/admin/reports/sellout"
            className="inline-flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-100"
          >
            Sell-out Dashboard
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>

      <div className="space-y-2">
        {rows.map((r) => {
          const Icon = ICONS[r.typ] ?? ShoppingCart;
          const href = getRowHref(r);

          return (
            <Link
              key={r.id}
              href={href}
              className="block rounded-xl border bg-white px-3 py-3 text-sm shadow-sm transition hover:border-blue-200 hover:bg-blue-50/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-gray-50">
                    <Icon className="h-4 w-4 text-gray-700" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-semibold text-gray-900">
                        {r.display_id || "–"}
                      </div>

                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${getStatusClass(
                          r.status
                        )}`}
                      >
                        {getStatusLabel(r.status)}
                      </span>
                    </div>

                    <div className="mt-1 text-xs text-gray-500">
                      {formatDateTime(r.created_at)}
                    </div>

                    {r.dealer_name ? (
                      <div className="mt-1 truncate text-xs text-gray-600">
                        Händler: {r.dealer_name}
                      </div>
                    ) : null}

                    {r.product_names ? (
                      <div className="mt-1 truncate text-xs text-gray-500">
                        Produkte: {r.product_names}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(r.total_amount)}
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600">
                    Öffnen
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Clock, Check, X, RotateCcw, Tag } from "lucide-react";

type DashboardRow = {
  submission_id: number;
  created_at: string;
  status: "pending" | "approved" | "rejected" | null;
  origin_project_submission_id: number | null;

  dealer_name: string | null;
  dealer_email: string | null;

  item_id: number | null;
  preis: number | null;
  menge: number | null;

  order_mode?: string | null;
  pricing_mode?: string | null;
  is_display_item?: boolean | null;
  campaign_name_snapshot?: string | null;
};

type Row = {
  submission_id: number;
  created_at: string;
  status: "pending" | "approved" | "rejected" | null;
  dealers: { name: string | null; email: string | null } | null;
  items_count: number;
  total_sum: number;
  origin_project_submission_id: number | null;

  has_campaign_items: boolean;
  has_display_items: boolean;
  has_standard_items: boolean;

  messe_count: number;
  display_count: number;
  standard_count: number;

  campaign_name_snapshot: string | null;
  order_mode?: string | null;
};

type TypeFilter = "alle" | "messe" | "display" | "standard";

export default function AdminBestellungenListPage() {
  const supabase = createClient();
  const router = useRouter();

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<
    "pending" | "approved" | "rejected" | "alle"
  >("pending");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("alle");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bestellung_dashboard")
        .select(`
          submission_id,
          created_at,
          status,
          origin_project_submission_id,
          dealer_name,
          dealer_email,
          item_id,
          preis,
          menge,
          order_mode,
          pricing_mode,
          is_display_item,
          campaign_name_snapshot
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const map = new Map<number, Row>();

      for (const r of (data ?? []) as DashboardRow[]) {
        if (!map.has(r.submission_id)) {
          map.set(r.submission_id, {
            submission_id: r.submission_id,
            created_at: r.created_at,
            status: r.status,
            dealers: {
              name: r.dealer_name,
              email: r.dealer_email,
            },
            items_count: 0,
            total_sum: 0,
            origin_project_submission_id: r.origin_project_submission_id,

            has_campaign_items: false,
            has_display_items: false,
            has_standard_items: false,

            messe_count: 0,
            display_count: 0,
            standard_count: 0,

            campaign_name_snapshot: r.campaign_name_snapshot ?? null,
            order_mode: r.order_mode ?? null,
          });
        }

        const row = map.get(r.submission_id)!;
        const qty = r.menge ?? 1;
        const price = r.preis ?? 0;

        row.items_count += qty;
        row.total_sum += price * qty;

        if (r.campaign_name_snapshot && !row.campaign_name_snapshot) {
          row.campaign_name_snapshot = r.campaign_name_snapshot;
        }

        if (r.pricing_mode === "messe" || r.order_mode === "messe") {
          row.has_campaign_items = true;
          row.messe_count += qty;
        }

        if (r.pricing_mode === "display" || r.is_display_item === true) {
          row.has_display_items = true;
          row.display_count += qty;
        }

        if (!r.pricing_mode || r.pricing_mode === "standard") {
          row.has_standard_items = true;
          row.standard_count += qty;
        }

        if (r.pricing_mode === "mixed") {
          row.has_campaign_items = true;
          row.has_display_items = true;
          row.messe_count += qty;
          row.display_count += qty;
        }
      }

      setRows(Array.from(map.values()));
    } catch (e) {
      console.error("❌ Laden fehlgeschlagen:", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const ch = supabase
      .channel("rt-admin-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "submissions" },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "submission_items" },
        () => fetchData()
      )
      .subscribe();

    return () => void supabase.removeChannel(ch);
  }, [supabase, fetchData]);

  const filtered = useMemo(() => {
    const s = (searchQuery || "").toLowerCase().trim();

    let result =
      statusFilter === "alle"
        ? rows
        : rows.filter((r) =>
            statusFilter === "pending"
              ? !r.status || r.status === "pending"
              : r.status === statusFilter
          );

    if (typeFilter === "messe") {
      result = result.filter((r) => r.has_campaign_items);
    } else if (typeFilter === "display") {
      result = result.filter((r) => r.has_display_items);
    } else if (typeFilter === "standard") {
      result = result.filter((r) => r.has_standard_items);
    }

    if (!s) return result;

    return result.filter((r) => {
      const hay =
        [
          r.submission_id,
          r.dealers?.name,
          r.dealers?.email,
          r.campaign_name_snapshot,
          new Date(r.created_at).toLocaleDateString("de-CH"),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase() || "";

      return hay.includes(s);
    });
  }, [rows, statusFilter, typeFilter, searchQuery]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Suche Bestellung (Händler, E-Mail, #ID, Kampagne)…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-80"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={statusFilter === "pending" ? "default" : "outline"}
            onClick={() => setStatusFilter("pending")}
            className="rounded-full text-xs"
          >
            <Clock className="w-3.5 h-3.5 mr-1" /> Offen
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "approved" ? "default" : "outline"}
            onClick={() => setStatusFilter("approved")}
            className="rounded-full text-xs"
          >
            <Check className="w-3.5 h-3.5 mr-1" /> Bestätigt
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "rejected" ? "default" : "outline"}
            onClick={() => setStatusFilter("rejected")}
            className="rounded-full text-xs"
          >
            <X className="w-3.5 h-3.5 mr-1" /> Abgelehnt
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "alle" ? "default" : "outline"}
            onClick={() => setStatusFilter("alle")}
            className="rounded-full text-xs"
          >
            Alle
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchData}
            className="rounded-full text-xs"
          >
            <RotateCcw className="w-4 h-4 mr-1" /> Neu laden
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="mr-1 inline-flex items-center text-xs font-medium text-gray-500">
          <Tag className="w-3.5 h-3.5 mr-1" />
          Typ
        </div>

        <Button
          size="sm"
          variant={typeFilter === "alle" ? "default" : "outline"}
          onClick={() => setTypeFilter("alle")}
          className="rounded-full text-xs"
        >
          Alle Typen
        </Button>

        <Button
          size="sm"
          variant={typeFilter === "messe" ? "default" : "outline"}
          onClick={() => setTypeFilter("messe")}
          className="rounded-full text-xs"
        >
          Nur Messe
        </Button>

        <Button
          size="sm"
          variant={typeFilter === "display" ? "default" : "outline"}
          onClick={() => setTypeFilter("display")}
          className="rounded-full text-xs"
        >
          Nur Display
        </Button>

        <Button
          size="sm"
          variant={typeFilter === "standard" ? "default" : "outline"}
          onClick={() => setTypeFilter("standard")}
          className="rounded-full text-xs"
        >
          Nur Standard
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Lade Bestellungen…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500">Keine Bestellungen gefunden.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((r) => (
            <Card
              key={r.submission_id}
              onClick={() => router.push(`/admin/bestellungen/${r.submission_id}`)}
              className="p-5 rounded-2xl border border-gray-200 hover:shadow-md cursor-pointer bg-white transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm text-gray-900">
                    #{r.submission_id} – {r.dealers?.name ?? "Unbekannter Händler"}

                    {r.origin_project_submission_id && (
                      <span className="ml-2 text-xs font-mono text-purple-600">
                        aus Projekt P-{r.origin_project_submission_id}
                      </span>
                    )}
                  </h3>

                  <p className="text-xs text-gray-500">{r.dealers?.email ?? "-"}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString("de-CH")}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {r.has_campaign_items && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                        Messe {r.messe_count > 0 ? `(${r.messe_count})` : ""}
                      </span>
                    )}

                    {r.has_display_items && (
                      <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700 ring-1 ring-sky-100">
                        Display {r.display_count > 0 ? `(${r.display_count})` : ""}
                      </span>
                    )}

                    {r.has_standard_items && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                        Standard {r.standard_count > 0 ? `(${r.standard_count})` : ""}
                      </span>
                    )}

                    {r.order_mode === "messe" && (
                      <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-700 ring-1 ring-violet-100">
                        Messebestellung
                      </span>
                    )}

                    {r.campaign_name_snapshot && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-amber-100">
                        {r.campaign_name_snapshot}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    {r.items_count} Pos.
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-semibold text-blue-600">
                    {r.total_sum.toFixed(2)} CHF
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {r.status === "approved"
                      ? "✅ Bestätigt"
                      : r.status === "rejected"
                      ? "❌ Abgelehnt"
                      : "⏳ Offen"}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
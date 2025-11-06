"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Clock, Check, X, RotateCcw } from "lucide-react";


type Row = {
  submission_id: number;
  created_at: string;
  status: "pending" | "approved" | "rejected" | null;
  dealers: { name: string | null; email: string | null } | null;
  items_count: number;
  total_sum: number;
};

export default function AdminBestellungenListPage() {
  const supabase = createClient();
  const router = useRouter();

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | "alle">(
    "pending"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Lade alle Bestellungen aus submissions (typ='bestellung')
      const { data, error } = await supabase
        .from("submissions")
        .select(
          `
          submission_id,
          created_at,
          status,
          dealers:dealers(name, email),
          submission_items(submission_id, preis)
        `
        )
        .eq("typ", "bestellung")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const normalized: Row[] =
        (data || []).map((row: any) => {
          const items = row.submission_items || [];
          const total = items.reduce((s: number, it: any) => s + (Number(it.preis) || 0), 0);
          return {
            submission_id: row.submission_id,
            created_at: row.created_at,
            status: row.status,
            dealers: row.dealers ?? null,
            items_count: items.length,
            total_sum: total,
          };
        }) ?? [];

      setRows(normalized);
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

  // Realtime refresh
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
    const statusFiltered =
      statusFilter === "alle"
        ? rows
        : rows.filter((r) =>
            statusFilter === "pending" ? (!r.status || r.status === "pending") : r.status === statusFilter
          );

    if (!s) return statusFiltered;

    return statusFiltered.filter((r) => {
      const hay =
        [
          r.submission_id,
          r.dealers?.name,
          r.dealers?.email,
          new Date(r.created_at).toLocaleDateString("de-CH"),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase() || "";
      return hay.includes(s);
    });
  }, [rows, statusFilter, searchQuery]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Suche */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Suche Bestellung (Händler, E-Mail, #ID)…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-80"
          />
        </div>

        {/* Filter + Neu laden */}
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

      {/* Liste */}
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
              className="p-5 rounded-2xl border border-gray-200 hover:shadow-md cursor-pointer bg-white"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900">
                    #{r.submission_id} – {r.dealers?.name ?? "Unbekannter Händler"}
                  </h3>
                  <p className="text-xs text-gray-500">{r.dealers?.email ?? "-"}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString("de-CH")}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {r.items_count} Pos.
                  </p>
                </div>
                <div className="text-right">
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

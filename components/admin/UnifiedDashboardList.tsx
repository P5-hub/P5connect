"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, Clock, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UnifiedDashboardListProps {
  type: string;
}

function hasDocument(projectFilePath?: string | null): boolean {
  return !!projectFilePath;
}

function parseSupportKind(support_typ?: string | null): "sellout" | "marketing" | "event" | "other" | "unknown" {
  const s = String(support_typ ?? "").toLowerCase();
  if (!s) return "unknown";
  if (s.includes("sellout") || s.includes("sell-out")) return "sellout";
  if (s.includes("marketing") || s.includes("werbung")) return "marketing";
  if (s.includes("event")) return "event";
  if (s.includes("other") || s.includes("sonstig")) return "other";
  return "unknown";
}

function supportKindLabel(kind: ReturnType<typeof parseSupportKind>) {
  switch (kind) {
    case "sellout": return "Sell-Out";
    case "marketing": return "Marketing";
    case "event": return "Event";
    case "other": return "Sonstiges";
    default: return "Unbekannt";
  }
}

export default function UnifiedDashboardList({ type }: UnifiedDashboardListProps) {
  const supabase = createClient();
  const [data, setData] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | "all">(
    "pending"
  );

  // ✅ nur für Support
  const [supportTypeFilter, setSupportTypeFilter] = useState<"all" | "sellout" | "marketing" | "event" | "other" | "unknown">("all");

  const pathMap: Record<string, string> = {
    projekt: "projekte",
    bestellung: "orders",
    support: "support",
    aktion: "aktionen",
    sofortrabatt: "sofortrabatt",
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let result: any[] = [];

        if (type === "aktion") {
          const { data, error } = await supabase
            .from("promotion_offers")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(200);

          if (error) throw error;

          result = data.map((r) => ({
            submission_id: r.id,
            title: r.title,
            status: r.active ? "approved" : "rejected",
            datum: r.valid_from ?? r.created_at,
            dealers: { name: r.title ?? "–" },
          }));
        } else if (type === "sofortrabatt") {
          const { data, error } = await supabase
            .from("sofortrabatt_claims")
            .select(`
              claim_id,
              status,
              created_at,
              dealers:dealers(*)
            `)
            .order("created_at", { ascending: false })
            .limit(200);

          if (error) throw error;

          result = data.map((r) => ({
            submission_id: r.claim_id,
            status: r.status,
            datum: r.created_at,
            dealers: r.dealers,
          }));
        } else {
          const { data, error } = await supabase
            .from("submissions")
            .select(`
              submission_id,
              typ,
              datum,
              status,
              created_at,
              order_comment,
              project_file_path,
              kommentar,
              dealers:dealers(*)
            `)
            .eq("typ", type)
            .order("created_at", { ascending: false })
            .limit(200);

          if (error) throw error;

          result = data || [];

          // ✅ Support: support_details nachladen und mergen
          if (type === "support" && result.length > 0) {
            const ids = result.map((r) => r.submission_id).filter(Boolean);

            const { data: details, error: detErr } = await supabase
              .from("support_details")
              .select("submission_id, support_typ, betrag")
              .in("submission_id", ids);

            if (detErr) {
              console.error("⚠️ support_details load failed:", detErr);
            } else {
              const map = new Map<number, any>();
              (details ?? []).forEach((d: any) => {
                map.set(Number(d.submission_id), d);
              });

              result = result.map((r) => {
                const d = map.get(Number(r.submission_id));
                const kind = parseSupportKind(d?.support_typ);
                return {
                  ...r,
                  support_details: d ?? null,
                  support_kind: kind,
                };
              });
            }

            // falls nichts gefunden -> fallback kind
            result = result.map((r) => ({
              ...r,
              support_kind: r.support_kind ?? "unknown",
            }));
          }
        }

        setData(result);
        setLoading(false);
      } catch (err) {
        console.error("❌ Fehler beim Laden:", err);
        setLoading(false);
      }
    })();
  }, [type, supabase]);

  useEffect(() => {
    let result = [...data];

    if (statusFilter !== "all") {
      result = result.filter((r) => (r.status || "pending") === statusFilter);
    }

    // ✅ Support-Art Filter
    if (type === "support" && supportTypeFilter !== "all") {
      result = result.filter((r) => (r.support_kind ?? "unknown") === supportTypeFilter);
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.submission_id?.toString().includes(s) ||
          r.title?.toLowerCase().includes(s) ||
          r.dealers?.name?.toLowerCase().includes(s) ||
          r.dealers?.email?.toLowerCase().includes(s) ||
          r.dealers?.mail_dealer?.toLowerCase().includes(s)
      );
    }

    setFiltered(result);
  }, [data, statusFilter, search, type, supportTypeFilter]);

  function getStatusInfo(status: string) {
    switch (status) {
      case "approved":
        return { color: "text-green-600", icon: <CheckCircle className="w-4 h-4" />, label: "Bestätigt" };
      case "rejected":
        return { color: "text-red-600", icon: <XCircle className="w-4 h-4" />, label: "Abgelehnt" };
      default:
        return { color: "text-yellow-600", icon: <Clock className="w-4 h-4" />, label: "Offen" };
    }
  }

  const supportTypeButtons = useMemo(() => {
    if (type !== "support") return null;

    const btn = (val: any, label: string) => (
      <Button
        key={val}
        size="sm"
        variant={supportTypeFilter === val ? "default" : "outline"}
        onClick={() => setSupportTypeFilter(val)}
      >
        {label}
      </Button>
    );

    return (
      <div className="flex gap-2 flex-wrap">
        {btn("all", "Alle Support-Arten")}
        {btn("sellout", "Sell-Out")}
        {btn("marketing", "Marketing")}
        {btn("event", "Event")}
        {btn("other", "Sonstiges")}
        {btn("unknown", "Unbekannt")}
      </div>
    );
  }, [type, supportTypeFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
          <Input
            placeholder="Suche nach Händler, E-Mail oder ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 w-64 text-sm"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant={statusFilter === "pending" ? "default" : "outline"} onClick={() => setStatusFilter("pending")}>
            Offen
          </Button>
          <Button size="sm" variant={statusFilter === "approved" ? "default" : "outline"} onClick={() => setStatusFilter("approved")}>
            Bestätigt
          </Button>
          <Button size="sm" variant={statusFilter === "rejected" ? "default" : "outline"} onClick={() => setStatusFilter("rejected")}>
            Abgelehnt
          </Button>
          <Button size="sm" variant={statusFilter === "all" ? "default" : "outline"} onClick={() => setStatusFilter("all")}>
            Alle
          </Button>
        </div>

        {supportTypeButtons}

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSearch("");
            setStatusFilter("pending");
            setSupportTypeFilter("all");
          }}
        >
          Neu laden
        </Button>
      </div>

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Lade {type}-Einträge…
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500">Keine passenden Einträge gefunden.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => {
            const { color, icon, label } = getStatusInfo(r.status);

            const kind = type === "support" ? (r.support_kind ?? "unknown") : null;
            const kindLabel = kind ? supportKindLabel(kind) : null;

            return (
              <Link key={r.submission_id} href={`/admin/${pathMap[type]}/${r.submission_id}`}>
                <Card className="p-4 border hover:shadow-md transition cursor-pointer">
                  <div className="flex justify-between items-center gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">
                        #{r.submission_id} – {r.dealers?.name ?? r.title ?? "Unbekannt"}
                      </h3>

                      {/* ✅ Support Typ Badge */}
                      {type === "support" && (
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] px-2 py-1 rounded-full border bg-gray-50 text-gray-700">
                            {kindLabel}
                          </span>

                          {hasDocument(r.project_file_path) && (
                            <span title="Beleg vorhanden" className="text-[11px] px-2 py-1 rounded-full border bg-white">
                              📎 Beleg
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {type !== "support" && icon}
                      {type === "support" && icon}
                    </div>
                  </div>

                  <p className="text-sm text-gray-500">
                    {r.datum ? new Date(r.datum).toLocaleDateString("de-CH") : "-"}
                  </p>
                  <p className={`text-xs mt-1 ${color}`}>Status: {label}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
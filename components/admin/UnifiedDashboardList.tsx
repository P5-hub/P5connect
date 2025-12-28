"use client";

import { useEffect, useState } from "react";
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


export default function UnifiedDashboardList({ type }: UnifiedDashboardListProps) {
  const supabase = createClient();
  const [data, setData] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | "all">(
    "pending"
  );

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
        }

        else if (type === "sofortrabatt") {
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
        }

        else {
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
              dealers:dealers(*)
            `)
            .eq("typ", type)
            .order("created_at", { ascending: false })
            .limit(200);

          if (error) throw error;

          result = data || [];
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

    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.submission_id?.toString().includes(s) ||
          r.title?.toLowerCase().includes(s) ||
          r.dealers?.name?.toLowerCase().includes(s) ||
          r.dealers?.email?.toLowerCase().includes(s)
      );
    }

    setFiltered(result);
  }, [data, statusFilter, search]);

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

        <Button variant="outline" size="sm" onClick={() => { setSearch(""); setStatusFilter("pending"); }}>
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
            return (
              <Link key={r.submission_id} href={`/admin/${pathMap[type]}/${r.submission_id}`}>
                <Card className="p-4 border hover:shadow-md transition cursor-pointer">
                  <div className="flex justify-between items-center gap-2">
                    <h3 className="font-semibold text-gray-800">
                      #{r.submission_id} – {r.dealers?.name ?? r.title ?? "Unbekannt"}
                    </h3>

                    <div className="flex items-center gap-2">
                      {type === "support" && hasDocument(r.project_file_path) && (
                        <span title="Beleg vorhanden">📎</span>
                      )}

                      {icon}
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

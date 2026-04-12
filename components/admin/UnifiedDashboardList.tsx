"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, Clock, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface UnifiedDashboardListProps {
  type: string;
}

function hasDocument(projectFilePath?: string | null): boolean {
  return !!projectFilePath;
}

function parseSupportKind(
  support_typ?: string | null
): "sellout" | "marketing" | "event" | "other" | "unknown" {
  const s = String(support_typ ?? "").toLowerCase();
  if (!s) return "unknown";
  if (s.includes("sellout") || s.includes("sell-out")) return "sellout";
  if (s.includes("marketing") || s.includes("werbung")) return "marketing";
  if (s.includes("event")) return "event";
  if (s.includes("other") || s.includes("sonstig")) return "other";
  return "unknown";
}

export default function UnifiedDashboardList({
  type,
}: UnifiedDashboardListProps) {
  const supabase = createClient();
  const { lang } = useI18n();

  const [data, setData] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "pending" | "approved" | "rejected" | "all"
  >("pending");

  const [supportTypeFilter, setSupportTypeFilter] = useState<
    "all" | "sellout" | "marketing" | "event" | "other" | "unknown"
  >("all");

  const pathMap: Record<string, string> = {
    projekt: "projekte",
    bestellung: "bestellungen",
    support: "support",
    aktion: "aktionen",
    sofortrabatt: "sofortrabatt",
  };

  const text = useMemo(() => {
    const isDe = lang === "de";
    const isEn = lang === "en";
    const isFr = lang === "fr";
    const isIt = lang === "it";
    const isRm = lang === "rm";

    return {
      searchPlaceholder: isDe
        ? "Suche nach Händler, E-Mail oder ID…"
        : isEn
        ? "Search by dealer, email or ID…"
        : isFr
        ? "Rechercher par revendeur, e-mail ou ID…"
        : isIt
        ? "Cerca per rivenditore, e-mail o ID…"
        : isRm
        ? "Tschertgar tenor commerziant, e-mail u ID…"
        : "Search by dealer, email or ID…",

      pending: isDe
        ? "Offen"
        : isEn
        ? "Open"
        : isFr
        ? "Ouvert"
        : isIt
        ? "Aperto"
        : isRm
        ? "Avert"
        : "Open",

      approved: isDe
        ? "Bestätigt"
        : isEn
        ? "Approved"
        : isFr
        ? "Approuvé"
        : isIt
        ? "Approvato"
        : isRm
        ? "Approvà"
        : "Approved",

      rejected: isDe
        ? "Abgelehnt"
        : isEn
        ? "Rejected"
        : isFr
        ? "Refusé"
        : isIt
        ? "Rifiutato"
        : isRm
        ? "Refusà"
        : "Rejected",

      all: isDe
        ? "Alle"
        : isEn
        ? "All"
        : isFr
        ? "Toutes"
        : isIt
        ? "Tutti"
        : isRm
        ? "Tut"
        : "All",

      reload: isDe
        ? "Neu laden"
        : isEn
        ? "Reload"
        : isFr
        ? "Recharger"
        : isIt
        ? "Ricarica"
        : isRm
        ? "Chargiar da nov"
        : "Reload",

      loadingEntries: isDe
        ? `Lade ${type}-Einträge…`
        : isEn
        ? `Loading ${type} entries…`
        : isFr
        ? `Chargement des entrées ${type}…`
        : isIt
        ? `Caricamento voci ${type}…`
        : isRm
        ? `Chargiar entradas ${type}…`
        : `Loading ${type} entries…`,

      noResults: isDe
        ? "Keine passenden Einträge gefunden."
        : isEn
        ? "No matching entries found."
        : isFr
        ? "Aucune entrée correspondante trouvée."
        : isIt
        ? "Nessuna voce corrispondente trovata."
        : isRm
        ? "Naginas entradas adattadas chattadas."
        : "No matching entries found.",

      unknown: isDe
        ? "Unbekannt"
        : isEn
        ? "Unknown"
        : isFr
        ? "Inconnu"
        : isIt
        ? "Sconosciuto"
        : isRm
        ? "Nunenconuschent"
        : "Unknown",

      statusPrefix: isDe
        ? "Status"
        : isEn
        ? "Status"
        : isFr
        ? "Statut"
        : isIt
        ? "Stato"
        : isRm
        ? "Status"
        : "Status",

      receiptAvailable: isDe
        ? "📎 Beleg"
        : isEn
        ? "📎 Receipt"
        : isFr
        ? "📎 Justificatif"
        : isIt
        ? "📎 Documento"
        : isRm
        ? "📎 Mussament"
        : "📎 Receipt",

      supportTypesAll: isDe
        ? "Alle Support-Arten"
        : isEn
        ? "All support types"
        : isFr
        ? "Tous les types de support"
        : isIt
        ? "Tutti i tipi di supporto"
        : isRm
        ? "Tut ils tips da support"
        : "All support types",

      supportSellout: "Sell-Out",
      supportMarketing: isDe
        ? "Marketing"
        : isEn
        ? "Marketing"
        : isFr
        ? "Marketing"
        : isIt
        ? "Marketing"
        : isRm
        ? "Marketing"
        : "Marketing",

      supportEvent: isDe
        ? "Event"
        : isEn
        ? "Event"
        : isFr
        ? "Événement"
        : isIt
        ? "Evento"
        : isRm
        ? "Event"
        : "Event",

      supportOther: isDe
        ? "Sonstiges"
        : isEn
        ? "Other"
        : isFr
        ? "Autre"
        : isIt
        ? "Altro"
        : isRm
        ? "Auter"
        : "Other",

      supportUnknown: isDe
        ? "Unbekannt"
        : isEn
        ? "Unknown"
        : isFr
        ? "Inconnu"
        : isIt
        ? "Sconosciuto"
        : isRm
        ? "Nunenconuschent"
        : "Unknown",
    };
  }, [lang, type]);

  const supportKindLabel = (kind: ReturnType<typeof parseSupportKind>) => {
    switch (kind) {
      case "sellout":
        return text.supportSellout;
      case "marketing":
        return text.supportMarketing;
      case "event":
        return text.supportEvent;
      case "other":
        return text.supportOther;
      default:
        return text.supportUnknown;
    }
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

          result = (data ?? []).map((r) => ({
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

          result = (data ?? []).map((r) => ({
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

    if (type === "support" && supportTypeFilter !== "all") {
      result = result.filter(
        (r) => (r.support_kind ?? "unknown") === supportTypeFilter
      );
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
        return {
          color: "text-green-600",
          icon: <CheckCircle className="w-4 h-4" />,
          label: text.approved,
        };
      case "rejected":
        return {
          color: "text-red-600",
          icon: <XCircle className="w-4 h-4" />,
          label: text.rejected,
        };
      default:
        return {
          color: "text-yellow-600",
          icon: <Clock className="w-4 h-4" />,
          label: text.pending,
        };
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
        {btn("all", text.supportTypesAll)}
        {btn("sellout", text.supportSellout)}
        {btn("marketing", text.supportMarketing)}
        {btn("event", text.supportEvent)}
        {btn("other", text.supportOther)}
        {btn("unknown", text.supportUnknown)}
      </div>
    );
  }, [type, supportTypeFilter, text]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
          <Input
            placeholder={text.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 w-64 text-sm"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={statusFilter === "pending" ? "default" : "outline"}
            onClick={() => setStatusFilter("pending")}
          >
            {text.pending}
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "approved" ? "default" : "outline"}
            onClick={() => setStatusFilter("approved")}
          >
            {text.approved}
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "rejected" ? "default" : "outline"}
            onClick={() => setStatusFilter("rejected")}
          >
            {text.rejected}
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
          >
            {text.all}
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
          {text.reload}
        </Button>
      </div>

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" /> {text.loadingEntries}
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500">{text.noResults}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => {
            const { color, icon, label } = getStatusInfo(r.status);

            const kind =
              type === "support" ? (r.support_kind ?? "unknown") : null;
            const kindLabel = kind ? supportKindLabel(kind) : null;

            return (
              <Link
                key={r.submission_id}
                href={`/admin/${pathMap[type]}/${r.submission_id}`}
              >
                <Card className="p-4 border hover:shadow-md transition cursor-pointer">
                  <div className="flex justify-between items-center gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">
                        #{r.submission_id} –{" "}
                        {r.dealers?.name ?? r.title ?? text.unknown}
                      </h3>

                      {type === "support" && (
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] px-2 py-1 rounded-full border bg-gray-50 text-gray-700">
                            {kindLabel}
                          </span>

                          {hasDocument(r.project_file_path) && (
                            <span
                              title={text.receiptAvailable}
                              className="text-[11px] px-2 py-1 rounded-full border bg-white"
                            >
                              {text.receiptAvailable}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">{icon}</div>
                  </div>

                  <p className="text-sm text-gray-500">
                    {r.datum
                      ? new Date(r.datum).toLocaleDateString("de-CH")
                      : "-"}
                  </p>
                  <p className={`text-xs mt-1 ${color}`}>
                    {text.statusPrefix}: {label}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
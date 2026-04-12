"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { useActiveDealer } from "@/app/(dealer)/hooks/useActiveDealer";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  ShoppingCart,
  FileSpreadsheet,
  LifeBuoy,
  Briefcase,
  Percent,
} from "lucide-react";

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
  project_id?: string | null;
  project_name?: string | null;
};

type ProjectLogRow = {
  project_id: string;
  action: string | null;
  created_at: string;
};

type SubmissionLogRow = {
  submission_id: string | number;
  typ: string;
  action: string | null;
  created_at: string;
};

function getLocale(lang: string) {
  switch (lang) {
    case "de":
      return "de-CH";
    case "en":
      return "en-CH";
    case "fr":
      return "fr-CH";
    case "it":
      return "it-CH";
    case "rm":
      return "rm-CH";
    default:
      return "de-CH";
  }
}

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

export default function VerlaufPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabaseBrowser();
  const { t, lang } = useI18n();

  const { dealer, loading: dealerLoading, isImpersonated } =
    useActiveDealer();

  const typFilter = searchParams.get("typ");
  const [search, setSearch] = useState("");

  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [latestProjectActions, setLatestProjectActions] = useState<
    Record<string, string>
  >({});
  const [latestSubmissionActions, setLatestSubmissionActions] = useState<
    Record<string, string>
  >({});

  const locale = useMemo(() => getLocale(lang), [lang]);

  const typeConfig = useMemo(
    () => ({
      bestellung: {
        label: t("verlauf.page.types.bestellung"),
        icon: ShoppingCart,
        color: "border-blue-200 bg-blue-50 text-blue-800",
      },
      verkauf: {
        label: t("verlauf.page.types.verkauf"),
        icon: FileSpreadsheet,
        color: "border-green-200 bg-green-50 text-green-800",
      },
      projekt: {
        label: t("verlauf.page.types.projekt"),
        icon: Briefcase,
        color: "border-purple-200 bg-purple-50 text-purple-800",
      },
      support: {
        label: t("verlauf.page.types.support"),
        icon: LifeBuoy,
        color: "border-teal-200 bg-teal-50 text-teal-800",
      },
      sofortrabatt: {
        label: t("verlauf.page.types.sofortrabatt"),
        icon: Percent,
        color: "border-orange-200 bg-orange-50 text-orange-800",
      },
    }),
    [t]
  );

  function getGroupLabel(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();

    if (d.toDateString() === now.toDateString()) {
      return t("verlauf.page.groups.today");
    }

    const diffDays =
      (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays < 7) {
      return t("verlauf.page.groups.thisWeek");
    }

    return d.toLocaleDateString(locale, {
      month: "long",
      year: "numeric",
    });
  }

  async function loadLatestProjectActions(inputRows: HistoryRow[]) {
    const projectIds = inputRows
      .filter((r) => r.typ === "projekt" && r.project_id)
      .map((r) => r.project_id as string);

    if (projectIds.length === 0) {
      setLatestProjectActions({});
      return;
    }

    const { data, error } = await supabase
      .from("project_logs")
      .select("project_id, action, created_at")
      .in("project_id", projectIds)
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
  }

  async function loadLatestSubmissionActions(inputRows: HistoryRow[]) {
    const submissionIds = inputRows
      .filter((r) => r.typ === "support")
      .map((r) => Number(r.submission_id))
      .filter((id) => Number.isFinite(id));

    if (submissionIds.length === 0) {
      setLatestSubmissionActions({});
      return;
    }

    const { data, error } = await supabase
      .from("submission_logs")
      .select("submission_id, typ, action, created_at")
      .eq("typ", "support")
      .in("submission_id", submissionIds)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Submission-Logs laden fehlgeschlagen:", error);
      setLatestSubmissionActions({});
      return;
    }

    const latestMap: Record<string, string> = {};

    for (const row of (data ?? []) as SubmissionLogRow[]) {
      const key = String(row.submission_id);
      if (!key) continue;
      if (latestMap[key]) continue;
      latestMap[key] = row.action ?? "";
    }

    setLatestSubmissionActions(latestMap);
  }

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
        const loadedRows = data as HistoryRow[];
        setRows(loadedRows);

        if (!typFilter || typFilter === "projekt") {
          await loadLatestProjectActions(loadedRows);
        } else {
          setLatestProjectActions({});
        }

        if (!typFilter || typFilter === "support") {
          await loadLatestSubmissionActions(loadedRows);
        } else {
          setLatestSubmissionActions({});
        }
      } else {
        console.error("Verlauf laden fehlgeschlagen:", error);
        setRows([]);
        setLatestProjectActions({});
        setLatestSubmissionActions({});
      }

      setLoading(false);
    })();
  }, [dealer?.dealer_id, dealerLoading, supabase, typFilter]);

  const dealerQuery =
    isImpersonated && dealer?.dealer_id
      ? `?dealer_id=${dealer.dealer_id}`
      : "";

  const getDisplayStatus = (r: HistoryRow) => {
    if (r.typ === "projekt" && r.project_id) {
      const latestAction = latestProjectActions[r.project_id];

      if (r.status === "approved" && latestAction === "geändert und genehmigt") {
        return t("verlauf.page.status.changedApproved");
      }

      if (r.status === "approved" && latestAction === "genehmigt") {
        return t("verlauf.page.status.approved");
      }

      if (r.status === "rejected" && latestAction === "abgelehnt") {
        return t("verlauf.page.status.rejected");
      }

      if (r.status === "pending") {
        return t("verlauf.page.status.pending");
      }

      return r.status ?? "—";
    }

    if (r.typ === "support") {
      const latestAction = latestSubmissionActions[String(r.submission_id)];

      if (r.status === "approved" && latestAction === "approved_with_counter_offer") {
        return t("verlauf.page.status.changedApproved");
      }

      if (r.status === "approved" && latestAction === "approved") {
        return t("verlauf.page.status.approved");
      }

      if (r.status === "rejected" && latestAction === "rejected") {
        return t("verlauf.page.status.rejected");
      }

      if (r.status === "pending" || latestAction === "reset_to_pending") {
        return t("verlauf.page.status.pending");
      }

      return r.status ?? "—";
    }

    if (r.status === "approved") return t("verlauf.page.status.approved");
    if (r.status === "rejected") return t("verlauf.page.status.rejected");
    if (r.status === "pending") return t("verlauf.page.status.pending");

    return r.status ?? "—";
  };

  const getStatusClass = (r: HistoryRow) => {
    if (r.status === "approved") {
      return "bg-green-100 text-green-700";
    }

    if (r.status === "rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-gray-100 text-gray-600";
  };

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const displayStatus = getDisplayStatus(r);

      if (!search) return true;
      const s = search.toLowerCase();

      return (
        r.display_id.toLowerCase().includes(s) ||
        displayStatus.toLowerCase().includes(s) ||
        (r.status ?? "").toLowerCase().includes(s) ||
        r.total_amount.toString().includes(s) ||
        (r.project_name ?? "").toLowerCase().includes(s)
      );
    });
  }, [rows, search, latestProjectActions, latestSubmissionActions]);

  if (dealerLoading || loading) {
    return <p className="text-gray-500">⏳ {t("verlauf.page.loading")}</p>;
  }

  if (!rows.length) {
    return <p className="text-gray-500">{t("verlauf.page.empty")}</p>;
  }

  const grouped = filteredRows.reduce(
    (acc: Record<string, HistoryRow[]>, r) => {
      const label = getGroupLabel(r.created_at);
      acc[label] = acc[label] || [];
      acc[label].push(r);
      return acc;
    },
    {}
  );

  const filterButtons = [
    { key: null, label: t("verlauf.page.filters.all") },
    { key: "bestellung", label: t("verlauf.page.filters.bestellung") },
    { key: "verkauf", label: t("verlauf.page.filters.verkauf") },
    { key: "projekt", label: t("verlauf.page.filters.projekt") },
    { key: "support", label: t("verlauf.page.filters.support") },
    { key: "sofortrabatt", label: t("verlauf.page.filters.sofortrabatt") },
  ];

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("verlauf.page.searchPlaceholder")}
        className="w-full md:w-80 px-3 py-1.5 border rounded-md text-sm"
      />

      <div className="flex flex-wrap gap-2">
        {filterButtons.map((f) => {
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
              key={String(f.key ?? "all")}
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

      {Object.entries(grouped).map(([label, items]) => (
        <div key={label} className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-600 mt-4">
            {label}
          </h3>

          {items.map((r) => {
            const cfg = typeConfig[r.typ as keyof typeof typeConfig];
            if (!cfg) return null;

            const Icon = cfg.icon;
            const target = getTargetRoute(r, dealerQuery);
            const displayStatus = getDisplayStatus(r);

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
                  <div className="flex justify-between items-center gap-3">
                    <span className="font-semibold text-sm">
                      {cfg.label} {r.display_id}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(r.created_at).toLocaleString(locale)}
                    </span>
                  </div>

                  <div className="text-sm mt-1">
                    {r.position_count}{" "}
                    {r.position_count === 1
                      ? t("verlauf.page.card.positionSingle")
                      : t("verlauf.page.card.positionPlural")}{" "}
                    ·{" "}
                    <strong>
                      {r.total_amount.toLocaleString(locale, {
                        style: "currency",
                        currency: "CHF",
                      })}
                    </strong>
                  </div>

                  {r.typ === "projekt" && r.project_name && (
                    <div className="text-sm mt-1 text-gray-700">
                      {r.project_name}
                    </div>
                  )}

                  <div className="mt-1">
                    <span
                      className={cn(
                        "inline-block text-xs px-2 py-0.5 rounded-full",
                        getStatusClass(r)
                      )}
                    >
                      {displayStatus}
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
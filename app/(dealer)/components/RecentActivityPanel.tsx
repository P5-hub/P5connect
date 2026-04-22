"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { useTheme } from "@/lib/theme/ThemeContext";
import { FileSpreadsheet, Loader2, FileText, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import type { FormType } from "@/types/formTypes";
import Link from "next/link";
import { useSeedProjectCart } from "@/app/(dealer)/hooks/useSeedProjectCart";
import { ProjectAlreadyOrderedDialog } from "@/app/(dealer)/components/dialogs/ProjectAlreadyOrderedDialog";
import { useI18n } from "@/lib/i18n/I18nProvider";

function StatusBadge({ label, status }: { label: string; status: string | null }) {
  if (status === "approved" || status === "csv") {
    return (
      <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium">
        {label}
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-600 text-xs font-medium">
        {label}
      </span>
    );
  }

  return (
    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-medium">
      {label}
    </span>
  );
}

type Row = {
  submission_id: string;
  dealer_id: number;
  typ: FormType;
  status: string | null;
  created_at: string;
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

type Props = {
  dealerId: number;
  limit?: number;
  excelLast?: number;
  formType: FormType;
};

const prefixMap: Record<FormType, string> = {
  bestellung: "B",
  verkauf: "V",
  projekt: "P",
  support: "S",
  sofortrabatt: "R",
};

const pdfRoutes: Partial<Record<FormType, string>> = {
  bestellung: "/api/exports/order-pdf",
  verkauf: "/api/exports/verkauf-pdf",
  projekt: "/api/exports/projekt-pdf",
  support: "/api/exports/support-pdf",
  sofortrabatt: "/api/exports/sofortrabatt-pdf",
};

export default function RecentActivityPanel({
  dealerId,
  limit = 2,
  excelLast = 100,
  formType,
}: Props) {
  const { t } = useI18n();
  const supabase = getSupabaseBrowser();
  const theme = useTheme();
  const pathname = usePathname();

  const {
    startFromProject,
    dialogOpen,
    confirmDuplicateOrder,
    cancelDuplicateOrder,
  } = useSeedProjectCart();

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const [latestProjectActions, setLatestProjectActions] = useState<Record<string, string>>({});
  const [latestSubmissionActions, setLatestSubmissionActions] = useState<Record<string, string>>(
    {}
  );

  const isAdminDetail = pathname.includes("/admin/bestellungen/");

  async function loadLatestProjectActions(inputRows: Row[]) {
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
      console.error("❌ Projekt-Logs Fehler:", error);
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

  async function loadLatestSubmissionActions(inputRows: Row[]) {
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
      console.error("❌ Submission-Logs Fehler:", error);
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

  async function loadData() {
    setLoading(true);

    const { data, error } = await supabase
      .from("v_submission_history_header" as any)
      .select(`
        submission_id,
        dealer_id,
        typ,
        status,
        created_at,
        project_id,
        project_name
      `)
      .eq("dealer_id", dealerId)
      .eq("typ", formType)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("❌ Verlauf Fehler:", error);
      setRows([]);
      setLatestProjectActions({});
      setLatestSubmissionActions({});
    } else {
      const nextRows = (data ?? []) as unknown as Row[];
      setRows(nextRows);

      if (formType === "projekt") {
        await loadLatestProjectActions(nextRows);
        setLatestSubmissionActions({});
      } else if (formType === "support") {
        await loadLatestSubmissionActions(nextRows);
        setLatestProjectActions({});
      } else {
        setLatestProjectActions({});
        setLatestSubmissionActions({});
      }
    }

    setLoading(false);
  }

  function handleRealtime(payload: any) {
    console.log("🔥 REALTIME EVENT", payload);

    const row = payload.new ?? payload.old;

    if (payload?.table === "project_logs" || payload?.table === "submission_logs") {
      setTimeout(loadData, 200);
      return;
    }

    if (!row?.submission_id) return;

    const id = String(row.submission_id);

    if (!isAdminDetail) {
      setHighlightedId(id);
      setTimeout(() => setHighlightedId(null), 3000);
    }

    setRows((prev) => {
      const next = [...prev];
      const index = next.findIndex((r) => r.submission_id === id);

      if (index !== -1) {
        next[index] = {
          ...next[index],
          status: row.status ?? next[index].status,
        };
      }

      return next;
    });

    setTimeout(loadData, 200);
  }

  useEffect(() => {
    loadData();
  }, [dealerId, formType]);

  useEffect(() => {
    const channel = supabase
      .channel(`realtime_history_${dealerId}_${formType}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "submissions",
          filter: `dealer_id=eq.${dealerId}`,
        },
        (payload) => handleRealtime({ ...payload, table: "submissions" })
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "verkauf_csv_meldungen",
          filter: `dealer_id=eq.${dealerId}`,
        },
        (payload) => handleRealtime({ ...payload, table: "verkauf_csv_meldungen" })
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "support_claims",
          filter: `dealer_id=eq.${dealerId}`,
        },
        (payload) => handleRealtime({ ...payload, table: "support_claims" })
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_logs",
        },
        (payload) => handleRealtime({ ...payload, table: "project_logs" })
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "submission_logs",
        },
        (payload) => handleRealtime({ ...payload, table: "submission_logs" })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealerId, formType]);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  function highlightClass(row: Row) {
    if (highlightedId !== row.submission_id) return "";

    if (row.status === "approved") {
      return "animate-pulse bg-green-50 border-green-400";
    }

    if (row.status === "rejected") {
      return "animate-pulse bg-red-50 border-red-400";
    }

    return "animate-pulse bg-blue-50 border-blue-300";
  }

  function getDisplayLabel(row: Row) {
    if (row.typ === "projekt" && row.project_id) {
      const latestAction = latestProjectActions[row.project_id];

      if (row.status === "approved" && latestAction === "geändert und genehmigt") {
        return "Geändert und genehmigt";
      }

      if (row.status === "approved" && latestAction === "genehmigt") {
        return t("activity.status.approved");
      }

      if (row.status === "rejected" && latestAction === "abgelehnt") {
        return t("activity.status.rejected");
      }

      return t(`activity.status.${row.status ?? "unknown"}`);
    }

    if (row.typ === "support") {
      const latestAction = latestSubmissionActions[String(row.submission_id)];

      if (row.status === "approved" && latestAction === "approved_with_counter_offer") {
        return "Geändert und genehmigt";
      }

      if (row.status === "approved" && latestAction === "approved") {
        return "Genehmigt";
      }

      if (row.status === "rejected" && latestAction === "rejected") {
        return "Abgelehnt";
      }

      if (row.status === "pending" || latestAction === "reset_to_pending") {
        return "Offen";
      }

      return t(`activity.status.${row.status ?? "unknown"}`);
    }

    return t(`activity.status.${row.status ?? "unknown"}`);
  }

  async function downloadPdf(id: string) {
    const route = pdfRoutes[formType];
    if (!route) return;

    try {
      setDownloading(true);

      const res = await fetch(`${route}?id=${encodeURIComponent(id)}`);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ PDF Route Fehler:", {
          status: res.status,
          statusText: res.statusText,
          errorText,
        });
        alert(`PDF konnte nicht geladen werden: ${errorText || res.statusText}`);
        return;
      }

      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/pdf")) {
        const responseText = await res.text();
        console.error("❌ Keine PDF-Antwort:", {
          contentType,
          responseText,
        });
        alert("Die Route hat keine gültige PDF-Datei zurückgegeben.");
        return;
      }

      const blob = await res.blob();

      if (blob.size === 0) {
        console.error("❌ Leere PDF-Datei erhalten");
        alert("Die PDF-Datei ist leer.");
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `${formType}_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      console.error("❌ PDF Download Fehler:", error);
      alert("Beim PDF-Download ist ein Fehler aufgetreten.");
    } finally {
      setDownloading(false);
    }
  }

  async function downloadExcel() {
    setDownloading(true);

    try {
      const res = await fetch("/api/exports/orders", {
        method: "POST",
        body: JSON.stringify({ dealerId, last: excelLast, type: formType }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Excel Export Fehler:", {
          status: res.status,
          statusText: res.statusText,
          errorText,
        });
        alert(`Excel konnte nicht geladen werden: ${errorText || res.statusText}`);
        return;
      }

      const blob = await res.blob();

      if (blob.size === 0) {
        console.error("❌ Leere Excel-Datei erhalten");
        alert("Die Excel-Datei ist leer.");
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `${formType}_verlauf.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      console.error("❌ Excel Download Fehler:", error);
      alert("Beim Excel-Download ist ein Fehler aufgetreten.");
    } finally {
      setDownloading(false);
    }
  }

  const visible = useMemo(() => rows.slice(0, limit), [rows, limit]);

  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm relative">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 text-sm">
          {t(`history.header.${formType}`)}
        </h2>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={downloadExcel}
            disabled={downloading}
            className={`inline-flex items-center gap-1 text-xs px-2 py-1 border rounded hover:bg-gray-50 ${theme.color}`}
          >
            {downloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5" />
            )}
            {t("history.actions.excel")}
          </button>

          <Link
            href={`/verlauf?typ=${formType}&dealer_id=${dealerId}`}
            className={`inline-flex items-center gap-1 text-xs px-2 py-1 border rounded hover:bg-gray-50 ${theme.color}`}
          >
            <ChevronRight className="w-3.5 h-3.5" />
            {t("history.actions.viewAll")}
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-4 text-sm text-gray-500 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> {t("activity.loading")}
        </div>
      ) : visible.length === 0 ? (
        <p className="text-sm text-gray-500">{t("activity.empty")}</p>
      ) : (
        <ul className="space-y-1.5">
          {visible.map((r) => {
            const id = `${prefixMap[r.typ]}-${r.submission_id}`;

            return (
              <li
                key={r.submission_id}
                className={`relative rounded-lg border-l-4 ${theme.border} p-2 ${highlightClass(r)}`}
              >
                <div className="flex items-center justify-between text-[13px]">
                  <div>
                    {r.typ === "projekt" && r.project_id ? (
                      <Link
                        href={`/projekt-bestellung/${r.project_id}?dealer_id=${r.dealer_id}`}
                        className="flex items-center gap-1 font-semibold text-sm text-purple-700 hover:underline max-w-[260px]"
                        title={r.project_name ?? `Projekt ${id}`}
                      >
                        <span className="shrink-0">#{id}</span>
                        <span className="truncate text-gray-800">
                          – {r.project_name || "Projekt"}
                        </span>
                      </Link>
                    ) : (
                      <span className="font-semibold text-sm">#{id}</span>
                    )}

                    <span className="text-gray-500"> • {fmtDate(r.created_at)}</span>

                    <div className="flex items-center gap-2 ml-2 mt-1 flex-wrap">
                      <StatusBadge
                        status={r.status}
                        label={getDisplayLabel(r)}
                      />

                      {r.typ === "projekt" && r.status === "approved" && r.project_id && (
                        <button
                          onClick={() => startFromProject(r.project_id!)}
                          className="px-2 py-0.5 rounded border border-purple-300 text-purple-700 text-xs hover:bg-purple-50"
                        >
                          {t("checkout.page.title")}
                        </button>
                      )}
                    </div>
                  </div>

                  {r.status !== "csv" && pdfRoutes[r.typ] && (
                    <button
                      onClick={() => downloadPdf(r.submission_id)}
                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 border rounded hover:bg-gray-50 ${theme.color}`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {t("history.actions.pdfTitle")}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ProjectAlreadyOrderedDialog
        open={dialogOpen}
        onConfirm={confirmDuplicateOrder}
        onCancel={cancelDuplicateOrder}
      />
    </div>
  );
}
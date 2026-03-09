"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { useActiveDealer } from "@/app/(dealer)/hooks/useActiveDealer";
import { ArrowLeft, LifeBuoy, Paperclip } from "lucide-react";

/* ================= TYPES ================= */

type SupportHeader = {
  submission_id: number;
  dealer_id: number | null;
  created_at: string;
  status: string | null;
  kommentar: string | null;
  project_file_path: string | null;
};

type SupportItem = {
  item_id: number;
  product_name: string | null;
  ean: string | null;
  menge: number | null;
  preis: number | null;
  comment: string | null;
};

type SupportMeta = {
  support_typ: string | null;
  betrag: number | null;
};

type SubmissionLog = {
  id?: number;
  action: string | null;
  old_status: string | null;
  new_status: string | null;
  changed: boolean | null;
  counter_amount: number | null;
  note: string | null;
  created_at: string;
};

const SUPPORT_BUCKET = "support-invoices";

/* ================= HELPERS ================= */

function getDisplayStatus(
  status: string | null,
  latestAction: string | null | undefined
) {
  if (status === "approved" && latestAction === "approved_with_counter_offer") {
    return "Geändert und genehmigt";
  }

  if (status === "approved") {
    return "Genehmigt";
  }

  if (status === "rejected") {
    return "Abgelehnt";
  }

  if (status === "pending" || latestAction === "reset_to_pending") {
    return "Offen";
  }

  return status ?? "—";
}

function getStatusClass(status: string | null) {
  if (status === "approved") {
    return "bg-green-100 text-green-700";
  }

  if (status === "rejected") {
    return "bg-red-100 text-red-700";
  }

  return "bg-gray-100 text-gray-600";
}

/* ================= COMPONENT ================= */

export default function SupportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = getSupabaseBrowser();

  const { dealer, loading: dealerLoading } = useActiveDealer();

  const [header, setHeader] = useState<SupportHeader | null>(null);
  const [items, setItems] = useState<SupportItem[]>([]);
  const [meta, setMeta] = useState<SupportMeta | null>(null);
  const [logs, setLogs] = useState<SubmissionLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileUrlLoading, setFileUrlLoading] = useState(false);

  useEffect(() => {
    if (!id || dealerLoading || !dealer?.dealer_id) return;

    (async () => {
      setLoading(true);
      setFileUrl(null);

      const numericId = Number(id);

      const { data: headerData, error: headerErr } = await supabase
        .from("submissions")
        .select(
          "submission_id, dealer_id, created_at, status, kommentar, project_file_path"
        )
        .eq("submission_id", numericId)
        .eq("typ", "support")
        .eq("dealer_id", dealer.dealer_id)
        .single();

      if (headerErr || !headerData) {
        console.error("headerErr:", headerErr);
        setHeader(null);
        setLoading(false);
        return;
      }

      setHeader(headerData as SupportHeader);

      const { data: itemsData, error: itemsErr } = await supabase
        .from("submission_items")
        .select("item_id, product_name, ean, menge, preis, comment")
        .eq("submission_id", numericId)
        .order("item_id", { ascending: true });

      if (itemsErr) {
        console.error("itemsErr:", itemsErr);
      }

      setItems((itemsData ?? []) as SupportItem[]);

      const { data: metaData, error: metaErr } = await supabase
        .from("support_details")
        .select("support_typ, betrag")
        .eq("submission_id", numericId)
        .maybeSingle();

      if (metaErr) {
        console.error("metaErr:", metaErr);
      }

      if (metaData) {
        setMeta(metaData as SupportMeta);
      } else {
        setMeta(null);
      }

      const { data: logsData, error: logsErr } = await supabase
        .from("submission_logs")
        .select("id, action, old_status, new_status, changed, counter_amount, note, created_at")
        .eq("submission_id", numericId)
        .eq("typ", "support")
        .order("created_at", { ascending: true });

      if (logsErr) {
        console.error("logsErr:", logsErr);
      }

      setLogs((logsData ?? []) as SubmissionLog[]);

      if (headerData.project_file_path) {
        setFileUrlLoading(true);

        const { data: signed, error: signedErr } = await supabase.storage
          .from(SUPPORT_BUCKET)
          .createSignedUrl(headerData.project_file_path, 60 * 30);

        if (signedErr) {
          console.error("signedErr:", signedErr);
          setFileUrl(null);
        } else {
          setFileUrl(signed?.signedUrl ?? null);
        }

        setFileUrlLoading(false);
      }

      setLoading(false);
    })();
  }, [id, dealer?.dealer_id, dealerLoading, supabase]);

  const totalAmount = useMemo(() => {
    return items.reduce(
      (s, i) => s + Number(i.preis ?? 0) * Number(i.menge ?? 0),
      0
    );
  }, [items]);

  const latestAction = logs.length > 0 ? logs[logs.length - 1]?.action : null;
  const displayStatus = getDisplayStatus(header?.status ?? null, latestAction);
  const statusClass = getStatusClass(header?.status ?? null);

  if (dealerLoading || loading) {
    return <p className="text-gray-500">⏳ Support-Details werden geladen…</p>;
  }

  if (!header) {
    return (
      <p className="text-red-600">
        Support-Fall nicht gefunden oder kein Zugriff.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/verlauf?dealer_id=${dealer?.dealer_id}`)}
          className="p-2 rounded hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <LifeBuoy className="w-6 h-6 text-teal-700" />

        <div className="flex-1">
          <h1 className="text-lg font-semibold">
            Support S-{header.submission_id}
          </h1>
          <p className="text-sm text-gray-500">
            {items.length} Position
            {items.length !== 1 ? "en" : ""} ·{" "}
            {totalAmount.toLocaleString("de-CH", {
              style: "currency",
              currency: "CHF",
            })}{" "}
            · {new Date(header.created_at).toLocaleString("de-CH")}
          </p>

          <div className="mt-2">
            <span
              className={`inline-block text-xs px-2 py-0.5 rounded-full ${statusClass}`}
            >
              {displayStatus}
            </span>
          </div>
        </div>

        {header.project_file_path && (
          <div>
            {fileUrlLoading ? (
              <span className="text-sm text-gray-500">Beleg wird geladen…</span>
            ) : fileUrl ? (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                <Paperclip className="w-4 h-4" />
                Beleg
              </a>
            ) : (
              <span className="text-sm text-gray-400">Kein Link</span>
            )}
          </div>
        )}
      </div>

      {/* ===== KOMMENTAR ===== */}
      {header.kommentar && (
        <div className="rounded-md border bg-gray-50 p-3 text-sm">
          💬 {header.kommentar}
        </div>
      )}

      {/* ===== NON-SELLOUT META ===== */}
      {meta && (
        <div className="rounded-md border bg-teal-50 p-3 text-sm">
          <strong>Support-Typ:</strong> {meta.support_typ}
          {meta.betrag != null && (
            <>
              <br />
              <strong>Betrag:</strong>{" "}
              {meta.betrag.toLocaleString("de-CH", {
                style: "currency",
                currency: "CHF",
              })}
            </>
          )}
        </div>
      )}

      {/* ===== ITEMS ===== */}
      {items.length > 0 && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left">Produkt</th>
                <th className="px-3 py-2 text-left">EAN</th>
                <th className="px-3 py-2 text-right">Menge</th>
                <th className="px-3 py-2 text-right">Betrag</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.item_id} className="border-b last:border-b-0">
                  <td className="px-3 py-2">{i.product_name ?? "—"}</td>
                  <td className="px-3 py-2 font-mono">{i.ean ?? "—"}</td>
                  <td className="px-3 py-2 text-right">{i.menge ?? 0}</td>
                  <td className="px-3 py-2 text-right">
                    {(Number(i.preis ?? 0) * Number(i.menge ?? 0)).toLocaleString(
                      "de-CH",
                      { style: "currency", currency: "CHF" }
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== LOGS ===== */}
      {logs.length > 0 && (
        <div className="rounded-md border bg-white p-3 text-sm space-y-2">
          <p className="font-semibold">Verlauf</p>

      {logs.map((log, index) => {
        let label = log.action ?? "-";

        if (log.action === "approved_with_counter_offer") {
          label = "Geändert und genehmigt";
        } else if (log.action === "approved") {
          label = "Genehmigt";
        } else if (log.action === "rejected") {
          label = "Abgelehnt";
        } else if (log.action === "reset_to_pending") {
          label = "Offen";
        }

        const safeKey =
          log.id ??
          `${log.action ?? "log"}-${log.created_at ?? "no-date"}-${index}`;

        return (
          <p key={safeKey} className="text-gray-700">
            {new Date(log.created_at).toLocaleString("de-CH")} – {label}
          </p>
        );
      })}
        </div>
      )}
    </div>
  );
}
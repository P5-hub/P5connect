"use client";

import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/lib/theme/ThemeContext";
import ThemedActionButtons from "@/lib/theme/ThemedActionButtons";

type Produkt = {
  product_name?: string;
  menge?: number;
  preis?: number;
};

const SUPPORT_BUCKET = "support-invoices"; // ✅ privater Bucket

function normalizeSupportKind(supportTyp?: string | null) {
  const s = String(supportTyp ?? "").toLowerCase();

  if (s.includes("sellout") || s.includes("sell-out")) return "sellout";
  if (s.includes("marketing") || s.includes("werbung")) return "marketing";
  if (s.includes("event")) return "event";
  if (s.includes("other") || s.includes("sonstig")) return "other";

  return "unknown";
}

function supportLabelFromKind(kind: string) {
  switch (kind) {
    case "sellout":
      return "Sell-Out Support";
    case "marketing":
      return "Marketing Support";
    case "event":
      return "Event Support";
    case "other":
      return "Sonstiger Support";
    default:
      return "Support";
  }
}

export default function SupportDetailPage() {
  const { id: rawId } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const theme = useTheme();

  const id = rawId ? Number(rawId) : null;

  const [data, setData] = useState<{
    submission?: any;
    items?: Produkt[];
    claim?: any;
    supportDetails?: {
      support_typ?: string;
      betrag?: number;
    };
  } | null>(null);

  const [loading, setLoading] = useState(true);

  // ✅ Signed URL State
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileUrlLoading, setFileUrlLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      setFileUrl(null);

      try {
        const { data: submission, error: subError } = await supabase
          .from("submissions")
          .select(`
            submission_id,
            dealer_id,
            typ,
            datum,
            status,
            kommentar,
            project_file_path,
            dealers ( name, email, mail_dealer )
          `)
          .eq("submission_id", id)
          .eq("typ", "support")
          .maybeSingle();

        if (subError || !submission) {
          console.error("⚠️ Keine Submission:", subError);
          setLoading(false);
          return;
        }

        const { data: items } = await supabase
          .from("submission_items")
          .select("product_name, menge, preis")
          .eq("submission_id", id);

        let claim = null;
        if (submission.dealer_id) {
          const { data: claimData } = await supabase
            .from("support_claims")
            .select("*")
            .eq("dealer_id", submission.dealer_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          claim = claimData;
        }

        const { data: supportDetails } = await supabase
          .from("support_details")
          .select("support_typ, betrag")
          .eq("submission_id", id)
          .maybeSingle();

        setData({
          submission,
          items: items ?? [],
          claim,
          supportDetails: supportDetails ?? undefined,
        });

        // ✅ Signed URL erzeugen (privater Bucket)
        if (submission.project_file_path) {
          setFileUrlLoading(true);

          const { data: signed, error: signedErr } = await supabase.storage
            .from(SUPPORT_BUCKET)
            .createSignedUrl(submission.project_file_path, 60 * 30); // 30 Minuten

          if (signedErr) {
            console.error("❌ Signed URL Error:", signedErr);
            setFileUrl(null);
          } else {
            setFileUrl(signed?.signedUrl ?? null);
          }

          setFileUrlLoading(false);
        }
      } catch (err: any) {
        console.error("💥 Fehler beim Laden:", err?.message);
        toast.error("Ein unerwarteter Fehler ist aufgetreten.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, supabase]);

  if (loading) {
    return <p className="p-6 text-sm text-gray-500">Lade Support-Daten...</p>;
  }

  if (!data) {
    return (
      <p className="p-6 text-sm text-gray-500">
        Kein Support-Datensatz gefunden.
      </p>
    );
  }

  const { submission, items } = data;

  const produkte: Produkt[] = items || [];
  const totalSupport = produkte.reduce(
    (sum, p) => sum + (Number(p.preis) || 0) * (Number(p.menge) || 1),
    0
  );

  // ✅ Support-Art ableiten
  let supportKind = normalizeSupportKind(data?.supportDetails?.support_typ);

  // Fallback für alte Datensätze ohne support_details:
  if (supportKind === "unknown") {
    supportKind = produkte.length > 0 ? "sellout" : "unknown";
  }

  const supportTitle = supportLabelFromKind(supportKind);

  // ✅ Non-Sell-Out Box nur anzeigen wenn NICHT sellout
  const showNonSelloutBox = Boolean(data?.supportDetails) && supportKind !== "sellout";

  const dealerName = submission?.dealers?.name ?? "Unbekannt";
  const dealerMail =
    submission?.dealers?.mail_dealer ||
    submission?.dealers?.email ||
    "Keine Händler-E-Mail";

  const updateStatus = async (newStatus: "approved" | "rejected" | "pending") => {
    if (!submission?.submission_id) return;

    const { error } = await supabase
      .from("submissions")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("submission_id", submission.submission_id);

    if (error) {
      toast.error("Fehler beim Aktualisieren des Status.");
    } else {
      toast.success(
        newStatus === "approved"
          ? "✅ Status auf 'Bestätigt' gesetzt."
          : newStatus === "rejected"
          ? "❌ Status auf 'Abgelehnt' gesetzt."
          : "🔄 Status auf 'Offen' zurückgesetzt."
      );

      setData((prev) =>
        prev
          ? { ...prev, submission: { ...prev.submission, status: newStatus } }
          : prev
      );
    }
  };

  const statusColor =
    submission?.status === "approved"
      ? "text-green-600"
      : submission?.status === "rejected"
      ? "text-red-600"
      : theme.color;

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className={`flex items-center gap-1 ${theme.border} ${theme.color}`}
        >
          <ArrowLeft className="w-4 h-4" /> Zurück
        </Button>
      </div>

      <Card
        className={`rounded-2xl border ${theme.border} bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]`}
      >
        <CardHeader className="pb-4 border-b bg-white rounded-t-2xl">
          <h2 className="text-xl font-semibold">
            {supportTitle} – Submission #{submission?.submission_id}
          </h2>

          <div className="text-sm text-gray-700 mt-1 space-y-1">
            <p>
              <strong>Händler:</strong> {dealerName}
            </p>
            <p>
              <strong>E-Mail:</strong> {dealerMail}
            </p>
            <p>
              <strong>Datum:</strong>{" "}
              {submission?.datum
                ? new Date(submission.datum).toLocaleDateString("de-CH")
                : "-"}
            </p>
            <p className={`mt-1 font-medium ${statusColor}`}>
              Status:{" "}
              {submission?.status === "approved"
                ? "✅ Bestätigt"
                : submission?.status === "rejected"
                ? "❌ Abgelehnt"
                : "⏳ Offen"}
            </p>
          </div>

          <ThemedActionButtons
            onApprove={() => updateStatus("approved")}
            onReject={() => updateStatus("rejected")}
            onReset={() => updateStatus("pending")}
          />
        </CardHeader>

        <CardContent className="pt-4">
          {produkte.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                  <tr>
                    <th className="px-3 py-2 text-left">Produkt</th>
                    <th className="px-3 py-2 text-right">Menge</th>
                    <th className="px-3 py-2 text-right">Einzelpreis (CHF)</th>
                    <th className="px-3 py-2 text-right">Total (CHF)</th>
                  </tr>
                </thead>
                <tbody>
                  {produkte.map((p, idx) => (
                    <tr
                      key={idx}
                      className="border-t hover:bg-gray-100/60 transition-colors"
                    >
                      <td className="px-3 py-1">{p.product_name || "–"}</td>
                      <td className="px-3 py-1 text-right">{p.menge ?? "-"}</td>
                      <td className="px-3 py-1 text-right">
                        {p.preis ? Number(p.preis).toFixed(2) : "-"}
                      </td>
                      <td className="px-3 py-1 text-right">
                        {(
                          (Number(p.preis) || 0) * (Number(p.menge) || 1)
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold bg-gray-50 border-t">
                    <td colSpan={3} className="px-3 py-2 text-right">
                      Gesamt-Support:
                    </td>
                    <td className="px-3 py-2 text-right">
                      {totalSupport.toFixed(2)} CHF
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Keine Produkte im Support-Datensatz.
            </p>
          )}

          {submission?.kommentar && (
            <div className="mt-5 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
              <strong>Kommentar:</strong> {submission.kommentar}
            </div>
          )}

          {/* ✅ Nur bei Non-Sell-Out anzeigen */}
          {showNonSelloutBox && data?.supportDetails && (
            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50/60 p-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">
                Non-Sell-Out Support Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Support-Typ</p>
                  <p className="font-medium text-gray-800">
                    {data.supportDetails.support_typ}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Sony Kostenanteil</p>
                  <p className="text-lg font-semibold text-blue-700">
                    {Number(data.supportDetails.betrag ?? 0).toFixed(2)} CHF
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Beleg (Signed URL) */}
          {submission?.project_file_path ? (
            <div className="mt-5">
              {fileUrlLoading ? (
                <p className="text-sm text-gray-500">Beleg wird geladen…</p>
              ) : fileUrl ? (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${theme.color} hover:underline text-sm`}
                >
                  📎 Beleg anzeigen
                </a>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-500 italic">
                  Beleg vorhanden, aber Link konnte nicht erstellt werden.
                </div>
              )}
            </div>
          ) : (
            <div className="mt-5 p-3 bg-gray-50 rounded-md text-sm text-gray-500 italic">
              Kein Beleg hochgeladen.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
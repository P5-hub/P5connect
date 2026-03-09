"use client";

import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/lib/theme/ThemeContext";
import ThemedActionButtons from "@/lib/theme/ThemedActionButtons";

type Produkt = {
  item_id: number;
  product_name?: string;
  menge?: number;
  preis?: number;
};

type SupportDetails = {
  support_typ?: string;
  betrag?: number;
};

type SubmissionLog = {
  id?: number;
  action?: string;
  old_status?: string | null;
  new_status?: string | null;
  changed?: boolean;
  counter_amount?: number | null;
  note?: string | null;
  created_at?: string;
};

type SubmissionFile = {
  id: number;
  file_name: string;
  file_path: string;
  bucket: string;
};

type SubmissionFileWithUrl = SubmissionFile & {
  signedUrl: string | null;
};

const SUPPORT_BUCKET = "support-invoices";

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
    supportDetails?: SupportDetails;
    logs?: SubmissionLog[];
    files?: SubmissionFileWithUrl[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [savingDecision, setSavingDecision] = useState(false);
  const [filesLoading, setFilesLoading] = useState(false);

  const [editableItems, setEditableItems] = useState<Produkt[]>([]);
  const [originalItems, setOriginalItems] = useState<Produkt[]>([]);

  const [editableSupportDetails, setEditableSupportDetails] = useState<SupportDetails | null>(null);
  const [originalSupportDetails, setOriginalSupportDetails] = useState<SupportDetails | null>(null);

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      setFilesLoading(false);

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
          toast.error("Support-Datensatz konnte nicht geladen werden.");
          setLoading(false);
          return;
        }

        const { data: items, error: itemsError } = await supabase
          .from("submission_items")
          .select("item_id, product_name, menge, preis")
          .eq("submission_id", id)
          .order("item_id", { ascending: true });

        if (itemsError) {
          console.error("itemsError:", itemsError);
          toast.error("Support-Positionen konnten nicht geladen werden.");
          setLoading(false);
          return;
        }

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

        const { data: supportDetails, error: detailsError } = await supabase
          .from("support_details")
          .select("support_typ, betrag")
          .eq("submission_id", id)
          .maybeSingle();

        if (detailsError) {
          console.error("supportDetailsError:", detailsError);
        }

        const { data: logs, error: logsError } = await supabase
          .from("submission_logs")
          .select("id, action, old_status, new_status, changed, counter_amount, note, created_at")
          .eq("submission_id", id)
          .eq("typ", "support")
          .order("created_at", { ascending: true });

        if (logsError) {
          console.error("logsError:", logsError);
        }

        const { data: submissionFiles, error: filesError } = await supabase
          .from("submission_files")
          .select("id, file_name, file_path, bucket")
          .eq("submission_id", id)
          .order("id", { ascending: true });

        if (filesError) {
          console.error("submissionFilesError:", filesError);
        }

        setFilesLoading(true);

        let resolvedFiles: SubmissionFileWithUrl[] = [];

        if (submissionFiles && submissionFiles.length > 0) {
          resolvedFiles = await Promise.all(
            submissionFiles.map(async (file) => {
              const bucket = file.bucket || SUPPORT_BUCKET;

              const { data: signed, error: signedErr } = await supabase.storage
                .from(bucket)
                .createSignedUrl(file.file_path, 60 * 30);

              if (signedErr) {
                console.error("❌ Signed URL Error:", signedErr);
                return {
                  ...file,
                  signedUrl: null,
                };
              }

              return {
                ...file,
                signedUrl: signed?.signedUrl ?? null,
              };
            })
          );
        } else if (submission.project_file_path) {
          // Fallback für alte Datensätze mit nur 1 Datei in submissions.project_file_path
          const { data: signed, error: signedErr } = await supabase.storage
            .from(SUPPORT_BUCKET)
            .createSignedUrl(submission.project_file_path, 60 * 30);

          resolvedFiles = [
            {
              id: -1,
              file_name:
                submission.project_file_path.split("/").pop() || "Beleg",
              file_path: submission.project_file_path,
              bucket: SUPPORT_BUCKET,
              signedUrl: signedErr ? null : (signed?.signedUrl ?? null),
            },
          ];
        }

        setFilesLoading(false);

        const loadedItems = (items ?? []) as Produkt[];
        const loadedDetails = (supportDetails ?? null) as SupportDetails | null;

        setEditableItems(loadedItems);
        setOriginalItems(loadedItems);
        setEditableSupportDetails(loadedDetails);
        setOriginalSupportDetails(loadedDetails);

        setData({
          submission,
          items: loadedItems,
          claim,
          supportDetails: loadedDetails ?? undefined,
          logs: (logs ?? []) as SubmissionLog[],
          files: resolvedFiles,
        });
      } catch (err: unknown) {
        console.error("💥 Fehler beim Laden:", err);
        toast.error("Ein unerwarteter Fehler ist aufgetreten.");
      } finally {
        setLoading(false);
        setFilesLoading(false);
      }
    })();
  }, [id, supabase]);

  const setProduktPreis = (itemId: number, value: string) => {
    const parsed = value.trim() === "" ? 0 : Number(value.replace(",", "."));

    setEditableItems((prev) =>
      prev.map((p) =>
        p.item_id === itemId
          ? {
              ...p,
              preis: Number.isNaN(parsed) ? 0 : parsed,
            }
          : p
      )
    );
  };

  const setSupportBetrag = (value: string) => {
    const parsed = value.trim() === "" ? 0 : Number(value.replace(",", "."));

    setEditableSupportDetails((prev) => ({
      ...(prev ?? {}),
      betrag: Number.isNaN(parsed) ? 0 : parsed,
    }));
  };

  const hasSelloutChanges = () => {
    if (editableItems.length !== originalItems.length) return true;

    return editableItems.some((p) => {
      const orig = originalItems.find((o) => o.item_id === p.item_id);
      return Number(p.preis || 0) !== Number(orig?.preis || 0);
    });
  };

  const hasNonSelloutChanges = () => {
    return Number(editableSupportDetails?.betrag || 0) !== Number(originalSupportDetails?.betrag || 0);
  };

  const isSelloutSupport = useMemo(() => {
    let kind = normalizeSupportKind(data?.supportDetails?.support_typ);
    if (kind === "unknown") {
      kind = editableItems.length > 0 ? "sellout" : "unknown";
    }
    return kind === "sellout";
  }, [data?.supportDetails?.support_typ, editableItems.length]);

  const totalSupport = editableItems.reduce(
    (sum, p) => sum + (Number(p.preis) || 0) * (Number(p.menge) || 1),
    0
  );

  const insertSubmissionLog = async ({
    action,
    oldStatus,
    newStatus,
    changed,
    counterAmount,
    note,
  }: {
    action: string;
    oldStatus: string | null;
    newStatus: string | null;
    changed: boolean;
    counterAmount?: number | null;
    note?: string | null;
  }) => {
    if (!data?.submission?.submission_id) return null;

    const payload = {
      submission_id: data.submission.submission_id,
      dealer_id: data.submission.dealer_id ?? null,
      typ: "support",
      action,
      old_status: oldStatus,
      new_status: newStatus,
      changed,
      counter_amount: counterAmount ?? null,
      note: note ?? null,
    };

    const { error } = await supabase
      .from("submission_logs" as any)
      .insert(payload);

    if (error) {
      console.error("submissionLogInsertError:", error);
      console.error("message:", error.message);
      console.error("details:", error.details);
      console.error("hint:", error.hint);
      console.error("code:", error.code);
      return null;
    }

    return {
      id: -Date.now(),
      action,
      old_status: oldStatus,
      new_status: newStatus,
      changed,
      counter_amount: counterAmount ?? null,
      note: note ?? null,
      created_at: new Date().toISOString(),
    } as SubmissionLog;
  };

  const updateStatus = async (newStatus: "approved" | "rejected" | "pending") => {
    if (!data?.submission?.submission_id) return;

    try {
      setSavingDecision(true);

      const oldStatus = data.submission.status ?? null;
      const changed = isSelloutSupport ? hasSelloutChanges() : hasNonSelloutChanges();

      if (newStatus === "approved" && changed) {
        if (isSelloutSupport) {
          for (const item of editableItems) {
            const { error: itemUpdateError } = await supabase
              .from("submission_items")
              .update({
                preis: Number(item.preis || 0),
                updated_at: new Date().toISOString(),
              })
              .eq("item_id", item.item_id);

            if (itemUpdateError) {
              console.error("itemUpdateError:", itemUpdateError);
              toast.error(
                `Preis für ${item.product_name || "Produkt"} konnte nicht gespeichert werden.`
              );
              return;
            }
          }
        } else if (editableSupportDetails) {
          const { error: detailsUpdateError } = await supabase
            .from("support_details")
            .update({
              betrag: Number(editableSupportDetails.betrag || 0),
            })
            .eq("submission_id", data.submission.submission_id);

          if (detailsUpdateError) {
            console.error("detailsUpdateError:", detailsUpdateError);
            toast.error("Support-Betrag konnte nicht gespeichert werden.");
            return;
          }
        }
      }

      const { error } = await supabase
        .from("submissions")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("submission_id", data.submission.submission_id);

      if (error) {
        console.error("submissionUpdateError:", error);
        toast.error("Fehler beim Aktualisieren des Status.");
        return;
      }

      let action = "";
      let note: string | null = null;
      let counterAmount: number | null = null;

      if (newStatus === "approved") {
        if (changed) {
          action = "approved_with_counter_offer";
          note = "Gegenvorschlag durch Admin";
          counterAmount = isSelloutSupport
            ? totalSupport
            : Number(editableSupportDetails?.betrag || 0);
        } else {
          action = "approved";
        }
      } else if (newStatus === "rejected") {
        action = "rejected";
      } else {
        action = "reset_to_pending";
      }

      const insertedLog = await insertSubmissionLog({
        action,
        oldStatus,
        newStatus,
        changed: newStatus === "approved" ? changed : false,
        counterAmount,
        note,
      });

      setData((prev) =>
        prev
          ? {
              ...prev,
              submission: { ...prev.submission, status: newStatus },
              items: editableItems,
              supportDetails: editableSupportDetails ?? undefined,
              logs: insertedLog ? [...(prev.logs ?? []), insertedLog] : prev.logs,
            }
          : prev
      );

      setOriginalItems(editableItems);
      setOriginalSupportDetails(editableSupportDetails);

      if (newStatus === "approved") {
        toast.success(
          changed
            ? "Gegenvorschlag gespeichert und Support genehmigt."
            : "✅ Status auf 'Bestätigt' gesetzt."
        );
      } else if (newStatus === "rejected") {
        toast.success("❌ Status auf 'Abgelehnt' gesetzt.");
      } else {
        toast.success("🔄 Status auf 'Offen' zurückgesetzt.");
      }
    } catch (err) {
      console.error("updateStatus catch:", err);
      toast.error("Aktion konnte nicht ausgeführt werden.");
    } finally {
      setSavingDecision(false);
    }
  };

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

  const { submission, logs, files } = data;

  let supportKind = normalizeSupportKind(data?.supportDetails?.support_typ);
  if (supportKind === "unknown") {
    supportKind = editableItems.length > 0 ? "sellout" : "unknown";
  }

  const supportTitle = supportLabelFromKind(supportKind);
  const showNonSelloutBox = Boolean(editableSupportDetails) && supportKind !== "sellout";

  const dealerName = submission?.dealers?.name ?? "Unbekannt";
  const dealerMail =
    submission?.dealers?.mail_dealer ||
    submission?.dealers?.email ||
    "Keine Händler-E-Mail";

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

          <div className={savingDecision ? "pointer-events-none opacity-70" : ""}>
            <ThemedActionButtons
              onApprove={() => updateStatus("approved")}
              onReject={() => updateStatus("rejected")}
              onReset={() => updateStatus("pending")}
            />
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-5">
          {editableItems.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                  <tr>
                    <th className="px-3 py-2 text-left">Produkt</th>
                    <th className="px-3 py-2 text-right">Menge</th>
                    <th className="px-3 py-2 text-right">Einzelpreis / Gegenvorschlag (CHF)</th>
                    <th className="px-3 py-2 text-right">Total (CHF)</th>
                  </tr>
                </thead>
                <tbody>
                  {editableItems.map((p) => {
                    const original = originalItems.find((o) => o.item_id === p.item_id);
                    const changed = Number(original?.preis || 0) !== Number(p.preis || 0);

                    return (
                      <tr
                        key={p.item_id}
                        className="border-t hover:bg-gray-100/60 transition-colors"
                      >
                        <td className="px-3 py-1">{p.product_name || "–"}</td>
                        <td className="px-3 py-1 text-right">{p.menge ?? "-"}</td>
                        <td className="px-3 py-1 text-right">
                          <div className="flex justify-end items-center gap-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={p.preis ?? 0}
                              onChange={(e) => setProduktPreis(p.item_id, e.target.value)}
                              className={`w-28 rounded border px-2 py-1 text-right ${
                                changed ? "border-orange-400 bg-orange-50" : ""
                              }`}
                            />
                            <span>CHF</span>
                          </div>
                        </td>
                        <td className="px-3 py-1 text-right">
                          {(
                            (Number(p.preis) || 0) * (Number(p.menge) || 1)
                          ).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
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
            <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-700">
              <strong>Kommentar:</strong> {submission.kommentar}
            </div>
          )}

          {showNonSelloutBox && editableSupportDetails && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-3">
                Non-Sell-Out Support Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Support-Typ</p>
                  <p className="font-medium text-gray-800">
                    {editableSupportDetails.support_typ || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 mb-1">Sony Kostenanteil / Gegenvorschlag</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editableSupportDetails.betrag ?? 0}
                      onChange={(e) => setSupportBetrag(e.target.value)}
                      className={`w-36 rounded border px-3 py-2 text-right ${
                        hasNonSelloutChanges() ? "border-orange-400 bg-orange-50" : ""
                      }`}
                    />
                    <span className="font-medium text-blue-700">CHF</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {filesLoading ? (
            <p className="text-sm text-gray-500">Belege werden geladen…</p>
          ) : files && files.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Belege</p>

              {files.map((file, index) =>
                file.signedUrl ? (
                  <a
                    key={`${file.id}-${index}`}
                    href={file.signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block ${theme.color} hover:underline text-sm`}
                  >
                    📎 {file.file_name || `Beleg ${index + 1}`}
                  </a>
                ) : (
                  <div
                    key={`${file.id}-${index}`}
                    className="p-3 bg-gray-50 rounded-md text-sm text-gray-500 italic"
                  >
                    {file.file_name || `Beleg ${index + 1}`} vorhanden, aber Link konnte nicht erstellt werden.
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-500 italic">
              Kein Beleg hochgeladen.
            </div>
          )}

          {logs && logs.length > 0 && (
            <div className="text-sm space-y-2 border rounded p-3">
              <p className="font-semibold">Supportverlauf</p>

              {logs.map((l, index) => {
                const safeKey =
                  l.id != null
                    ? `support-log-${l.id}`
                    : `support-log-${l.action ?? "x"}-${l.created_at ?? "no-date"}-${index}`;

                return (
                  <p key={safeKey}>
                    {new Date(l.created_at || "").toLocaleString("de-CH")} –{" "}
                    {l.action === "approved_with_counter_offer"
                      ? "geändert und genehmigt"
                      : l.action === "approved"
                      ? "genehmigt"
                      : l.action === "rejected"
                      ? "abgelehnt"
                      : l.action === "reset_to_pending"
                      ? "zurückgesetzt"
                      : l.action}
                  </p>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
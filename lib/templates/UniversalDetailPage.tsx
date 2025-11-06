"use client";

import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Check, X, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/lib/theme/ThemeContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { sendOrderNotification } from "@/lib/notifications/sendOrderNotification";
import OrderDetailView from "@/components/admin/OrderDetailView";

// 🔹 Typen
type Dealer = { name?: string; email?: string; mail_dealer?: string };
type SubmissionRecord = {
  submission_id?: number;
  dealer_id?: number;
  status?: "pending" | "approved" | "rejected" | null;
  datum?: string;
  created_at?: string;
  typ?: string;
  kommentar?: string;
  dealers?: Dealer | null;
};

type UniversalDetailProps = {
  tableName: string;
  typeFilter?: string;
  title: string;
  storageBucket?: string;
};

export default function UniversalDetailPage({
  tableName,
  typeFilter,
  title,
  storageBucket,
}: UniversalDetailProps) {
  const params = useParams();
  const rawId = params.claim_id || params.id;
  const id = rawId ? Number(rawId) : null;

  const router = useRouter();
  const supabase = createClient();
  const theme = useTheme();

  const [record, setRecord] = useState<SubmissionRecord | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingMail, setSendingMail] = useState(false);

  // Daten laden
  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      let query = supabase
        .from("submissions")
        .select(
          `
          submission_id, dealer_id, typ, datum, status, kommentar, created_at,
          dealers ( name, email, mail_dealer )
        `
        )
        .eq("submission_id", id);

      if (typeFilter) query = query.eq("typ", typeFilter);

      const { data, error } = await query.maybeSingle();

      if (error || !data) {
        toast.error("Datensatz nicht gefunden.");
        setRecord(null);
        return;
      }

      setRecord({
        ...data,
        dealers: Array.isArray(data.dealers) ? data.dealers[0] : data.dealers || null,
      });
    } catch (e) {
      console.error(e);
      toast.error("Fehler beim Laden.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (!id) return;
    const ch = supabase
      .channel(`realtime-detail-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "submissions", filter: `submission_id=eq.${id}` },
        (payload) => {
          if (payload.new) {
            setRecord((prev) =>
              prev ? { ...prev, status: (payload.new as any).status } : prev
            );
          }
        }
      )
      .subscribe();
    return () => void supabase.removeChannel(ch);
  }, [id]);

  const dealerName = record?.dealers?.name ?? "Unbekannt";
  const dealerMail = record?.dealers?.mail_dealer || record?.dealers?.email || "-";

  // 🔸 Status-Update
  const updateStatus = async (newStatus: "approved" | "rejected" | "pending") => {
    if (!record?.submission_id) return;
    const { error } = await supabase
      .from("submissions")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("submission_id", record.submission_id);

    if (error) return toast.error("Status-Update fehlgeschlagen.");
    toast.success("Status aktualisiert.");
    setRecord((r) => (r ? { ...r, status: newStatus } : r));
  };

  // 🔸 Mail-Preview
  const handlePreviewMail = async () => {
    try {
      setSendingMail(true);
      if (!record?.submission_id) throw new Error("Keine Submission-ID.");
      const { html, ok } = await sendOrderNotification({
        submissionId: Number(record.submission_id),
        stage: "confirmed",
        preview: true,
      });

      if (!ok || !html) {
        setPreviewHtml("<p>Keine Vorschau verfügbar.</p>");
        toast.warning("Keine Vorschau verfügbar.");
      } else {
        setPreviewHtml(html);
      }
    } catch (e) {
      console.error(e);
      toast.error("Fehler bei der Vorschau.");
    } finally {
      setSendingMail(false);
    }
  };

  // 🔸 Bestätigen + Mail
  const handleApproveWithMail = async () => {
    try {
      setSendingMail(true);
      if (!record?.submission_id) throw new Error("Keine Submission-ID.");

      const res = await sendOrderNotification({
        submissionId: Number(record.submission_id),
        stage: "confirmed",
      });

      if (!res.ok) throw new Error("E-Mail Versand fehlgeschlagen.");

      await updateStatus("approved");
      toast.success("Bestellung bestätigt & E-Mail gesendet.");
    } catch (e) {
      console.error(e);
      toast.error("E-Mail Versand fehlgeschlagen.");
    } finally {
      setSendingMail(false);
    }
  };

  if (loading) return <p className="p-6 text-sm text-gray-500">Lade Daten…</p>;
  if (!record) return <p className="p-6 text-sm text-gray-500">Kein Datensatz gefunden.</p>;

  const statusColor =
    record?.status === "approved"
      ? "text-green-600"
      : record?.status === "rejected"
      ? "text-red-600"
      : theme.color;

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* 🔹 Zurück */}
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className={`gap-1 ${theme.border} ${theme.color}`}
        >
          <ArrowLeft className="w-4 h-4" /> Zurück
        </Button>
      </div>

      {/* 🔹 Kopfkarte */}
      <Card className="rounded-2xl border bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <CardHeader className="pb-4 border-b bg-white rounded-t-2xl">
          <h2 className="text-xl font-semibold">
            {title} – #{record?.submission_id}
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
              {record?.datum || record?.created_at
                ? new Date((record?.datum || record?.created_at) ?? "").toLocaleDateString("de-CH")
                : "-"}
            </p>
            <p className={`mt-1 font-medium ${statusColor}`}>
              Status:{" "}
              {record?.status === "approved"
                ? "✅ Bestätigt"
                : record?.status === "rejected"
                ? "❌ Abgelehnt"
                : "⏳ Offen"}
            </p>
          </div>

          {/* 🔹 EINZIGE Buttonleiste */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Button
              size="sm"
              variant={record?.status === "approved" ? "default" : "outline"}
              onClick={() => updateStatus("approved")}
              className="rounded-full"
            >
              <Check className="w-4 h-4 mr-1" /> Bestätigen
            </Button>
            <Button
              size="sm"
              variant={record?.status === "rejected" ? "default" : "outline"}
              onClick={() => updateStatus("rejected")}
              className="rounded-full"
            >
              <X className="w-4 h-4 mr-1" /> Ablehnen
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateStatus("pending")}
              className="rounded-full"
            >
              <RotateCcw className="w-4 h-4 mr-1" /> Reset
            </Button>

            {record?.typ === "bestellung" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePreviewMail}
                  disabled={sendingMail}
                  className="rounded-full"
                >
                  <Mail className="w-4 h-4 mr-1" /> Vorschau
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleApproveWithMail}
                  disabled={sendingMail}
                  className="rounded-full"
                >
                  <Mail className="w-4 h-4 mr-1" /> Bestätigen + Mail
                </Button>
              </>
            )}
          </div>
        </CardHeader>

        {/* 🔹 Detailkarte */}
        <CardContent className="pt-4">
          {record?.typ === "bestellung" && (
            <OrderDetailView
              submission={{
                submission_id: Number(record.submission_id),
                status: record.status ?? null, // ✅ fix gegen undefined
              }}
              onStatusChange={fetchData}
            />
          )}
        </CardContent>
      </Card>

      {/* 🔹 Mail Vorschau */}
      <Dialog open={!!previewHtml} onOpenChange={(o) => !o && setPreviewHtml(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>E-Mail-Vorschau</DialogTitle>
          </DialogHeader>
          <div
            className="prose max-w-none border rounded-md p-4 bg-white"
            dangerouslySetInnerHTML={{ __html: previewHtml || "" }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

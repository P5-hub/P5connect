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
  submission_id?: number; // Für submissions & Sofortrabatt (gemappt von claim_id)
  dealer_id?: number;
  status?: "pending" | "approved" | "rejected" | null;
  datum?: string;
  created_at?: string;
  typ?: string;
  kommentar?: string;
  dealers?: Dealer | null;

  // Sofortrabatt-spezifisch (optional)
  rabatt_level?: number | null;
  rabatt_betrag?: number | null;
  products?: any;
};

type UniversalDetailProps = {
  tableName: string;        // "submissions" oder "sofortrabatt_claims"
  typeFilter?: string;      // z. B. "bestellung", "projekt", "support", "sofortrabatt"
  title: string;
  storageBucket?: string;
};

export default function UniversalDetailPage({
  tableName,
  typeFilter,
  title,
}: UniversalDetailProps) {
  const params = useParams();
  const rawId = params.claim_id || params.id;
  const id = rawId ? Number(rawId) : null;

  const router = useRouter();
  const supabase = createClient();
  const theme = useTheme();

  const [record, setRecord] = useState<SubmissionRecord | null>(null);
  const [dealerPreview, setDealerPreview] = useState<string | null>(null);
  const [distiPreview, setDistiPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingMail, setSendingMail] = useState(false);

  const [activeTab, setActiveTab] = useState<"dealer" | "disti">("dealer");


  // Sofortrabatt-Erkennung
  const isSofort = tableName === "sofortrabatt_claims" || typeFilter === "sofortrabatt";

  // Daten laden
  const fetchData = async () => {
    if (!id) return;
    setLoading(true);

    try {
      if (isSofort) {
        // 🔸 Sofortrabatt: aus sofortrabatt_claims lesen, Dealer separat holen
        const { data, error } = await supabase
          .from("sofortrabatt_claims")
          .select("*")
          .eq("claim_id", id)
          .maybeSingle();

        if (error || !data) {
          console.error(error);
          toast.error("Datensatz nicht gefunden.");
          setRecord(null);
          return;
        }

        const anyData: any = data; // ParserError-Typing entschärfen

        // Händler separat nachladen
        let dealer: Dealer | null = null;
        if (anyData.dealer_id) {
          const { data: dealerRow } = await supabase
            .from("dealers")
            .select("name, email, mail_dealer")
            .eq("dealer_id", anyData.dealer_id)
            .maybeSingle();
          dealer = (dealerRow as Dealer) || null;
        }

        setRecord({
          submission_id: anyData.claim_id,
          dealer_id: anyData.dealer_id,
          status: anyData.status,
          datum: anyData.submission_date ?? anyData.created_at,
          created_at: anyData.created_at,
          typ: "sofortrabatt",
          kommentar: anyData.comment,
          rabatt_level: anyData.rabatt_level,
          rabatt_betrag: anyData.rabatt_betrag,
          products: anyData.products,
          dealers: dealer,
        });
      } else {
        // 🔸 Standard: submissions (dein Originalcode)
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
          console.error(error);
          toast.error("Datensatz nicht gefunden.");
          setRecord(null);
          return;
        }

        const anyData: any = data; // Typ-Parser entschärfen

        setRecord({
          ...anyData,
          dealers: Array.isArray(anyData.dealers) ? anyData.dealers[0] : anyData.dealers || null,
        });
      }
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

    const table = isSofort ? "sofortrabatt_claims" : "submissions";
    const idColumn = isSofort ? "claim_id" : "submission_id";

    const ch = supabase
      .channel(`realtime-detail-${table}-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter: `${idColumn}=eq.${id}` },
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
  }, [id, isSofort, tableName]);

  const dealerName = record?.dealers?.name ?? "Unbekannt";
  const dealerMail = record?.dealers?.mail_dealer || record?.dealers?.email || "-";

  // 🔸 Status-Update
  const updateStatus = async (newStatus: "approved" | "rejected" | "pending") => {
    if (!record?.submission_id) return;

    const table = isSofort ? "sofortrabatt_claims" : "submissions";
    const idColumn = isSofort ? "claim_id" : "submission_id";
    const idValue = record.submission_id; // für Sofortrabatt = claim_id gemappt

    const { error } = await supabase
      .from(table)
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq(idColumn, idValue);

    if (error) return toast.error("Status-Update fehlgeschlagen.");
    toast.success("Status aktualisiert.");
    setRecord((r) => (r ? { ...r, status: newStatus } : r));
  };

  // 🔸 Mail-Preview (nur für Bestellungen)
  // 🔸 Mail-Preview (Bestellungen)
  const handlePreviewMail = async () => {
    try {
      setSendingMail(true);

      if (!record?.submission_id) throw new Error("Keine Submission-ID.");

      const res = await sendOrderNotification({
        submissionId: Number(record.submission_id),
        stage: "confirmed",
        preview: true,
      });

      // ❗ Fehlerfall
      if (!res.ok) {
        setDealerPreview("<p>Keine Vorschau verfügbar.</p>");
        setDistiPreview("<p>Keine Vorschau verfügbar.</p>");
        toast.warning("Keine Vorschau verfügbar.");
        return;
      }

      // ❗ Preview-Modus → dealer & disti existieren garantiert
      if (res.preview === true) {
        setActiveTab("dealer");

        const dealerHtml =
          res.dealer?.html ?? "<p>Keine Händler-Mail vorhanden.</p>";
        const distiHtml =
          res.disti?.html ?? "<p>Keine Disti-Mail vorhanden.</p>";

        setDealerPreview(dealerHtml);
        setDistiPreview(distiHtml);

        return;
      }

      // ❗ Falls aus irgendeinem Grund preview=false kam (soll nicht passieren)
      setDealerPreview("<p>Keine Vorschau verfügbar.</p>");
      setDistiPreview("<p>Keine Vorschau verfügbar.</p>");
      toast.warning("Keine Vorschau verfügbar.");

    } catch (e) {
      console.error(e);
      toast.error("Fehler bei der Vorschau.");
    } finally {
      setSendingMail(false);
    }
  };



  // 🔸 Bestätigen + Mail (nur für Bestellungen)
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
          {/* Bestellung → OrderDetailView wie bisher */}
          {record?.typ === "bestellung" && (
            <OrderDetailView
              submission={{
                submission_id: Number(record.submission_id),
                status: record.status ?? null,
              }}
              onStatusChange={fetchData}
            />
          )}

          {/* Sofortrabatt – optional einfache Anzeige (bricht nichts) */}
          {record?.typ === "sofortrabatt" && (
            <div className="mt-4 text-sm text-gray-700 space-y-1">
              {record.rabatt_betrag != null && (
                <p>
                  <strong>Rabattbetrag:</strong> {record.rabatt_betrag} CHF
                </p>
              )}
              {record.rabatt_level != null && (
                <p>
                  <strong>Rabatt-Level:</strong> {record.rabatt_level}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🔹 Mail Vorschau */}
      {/* --- MAIL PREVIEW DIALOG --- */}
      <Dialog
        open={!!dealerPreview || !!distiPreview}
        onOpenChange={(o) => {
          if (!o) {
            setDealerPreview(null);
            setDistiPreview(null);
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-[1600px] p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-xl font-semibold">
              E-Mail Vorschau
            </DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="px-6 mt-4 border-b flex gap-6 text-sm font-medium">
            <button
              onClick={() => setActiveTab("dealer")}
              className={`pb-3 -mb-px ${
                activeTab === "dealer"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500"
              }`}
            >
              Händler-Mail
            </button>

            <button
              onClick={() => setActiveTab("disti")}
              className={`pb-3 -mb-px ${
                activeTab === "disti"
                  ? "border-b-2 border-amber-600 text-amber-600"
                  : "text-gray-500"
              }`}
            >
              Disti-Mail
            </button>
          </div>

          {/* Content */}
          <div className="p-8 max-h-[85vh] overflow-auto w-full">
            {activeTab === "dealer" && (
              <div
                className="prose prose-sm max-w-none w-full"
                dangerouslySetInnerHTML={{
                  __html: dealerPreview || "<p>Keine Händler-Mail verfügbar.</p>",
                }}
              />
            )}

            {activeTab === "disti" && (
              <div
                className="prose prose-sm max-w-none w-full"
                dangerouslySetInnerHTML={{
                  __html: distiPreview || "<p>Keine Disti-Mail verfügbar.</p>",
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

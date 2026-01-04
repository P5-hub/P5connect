"use client";

import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Check, X, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/lib/theme/ThemeContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sendOrderNotification } from "@/lib/notifications/sendOrderNotification";
import OrderDetailView from "@/components/admin/OrderDetailView";

// 🔹 Typen
type Dealer = {
  name?: string;
  email?: string;
  mail_dealer?: string;
};

type SofortrabattProduct = {
  product_name?: string;
  category?: string;
  ean?: string;
};

type SubmissionRecord = {
  submission_id?: number; // Für submissions & Sofortrabatt (gemappt von claim_id)
  dealer_id?: number;
  status?: "pending" | "approved" | "rejected" | null;
  datum?: string;
  created_at?: string;
  typ?: string;
  kommentar?: string;
  dealers?: Dealer | null;

  // ✅ WICHTIG für Projekte
  project_id?: string | null;

  // Sofortrabatt-spezifisch
  rabatt_level?: number | null;
  rabatt_betrag?: number | null;
  products?: any;
};

// Projekt-spezifisch
type ProjectFile = {
  id: number;
  file_name: string;
  path: string;
  bucket: string;
  created_at?: string;
};

type SubmissionFile = {
  id: number;
  file_name: string;
  file_path: string;
  bucket: string;
  created_at?: string;
};


type UniversalDetailProps = {
  tableName: string; // "submissions" oder "sofortrabatt_claims"
  typeFilter?: string; // z. B. "bestellung", "projekt", "support", "sofortrabatt"
  title: string;
  storageBucket?: string; // für Sofortrabatt invoice API
};


export default function UniversalDetailPage({
  tableName,
  typeFilter,
  title,
  storageBucket = "sofortrabatt-invoices",
}: UniversalDetailProps) {
  const params = useParams();
  const rawId = (params as any).claim_id || (params as any).id;
  const id = rawId ? Number(rawId) : null;

  const router = useRouter();
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const theme = useTheme();

  const [record, setRecord] = useState<SubmissionRecord | null>(null);
  const [dealerPreview, setDealerPreview] = useState<string | null>(null);
  const [distiPreview, setDistiPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingMail, setSendingMail] = useState(false);

  const [activeTab, setActiveTab] = useState<"dealer" | "disti">("dealer");

  // Sofortrabatt invoice
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [invoicePath, setInvoicePath] = useState<string | null>(null);

  // Projekt files
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  // order files
  const [orderFiles, setOrderFiles] = useState<SubmissionFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);


  // Sofortrabatt-Erkennung
  const isSofort =
    tableName === "sofortrabatt_claims" || typeFilter === "sofortrabatt";

  // -----------------------------
  // Helpers: Signed URLs
  // -----------------------------
  const loadInvoiceUrl = async (path: string) => {
    try {
      const res = await fetch("/api/admin/sofortrabatt/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path,
          bucket: storageBucket,
        }),
      });

      const text = await res.text();
      if (!res.ok) {
        console.error("Invoice API error:", text);
        toast.error("Invoice-URL konnte nicht geladen werden.");
        return null;
      }

      const json = JSON.parse(text);
      return json?.url ?? null;
    } catch (e) {
      console.error("loadInvoiceUrl failed:", e);
      toast.error("Fehler beim Laden der Rechnung.");
      return null;
    }
  };

  const loadProjectFileUrl = async (path: string, bucket: string) => {
    try {
      const res = await fetch("/api/admin/project/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, bucket }),
      });

      const text = await res.text();
      if (!res.ok) {
        console.error("Project document API error:", text);
        toast.error("Projektdatei konnte nicht geladen werden.");
        return null;
      }

      const json = JSON.parse(text);
      return json?.url ?? null;
    } catch (e) {
      console.error("loadProjectFileUrl failed:", e);
      toast.error("Fehler beim Laden der Projektdatei.");
      return null;
    }
  };

  // -----------------------------
  // Daten laden
  // -----------------------------
  const fetchData = async () => {
    if (!id) return;
    setLoading(true);

    try {
      if (isSofort) {
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

        const anyData: any = data;

        // Invoice signed URL
        setInvoiceUrl(null);
        setInvoicePath(anyData.invoice_file_url ?? null);
        if (anyData.invoice_file_url) {
          const url = await loadInvoiceUrl(anyData.invoice_file_url);
          if (url) setInvoiceUrl(url);
        }

        // Dealer nachladen
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
          project_id: null,
        });

        // Projekte sind hier nicht relevant
        setProjectFiles([]);
      } else {
        // ✅ project_id MUSS mit-selectt werden
        let query = supabase
          .from("submissions")
          .select(
            `
            submission_id, dealer_id, typ, datum, status, kommentar, created_at, project_id,
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

        const anyData: any = data;

        setRecord({
          ...anyData,
          dealers: Array.isArray(anyData.dealers)
            ? anyData.dealers[0]
            : anyData.dealers || null,
        });

        // Sofortrabatt invoice states resetten, damit UI sauber bleibt
        setInvoiceUrl(null);
        setInvoicePath(null);
      }
    } catch (e) {
      console.error(e);
      toast.error("Fehler beim Laden.");
    } finally {
      setLoading(false);
    }
  };

  // Realtime Status refresh
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isSofort, tableName]);

  useEffect(() => {
    const loadRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const role =
        user?.app_metadata?.role ||
        user?.user_metadata?.role ||
        null;

      setIsAdmin(role === "admin");
    };

    loadRole();
  }, [supabase]);


  // -----------------------------
  // Projekt-Dateien nachladen (nur wenn record geladen ist)
  // -----------------------------
  useEffect(() => {
    const run = async () => {
      if (!record) return;

      if (record.typ === "projekt" && record.project_id) {
        const { data, error } = await supabase
          .from("project_files")
          .select("id, file_name, path, bucket, created_at")
          .eq("project_id", record.project_id)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("❌ project_files load error:", error);
          setProjectFiles([]);
          return;
        }

        setProjectFiles((data as ProjectFile[]) ?? []);
      } else {
        setProjectFiles([]);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record?.typ, record?.project_id]);

  const dealerName = useMemo(
    () => record?.dealers?.name ?? "Unbekannt",
    [record?.dealers?.name]
  );

  const dealerMail = useMemo(
    () => record?.dealers?.mail_dealer || record?.dealers?.email || "-",
    [record?.dealers?.mail_dealer, record?.dealers?.email]
  );

  console.log("🧾 RECORD FULL", record);
  // -----------------------------
  // Bestell-Dateien nachladen
  // -----------------------------
  // -----------------------------
  // Bestell-Dateien nachladen
  // -----------------------------
  useEffect(() => {
    // ❗ Seite entscheidet, nicht der Record
    if (typeFilter !== "bestellung") {
      setOrderFiles([]);
      return;
    }

    // ❗ Warten bis Submission-ID wirklich da ist
    if (!record?.submission_id) return;

    (async () => {
      console.log("📎 LOADING ORDER FILES FOR", record.submission_id);

      const { data, error } = await supabase
        .from("submission_files")
        .select("id, file_name, file_path, bucket, created_at")
        .eq("submission_id", record.submission_id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("❌ Fehler beim Laden der Bestell-Dateien:", error);
        setOrderFiles([]);
        return;
      }

      console.log("✅ ORDER FILES", data);
      setOrderFiles(data ?? []);
    })();
  }, [record?.submission_id, typeFilter]);



  // ===============================
  // Sofortrabatt: Products normalisieren (String | Array)
  // ===============================
  // ===============================
  // Sofortrabatt: Products normalisieren (robust)
  // ===============================
  const normalizedProducts = useMemo<SofortrabattProduct[]>(() => {
    if (!record?.products) return [];

    try {
      const parsed =
        typeof record.products === "string"
          ? JSON.parse(record.products)
          : record.products;

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [record?.products]);


  // Status-Update
  const updateStatus = async (
    newStatus: "approved" | "rejected" | "pending"
  ) => {
    if (!record?.submission_id) return;

    const table = isSofort ? "sofortrabatt_claims" : "submissions";
    const idColumn = isSofort ? "claim_id" : "submission_id";
    const idValue = record.submission_id;

    const { error } = await supabase
      .from(table)
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq(idColumn, idValue);

    if (error) return toast.error("Status-Update fehlgeschlagen.");
    toast.success("Status aktualisiert.");
    setRecord((r) => (r ? { ...r, status: newStatus } : r));
  };

  // Mail-Preview (Bestellungen)
  const handlePreviewMail = async () => {
    try {
      setSendingMail(true);

      if (!record?.submission_id) throw new Error("Keine Submission-ID.");

      const res = await sendOrderNotification({
        submissionId: Number(record.submission_id),
        stage: "confirmed",
        preview: true,
      });

      if (!res.ok) {
        setDealerPreview("<p>Keine Vorschau verfügbar.</p>");
        setDistiPreview("<p>Keine Vorschau verfügbar.</p>");
        toast.warning("Keine Vorschau verfügbar.");
        return;
      }

      if (res.preview === true) {
        setActiveTab("dealer");

        const dealerHtml = res.dealer?.html ?? "<p>Keine Händler-Mail vorhanden.</p>";
        const distiHtml = res.disti?.html ?? "<p>Keine Disti-Mail vorhanden.</p>";

        setDealerPreview(dealerHtml);
        setDistiPreview(distiHtml);
        return;
      }

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

  // Bestätigen + Mail (nur Bestellungen)
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
  // -----------------------------
  // Datei-Upload für Bestellung (ADMIN)
  // -----------------------------
  const handleOrderFileUpload = async (file: File) => {
    if (!record?.submission_id) return;

    try {
      setUploading(true);

      const path = `${record.submission_id}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("order-documents")
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from("submission_files")
        .insert({
          submission_id: record.submission_id,
          file_name: file.name,
          file_path: path,
          bucket: "order-documents",
        });


      if (insertError) throw insertError;

      toast.success("Datei hochgeladen");

      const { data } = await supabase
        .from("submission_files")
        .select("id, file_name, file_path, bucket, created_at")
        .eq("submission_id", record.submission_id)
        .order("created_at", { ascending: true });

      setOrderFiles(data ?? []);
    } catch (e) {
      console.error(e);
      toast.error("Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  };
  const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragging(true);
};

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    for (const file of files) {
      await handleOrderFileUpload(file);
    }
  };

  // -----------------------------
  // Datei öffnen (Signed URL)
  // -----------------------------
  // -----------------------------
  // Datei anzeigen (Browser / Office entscheidet)
  // -----------------------------
  const previewOrderFile = async (file: SubmissionFile) => {
    try {
      const res = await fetch("/api/admin/order/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: file.file_path,
          bucket: file.bucket,
          mode: "preview",
        }),
      });

      if (!res.ok) throw new Error("API error");

      const { url } = await res.json();
      if (!url) throw new Error("Keine URL");

      window.open(url, "_blank");
    } catch (e) {
      console.error(e);
      toast.error("Datei konnte nicht angezeigt werden");
    }
  };


  // -----------------------------
  // Datei herunterladen (erzwingen)
  // -----------------------------
  const downloadOrderFile = async (file: SubmissionFile) => {
    try {
      const res = await fetch("/api/admin/order/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: file.file_path,
          bucket: file.bucket,
          mode: "download", // 👈 erzwingt attachment
        }),
      });

      const { url } = await res.json();
      if (!url) throw new Error("Keine URL");

      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
      toast.error("Download fehlgeschlagen");
    }
  };

  // -----------------------------
  // Datei löschen (ADMIN)
  // -----------------------------
  const deleteOrderFile = async (file: SubmissionFile) => {
    const confirmed = confirm(
      `Datei "${file.file_name}" wirklich löschen?`
    );
    if (!confirmed) return;

    try {
      // 1️⃣ Storage-Datei löschen
      const { error: storageError } = await supabase.storage
        .from(file.bucket)
        .remove([file.file_path]);

      if (storageError) throw storageError;

      // 2️⃣ DB-Eintrag löschen
      const { error: dbError } = await supabase
        .from("submission_files")
        .delete()
        .eq("id", file.id);

      if (dbError) throw dbError;

      toast.success("Datei gelöscht");

      // 3️⃣ UI sofort aktualisieren
      setOrderFiles((prev) =>
        prev.filter((f) => f.id !== file.id)
      );
    } catch (e) {
      console.error(e);
      toast.error("Datei konnte nicht gelöscht werden");
    }
  };

  if (loading) return <p className="p-6 text-sm text-gray-500">Lade Daten…</p>;
  if (!record)
    return <p className="p-6 text-sm text-gray-500">Kein Datensatz gefunden.</p>;

  const statusColor =
    record?.status === "approved"
      ? "text-green-600"
      : record?.status === "rejected"
      ? "text-red-600"
      : theme.color;

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* Zurück */}
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className={`gap-1 ${theme.border} ${theme.color}`}
        >
          <ArrowLeft className="w-4 h-4" /> Zurück
        </Button>
      </div>

      {/* Kopfkarte */}
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

          {/* Buttonleiste */}
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

            {typeFilter === "bestellung" && (
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

        {/* Detailkarte */}
        <CardContent className="pt-4">
          {/* Bestellung → OrderDetailView wie bisher */}
          {typeFilter === "bestellung" && (
            
            <OrderDetailView
              submission={{
                submission_id: Number(record.submission_id),
                status: record.status ?? null,
              }}
              onStatusChange={fetchData}
            />
          )}
          {/* 📎 Dateien zur Bestellung (Admin Upload) */}
          {typeFilter === "bestellung" && (
            <div className="mt-6 max-w-xl">
              <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
                <h4 className="text-sm font-semibold text-blue-700 mb-3">
                  📎 Dateien zur Bestellung
                </h4>

                {/* Upload */}
                {/* Upload */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    flex items-center justify-center
                    border-2 border-dashed rounded-xl
                    px-4 py-6 mb-3
                    text-xs cursor-pointer transition
                    ${
                      isDragging
                        ? "border-blue-500 bg-blue-100 text-blue-700"
                        : "border-blue-300 bg-white hover:bg-blue-50"
                    }
                  `}
                >
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? []);
                        files.forEach((file) => handleOrderFileUpload(file));
                        e.currentTarget.value = "";
                      }}
                    />
                    <div className="text-center space-y-1">
                      <div className="text-sm font-medium">
                        ➕ Datei hier ablegen oder klicken
                      </div>
                      <div className="text-[11px] text-gray-500">
                        PDF, Excel, Word – mehrere Dateien möglich
                      </div>
                    </div>
                  </label>
                </div>


                {/* Datei-Liste */}
                {orderFiles.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    Keine Dateien vorhanden.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {orderFiles.map((file) => (
                      <div
                        key={file.id}
                        className="
                          flex items-center justify-between gap-2
                          text-sm px-3 py-2 rounded-lg
                          border bg-white
                          hover:bg-blue-50 hover:border-blue-300
                          transition
                        "
                      >
                        {/* Dateiname */}
                        <span className="flex-1 truncate">
                          📄 {file.file_name}
                        </span>

                        {/* Anzeigen */}
                        <button
                          type="button"
                          onClick={() => previewOrderFile(file)}
                          className="text-xs px-2 hover:text-blue-700"
                          title="Im Browser anzeigen"
                        >
                          👁️
                        </button>

                        {/* Download */}
                        <button
                          type="button"
                          onClick={() => downloadOrderFile(file)}
                          className="text-xs px-2 hover:text-green-700"
                          title="Herunterladen"
                        >
                          ⬇️
                        </button>

                        {/* Löschen (Admin) */}
                        <button
                          type="button"
                          onClick={() => deleteOrderFile(file)}
                          className="text-xs px-2 text-red-600 hover:text-red-800"
                          title="Datei löschen"
                        >
                          🗑️
                        </button>
                      </div>


                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sofortrabatt Anzeige */}
          {record?.typ === "sofortrabatt" && (
            <div className="mt-6 space-y-6 text-sm text-gray-700">

              {/* ===================== */}
              {/* ANTRAGSDETAILS */}
              {/* ===================== */}
              <div className="rounded-xl border p-4 bg-gray-50">
                <h4 className="font-semibold mb-3">Antragsdetails</h4>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <p><strong>Claim-ID:</strong> #{record.submission_id}</p>
                  <p><strong>Status:</strong> {record.status ?? "-"}</p>

                  <p>
                    <strong>Datum:</strong>{" "}
                    {record.datum
                      ? new Date(record.datum).toLocaleDateString("de-CH")
                      : "-"}
                  </p>

                  <p>
                    <strong>Rabatt-Level:</strong>{" "}
                    {record.rabatt_level ?? "-"}
                  </p>

                  <p>
                    <strong>Rabattbetrag:</strong>{" "}
                    CHF {(Number(record.rabatt_betrag) || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* ===================== */}
              {/* PRODUKTE */}
              {/* ===================== */}
              <div className="rounded-xl border p-4">
                <h4 className="font-semibold mb-3">Produkte</h4>

                {normalizedProducts.length === 0 ? (
                  <p className="text-xs text-gray-500">Keine Produkte vorhanden.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left p-2">Produkt</th>
                          <th className="text-left p-2">Kategorie</th>
                          <th className="text-left p-2">EAN</th>
                          <th className="text-right p-2">Menge</th>
                        </tr>
                      </thead>
                      <tbody>
                        {normalizedProducts.map((p: any, idx: number) => (
                          <tr key={idx} className="border-t">
                            <td className="p-2">{p.product_name || "-"}</td>
                            <td className="p-2">{p.category || "-"}</td>
                            <td className="p-2">{p.ean || "-"}</td>
                            <td className="p-2 text-right">1</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ===================== */}
              {/* KOMMENTAR */}
              {/* ===================== */}
              {record.kommentar && (
                <div className="rounded-xl border p-4 bg-gray-50">
                  <h4 className="font-semibold mb-2">Kommentar</h4>
                  <p className="whitespace-pre-wrap">{record.kommentar}</p>
                </div>
              )}

              {/* ===================== */}
              {/* RECHNUNG */}
              {/* ===================== */}
              <div>
                {invoiceUrl ? (
                  <Button
                    variant="outline"
                    onClick={() => window.open(invoiceUrl, "_blank")}
                  >
                    📎 Rechnung anzeigen
                  </Button>
                ) : invoicePath ? (
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const url = await loadInvoiceUrl(invoicePath);
                      if (url) {
                        setInvoiceUrl(url);
                        window.open(url, "_blank");
                      }
                    }}
                  >
                    📎 Rechnung laden
                  </Button>
                ) : (
                  <p className="text-xs text-gray-500">
                    Keine Rechnung hinterlegt.
                  </p>
                )}
              </div>
            </div>
          )}


          {/* ✅ Projekt-Dateien */}
          {record?.typ === "projekt" && (
            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">
                Projektdateien
              </h4>

              {projectFiles.length === 0 ? (
                <p className="text-xs text-gray-500">Keine Dateien hochgeladen.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {projectFiles.map((file) => (
                    <Button
                      key={file.id}
                      variant="outline"
                      className="justify-start"
                      onClick={async () => {
                        const url = await loadProjectFileUrl(file.path, file.bucket);
                        if (url) window.open(url, "_blank");
                      }}
                    >
                      📎 {file.file_name}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mail Vorschau Dialog */}
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

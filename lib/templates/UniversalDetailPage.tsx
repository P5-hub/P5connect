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
import { useI18n } from "@/lib/i18n/I18nProvider";

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
  qty?: number;
  tv_size_inch?: number | null;
  sales_price?: number | null;
  calculated_discount?: number | null;
};

type SubmissionRecord = {
  submission_id?: number;
  dealer_id?: number;
  status?: "pending" | "approved" | "rejected" | null;
  datum?: string;
  created_at?: string;
  typ?: string;
  kommentar?: string;
  dealers?: Dealer | null;
  project_id?: string | null;
  rabatt_level?: number | null;
  rabatt_betrag?: number | null;
  products?: any;
  invoice_file_url?: any;
};

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
  tableName: string;
  typeFilter?: string;
  title: string;
  storageBucket?: string;
};

export default function UniversalDetailPage({
  tableName,
  typeFilter,
  title,
  storageBucket = "sofortrabatt-invoices",
}: UniversalDetailProps) {
  const { t } = useI18n();
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

  const [invoiceUrls, setInvoiceUrls] = useState<Record<string, string>>({});
  const [invoicePaths, setInvoicePaths] = useState<string[]>([]);

  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [orderFiles, setOrderFiles] = useState<SubmissionFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isSofort =
    tableName === "sofortrabatt_claims" || typeFilter === "sofortrabatt";

  const getStatusText = (status?: string | null) => {
    if (status === "approved") return t("adminUniversalDetail.status.approved");
    if (status === "rejected") return t("adminUniversalDetail.status.rejected");
    return t("adminUniversalDetail.status.pending");
  };

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
        toast.error(t("adminUniversalDetail.errors.invoiceUrl"));
        return null;
      }

      const json = JSON.parse(text);
      return json?.url ?? null;
    } catch (e) {
      console.error("loadInvoiceUrl failed:", e);
      toast.error(t("adminUniversalDetail.errors.invoiceLoad"));
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
        toast.error(t("adminUniversalDetail.errors.projectFileLoad"));
        return null;
      }

      const json = JSON.parse(text);
      return json?.url ?? null;
    } catch (e) {
      console.error("loadProjectFileUrl failed:", e);
      toast.error(t("adminUniversalDetail.errors.projectFileError"));
      return null;
    }
  };

  const normalizeInvoicePaths = (raw: any): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter(Boolean);

    if (typeof raw === "string") {
      const s = raw.trim();

      if (s.startsWith("[") && s.endsWith("]")) {
        try {
          const parsed = JSON.parse(s);
          return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
        } catch {
          return [];
        }
      }

      return [s];
    }

    return [];
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
          toast.error(t("adminUniversalDetail.errors.notFound"));
          setRecord(null);
          return;
        }

        const anyData: any = data;

        const paths = normalizeInvoicePaths(anyData.invoice_file_url);
        setInvoicePaths(paths);
        setInvoiceUrls({});

        if (paths.length > 0) {
          const next: Record<string, string> = {};
          await Promise.all(
            paths.map(async (p) => {
              const url = await loadInvoiceUrl(p);
              if (url) next[p] = url;
            })
          );
          setInvoiceUrls(next);
        }

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
          invoice_file_url: anyData.invoice_file_url,
        });

        setProjectFiles([]);
      } else {
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
          toast.error(t("adminUniversalDetail.errors.notFound"));
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

        setInvoicePaths([]);
        setInvoiceUrls({});
      }
    } catch (e) {
      console.error(e);
      toast.error(t("adminUniversalDetail.errors.load"));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isSofort, tableName]);

  useEffect(() => {
    const loadRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const role = user?.app_metadata?.role || user?.user_metadata?.role || null;

      setIsAdmin(role === "admin");
    };

    loadRole();
  }, [supabase]);

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
    () => record?.dealers?.name ?? t("adminDashboardList.labels.unknown"),
    [record?.dealers?.name, t]
  );

  const dealerMail = useMemo(
    () => record?.dealers?.mail_dealer || record?.dealers?.email || "-",
    [record?.dealers?.mail_dealer, record?.dealers?.email]
  );

  useEffect(() => {
    if (typeFilter !== "bestellung") {
      setOrderFiles([]);
      return;
    }

    if (!record?.submission_id) return;

    (async () => {
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

      setOrderFiles(data ?? []);
    })();
  }, [record?.submission_id, typeFilter, supabase]);

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

  const isPercentPromo = useMemo(() => {
    const comment = (record?.kommentar || "").toLowerCase();
    return comment.includes("tv55_soundbar_percent");
  }, [record?.kommentar]);

  const updateStatus = async (newStatus: "approved" | "rejected" | "pending") => {
    if (!record?.submission_id) return;

    const table = isSofort ? "sofortrabatt_claims" : "submissions";
    const idColumn = isSofort ? "claim_id" : "submission_id";
    const idValue = record.submission_id;

    const { error } = await supabase
      .from(table)
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq(idColumn, idValue);

    if (error) return toast.error(t("adminUniversalDetail.errors.statusUpdate"));
    toast.success(t("adminUniversalDetail.success.statusUpdated"));
    setRecord((r) => (r ? { ...r, status: newStatus } : r));
  };

  const handlePreviewMail = async () => {
    try {
      setSendingMail(true);

      if (!record?.submission_id) throw new Error(t("adminUniversalDetail.errors.noSubmissionId"));

      const res = await sendOrderNotification({
        submissionId: Number(record.submission_id),
        stage: "confirmed",
        preview: true,
      });

      if (!res.ok) {
        setDealerPreview(`<p>${t("adminUniversalDetail.errors.noPreviewAvailable")}</p>`);
        setDistiPreview(`<p>${t("adminUniversalDetail.errors.noPreviewAvailable")}</p>`);
        toast.warning(t("adminUniversalDetail.errors.noPreviewAvailable"));
        return;
      }

      if (res.preview === true) {
        setActiveTab("dealer");

        const dealerHtml =
          res.dealer?.html ?? `<p>${t("adminUniversalDetail.empty.noPreviewDealer")}</p>`;
        const distiHtml =
          res.disti?.html ?? `<p>${t("adminUniversalDetail.empty.noPreviewDisti")}</p>`;

        setDealerPreview(dealerHtml);
        setDistiPreview(distiHtml);
        return;
      }

      setDealerPreview(`<p>${t("adminUniversalDetail.errors.noPreviewAvailable")}</p>`);
      setDistiPreview(`<p>${t("adminUniversalDetail.errors.noPreviewAvailable")}</p>`);
      toast.warning(t("adminUniversalDetail.errors.noPreviewAvailable"));
    } catch (e) {
      console.error(e);
      toast.error(t("adminUniversalDetail.errors.previewLoad"));
    } finally {
      setSendingMail(false);
    }
  };

  const handleApproveWithMail = async () => {
    try {
      setSendingMail(true);
      if (!record?.submission_id) throw new Error(t("adminUniversalDetail.errors.noSubmissionId"));

      const res = await sendOrderNotification({
        submissionId: Number(record.submission_id),
        stage: "confirmed",
      });

      if (!res.ok) throw new Error(t("adminUniversalDetail.errors.mailSend"));

      await updateStatus("approved");
      toast.success(t("adminUniversalDetail.success.approveWithMail"));
    } catch (e) {
      console.error(e);
      toast.error(t("adminUniversalDetail.errors.mailSend"));
    } finally {
      setSendingMail(false);
    }
  };

  const handleOrderFileUpload = async (file: File) => {
    if (!record?.submission_id) return;

    try {
      setUploading(true);

      const path = `${record.submission_id}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("order-documents")
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("submission_files").insert({
        submission_id: record.submission_id,
        file_name: file.name,
        file_path: path,
        bucket: "order-documents",
      });

      if (insertError) throw insertError;

      toast.success(t("adminUniversalDetail.success.orderFileUploaded"));

      const { data } = await supabase
        .from("submission_files")
        .select("id, file_name, file_path, bucket, created_at")
        .eq("submission_id", record.submission_id)
        .order("created_at", { ascending: true });

      setOrderFiles(data ?? []);
    } catch (e) {
      console.error(e);
      toast.error(t("adminUniversalDetail.errors.uploadFailed"));
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
      if (!url) throw new Error(t("adminUniversalDetail.errors.noUrl"));

      window.open(url, "_blank");
    } catch (e) {
      console.error(e);
      toast.error(t("adminUniversalDetail.errors.orderFilePreview"));
    }
  };

  const downloadOrderFile = async (file: SubmissionFile) => {
    try {
      const res = await fetch("/api/admin/order/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: file.file_path,
          bucket: file.bucket,
          mode: "download",
        }),
      });

      const { url } = await res.json();
      if (!url) throw new Error(t("adminUniversalDetail.errors.noUrl"));

      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
      toast.error(t("adminUniversalDetail.errors.orderFileDownload"));
    }
  };

  const deleteOrderFile = async (file: SubmissionFile) => {
    const confirmed = confirm(
      t("adminUniversalDetail.orderFiles.confirmDelete", {
        fileName: file.file_name,
      })
    );
    if (!confirmed) return;

    try {
      const { error: storageError } = await supabase.storage
        .from(file.bucket)
        .remove([file.file_path]);
      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("submission_files")
        .delete()
        .eq("id", file.id);
      if (dbError) throw dbError;

      toast.success(t("adminUniversalDetail.success.orderFileDeleted"));
      setOrderFiles((prev) => prev.filter((f) => f.id !== file.id));
    } catch (e) {
      console.error(e);
      toast.error(t("adminUniversalDetail.errors.orderFileDelete"));
    }
  };

  if (loading) {
    return (
      <p className="p-6 text-sm text-gray-500">
        {t("adminUniversalDetail.loading.data")}
      </p>
    );
  }

  if (!record) {
    return (
      <p className="p-6 text-sm text-gray-500">
        {t("adminUniversalDetail.empty.noRecord")}
      </p>
    );
  }

  const statusColor =
    record?.status === "approved"
      ? "text-green-600"
      : record?.status === "rejected"
      ? "text-red-600"
      : theme.color;

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className={`gap-1 ${theme.border} ${theme.color}`}
        >
          <ArrowLeft className="w-4 h-4" /> {t("adminUniversalDetail.actions.back")}
        </Button>
      </div>

      <Card className="rounded-2xl border bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <CardHeader className="pb-4 border-b bg-white rounded-t-2xl">
          <h2 className="text-xl font-semibold">
            {title} – #{record?.submission_id}
          </h2>

          <div className="text-sm text-gray-700 mt-1 space-y-1">
            <p>
              <strong>{t("adminUniversalDetail.labels.dealer")}:</strong> {dealerName}
            </p>
            <p>
              <strong>{t("adminUniversalDetail.labels.email")}:</strong> {dealerMail}
            </p>
            <p>
              <strong>{t("adminUniversalDetail.labels.date")}:</strong>{" "}
              {record?.datum || record?.created_at
                ? new Date((record?.datum || record?.created_at) ?? "").toLocaleDateString(
                    "de-CH"
                  )
                : "-"}
            </p>
            <p className={`mt-1 font-medium ${statusColor}`}>
              {t("adminUniversalDetail.labels.status")}: {getStatusText(record?.status)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Button
              size="sm"
              variant={record?.status === "approved" ? "default" : "outline"}
              onClick={() => updateStatus("approved")}
              className="rounded-full"
            >
              <Check className="w-4 h-4 mr-1" /> {t("adminUniversalDetail.actions.approve")}
            </Button>
            <Button
              size="sm"
              variant={record?.status === "rejected" ? "default" : "outline"}
              onClick={() => updateStatus("rejected")}
              className="rounded-full"
            >
              <X className="w-4 h-4 mr-1" /> {t("adminUniversalDetail.actions.reject")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateStatus("pending")}
              className="rounded-full"
            >
              <RotateCcw className="w-4 h-4 mr-1" /> {t("adminUniversalDetail.actions.reset")}
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
                  <Mail className="w-4 h-4 mr-1" /> {t("adminUniversalDetail.actions.preview")}
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleApproveWithMail}
                  disabled={sendingMail}
                  className="rounded-full"
                >
                  <Mail className="w-4 h-4 mr-1" /> {t("adminUniversalDetail.actions.approveWithMail")}
                </Button>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {typeFilter === "bestellung" && (
            <OrderDetailView
              submission={{
                submission_id: Number(record.submission_id),
                status: record.status ?? null,
              }}
              onStatusChange={fetchData}
            />
          )}

          {typeFilter === "bestellung" && (
            <div className="mt-6 max-w-xl">
              <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
                <h4 className="text-sm font-semibold text-blue-700 mb-3">
                  {t("adminUniversalDetail.labels.orderFiles")}
                </h4>

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
                        {t("adminUniversalDetail.actions.uploadPrompt")}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {t("adminUniversalDetail.labels.fileHint")}
                      </div>
                    </div>
                  </label>
                </div>

                {orderFiles.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    {t("adminUniversalDetail.empty.noFiles")}
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
                        <span className="flex-1 truncate">📄 {file.file_name}</span>

                        <button
                          type="button"
                          onClick={() => previewOrderFile(file)}
                          className="text-xs px-2 hover:text-blue-700"
                          title={t("adminUniversalDetail.actions.view")}
                        >
                          👁️
                        </button>

                        <button
                          type="button"
                          onClick={() => downloadOrderFile(file)}
                          className="text-xs px-2 hover:text-green-700"
                          title={t("adminUniversalDetail.actions.download")}
                        >
                          ⬇️
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteOrderFile(file)}
                          className="text-xs px-2 text-red-600 hover:text-red-800"
                          title={t("adminUniversalDetail.actions.delete")}
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

          {record?.typ === "sofortrabatt" && (
            <div className="mt-6 space-y-6 text-sm text-gray-700">
              <div className="rounded-xl border p-4 bg-gray-50">
                <h4 className="font-semibold mb-3">{t("adminSofortrabatt.detail.title")}</h4>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <p>
                    <strong>{t("adminUniversalDetail.labels.claimId")}:</strong> #{record.submission_id}
                  </p>
                  <p>
                    <strong>{t("adminUniversalDetail.labels.status")}:</strong> {record.status ?? "-"}
                  </p>

                  <p>
                    <strong>{t("adminUniversalDetail.labels.date")}:</strong>{" "}
                    {record.datum ? new Date(record.datum).toLocaleDateString("de-CH") : "-"}
                  </p>

                  <p>
                    <strong>{t("adminUniversalDetail.labels.discountLevel")}:</strong> {record.rabatt_level ?? "-"}
                  </p>

                  <p>
                    <strong>{t("adminUniversalDetail.labels.discountAmount")}:</strong> CHF {(Number(record.rabatt_betrag) || 0).toFixed(2)}
                  </p>

                  <p>
                    <strong>{t("adminUniversalDetail.labels.promotion")}:</strong>{" "}
                    {isPercentPromo
                      ? t("adminUniversalDetail.labels.percentPromo")
                      : t("adminUniversalDetail.labels.classicPromo")}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <h4 className="font-semibold mb-3">{t("adminUniversalDetail.labels.products")}</h4>

                {normalizedProducts.length === 0 ? (
                  <p className="text-xs text-gray-500">{t("adminUniversalDetail.empty.noProducts")}</p>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-xs">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="text-left p-2">{t("adminUniversalDetail.labels.product")}</th>
                            <th className="text-left p-2">{t("adminUniversalDetail.labels.category")}</th>
                            <th className="text-left p-2">{t("adminUniversalDetail.labels.ean")}</th>
                            <th className="text-right p-2">{t("adminUniversalDetail.labels.quantity")}</th>
                            <th className="text-right p-2">{t("adminUniversalDetail.labels.tvSize")}</th>
                            <th className="text-right p-2">{t("adminUniversalDetail.labels.salesPrice")}</th>
                            <th className="text-right p-2">{t("adminUniversalDetail.labels.discount")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {normalizedProducts.map((p: SofortrabattProduct, idx: number) => (
                            <tr key={idx} className="border-t">
                              <td className="p-2">{p.product_name || "-"}</td>
                              <td className="p-2">{p.category || "-"}</td>
                              <td className="p-2">{p.ean || "-"}</td>
                              <td className="p-2 text-right">{p.qty ?? 1}</td>
                              <td className="p-2 text-right">
                                {p.tv_size_inch ? `${p.tv_size_inch}"` : "-"}
                              </td>
                              <td className="p-2 text-right">
                                {typeof p.sales_price === "number"
                                  ? `CHF ${p.sales_price.toFixed(2)}`
                                  : "-"}
                              </td>
                              <td className="p-2 text-right">
                                {typeof p.calculated_discount === "number"
                                  ? `CHF ${p.calculated_discount.toFixed(2)}`
                                  : "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {isPercentPromo && (
                      <div className="mt-3 rounded-lg border bg-blue-50 p-3 text-xs text-gray-700">
                        <p className="font-semibold mb-1">{t("adminUniversalDetail.labels.calculationLogic")}</p>
                        <p>{t("adminUniversalDetail.calculation.line1")}</p>
                        <p>{t("adminUniversalDetail.calculation.line2")}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {record.kommentar && (
                <div className="rounded-xl border p-4 bg-gray-50">
                  <h4 className="font-semibold mb-2">{t("adminUniversalDetail.labels.comment")}</h4>
                  <p className="whitespace-pre-wrap">{record.kommentar}</p>
                </div>
              )}

              <div className="space-y-2">
                {invoicePaths.length === 0 ? (
                  <p className="text-xs text-gray-500">{t("adminUniversalDetail.empty.noInvoice")}</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {invoicePaths.map((path, idx) => {
                      const url = invoiceUrls[path];

                      return (
                        <div
                          key={path}
                          className="flex items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2"
                        >
                          <span className="text-xs truncate">
                            📎 {t("adminUniversalDetail.labels.invoice")} {idx + 1}: {path.split("/").pop() || path}
                          </span>

                          {url ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(url, "_blank")}
                            >
                              {t("adminUniversalDetail.actions.show")}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                const nextUrl = await loadInvoiceUrl(path);
                                if (nextUrl) {
                                  setInvoiceUrls((prev) => ({ ...prev, [path]: nextUrl }));
                                  window.open(nextUrl, "_blank");
                                }
                              }}
                            >
                              {t("adminUniversalDetail.actions.load")}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {record?.typ === "projekt" && (
            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">
                {t("adminUniversalDetail.labels.projectFiles")}
              </h4>

              {projectFiles.length === 0 ? (
                <p className="text-xs text-gray-500">
                  {t("adminUniversalDetail.empty.noProjectFiles")}
                </p>
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
              {t("adminUniversalDetail.labels.titleMailPreview")}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 mt-4 border-b flex gap-6 text-sm font-medium">
            <button
              onClick={() => setActiveTab("dealer")}
              className={`pb-3 -mb-px ${
                activeTab === "dealer"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500"
              }`}
            >
              {t("adminUniversalDetail.labels.dealerMail")}
            </button>

            <button
              onClick={() => setActiveTab("disti")}
              className={`pb-3 -mb-px ${
                activeTab === "disti"
                  ? "border-b-2 border-amber-600 text-amber-600"
                  : "text-gray-500"
              }`}
            >
              {t("adminUniversalDetail.labels.distiMail")}
            </button>
          </div>

          <div className="p-8 max-h-[85vh] overflow-auto w-full">
            {activeTab === "dealer" && (
              <div
                className="prose prose-sm max-w-none w-full"
                dangerouslySetInnerHTML={{
                  __html: dealerPreview || `<p>${t("adminUniversalDetail.empty.noPreviewDealer")}</p>`,
                }}
              />
            )}

            {activeTab === "disti" && (
              <div
                className="prose prose-sm max-w-none w-full"
                dangerouslySetInnerHTML={{
                  __html: distiPreview || `<p>${t("adminUniversalDetail.empty.noPreviewDisti")}</p>`,
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
"use client";

import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileDown, Upload } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/lib/theme/ThemeContext";
import ThemedActionButtons from "@/lib/theme/ThemedActionButtons";
import { useI18n } from "@/lib/i18n/I18nProvider";

type Produkt = {
  item_id: number;
  product_name?: string;
  menge?: number;
  preis?: number;
};

type Dealer = {
  dealer_id: number;
  store_name?: string;
  street?: string;
  zip?: string;
  city?: string;
  country?: string;
  login_nr?: string;
  email?: string;
  phone?: string;
};

type ProjectLog = {
  action?: string;
  created_at?: string;
};

type ProjectFileRow = {
  id: string;
  file_name: string;
  bucket: string;
  path: string;
  uploaded_at?: string;
};

export default function ProjektDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const theme = useTheme();
  const { t } = useI18n();

  const id = params.id as string;

  const [data, setData] = useState<{
    projekt: any;
    submission: any;
    produkte: Produkt[];
    dealer: Dealer | null;
    projectFiles: ProjectFileRow[];
    projectLogs: ProjectLog[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingDecision, setSavingDecision] = useState(false);

  const [editableProdukte, setEditableProdukte] = useState<Produkt[]>([]);
  const [originalProdukte, setOriginalProdukte] = useState<Produkt[]>([]);

  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      try {
        const isUUID =
          /^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}$/.test(
            id
          );

        let submissionQuery = supabase
          .from("submissions")
          .select("submission_id, dealer_id, project_id, typ, status, kommentar, datum")
          .eq("typ", "projekt")
          .order("datum", { ascending: false })
          .limit(1);

        submissionQuery = isUUID
          ? submissionQuery.eq("project_id", id)
          : submissionQuery.eq("submission_id", Number(id));

        const { data: submission, error: submissionError } =
          await submissionQuery.maybeSingle();

        if (submissionError) {
          console.error("submissionError:", submissionError);
          toast.error(t("adminProject.detail.errors.requestLoadFailed"));
          return;
        }

        if (!submission) {
          toast.error(t("adminProject.detail.errors.requestNotFound"));
          return;
        }

        const { data: projekt, error: projektError } = await supabase
          .from("project_requests")
          .select(`
            id,
            dealer_id,
            project_type,
            project_name,
            customer,
            location,
            start_date,
            end_date,
            comment,
            created_at
          `)
          .eq("id", submission.project_id)
          .maybeSingle();

        if (projektError) {
          console.error("projektError:", projektError);
          toast.error(t("adminProject.detail.errors.projectLoadFailed"));
          return;
        }

        if (!projekt) {
          toast.error(t("adminProject.detail.errors.projectNotFound"));
          return;
        }

        const { data: dealer, error: dealerError } = await supabase
          .from("dealers")
          .select(`
            dealer_id,
            store_name,
            street,
            zip,
            city,
            country,
            login_nr,
            email,
            phone
          `)
          .eq("dealer_id", projekt.dealer_id)
          .maybeSingle();

        if (dealerError) {
          console.error("dealerError:", dealerError);
        }

        const { data: produkte, error: produkteError } = await supabase
          .from("submission_items")
          .select("item_id, product_name, menge, preis")
          .eq("submission_id", submission.submission_id)
          .order("item_id", { ascending: true });

        if (produkteError) {
          console.error("produkteError:", produkteError);
          toast.error(t("adminProject.detail.errors.productsLoadFailed"));
          return;
        }

        const { data: projectFiles, error: filesError } = await supabase
          .from("project_files")
          .select("id, file_name, bucket, path, uploaded_at")
          .eq("project_id", projekt.id)
          .order("uploaded_at", { ascending: false });

        if (filesError) {
          console.error("filesError:", filesError);
        }

        const { data: projectLogs, error: logsError } = await supabase
          .from("project_logs")
          .select("action, created_at")
          .eq("project_id", projekt.id)
          .order("created_at", { ascending: true });

        if (logsError) {
          console.error("logsError:", logsError);
        }

        const loadedProdukte = (produkte ?? []) as Produkt[];

        setSignedUrls({});
        setEditableProdukte(loadedProdukte);
        setOriginalProdukte(loadedProdukte);

        setData({
          projekt,
          submission,
          produkte: loadedProdukte,
          dealer,
          projectFiles: (projectFiles ?? []) as ProjectFileRow[],
          projectLogs: projectLogs ?? [],
        });
      } catch (err: unknown) {
        console.error("Fehler beim Laden der Projektdaten:", err);

        if (err instanceof Error) {
          console.error("Message:", err.message);
          console.error("Stack:", err.stack);
        } else {
          try {
            console.error("Raw error:", JSON.stringify(err, null, 2));
          } catch {
            console.error("Raw error konnte nicht serialisiert werden.");
          }
        }

        toast.error(t("adminProject.detail.errors.loadGeneric"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, supabase, t]);

  const getSignedUrl = useCallback(
    async (bucket: string, path: string) => {
      const key = `${bucket}::${path}`;
      if (signedUrls[key]) return signedUrls[key];

      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 60 * 30);

      if (error || !data?.signedUrl) {
        console.error("createSignedUrl error:", error);
        toast.error(t("adminProject.detail.errors.fileOpenFailed"));
        return null;
      }

      setSignedUrls((prev) => ({ ...prev, [key]: data.signedUrl }));
      return data.signedUrl;
    },
    [signedUrls, supabase, t]
  );

  const setProduktPreis = (itemId: number, value: string) => {
    const parsed = value.trim() === "" ? 0 : Number(value.replace(",", "."));

    setEditableProdukte((prev) =>
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

  const hasPriceChanges = () => {
    if (editableProdukte.length !== originalProdukte.length) return true;

    return editableProdukte.some((p) => {
      const orig = originalProdukte.find((o) => o.item_id === p.item_id);
      const currentPreis = Number(p.preis || 0);
      const origPreis = Number(orig?.preis || 0);
      return currentPreis !== origPreis;
    });
  };

  const currentTotal = editableProdukte.reduce(
    (sum, p) => sum + (Number(p.preis) || 0) * (Number(p.menge) || 1),
    0
  );

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !data) return;

    try {
      setUploading(true);

      const dealerId =
        data.submission?.dealer_id ?? data.projekt?.dealer_id ?? "unknown";
      const safeName = file.name.replaceAll("/", "_");
      const filePath = `projects/${data.projekt.id}/dealer_${dealerId}/${Date.now()}_${safeName}`;

      const { error: upErr } = await supabase.storage
        .from("project-documents")
        .upload(filePath, file, { upsert: true });

      if (upErr) {
        console.error("uploadError:", upErr);
        toast.error(t("adminProject.detail.errors.uploadFailed"));
        return;
      }

      const { error: insertError } = await supabase.from("project_files").insert({
        project_id: data.projekt.id,
        file_name: file.name,
        bucket: "project-documents",
        path: filePath,
        file_size: file.size,
        mime_type: file.type,
        dealer_id: data.submission.dealer_id,
      });

      if (insertError) {
        console.error("projectFilesInsertError:", insertError);
        toast.error(t("adminProject.detail.errors.fileDbSaveFailed"));
        return;
      }

      const { data: refreshedFiles, error: refreshError } = await supabase
        .from("project_files")
        .select("id, file_name, bucket, path, uploaded_at")
        .eq("project_id", data.projekt.id)
        .order("uploaded_at", { ascending: false });

      if (refreshError) {
        console.error("refreshFilesError:", refreshError);
      }

      setSignedUrls({});

      setData((prev) =>
        prev ? { ...prev, projectFiles: (refreshedFiles ?? []) as ProjectFileRow[] } : prev
      );

      toast.success(t("adminProject.detail.success.fileUploaded"));
    } catch (e) {
      console.error("handleUpload catch:", e);
      toast.error(t("adminProject.detail.errors.uploadFailed"));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const addProjectLog = async (projectId: string, action: string) => {
    const { data: insertedLog, error } = await supabase
      .from("project_logs")
      .insert({
        project_id: projectId,
        action,
      })
      .select("action, created_at")
      .single();

    if (error) {
      console.error("Log insert error:", error);
      return null;
    }

    return insertedLog as ProjectLog;
  };

  const handleDecision = async (newStatus: "approved" | "rejected" | "pending") => {
    if (!data) return;

    try {
      setSavingDecision(true);

      let logAction = "";

      if (newStatus === "approved") {
        const changed = hasPriceChanges();

        if (changed) {
          for (const item of editableProdukte) {
            const { error: updateItemError } = await supabase
              .from("submission_items")
              .update({
                preis: Number(item.preis || 0),
              })
              .eq("item_id", item.item_id);

            if (updateItemError) {
              console.error("updateItemError:", updateItemError);
              toast.error(
                t("adminProject.detail.errors.priceSaveFailed", {
                  product: item.product_name || t("adminProject.detail.labels.unknownProduct"),
                })
              );
              return;
            }
          }

          logAction = "geändert und genehmigt";
        } else {
          logAction = "genehmigt";
        }
      }

      if (newStatus === "rejected") {
        logAction = "abgelehnt";
      }

      if (newStatus === "pending") {
        logAction = "zurückgesetzt";
      }

      const { error: submissionUpdateError } = await supabase
        .from("submissions")
        .update({ status: newStatus })
        .eq("submission_id", data.submission.submission_id);

      if (submissionUpdateError) {
        console.error("submissionUpdateError:", submissionUpdateError);
        toast.error(t("adminProject.detail.errors.statusUpdateFailed"));
        return;
      }

      let insertedLog: ProjectLog | null = null;
      if (logAction) {
        insertedLog = await addProjectLog(data.projekt.id, logAction);
      }

      setData((prev) =>
        prev
          ? {
              ...prev,
              submission: { ...prev.submission, status: newStatus },
              produkte: editableProdukte,
              projectLogs: insertedLog
                ? [...prev.projectLogs, insertedLog]
                : prev.projectLogs,
            }
          : prev
      );

      setOriginalProdukte(editableProdukte);

      if (newStatus === "approved") {
        toast.success(
          logAction === "geändert und genehmigt"
            ? t("adminProject.detail.success.counterOfferSavedApproved")
            : t("adminProject.detail.success.projectApproved")
        );
      } else if (newStatus === "rejected") {
        toast.success(t("adminProject.detail.success.projectRejected"));
      } else {
        toast.success(t("adminProject.detail.success.projectReset"));
      }
    } catch (e) {
      console.error("handleDecision catch:", e);
      toast.error(t("adminProject.detail.errors.actionFailed"));
    } finally {
      setSavingDecision(false);
    }
  };

  if (loading) {
    return (
      <p className="p-6 text-sm text-gray-500">
        {t("adminProject.detail.loading.data")}
      </p>
    );
  }

  if (!data) {
    return (
      <p className="p-6 text-sm text-gray-500">
        {t("adminProject.detail.errors.noRecord")}
      </p>
    );
  }

  const { projekt, submission, dealer, projectFiles, projectLogs } = data;

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <Button
        variant="outline"
        onClick={() => router.back()}
        className={`flex items-center gap-1 ${theme.border} ${theme.color}`}
      >
        <ArrowLeft className="w-4 h-4" /> {t("adminProject.detail.actions.back")}
      </Button>

      <Card className={`rounded-2xl border ${theme.border}`}>
        <CardHeader className="space-y-4">
          <h2 className="text-xl font-semibold">
            {t("adminProject.detail.title")} –{" "}
            {projekt.project_name || t("adminProject.detail.labels.untitled")}
          </h2>

          <div className="text-sm space-y-1">
            <p className="font-semibold">{t("adminProject.detail.sections.dealer")}</p>
            <p>{dealer?.store_name || "-"}</p>
            <p>
              {[dealer?.street, dealer?.zip, dealer?.city, dealer?.country]
                .filter(Boolean)
                .join(" ")}
            </p>
            <p>
              {t("adminProject.detail.labels.customerNumber")}: {dealer?.login_nr || "-"}
            </p>
          </div>

          <div className="text-sm space-y-1 border rounded p-3">
            <p className="font-semibold">
              {t("adminProject.detail.sections.projectInfo")}
            </p>
            <p>
              {t("adminProject.detail.labels.projectNumber")}: #{submission.submission_id}
            </p>
            <p>
              {t("adminProject.detail.labels.type")}: {projekt.project_type || "-"}
            </p>
            <p>
              {t("adminProject.detail.labels.customer")}: {projekt.customer || "-"}
            </p>
            <p>
              {t("adminProject.detail.labels.location")}: {projekt.location || "-"}
            </p>
            <p>
              {t("adminProject.detail.labels.period")}: {projekt.start_date || "-"} –{" "}
              {projekt.end_date || "-"}
            </p>
            <p className="text-sm">
              {t("adminProject.detail.labels.status")}{" "}
              {submission.status === "approved"
                ? t("adminProject.detail.status.approved")
                : submission.status === "rejected"
                ? t("adminProject.detail.status.rejected")
                : t("adminProject.detail.status.pending")}
            </p>

            {(projekt.comment || submission.kommentar) && (
              <>
                <p className="font-semibold mt-2">
                  {t("adminProject.detail.sections.comment")}
                </p>
                <p>{projekt.comment || submission.kommentar}</p>
              </>
            )}
          </div>

          <div className={savingDecision ? "pointer-events-none opacity-70" : ""}>
            <ThemedActionButtons
              onApprove={() => handleDecision("approved")}
              onReject={() => handleDecision("rejected")}
              onReset={() => handleDecision("pending")}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <FileDown className="w-4 h-4" />
                {t("adminProject.detail.sections.projectFiles")}
              </h3>

              <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>
                  {uploading
                    ? t("adminProject.detail.actions.uploading")
                    : t("adminProject.detail.actions.upload")}
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            </div>

            {projectFiles?.length > 0 ? (
              <ul className="space-y-2">
                {projectFiles.map((f) => (
                  <li key={f.id} className="flex justify-between text-sm">
                    <span className="truncate max-w-[70%]">{f.file_name}</span>

                    <button
                      type="button"
                      className="text-purple-600 hover:underline"
                      onClick={async () => {
                        const url = await getSignedUrl(f.bucket, f.path);
                        if (url) window.open(url, "_blank", "noopener,noreferrer");
                      }}
                    >
                      {t("adminProject.detail.actions.view")}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                {t("adminProject.detail.empty.noFiles")}
              </p>
            )}
          </div>

          <div className="border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-2 text-left">
                    {t("adminProject.detail.table.product")}
                  </th>
                  <th className="p-2 text-right">
                    {t("adminProject.detail.table.quantity")}
                  </th>
                  <th className="p-2 text-right">
                    {t("adminProject.detail.table.counterOffer")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {editableProdukte.map((p, i) => {
                  const original = originalProdukte.find((o) => o.item_id === p.item_id);
                  const changed =
                    Number(original?.preis || 0) !== Number(p.preis || 0);

                  return (
                    <tr key={p.item_id ?? i} className="border-t">
                      <td className="p-2">{p.product_name}</td>
                      <td className="p-2 text-right">{p.menge}</td>
                      <td className="p-2">
                        <div className="flex justify-end items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={p.preis ?? 0}
                            onChange={(e) => setProduktPreis(p.item_id, e.target.value)}
                            className={`w-32 rounded border px-2 py-1 text-right ${
                              changed ? "border-purple-500 bg-purple-50" : ""
                            }`}
                          />
                          <span className="min-w-[42px] text-right">CHF</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                <tr className="border-t font-semibold bg-gray-50">
                  <td className="p-2">{t("adminProject.detail.table.total")}</td>
                  <td className="p-2" />
                  <td className="p-2 text-right">{currentTotal.toFixed(2)} CHF</td>
                </tr>
              </tbody>
            </table>
          </div>

          {projectLogs?.length > 0 && (
            <div className="text-sm space-y-2 border rounded p-3">
              <p className="font-semibold">
                {t("adminProject.detail.sections.projectHistory")}
              </p>
              {projectLogs.map((l, i) => (
                <p key={i}>
                  {new Date(l.created_at || "").toLocaleString("de-CH")} –{" "}
                  {l.action || t("adminProject.detail.labels.created")}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
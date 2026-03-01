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

type Produkt = {
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

  // ✅ Signed URL Cache: key = `${bucket}::${path}`
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

        const { data: submission } = await submissionQuery.maybeSingle();

        if (!submission) {
          toast.error("Projektanfrage nicht gefunden.");
          return;
        }

        const { data: projekt } = await supabase
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

        if (!projekt) {
          toast.error("Projekt nicht gefunden.");
          return;
        }

        const { data: dealer } = await supabase
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

        const { data: produkte } = await supabase
          .from("submission_items")
          .select("product_name, menge, preis")
          .eq("submission_id", submission.submission_id);

        const { data: projectFiles } = await supabase
          .from("project_files")
          .select("id, file_name, bucket, path, uploaded_at")
          .eq("project_id", projekt.id)
          .order("uploaded_at", { ascending: false });

        const { data: projectLogs } = await supabase
          .from("project_logs")
          .select("action, created_at")
          .eq("project_id", projekt.id)
          .order("created_at", { ascending: true });

        setSignedUrls({}); // ✅ cache reset bei neuem Projekt

        setData({
          projekt,
          submission,
          produkte: produkte ?? [],
          dealer,
          projectFiles: (projectFiles ?? []) as ProjectFileRow[],
          projectLogs: projectLogs ?? [],
        });
      } catch (err) {
        console.error(err);
        toast.error("Fehler beim Laden der Projektdaten.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, supabase]);

  const getSignedUrl = useCallback(
    async (bucket: string, path: string) => {
      const key = `${bucket}::${path}`;
      if (signedUrls[key]) return signedUrls[key];

      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 60 * 30); // 30 min

      if (error || !data?.signedUrl) {
        console.error("createSignedUrl error:", error);
        toast.error("Datei konnte nicht geöffnet werden.");
        return null;
      }

      setSignedUrls((prev) => ({ ...prev, [key]: data.signedUrl }));
      return data.signedUrl;
    },
    [signedUrls, supabase]
  );

  if (loading) {
    return <p className="p-6 text-sm text-gray-500">Lade Daten…</p>;
  }

  if (!data) {
    return <p className="p-6 text-sm text-gray-500">Kein Datensatz gefunden.</p>;
  }

  const { projekt, submission, produkte, dealer, projectFiles, projectLogs } = data;

  const total = produkte.reduce(
    (sum, p) => sum + (Number(p.preis) || 0) * (Number(p.menge) || 1),
    0
  );

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // ✅ Konsistente Pfad-Logik (passt zu deinem Screenshot)
      const dealerId = submission?.dealer_id ?? projekt?.dealer_id ?? "unknown";
      const safeName = file.name.replaceAll("/", "_");
      const filePath = `projects/${projekt.id}/dealer_${dealerId}/${Date.now()}_${safeName}`;

      const { error: upErr } = await supabase.storage
        .from("project-documents")
        .upload(filePath, file, { upsert: true });

      if (upErr) {
        console.error(upErr);
        toast.error("Upload fehlgeschlagen.");
        return;
      }

      await supabase.from("project_files").insert({
        project_id: projekt.id,
        file_name: file.name,
        bucket: "project-documents",
        path: filePath,
        file_size: file.size,
        mime_type: file.type,
        dealer_id: submission.dealer_id,
      });

      const { data: refreshedFiles } = await supabase
        .from("project_files")
        .select("id, file_name, bucket, path, uploaded_at")
        .eq("project_id", projekt.id)
        .order("uploaded_at", { ascending: false });

      setSignedUrls({}); // ✅ neu signieren nach Upload

      setData((prev) =>
        prev ? { ...prev, projectFiles: (refreshedFiles ?? []) as ProjectFileRow[] } : prev
      );

      toast.success("Datei erfolgreich hochgeladen.");
    } catch (e) {
      console.error(e);
      toast.error("Upload fehlgeschlagen.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const updateStatus = async (newStatus: "approved" | "rejected" | "pending") => {
    try {
      await supabase
        .from("submissions")
        .update({ status: newStatus })
        .eq("submission_id", submission.submission_id);

      setData((prev) =>
        prev
          ? { ...prev, submission: { ...prev.submission, status: newStatus } }
          : prev
      );

      toast.success(
        newStatus === "approved"
          ? "Projekt bestätigt"
          : newStatus === "rejected"
          ? "Projekt abgelehnt"
          : "Status zurückgesetzt"
      );
    } catch (e) {
      console.error(e);
      toast.error("Status konnte nicht aktualisiert werden.");
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <Button
        variant="outline"
        onClick={() => router.back()}
        className={`flex items-center gap-1 ${theme.border} ${theme.color}`}
      >
        <ArrowLeft className="w-4 h-4" /> Zurück
      </Button>

      <Card className={`rounded-2xl border ${theme.border}`}>
        <CardHeader className="space-y-4">
          <h2 className="text-xl font-semibold">
            Projektanfrage – {projekt.project_name || "(ohne Titel)"}
          </h2>

          {/* HÄNDLER */}
          <div className="text-sm space-y-1">
            <p className="font-semibold">Händler</p>
            <p>{dealer?.store_name || "-"}</p>
            <p>
              {[dealer?.street, dealer?.zip, dealer?.city, dealer?.country]
                .filter(Boolean)
                .join(" ")}
            </p>
            <p>Kd.-Nr.: {dealer?.login_nr || "-"}</p>
          </div>

          {/* PROJEKTINFOS */}
          <div className="text-sm space-y-1 border rounded p-3">
            <p className="font-semibold">Projektinformationen</p>
            <p>Projekt-Nr.: #{submission.submission_id}</p>
            <p>Typ: {projekt.project_type || "-"}</p>
            <p>Kunde: {projekt.customer || "-"}</p>
            <p>Ort: {projekt.location || "-"}</p>
            <p>
              Zeitraum: {projekt.start_date || "-"} – {projekt.end_date || "-"}
            </p>
            <p className="text-sm">
              Status:{" "}
              {submission.status === "approved"
                ? "✅ Bestätigt"
                : submission.status === "rejected"
                ? "❌ Abgelehnt"
                : "⏳ Offen"}
            </p>

            {(projekt.comment || submission.kommentar) && (
              <>
                <p className="font-semibold mt-2">Kommentar</p>
                <p>{projekt.comment || submission.kommentar}</p>
              </>
            )}
          </div>

          <ThemedActionButtons
            onApprove={() => updateStatus("approved")}
            onReject={() => updateStatus("rejected")}
            onReset={() => updateStatus("pending")}
          />
        </CardHeader>

        <CardContent className="space-y-6">
          {/* DATEIEN */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <FileDown className="w-4 h-4" />
                Projektbelege
              </h3>

              <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>{uploading ? "Lädt…" : "Upload"}</span>
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
                      Anzeigen
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Keine Dateien vorhanden.</p>
            )}
          </div>

          {/* PRODUKTE */}
          <div className="border rounded">
            <table className="w-full text-sm">
              <tbody>
                {produkte.map((p, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{p.product_name}</td>
                    <td className="p-2 text-right">{p.menge}</td>
                    <td className="p-2 text-right">
                      {Number(p.preis || 0).toFixed(2)} CHF
                    </td>
                  </tr>
                ))}
                <tr className="border-t font-semibold">
                  <td className="p-2">Total</td>
                  <td className="p-2" />
                  <td className="p-2 text-right">{total.toFixed(2)} CHF</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* VERLAUF */}
          {projectLogs?.length > 0 && (
            <div className="text-sm space-y-2 border rounded p-3">
              <p className="font-semibold">Projektverlauf</p>
              {projectLogs.map((l, i) => (
                <p key={i}>
                  {new Date(l.created_at || "").toLocaleString("de-CH")} –{" "}
                  {l.action || "created"}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
"use client";

import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
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
    projectFiles: any[];
    projectLogs: ProjectLog[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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
          .select(
            "submission_id, dealer_id, project_id, typ, status, kommentar, datum"
          )
          .eq("typ", "projekt")
          .order("datum", { ascending: false })
          .limit(1);

        submissionQuery = isUUID
          ? submissionQuery.eq("project_id", id)
          : submissionQuery.eq("submission_id", Number(id));

        const { data: submission } =
          await submissionQuery.maybeSingle();

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

        setData({
          projekt,
          submission,
          produkte: produkte ?? [],
          dealer,
          projectFiles: projectFiles ?? [],
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

  if (loading) {
    return <p className="p-6 text-sm text-gray-500">Lade Daten…</p>;
  }

  if (!data) {
    return <p className="p-6 text-sm text-gray-500">Kein Datensatz gefunden.</p>;
  }

  const {
    projekt,
    submission,
    produkte,
    dealer,
    projectFiles,
    projectLogs,
  } = data;

  const total = produkte.reduce(
    (sum, p) =>
      sum + (Number(p.preis) || 0) * (Number(p.menge) || 1),
    0
  );

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const filePath = `${projekt.id}/${file.name}`;

      await supabase.storage
        .from("project-documents")
        .upload(filePath, file, { upsert: true });

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

      setData((prev) =>
        prev
          ? { ...prev, projectFiles: refreshedFiles ?? [] }
          : prev
      );

      toast.success("Datei erfolgreich hochgeladen.");
    } finally {
      setUploading(false);
    }
  };
  const updateStatus = async (
    newStatus: "approved" | "rejected" | "pending"
  ) => {
    try {
      await supabase
        .from("submissions")
        .update({ status: newStatus })
        .eq("submission_id", submission.submission_id);

      setData((prev) =>
        prev
          ? {
              ...prev,
              submission: {
                ...prev.submission,
                status: newStatus,
              },
            }
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

          {/* PROJEKTINFOS (aus PDF) */}
          <div className="text-sm space-y-1 border rounded p-3">
            <p className="font-semibold">Projektinformationen</p>
            <p>Projekt-Nr.: #{submission.submission_id}</p>
            <p>Typ: {projekt.project_type || "-"}</p>
            <p>Kunde: {projekt.customer || "-"}</p>
            <p>Ort: {projekt.location || "-"}</p>
            <p>
              Zeitraum: {projekt.start_date || "-"} –{" "}
              {projekt.end_date || "-"}
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
          {projectFiles?.length > 0 && (
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <FileDown className="w-4 h-4" />
                Projektbelege
              </h3>

              <ul className="space-y-2">
                {projectFiles.map((f) => (
                  <li key={f.id} className="flex justify-between text-sm">
                    <span>{f.file_name}</span>
                    <a
                      href={
                        supabase.storage
                          .from(f.bucket)
                          .getPublicUrl(f.path).data.publicUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:underline"
                    >
                      Anzeigen
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* PRODUKTE */}
          <div className="border rounded">
            <table className="w-full text-sm">
              <tbody>
                {produkte.map((p, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{p.product_name}</td>
                    <td className="p-2 text-right">{p.menge}</td>
                    <td className="p-2 text-right">
                      {Number(p.preis).toFixed(2)} CHF
                    </td>
                  </tr>
                ))}
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

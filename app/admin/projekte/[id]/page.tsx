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

export default function ProjektDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const theme = useTheme();

  const id = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      try {
        // 🔍 UUID prüfen
        const isUUID =
          /^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}$/.test(
            id
          );

        // 1️⃣ Submission laden
        let submissionQuery = supabase
          .from("submissions")
          .select(
            "submission_id, dealer_id, project_id, typ, status, kommentar, datum"
          )
          .eq("typ", "projekt")
          .order("datum", { ascending: false })
          .limit(1);

        if (isUUID) {
          submissionQuery = submissionQuery.eq("project_id", id);
        } else {
          submissionQuery = submissionQuery.eq(
            "submission_id",
            Number(id)
          );
        }

        const { data: submission, error: subError } =
          await submissionQuery.maybeSingle();

        if (subError || !submission) {
          toast.error("Projektanfrage nicht gefunden.");
          setLoading(false);
          return;
        }

        // 2️⃣ Projekt laden
        const { data: projekt } = await supabase
          .from("project_requests")
          .select(
            `
            id,
            dealer_id,
            store_name,
            project_type,
            project_name,
            customer,
            location,
            start_date,
            end_date,
            comment,
            created_at
          `
          )
          .eq("id", submission.project_id)
          .maybeSingle();

        if (!projekt) {
          toast.error("Projekt nicht gefunden.");
          setLoading(false);
          return;
        }

        // 3️⃣ Händler laden
        const { data: dealer } = await supabase
          .from("dealers")
          .select("name, email, mail_dealer")
          .eq("dealer_id", projekt.dealer_id)
          .maybeSingle();

        // 4️⃣ Produkte laden
        const { data: produkte } = await supabase
          .from("submission_items")
          .select("product_name, menge, preis")
          .eq("submission_id", submission.submission_id);

        // 5️⃣ Projekt-Dateien laden
        const { data: projectFiles } = await supabase
          .from("project_files")
          .select("id, file_name, bucket, path, uploaded_at")
          .eq("project_id", projekt.id)
          .order("uploaded_at", { ascending: false });

        setData({
          projekt,
          submission,
          produkte: produkte ?? [],
          dealer,
          projectFiles: projectFiles ?? [],
        });
      } catch (err: any) {
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
    return (
      <p className="p-6 text-sm text-gray-500">
        Kein Datensatz gefunden.
      </p>
    );
  }

  const { projekt, submission, produkte, dealer, projectFiles } = data;

  const total = produkte.reduce(
    (sum: number, p: Produkt) =>
      sum + (Number(p.preis) || 0) * (Number(p.menge) || 1),
    0
  );

  // 📤 Upload
  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const filePath = `${projekt.id}/${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("project-documents")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      await supabase.from("project_files").insert({
        project_id: projekt.id,
        file_name: file.name,
        bucket: "project-documents",
        path: filePath,
        file_size: file.size,
        mime_type: file.type,
        dealer_id: submission.dealer_id,
      });

      toast.success("Datei erfolgreich hochgeladen.");

      // Reload Dateien
      const { data: refreshedFiles } = await supabase
        .from("project_files")
        .select("id, file_name, bucket, path, uploaded_at")
        .eq("project_id", projekt.id)
        .order("uploaded_at", { ascending: false });

      setData((prev: any) => ({
        ...prev,
        projectFiles: refreshedFiles ?? [],
      }));
    } catch (err: any) {
      console.error(err);
      toast.error("Fehler beim Datei-Upload.");
    } finally {
      setUploading(false);
    }
  };

  const updateStatus = async (
    newStatus: "approved" | "rejected" | "pending"
  ) => {
    await supabase
      .from("submissions")
      .update({ status: newStatus })
      .eq("submission_id", submission.submission_id);

    setData((prev: any) => ({
      ...prev,
      submission: { ...prev.submission, status: newStatus },
    }));

    toast.success(`Status geändert: ${newStatus}`);
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
        <CardHeader className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Projektanfrage – {projekt.project_name || "(ohne Titel)"}
            </h2>

            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <Upload className="w-4 h-4" />
              {uploading ? "Upload…" : "Datei hochladen"}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.png,.jpeg"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          </div>

          <p>
            <strong>Händler:</strong> {dealer?.name ?? "–"}
          </p>

          <p>
            Status:{" "}
            {submission.status === "approved"
              ? "✅ Bestätigt"
              : submission.status === "rejected"
              ? "❌ Abgelehnt"
              : "⏳ Offen"}
          </p>

          <ThemedActionButtons
            onApprove={() => updateStatus("approved")}
            onReject={() => updateStatus("rejected")}
            onReset={() => updateStatus("pending")}
          />
        </CardHeader>

        <CardContent className="space-y-6">
          {projectFiles.length > 0 && (
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <FileDown className="w-4 h-4" />
                Projektbelege
              </h3>

              <ul className="space-y-2">
                {projectFiles.map((f: any) => (
                  <li
                    key={f.id}
                    className="flex justify-between text-sm"
                  >
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

          <div className="border rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Produkt</th>
                  <th className="p-2 text-right">Menge</th>
                  <th className="p-2 text-right">Preis</th>
                </tr>
              </thead>
              <tbody>
                {produkte.map((p: Produkt, i: number) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{p.product_name}</td>
                    <td className="p-2 text-right">{p.menge}</td>
                    <td className="p-2 text-right">
                      {Number(p.preis).toFixed(2)} CHF
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t font-semibold">
                  <td colSpan={2} className="p-2 text-right">
                    Total:
                  </td>
                  <td className="p-2 text-right">
                    {total.toFixed(2)} CHF
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

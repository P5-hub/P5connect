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
        console.log("🔎 Lade Projektdetails für ID:", id);

        // Prüfen, ob die ID eine UUID ist (z. B. project_id oder submission.project_id)
        const isUUID =
          /^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}$/.test(id);

        // 🟣 Schritt 1: Submission suchen (Typ "projekt")
        // Suche nach Submission anhand UUID → project_id oder submission_id
        // Falls ID keine UUID ist → treat as submission_id (number)
        let submissionQuery = supabase
          .from("submissions")
          .select("submission_id, dealer_id, project_id, typ, status, kommentar, datum")
          .eq("typ", "projekt")
          .order("datum", { ascending: false })
          .limit(1);

        if (isUUID) {
          submissionQuery = submissionQuery.eq("project_id", id);
        } else if (!isNaN(Number(id))) {
          submissionQuery = submissionQuery.eq("submission_id", Number(id));
        } else {
          console.warn("⚠️ ID-Format nicht erkannt:", id);
        }

        const { data: submission, error: subError } = await submissionQuery.maybeSingle();

        if (subError) {
          console.error("💥 Fehler beim Laden der Submission:", subError.message);
          toast.error("Fehler beim Laden der Projektanfrage.");
          setLoading(false);
          return;
        }

        if (!submission) {
          console.warn("⚠️ Keine Submission gefunden für ID:", id);
          toast.warning("Keine Projektanfrage gefunden.");
          setLoading(false);
          return;
        }

        console.log("✅ Gefundene Submission:", submission);

        // 🟣 Schritt 2: Projekt laden über submission.project_id
        let projekt = null;
        if (submission.project_id) {
          const { data: projData, error: projError } = await supabase
            .from("project_requests")
            .select(`
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
              project_date,
              created_at,
              project_file_url
            `)
            .eq("id", submission.project_id)
            .maybeSingle();

          if (projError) {
            console.error("💥 Fehler beim Laden der Projektanfrage:", projError.message);
            toast.error("Fehler beim Laden der Projektanfrage.");
            setLoading(false);
            return;
          }

          projekt = projData;
        }

        if (!projekt) {
          console.warn("⚠️ Kein Projekt mit dieser project_id gefunden:", submission.project_id);
          toast.warning("Projektanfrage nicht gefunden.");
          setLoading(false);
          return;
        }

        // 🟣 Schritt 3: Händler laden
        let dealerData = null;
        if (projekt.dealer_id) {
          const { data: dealer } = await supabase
            .from("dealers")
            .select("name, email, mail_dealer")
            .eq("dealer_id", projekt.dealer_id)
            .maybeSingle();
          dealerData = dealer;
        }

        // 🟣 Schritt 4: Produkte laden
        let produkte: Produkt[] = [];
        const { data: items, error: itemError } = await supabase
          .from("submission_items")
          .select("product_name, menge, preis")
          .eq("submission_id", submission.submission_id);

        if (itemError) {
          console.error("❌ Fehler beim Laden der Produkte:", itemError.message);
        } else {
          produkte = items ?? [];
        }

        // ✅ Daten setzen
        setData({ projekt, submission, produkte, dealer: dealerData });
      } catch (err: any) {
        console.error("💥 Fehler beim Laden:", err.message);
        toast.error("Ein unerwarteter Fehler ist aufgetreten.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, supabase]);



  if (loading)
    return <p className="p-6 text-sm text-gray-500">Lade Daten...</p>;
  if (!data)
    return (
      <p className="p-6 text-sm text-gray-500">
        Kein Datensatz gefunden oder ungültige ID.
      </p>
    );

  const { projekt, submission, produkte, dealer } = data;

  const dealerName = dealer?.name ?? "Unbekannt";
  const dealerMail =
    dealer?.mail_dealer || dealer?.email || "Keine Händler-E-Mail";

  const statusColor =
    submission?.status === "approved"
      ? "text-green-600"
      : submission?.status === "rejected"
      ? "text-red-600"
      : theme.color;

  const total = produkte?.reduce(
    (sum: number, p: Produkt) =>
      sum + (Number(p.preis) || 0) * (Number(p.menge) || 1),
    0
  );

  // 🟣 Datei-Upload-Handler (PDF / Bild)
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);

      const fileName = `${projekt.id}_${file.name}`;
      const { data: storageData, error: uploadError } = await supabase.storage
        .from("project_files")
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrl } = supabase.storage
        .from("project_files")
        .getPublicUrl(fileName);

      // 📦 Projekt mit Datei-URL aktualisieren
      const { error: updateError } = await supabase
        .from("project_requests")
        .update({ project_file_url: publicUrl.publicUrl })
        .eq("id", projekt.id);

      if (updateError) throw updateError;

      toast.success("Datei erfolgreich hochgeladen!");
      setData((prev: any) => ({
        ...prev,
        projekt: { ...prev.projekt, project_file_url: publicUrl.publicUrl },
      }));
    } catch (err: any) {
      console.error("💥 Upload-Fehler:", err.message);
      toast.error("Fehler beim Hochladen der Datei.");
    } finally {
      setUploading(false);
    }
  };

  const updateStatus = async (
    newStatus: "approved" | "rejected" | "pending"
  ) => {
    if (!submission?.submission_id) {
      toast.error(
        "Keine Submission gefunden, Status kann nicht aktualisiert werden."
      );
      return;
    }

    const { error } = await supabase
      .from("submissions")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("submission_id", submission.submission_id);

    if (error) {
      toast.error("Fehler beim Aktualisieren des Status.");
    } else {
      toast.success(`Status aktualisiert: ${newStatus}`);
      setData((prev: any) =>
        prev
          ? { ...prev, submission: { ...prev.submission, status: newStatus } }
          : prev
      );
    }
  };

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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Projektanfrage – {projekt?.project_name || "(ohne Titel)"}
            </h2>

            <div className="flex items-center gap-3">
              <label
                className={`cursor-pointer flex items-center gap-2 text-sm ${theme.color}`}
              >
                <Upload className="w-4 h-4" />
                {uploading ? "Wird hochgeladen..." : "Datei hochladen"}
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.png,.jpeg"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          <div className="text-sm text-gray-700 mt-2 space-y-1">
            <p>
              <strong>Händler:</strong> {dealerName}
            </p>
            <p>
              <strong>E-Mail:</strong> {dealerMail}
            </p>
            <p>
              <strong>Shop:</strong> {projekt?.store_name || "-"}
            </p>
            <p>
              <strong>Projekttyp:</strong> {projekt?.project_type || "-"}
            </p>
            <p>
              <strong>Kunde:</strong> {projekt?.customer || "-"}
            </p>
            <p>
              <strong>Standort:</strong> {projekt?.location || "-"}
            </p>
            <p>
              <strong>Zeitraum:</strong>{" "}
              {projekt?.start_date
                ? new Date(projekt.start_date).toLocaleDateString("de-CH")
                : "-"}{" "}
              –{" "}
              {projekt?.end_date
                ? new Date(projekt.end_date).toLocaleDateString("de-CH")
                : "-"}
            </p>
            <p>
              <strong>Erstellt am:</strong>{" "}
              {projekt?.created_at
                ? new Date(projekt.created_at).toLocaleDateString("de-CH")
                : "-"}
            </p>

            {submission && (
              <p className={`mt-1 font-medium ${statusColor}`}>
                Status:{" "}
                {submission.status === "approved"
                  ? "✅ Bestätigt"
                  : submission.status === "rejected"
                  ? "❌ Abgelehnt"
                  : "⏳ Offen"}
              </p>
            )}
          </div>

          {submission && (
            <ThemedActionButtons
              onApprove={() => updateStatus("approved")}
              onReject={() => updateStatus("rejected")}
              onReset={() => updateStatus("pending")}
            />
          )}
        </CardHeader>

        <CardContent className="pt-4 text-sm text-gray-700 space-y-5">
          {projekt?.comment && (
            <div className="p-3 bg-gray-50 rounded-md">
              <strong>Kommentar:</strong> {projekt.comment}
            </div>
          )}

          {projekt?.project_file_url && (
            <div className="flex items-center gap-2 mt-4">
              <FileDown className="w-4 h-4 text-purple-600" />
              <a
                href={projekt.project_file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline"
              >
                Projektdatei anzeigen / herunterladen
              </a>
            </div>
          )}

          {produkte?.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                  <tr>
                    <th className="px-3 py-2 text-left">Produkt</th>
                    <th className="px-3 py-2 text-right">Menge</th>
                    <th className="px-3 py-2 text-right">Zielpreis (CHF)</th>
                  </tr>
                </thead>
                <tbody>
                  {produkte.map((p: Produkt, idx: number) => (
                    <tr
                      key={idx}
                      className="border-t hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-3 py-1">{p.product_name || "–"}</td>
                      <td className="px-3 py-1 text-right">
                        {p.menge ?? "-"}
                      </td>
                      <td className="px-3 py-1 text-right">
                        {p.preis ? Number(p.preis).toFixed(2) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold bg-gray-50 border-t">
                    <td colSpan={2} className="px-3 py-2 text-right">
                      Gesamtbetrag:
                    </td>
                    <td className="px-3 py-2 text-right">
                      {total.toFixed(2)} CHF
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">
              Keine Produkte für dieses Projekt gefunden.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

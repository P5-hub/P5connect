"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, X, Mail } from "lucide-react";
import { sendOrderNotification } from "@/lib/notifications/sendOrderNotification";
import { toast } from "sonner";

type SubmissionType =
  | "bestellung"
  | "projekt"
  | "support"
  | "aktion"
  | "sofortrabatt";

interface Props {
  submissionType: SubmissionType;
}

export default function UnifiedDashboard({ submissionType }: Props) {
  const supabase = createClient();
  const params = useSearchParams();
  const routeParams = useParams();
  const router = useRouter();

  const id = params.get("id") || routeParams?.id;

  const [data, setData] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMail, setSendingMail] = useState(false);

  // 🔹 Daten laden
  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      let main: any = null;
      let rows: any[] = [];

      try {
        let response: any = {};

        switch (submissionType) {
          // 🔸 Sofortrabatt
          case "sofortrabatt":
            response = await supabase
              .from("sofortrabatt_claims")
              .select(`
                *,
                dealers ( name, email, login_nr ),
                promotion_offers ( title, valid_from, valid_to, promotion_price )
              `)
              .eq("claim_id", Number(id))
              .single();
            if (response.error)
              console.error("❌ Fehler bei Sofortrabatt:", response.error.message);
            main = response.data ?? null;
            break;

          // 🔸 Aktionen / Promotions
          case "aktion":
            response = await supabase
              .from("promotion_offers")
              .select(`
                *,
                products ( product_name, ean, retail_price )
              `)
              .eq("id", Number(id))
              .single();
            if (response.error)
              console.error("❌ Fehler bei Aktion:", response.error.message);
            main = response.data ?? null;
            break;

          // 🔸 Support, Projekte & Bestellungen
          case "support":
          case "projekt":
          case "bestellung":
            response = await supabase
              .from("submissions")
              .select(`
                submission_id,
                typ,
                datum,
                status,
                sony_share,
                dealer_id,
                order_comment,
                project_file_path,
                dealers ( name, email )
              `)

              .eq("submission_id", Number(id))
              .eq("typ", submissionType)
              .maybeSingle();

            if (response.error)
              console.error(`❌ Fehler bei ${submissionType}:`, response.error.message);
            main = response.data ?? null;

            // 🔹 Zugehörige Items laden
            const itemsRes = await supabase
              .from("submission_items")
              .select(
                "item_id, ean, product_name, menge, preis, lowest_price_brutto, lowest_price_netto"
              )
              .eq("submission_id", Number(id));

            if (itemsRes.error)
              console.warn(
                "⚠️ Konnte Items nicht laden:",
                itemsRes.error.message
              );
            else rows = itemsRes.data ?? [];
            break;

          default:
            console.warn("⚠️ Unbekannter SubmissionType:", submissionType);
        }
      } catch (err: any) {
        console.error("💥 Unerwarteter Fehler beim Laden:", err.message || err);
      }

      if (!main) {
        console.warn("⚠️ Keine Daten gefunden", { id, submissionType });
      }

      setData(main);
      setItems(rows);
      setLoading(false);
    })();
  }, [id, submissionType, supabase]);

  // 🔹 Support-Gesamtbetrag berechnen (aus Items)
  const totalSupport =
    submissionType === "support"
      ? items.reduce(
          (sum, i) =>
            sum + (Number(i.preis) || 0) * (Number(i.menge) || 1),
          0
        )
      : 0;

  // 🔹 Status ändern
  async function updateStatus(status: "approved" | "rejected") {
    try {
      if (submissionType === "aktion") {
        await supabase
          .from("promotion_offers")
          .update({ active: status === "approved" })
          .eq("id", Number(id));
      } else if (submissionType === "sofortrabatt") {
        await supabase
          .from("sofortrabatt_claims")
          .update({ status })
          .eq("claim_id", Number(id));
      } else {
        await supabase
          .from("submissions")
          .update({ status })
          .eq("submission_id", Number(id));
      }

      toast.success(
        `Status auf "${status === "approved" ? "Bestätigt" : "Abgelehnt"}" geändert.`
      );
      setData((prev: any) => ({ ...prev, status }));
    } catch (err) {
      console.error("❌ Fehler beim Status-Update:", err);
    }
  }

  // 🔹 Mail senden
  async function handleMail() {
    if (submissionType === "projekt") {
      try {
        setSendingMail(true);
        await sendOrderNotification({
          submissionId: Number(id),
          stage: "confirmed",
          preview: false,
        });
        toast.success("Projekt-E-Mail erfolgreich gesendet.");
      } catch (err) {
        console.error("❌ Fehler beim E-Mail-Versand (Projekt):", err);
        toast.error("Fehler beim E-Mail-Versand.");
      } finally {
        setSendingMail(false);
      }
      return;
    }

    if (submissionType === "aktion" || submissionType === "sofortrabatt") {
      toast.info("E-Mail-Versand für diesen Typ ist nicht verfügbar.");
      return;
    }

    try {
      setSendingMail(true);
      await sendOrderNotification({
        submissionId: Number(id),
        stage: "confirmed",
        preview: false,
      });
      toast.success("E-Mail erfolgreich gesendet.");
    } catch (err) {
      console.error("❌ Fehler beim E-Mail-Versand:", err);
      toast.error("Fehler beim E-Mail-Versand.");
    } finally {
      setSendingMail(false);
    }
  }

  // 🔹 UI-Zustände
  if (loading)
    return <p className="p-6 text-sm text-gray-500">Lade Daten...</p>;
  if (!data)
    return <p className="p-6 text-sm text-gray-500">Kein Datensatz gefunden.</p>;

  const titleMap: Record<SubmissionType, string> = {
    bestellung: "Bestellung",
    projekt: "Projektanfrage",
    support: "Sell-Out Support",
    aktion: "Promotion / Aktion",
    sofortrabatt: "Sofortrabatt Claim",
  };

  const status =
    data.status ??
    (typeof data.active === "boolean"
      ? data.active
        ? "approved"
        : "rejected"
      : "pending");

  const hasSupportFile =
    submissionType === "support" && !!data?.project_file_path;

  const fileUrl = hasSupportFile
    ? supabase.storage
        .from("support-documents")
        .getPublicUrl(data.project_file_path).data.publicUrl
    : null;


    console.log("DEBUG support file:", {
    submissionType,
    project_file_path: data?.project_file_path,
    fileUrl,
  });

    

  return (
    <div className="p-6 space-y-6">
      {/* 🔹 Header mit Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Zurück
        </Button>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => updateStatus("approved")}
            className="border-green-600 text-green-700 hover:bg-green-100/40"
          >
            <Check className="w-4 h-4 mr-1" /> Bestätigen
          </Button>
          <Button
            variant="outline"
            onClick={() => updateStatus("rejected")}
            className="border-red-600 text-red-700 hover:bg-red-100/40"
          >
            <X className="w-4 h-4 mr-1" /> Ablehnen
          </Button>
          {submissionType !== "aktion" &&
            submissionType !== "sofortrabatt" && (
              <Button
                variant="outline"
                onClick={handleMail}
                disabled={sendingMail}
                className="border-blue-600 text-blue-700 hover:bg-blue-100/40"
              >
                <Mail className="w-4 h-4 mr-1" />{" "}
                {sendingMail ? "Sende..." : "E-Mail senden"}
              </Button>
            )}
        </div>
      </div>

      {/* 🔹 Datenkarte */}
      <Card className="border rounded-2xl shadow-sm">
        <CardHeader>
          <h2 className="text-lg font-semibold">
            {titleMap[submissionType]} – #{id}
          </h2>

          {submissionType === "aktion" ? (
            <>
              <p className="text-sm text-gray-700">{data.title}</p>
              <p className="text-xs text-gray-500">
                Gültig: {data.valid_from ?? "-"} bis {data.valid_to ?? "-"}
              </p>
            </>
          ) : submissionType === "sofortrabatt" ? (
            <>
              <p className="text-sm text-gray-700">
                Händler: {data.dealers?.name ?? "Unbekannt"}
              </p>
              <p className="text-xs text-gray-500">
                Rabattbetrag: {data.rabatt_betrag ?? "–"} CHF
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500">
                {data.dealers?.name ?? data.dealers?.email ?? "–"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {data.datum
                  ? new Date(data.datum).toLocaleDateString("de-CH")
                  : "-"}
              </p>
              {submissionType === "support" && totalSupport > 0 && (
                <p className="text-xs text-gray-500">
                  Gesamt-Support: {totalSupport.toFixed(2)} CHF
                </p>
              )}
              {submissionType === "support" && (
                hasSupportFile ? (
                  <div className="mt-2">
                    <a
                      href={fileUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                    >
                      📎 Beleg anzeigen
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Kein Beleg hochgeladen.</p>
                )
              )}








            </>
          )}

          <p className="text-xs text-gray-400 mt-1">
            Status:{" "}
            {status === "approved"
              ? "✅ Bestätigt"
              : status === "rejected"
              ? "❌ Abgelehnt"
              : "⏳ Offen"}
          </p>
        </CardHeader>

        {/* 🔹 Item-Tabelle */}
        <CardContent>
          {items.length > 0 ? (
            <table className="w-full text-sm border-t">
              <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="px-2 py-2 text-left">EAN</th>
                  <th className="px-2 py-2 text-left">Produkt</th>
                  <th className="px-2 py-2 text-right">Menge</th>
                  <th className="px-2 py-2 text-right">Preis (CHF)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.item_id} className="border-b">
                    <td className="px-2 py-1">{item.ean}</td>
                    <td className="px-2 py-1">{item.product_name}</td>
                    <td className="px-2 py-1 text-right">{item.menge}</td>
                    <td className="px-2 py-1 text-right">
                      {item.preis ? item.preis.toFixed(2) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : submissionType === "support" ? (
            <div className="text-sm text-gray-600 italic">
              Kein Sell-Out Support – Werbe-/Event-/Sonstiger Support.
            </div>
          ) : (
            <p className="text-sm text-gray-500">Keine Positionen gefunden.</p>
          )}
        </CardContent>

      </Card>
    </div>
  );
}

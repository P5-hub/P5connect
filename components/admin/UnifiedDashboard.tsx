"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, X, Mail } from "lucide-react";
import { sendOrderNotification } from "@/lib/notifications/sendOrderNotification";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/I18nProvider";

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
  const searchParams = useSearchParams();
  const routeParams = useParams();
  const router = useRouter();
  const { t, lang } = useI18n();

  const paramId = searchParams.get("id");
  const routeId = routeParams?.id;
  const id = Array.isArray(routeId) ? routeId[0] : routeId || paramId;

  const [data, setData] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMail, setSendingMail] = useState(false);

  const uiText = useMemo(() => {
    return {
      back:
        lang === "de"
          ? "Zurück"
          : lang === "en"
          ? "Back"
          : lang === "fr"
          ? "Retour"
          : lang === "it"
          ? "Indietro"
          : lang === "rm"
          ? "Enavos"
          : "Back",

      approve:
        lang === "de"
          ? "Bestätigen"
          : lang === "en"
          ? "Approve"
          : lang === "fr"
          ? "Approuver"
          : lang === "it"
          ? "Approva"
          : lang === "rm"
          ? "Approvar"
          : "Approve",

      reject:
        lang === "de"
          ? "Ablehnen"
          : lang === "en"
          ? "Reject"
          : lang === "fr"
          ? "Refuser"
          : lang === "it"
          ? "Rifiuta"
          : lang === "rm"
          ? "Refusar"
          : "Reject",

      sendMail:
        lang === "de"
          ? "E-Mail senden"
          : lang === "en"
          ? "Send email"
          : lang === "fr"
          ? "Envoyer l’e-mail"
          : lang === "it"
          ? "Invia e-mail"
          : lang === "rm"
          ? "Trametter e-mail"
          : "Send email",

      sending:
        lang === "de"
          ? "Sende..."
          : lang === "en"
          ? "Sending..."
          : lang === "fr"
          ? "Envoi..."
          : lang === "it"
          ? "Invio..."
          : lang === "rm"
          ? "Tramett..."
          : "Sending...",

      loading:
        lang === "de"
          ? "Lade Daten..."
          : lang === "en"
          ? "Loading data..."
          : lang === "fr"
          ? "Chargement des données..."
          : lang === "it"
          ? "Caricamento dati..."
          : lang === "rm"
          ? "Chargiar datas..."
          : "Loading data...",

      notFound:
        lang === "de"
          ? "Kein Datensatz gefunden."
          : lang === "en"
          ? "No record found."
          : lang === "fr"
          ? "Aucun enregistrement trouvé."
          : lang === "it"
          ? "Nessun record trovato."
          : lang === "rm"
          ? "Nagìn record chattà."
          : "No record found.",

      valid:
        lang === "de"
          ? "Gültig"
          : lang === "en"
          ? "Valid"
          : lang === "fr"
          ? "Valable"
          : lang === "it"
          ? "Valido"
          : lang === "rm"
          ? "Valabel"
          : "Valid",

      to:
        lang === "de"
          ? "bis"
          : lang === "en"
          ? "to"
          : lang === "fr"
          ? "au"
          : lang === "it"
          ? "fino a"
          : lang === "rm"
          ? "fin"
          : "to",

      dealer:
        lang === "de"
          ? "Händler"
          : lang === "en"
          ? "Dealer"
          : lang === "fr"
          ? "Revendeur"
          : lang === "it"
          ? "Rivenditore"
          : lang === "rm"
          ? "Commerziant"
          : "Dealer",

      unknown:
        lang === "de"
          ? "Unbekannt"
          : lang === "en"
          ? "Unknown"
          : lang === "fr"
          ? "Inconnu"
          : lang === "it"
          ? "Sconosciuto"
          : lang === "rm"
          ? "Nunenconuschent"
          : "Unknown",

      discountAmount:
        lang === "de"
          ? "Rabattbetrag"
          : lang === "en"
          ? "Discount amount"
          : lang === "fr"
          ? "Montant de la remise"
          : lang === "it"
          ? "Importo sconto"
          : lang === "rm"
          ? "Import dal rabat"
          : "Discount amount",

      totalSupport:
        lang === "de"
          ? "Gesamt-Support"
          : lang === "en"
          ? "Total support"
          : lang === "fr"
          ? "Support total"
          : lang === "it"
          ? "Supporto totale"
          : lang === "rm"
          ? "Support total"
          : "Total support",

      showReceipt:
        lang === "de"
          ? "Beleg anzeigen"
          : lang === "en"
          ? "Show receipt"
          : lang === "fr"
          ? "Afficher le justificatif"
          : lang === "it"
          ? "Mostra documento"
          : lang === "rm"
          ? "Mussar mussament"
          : "Show receipt",

      noReceipt:
        lang === "de"
          ? "Kein Beleg hochgeladen."
          : lang === "en"
          ? "No receipt uploaded."
          : lang === "fr"
          ? "Aucun justificatif téléchargé."
          : lang === "it"
          ? "Nessun documento caricato."
          : lang === "rm"
          ? "Nagìn mussament chargià."
          : "No receipt uploaded.",

      status:
        lang === "de"
          ? "Status"
          : lang === "en"
          ? "Status"
          : lang === "fr"
          ? "Statut"
          : lang === "it"
          ? "Stato"
          : lang === "rm"
          ? "Status"
          : "Status",

      approvedStatus:
        lang === "de"
          ? "✅ Bestätigt"
          : lang === "en"
          ? "✅ Approved"
          : lang === "fr"
          ? "✅ Approuvé"
          : lang === "it"
          ? "✅ Approvato"
          : lang === "rm"
          ? "✅ Approvà"
          : "✅ Approved",

      rejectedStatus:
        lang === "de"
          ? "❌ Abgelehnt"
          : lang === "en"
          ? "❌ Rejected"
          : lang === "fr"
          ? "❌ Refusé"
          : lang === "it"
          ? "❌ Rifiutato"
          : lang === "rm"
          ? "❌ Refusà"
          : "❌ Rejected",

      pendingStatus:
        lang === "de"
          ? "⏳ Offen"
          : lang === "en"
          ? "⏳ Open"
          : lang === "fr"
          ? "⏳ Ouvert"
          : lang === "it"
          ? "⏳ Aperto"
          : lang === "rm"
          ? "⏳ Avert"
          : "⏳ Open",

      ean: "EAN",

      product:
        lang === "de"
          ? "Produkt"
          : lang === "en"
          ? "Product"
          : lang === "fr"
          ? "Produit"
          : lang === "it"
          ? "Prodotto"
          : lang === "rm"
          ? "Product"
          : "Product",

      quantity:
        lang === "de"
          ? "Menge"
          : lang === "en"
          ? "Quantity"
          : lang === "fr"
          ? "Quantité"
          : lang === "it"
          ? "Quantità"
          : lang === "rm"
          ? "Quantitad"
          : "Quantity",

      priceChf:
        lang === "de"
          ? "Preis (CHF)"
          : lang === "en"
          ? "Price (CHF)"
          : lang === "fr"
          ? "Prix (CHF)"
          : lang === "it"
          ? "Prezzo (CHF)"
          : lang === "rm"
          ? "Pretsch (CHF)"
          : "Price (CHF)",

      noSelloutSupport:
        lang === "de"
          ? "Kein Sell-Out Support – Werbe-/Event-/Sonstiger Support."
          : lang === "en"
          ? "No sell-out support – advertising / event / other support."
          : lang === "fr"
          ? "Pas de support Sell-Out – support publicité / événement / autre."
          : lang === "it"
          ? "Nessun supporto Sell-Out – supporto pubblicità / evento / altro."
          : lang === "rm"
          ? "Nagìn support Sell-Out – support da reclama / event / auter."
          : "No sell-out support – advertising / event / other support.",

      noItems:
        lang === "de"
          ? "Keine Positionen gefunden."
          : lang === "en"
          ? "No items found."
          : lang === "fr"
          ? "Aucune position trouvée."
          : lang === "it"
          ? "Nessuna posizione trovata."
          : lang === "rm"
          ? "Naginas posiziuns chattadas."
          : "No items found.",

      statusUpdatedApproved:
        lang === "de"
          ? 'Status auf "Bestätigt" geändert.'
          : lang === "en"
          ? 'Status changed to "Approved".'
          : lang === "fr"
          ? 'Statut modifié en "Approuvé".'
          : lang === "it"
          ? 'Stato cambiato in "Approvato".'
          : lang === "rm"
          ? 'Status midà sin "Approvà".'
          : 'Status changed to "Approved".',

      statusUpdatedRejected:
        lang === "de"
          ? 'Status auf "Abgelehnt" geändert.'
          : lang === "en"
          ? 'Status changed to "Rejected".'
          : lang === "fr"
          ? 'Statut modifié en "Refusé".'
          : lang === "it"
          ? 'Stato cambiato in "Rifiutato".'
          : lang === "rm"
          ? 'Status midà sin "Refusà".'
          : 'Status changed to "Rejected".',

      projectMailSuccess:
        lang === "de"
          ? "Projekt-E-Mail erfolgreich gesendet."
          : lang === "en"
          ? "Project email sent successfully."
          : lang === "fr"
          ? "E-mail projet envoyé avec succès."
          : lang === "it"
          ? "E-mail progetto inviata con successo."
          : lang === "rm"
          ? "E-mail dal project tramessa cun success."
          : "Project email sent successfully.",

      mailSuccess:
        lang === "de"
          ? "E-Mail erfolgreich gesendet."
          : lang === "en"
          ? "Email sent successfully."
          : lang === "fr"
          ? "E-mail envoyé avec succès."
          : lang === "it"
          ? "E-mail inviata con successo."
          : lang === "rm"
          ? "E-mail tramessa cun success."
          : "Email sent successfully.",

      mailError:
        lang === "de"
          ? "Fehler beim E-Mail-Versand."
          : lang === "en"
          ? "Error sending email."
          : lang === "fr"
          ? "Erreur lors de l’envoi de l’e-mail."
          : lang === "it"
          ? "Errore durante l’invio dell’e-mail."
          : lang === "rm"
          ? "Errur tar trametter l’e-mail."
          : "Error sending email.",

      mailUnavailable:
        lang === "de"
          ? "E-Mail-Versand für diesen Typ ist nicht verfügbar."
          : lang === "en"
          ? "Email sending is not available for this type."
          : lang === "fr"
          ? "L’envoi d’e-mail n’est pas disponible pour ce type."
          : lang === "it"
          ? "L’invio e-mail non è disponibile per questo tipo."
          : lang === "rm"
          ? "Trametter e-mail n’è betg disponibel per quest tip."
          : "Email sending is not available for this type.",
    };
  }, [lang]);

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      let main: any = null;
      let rows: any[] = [];

      try {
        let response: any = {};

        switch (submissionType) {
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

            if (response.error) {
              console.error(
                "❌ Fehler bei Sofortrabatt:",
                response.error.message
              );
            }

            main = response.data ?? null;
            break;

          case "aktion":
            response = await supabase
              .from("promotion_offers")
              .select(`
                *,
                products ( product_name, ean, retail_price )
              `)
              .eq("id", Number(id))
              .single();

            if (response.error) {
              console.error("❌ Fehler bei Aktion:", response.error.message);
            }

            main = response.data ?? null;
            break;

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

            if (response.error) {
              console.error(
                `❌ Fehler bei ${submissionType}:`,
                response.error.message
              );
            }

            main = response.data ?? null;

            const itemsRes = await supabase
              .from("submission_items")
              .select(
                "item_id, ean, product_name, menge, preis, lowest_price_brutto, lowest_price_netto"
              )
              .eq("submission_id", Number(id));

            if (itemsRes.error) {
              console.warn(
                "⚠️ Konnte Items nicht laden:",
                itemsRes.error.message
              );
            } else {
              rows = itemsRes.data ?? [];
            }
            break;

          default:
            console.warn("⚠️ Unbekannter SubmissionType:", submissionType);
        }
      } catch (err: any) {
        console.error(
          "💥 Unerwarteter Fehler beim Laden:",
          err?.message || err
        );
      }

      if (!main) {
        console.warn("⚠️ Keine Daten gefunden", { id, submissionType });
      }

      setData(main);
      setItems(rows);
      setLoading(false);
    })();
  }, [id, submissionType, supabase]);

  const totalSupport =
    submissionType === "support"
      ? items.reduce(
          (sum, i) => sum + (Number(i.preis) || 0) * (Number(i.menge) || 1),
          0
        )
      : 0;

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
        status === "approved"
          ? uiText.statusUpdatedApproved
          : uiText.statusUpdatedRejected
      );

      setData((prev: any) => ({ ...prev, status }));
    } catch (err) {
      console.error("❌ Fehler beim Status-Update:", err);
    }
  }

  async function handleMail() {
    if (submissionType === "projekt") {
      try {
        setSendingMail(true);
        await sendOrderNotification({
          submissionId: Number(id),
          stage: "confirmed",
          preview: false,
        });
        toast.success(uiText.projectMailSuccess);
      } catch (err) {
        console.error("❌ Fehler beim E-Mail-Versand (Projekt):", err);
        toast.error(uiText.mailError);
      } finally {
        setSendingMail(false);
      }
      return;
    }

    if (submissionType === "aktion" || submissionType === "sofortrabatt") {
      toast.info(uiText.mailUnavailable);
      return;
    }

    try {
      setSendingMail(true);
      await sendOrderNotification({
        submissionId: Number(id),
        stage: "confirmed",
        preview: false,
      });
      toast.success(uiText.mailSuccess);
    } catch (err) {
      console.error("❌ Fehler beim E-Mail-Versand:", err);
      toast.error(uiText.mailError);
    } finally {
      setSendingMail(false);
    }
  }

  if (loading) {
    return <p className="p-6 text-sm text-gray-500">{uiText.loading}</p>;
  }

  if (!data) {
    return <p className="p-6 text-sm text-gray-500">{uiText.notFound}</p>;
  }

  const titleMap: Record<SubmissionType, string> = {
    bestellung: t("adminCommon.orders"),
    projekt: t("adminCommon.projects"),
    support: t("adminCommon.support"),
    aktion: t("adminCommon.promotions"),
    sofortrabatt: t("adminCommon.instantDiscount"),
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
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> {uiText.back}
        </Button>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => updateStatus("approved")}
            className="border-green-600 text-green-700 hover:bg-green-100/40"
          >
            <Check className="w-4 h-4 mr-1" /> {uiText.approve}
          </Button>

          <Button
            variant="outline"
            onClick={() => updateStatus("rejected")}
            className="border-red-600 text-red-700 hover:bg-red-100/40"
          >
            <X className="w-4 h-4 mr-1" /> {uiText.reject}
          </Button>

          {submissionType !== "aktion" && submissionType !== "sofortrabatt" && (
            <Button
              variant="outline"
              onClick={handleMail}
              disabled={sendingMail}
              className="border-blue-600 text-blue-700 hover:bg-blue-100/40"
            >
              <Mail className="w-4 h-4 mr-1" />{" "}
              {sendingMail ? uiText.sending : uiText.sendMail}
            </Button>
          )}
        </div>
      </div>

      <Card className="border rounded-2xl shadow-sm">
        <CardHeader>
          <h2 className="text-lg font-semibold">
            {titleMap[submissionType]} – #{id}
          </h2>

          {submissionType === "aktion" ? (
            <>
              <p className="text-sm text-gray-700">{data.title}</p>
              <p className="text-xs text-gray-500">
                {uiText.valid}: {data.valid_from ?? "-"} {uiText.to}{" "}
                {data.valid_to ?? "-"}
              </p>
            </>
          ) : submissionType === "sofortrabatt" ? (
            <>
              <p className="text-sm text-gray-700">
                {uiText.dealer}: {data.dealers?.name ?? uiText.unknown}
              </p>
              <p className="text-xs text-gray-500">
                {uiText.discountAmount}: {data.rabatt_betrag ?? "–"} CHF
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
                  {uiText.totalSupport}: {totalSupport.toFixed(2)} CHF
                </p>
              )}

              {submissionType === "support" &&
                (hasSupportFile ? (
                  <div className="mt-2">
                    <a
                      href={fileUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                    >
                      📎 {uiText.showReceipt}
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">{uiText.noReceipt}</p>
                ))}
            </>
          )}

          <p className="text-xs text-gray-400 mt-1">
            {uiText.status}:{" "}
            {status === "approved"
              ? uiText.approvedStatus
              : status === "rejected"
              ? uiText.rejectedStatus
              : uiText.pendingStatus}
          </p>
        </CardHeader>

        <CardContent>
          {items.length > 0 ? (
            <table className="w-full text-sm border-t">
              <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="px-2 py-2 text-left">{uiText.ean}</th>
                  <th className="px-2 py-2 text-left">{uiText.product}</th>
                  <th className="px-2 py-2 text-right">{uiText.quantity}</th>
                  <th className="px-2 py-2 text-right">{uiText.priceChf}</th>
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
              {uiText.noSelloutSupport}
            </div>
          ) : (
            <p className="text-sm text-gray-500">{uiText.noItems}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
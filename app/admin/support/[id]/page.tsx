"use client";

import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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

type SupportDetails = {
  support_typ?: string;
  betrag?: number;
};

type SubmissionLog = {
  id?: number;
  action?: string;
  old_status?: string | null;
  new_status?: string | null;
  changed?: boolean;
  counter_amount?: number | null;
  note?: string | null;
  created_at?: string;
};

type SubmissionFile = {
  id: number;
  file_name: string;
  file_path: string;
  bucket: string;
};

type SubmissionFileWithUrl = SubmissionFile & {
  signedUrl: string | null;
};

const SUPPORT_BUCKET = "support-invoices";

function normalizeSupportKind(supportTyp?: string | null) {
  const s = String(supportTyp ?? "").toLowerCase();

  if (s.includes("sellout") || s.includes("sell-out")) return "sellout";
  if (s.includes("marketing") || s.includes("werbung")) return "marketing";
  if (s.includes("event")) return "event";
  if (s.includes("other") || s.includes("sonstig")) return "other";

  return "unknown";
}

function supportLabelFromKind(kind: string, lang: string) {
  if (lang === "de") {
    switch (kind) {
      case "sellout":
        return "Sell-Out Support";
      case "marketing":
        return "Marketing Support";
      case "event":
        return "Event Support";
      case "other":
        return "Sonstiger Support";
      default:
        return "Support";
    }
  }

  if (lang === "en") {
    switch (kind) {
      case "sellout":
        return "Sell-Out Support";
      case "marketing":
        return "Marketing Support";
      case "event":
        return "Event Support";
      case "other":
        return "Other Support";
      default:
        return "Support";
    }
  }

  if (lang === "fr") {
    switch (kind) {
      case "sellout":
        return "Support Sell-Out";
      case "marketing":
        return "Support marketing";
      case "event":
        return "Support événement";
      case "other":
        return "Autre support";
      default:
        return "Support";
    }
  }

  if (lang === "it") {
    switch (kind) {
      case "sellout":
        return "Supporto Sell-Out";
      case "marketing":
        return "Supporto marketing";
      case "event":
        return "Supporto evento";
      case "other":
        return "Altro supporto";
      default:
        return "Supporto";
    }
  }

  if (lang === "rm") {
    switch (kind) {
      case "sellout":
        return "Support Sell-Out";
      case "marketing":
        return "Support da marketing";
      case "event":
        return "Support d’event";
      case "other":
        return "Auter support";
      default:
        return "Support";
    }
  }

  return "Support";
}

export default function SupportDetailPage() {
  const { t, lang } = useI18n();
  const { id: rawId } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const theme = useTheme();

  const id = rawId ? Number(rawId) : null;

  const [data, setData] = useState<{
    submission?: any;
    items?: Produkt[];
    claim?: any;
    supportDetails?: SupportDetails;
    logs?: SubmissionLog[];
    files?: SubmissionFileWithUrl[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [savingDecision, setSavingDecision] = useState(false);
  const [filesLoading, setFilesLoading] = useState(false);

  const [editableItems, setEditableItems] = useState<Produkt[]>([]);
  const [originalItems, setOriginalItems] = useState<Produkt[]>([]);

  const [editableSupportDetails, setEditableSupportDetails] =
    useState<SupportDetails | null>(null);
  const [originalSupportDetails, setOriginalSupportDetails] =
    useState<SupportDetails | null>(null);

  const uiText = useMemo(() => {
    return {
      loading:
        lang === "de"
          ? "Lade Support-Daten..."
          : lang === "en"
          ? "Loading support data..."
          : lang === "fr"
          ? "Chargement des données de support..."
          : lang === "it"
          ? "Caricamento dati supporto..."
          : lang === "rm"
          ? "Chargiar datas da support..."
          : "Loading support data...",

      notFound:
        lang === "de"
          ? "Kein Support-Datensatz gefunden."
          : lang === "en"
          ? "No support record found."
          : lang === "fr"
          ? "Aucun enregistrement de support trouvé."
          : lang === "it"
          ? "Nessun record di support trovato."
          : lang === "rm"
          ? "Nagìn record da support chattà."
          : "No support record found.",

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

      email: "E-Mail",

      date:
        lang === "de"
          ? "Datum"
          : lang === "en"
          ? "Date"
          : lang === "fr"
          ? "Date"
          : lang === "it"
          ? "Data"
          : lang === "rm"
          ? "Data"
          : "Date",

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

      approved:
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

      rejected:
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

      pending:
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

      supportLoadFailed:
        lang === "de"
          ? "Support-Datensatz konnte nicht geladen werden."
          : lang === "en"
          ? "Support record could not be loaded."
          : lang === "fr"
          ? "L’enregistrement de support n’a pas pu être chargé."
          : lang === "it"
          ? "Il record di supporto non ha potuto essere caricato."
          : lang === "rm"
          ? "Il record da support n’ha betg pudì vegnir chargià."
          : "Support record could not be loaded.",

      supportItemsLoadFailed:
        lang === "de"
          ? "Support-Positionen konnten nicht geladen werden."
          : lang === "en"
          ? "Support items could not be loaded."
          : lang === "fr"
          ? "Les positions de support n’ont pas pu être chargées."
          : lang === "it"
          ? "Le posizioni di supporto non hanno potuto essere caricate."
          : lang === "rm"
          ? "Las posiziuns da support n’han betg pudì vegnir chargiadas."
          : "Support items could not be loaded.",

      unexpectedError:
        lang === "de"
          ? "Ein unerwarteter Fehler ist aufgetreten."
          : lang === "en"
          ? "An unexpected error occurred."
          : lang === "fr"
          ? "Une erreur inattendue s’est produite."
          : lang === "it"
          ? "Si è verificato un errore imprevisto."
          : lang === "rm"
          ? "Ina errur nunspetgada è capità."
          : "An unexpected error occurred.",

      priceSaveFailedPrefix:
        lang === "de"
          ? "Preis für"
          : lang === "en"
          ? "Price for"
          : lang === "fr"
          ? "Le prix pour"
          : lang === "it"
          ? "Il prezzo per"
          : lang === "rm"
          ? "Il pretsch per"
          : "Price for",

      couldNotBeSaved:
        lang === "de"
          ? "konnte nicht gespeichert werden."
          : lang === "en"
          ? "could not be saved."
          : lang === "fr"
          ? "n’a pas pu être enregistré."
          : lang === "it"
          ? "non ha potuto essere salvato."
          : lang === "rm"
          ? "n’ha betg pudì vegnir memorisà."
          : "could not be saved.",

      supportAmountSaveFailed:
        lang === "de"
          ? "Support-Betrag konnte nicht gespeichert werden."
          : lang === "en"
          ? "Support amount could not be saved."
          : lang === "fr"
          ? "Le montant du support n’a pas pu être enregistré."
          : lang === "it"
          ? "L’importo del supporto non ha potuto essere salvato."
          : lang === "rm"
          ? "L’import da support n’ha betg pudì vegnir memorisà."
          : "Support amount could not be saved.",

      statusUpdateFailed:
        lang === "de"
          ? "Fehler beim Aktualisieren des Status."
          : lang === "en"
          ? "Error updating status."
          : lang === "fr"
          ? "Erreur lors de la mise à jour du statut."
          : lang === "it"
          ? "Errore durante l’aggiornamento dello stato."
          : lang === "rm"
          ? "Errur tar l’actualisaziun dal status."
          : "Error updating status.",

      actionFailed:
        lang === "de"
          ? "Aktion konnte nicht ausgeführt werden."
          : lang === "en"
          ? "Action could not be executed."
          : lang === "fr"
          ? "L’action n’a pas pu être exécutée."
          : lang === "it"
          ? "L’azione non ha potuto essere eseguita."
          : lang === "rm"
          ? "L’acziun n’ha betg pudì vegnir exequida."
          : "Action could not be executed.",

      unknownDealer:
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

      noDealerMail:
        lang === "de"
          ? "Keine Händler-E-Mail"
          : lang === "en"
          ? "No dealer email"
          : lang === "fr"
          ? "Pas d’e-mail revendeur"
          : lang === "it"
          ? "Nessuna e-mail rivenditore"
          : lang === "rm"
          ? "Nagina e-mail dal commerziant"
          : "No dealer email",

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

      unitPriceCounter:
        lang === "de"
          ? "Einzelpreis / Gegenvorschlag (CHF)"
          : lang === "en"
          ? "Unit price / counter offer (CHF)"
          : lang === "fr"
          ? "Prix unitaire / contre-offre (CHF)"
          : lang === "it"
          ? "Prezzo unitario / controfferta (CHF)"
          : lang === "rm"
          ? "Pretsch unitari / cuntraofferta (CHF)"
          : "Unit price / counter offer (CHF)",

      total:
        lang === "de"
          ? "Total (CHF)"
          : lang === "en"
          ? "Total (CHF)"
          : lang === "fr"
          ? "Total (CHF)"
          : lang === "it"
          ? "Totale (CHF)"
          : lang === "rm"
          ? "Total (CHF)"
          : "Total (CHF)",

      totalSupport:
        lang === "de"
          ? "Gesamt-Support:"
          : lang === "en"
          ? "Total support:"
          : lang === "fr"
          ? "Support total :"
          : lang === "it"
          ? "Supporto totale:"
          : lang === "rm"
          ? "Support total:"
          : "Total support:",

      noProducts:
        lang === "de"
          ? "Keine Produkte im Support-Datensatz."
          : lang === "en"
          ? "No products in the support record."
          : lang === "fr"
          ? "Aucun produit dans l’enregistrement de support."
          : lang === "it"
          ? "Nessun prodotto nel record di supporto."
          : lang === "rm"
          ? "Nagins products en il record da support."
          : "No products in the support record.",

      comment:
        lang === "de"
          ? "Kommentar:"
          : lang === "en"
          ? "Comment:"
          : lang === "fr"
          ? "Commentaire :"
          : lang === "it"
          ? "Commento:"
          : lang === "rm"
          ? "Commentari:"
          : "Comment:",

      nonSelloutDetails:
        lang === "de"
          ? "Non-Sell-Out Support Details"
          : lang === "en"
          ? "Non sell-out support details"
          : lang === "fr"
          ? "Détails du support non Sell-Out"
          : lang === "it"
          ? "Dettagli supporto non Sell-Out"
          : lang === "rm"
          ? "Detagls dal support betg Sell-Out"
          : "Non sell-out support details",

      supportType:
        lang === "de"
          ? "Support-Typ"
          : lang === "en"
          ? "Support type"
          : lang === "fr"
          ? "Type de support"
          : lang === "it"
          ? "Tipo di supporto"
          : lang === "rm"
          ? "Tip da support"
          : "Support type",

      sonyShareCounter:
        lang === "de"
          ? "Sony Kostenanteil / Gegenvorschlag"
          : lang === "en"
          ? "Sony cost share / counter offer"
          : lang === "fr"
          ? "Part Sony / contre-offre"
          : lang === "it"
          ? "Quota costi Sony / controfferta"
          : lang === "rm"
          ? "Part da custs Sony / cuntraofferta"
          : "Sony cost share / counter offer",

      receipts:
        lang === "de"
          ? "Belege"
          : lang === "en"
          ? "Receipts"
          : lang === "fr"
          ? "Justificatifs"
          : lang === "it"
          ? "Documenti"
          : lang === "rm"
          ? "Mussaments"
          : "Receipts",

      receiptsLoading:
        lang === "de"
          ? "Belege werden geladen…"
          : lang === "en"
          ? "Receipts are loading…"
          : lang === "fr"
          ? "Chargement des justificatifs…"
          : lang === "it"
          ? "Caricamento documenti…"
          : lang === "rm"
          ? "Mussaments vegnan chargiads…"
          : "Receipts are loading…",

      fileLinkFailedSuffix:
        lang === "de"
          ? "vorhanden, aber Link konnte nicht erstellt werden."
          : lang === "en"
          ? "exists, but the link could not be created."
          : lang === "fr"
          ? "est disponible, mais le lien n’a pas pu être créé."
          : lang === "it"
          ? "è presente, ma il link non ha potuto essere creato."
          : lang === "rm"
          ? "è avant ma il link n’ha betg pudì vegnir creà."
          : "exists, but the link could not be created.",

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

      history:
        lang === "de"
          ? "Supportverlauf"
          : lang === "en"
          ? "Support history"
          : lang === "fr"
          ? "Historique du support"
          : lang === "it"
          ? "Storico supporto"
          : lang === "rm"
          ? "Istorgia dal support"
          : "Support history",

      changedApproved:
        lang === "de"
          ? "geändert und genehmigt"
          : lang === "en"
          ? "changed and approved"
          : lang === "fr"
          ? "modifié et approuvé"
          : lang === "it"
          ? "modificato e approvato"
          : lang === "rm"
          ? "midà ed approvà"
          : "changed and approved",

      approvedWord:
        lang === "de"
          ? "genehmigt"
          : lang === "en"
          ? "approved"
          : lang === "fr"
          ? "approuvé"
          : lang === "it"
          ? "approvato"
          : lang === "rm"
          ? "approvà"
          : "approved",

      rejectedWord:
        lang === "de"
          ? "abgelehnt"
          : lang === "en"
          ? "rejected"
          : lang === "fr"
          ? "refusé"
          : lang === "it"
          ? "rifiutato"
          : lang === "rm"
          ? "refusà"
          : "rejected",

      resetWord:
        lang === "de"
          ? "zurückgesetzt"
          : lang === "en"
          ? "reset"
          : lang === "fr"
          ? "réinitialisé"
          : lang === "it"
          ? "reimpostato"
          : lang === "rm"
          ? "reinitialisà"
          : "reset",

      approveSuccessChanged:
        lang === "de"
          ? "Gegenvorschlag gespeichert und Support genehmigt."
          : lang === "en"
          ? "Counter offer saved and support approved."
          : lang === "fr"
          ? "Contre-offre enregistrée et support approuvé."
          : lang === "it"
          ? "Controfferta salvata e supporto approvato."
          : lang === "rm"
          ? "Cuntraofferta memorisada e support approvà."
          : "Counter offer saved and support approved.",

      approveSuccess:
        lang === "de"
          ? "✅ Status auf 'Bestätigt' gesetzt."
          : lang === "en"
          ? "✅ Status set to 'Approved'."
          : lang === "fr"
          ? "✅ Statut défini sur « Approuvé »."
          : lang === "it"
          ? "✅ Stato impostato su 'Approvato'."
          : lang === "rm"
          ? "✅ Status mess sin 'Approvà'."
          : "✅ Status set to 'Approved'.",

      rejectSuccess:
        lang === "de"
          ? "❌ Status auf 'Abgelehnt' gesetzt."
          : lang === "en"
          ? "❌ Status set to 'Rejected'."
          : lang === "fr"
          ? "❌ Statut défini sur « Refusé »."
          : lang === "it"
          ? "❌ Stato impostato su 'Rifiutato'."
          : lang === "rm"
          ? "❌ Status mess sin 'Refusà'."
          : "❌ Status set to 'Rejected'.",

      resetSuccess:
        lang === "de"
          ? "🔄 Status auf 'Offen' zurückgesetzt."
          : lang === "en"
          ? "🔄 Status reset to 'Open'."
          : lang === "fr"
          ? "🔄 Statut réinitialisé sur « Ouvert »."
          : lang === "it"
          ? "🔄 Stato reimpostato su 'Aperto'."
          : lang === "rm"
          ? "🔄 Status reinitialisà sin 'Avert'."
          : "🔄 Status reset to 'Open'.",
    };
  }, [lang]);

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      setFilesLoading(false);

      try {
        const { data: submission, error: subError } = await supabase
          .from("submissions")
          .select(`
            submission_id,
            dealer_id,
            typ,
            datum,
            status,
            kommentar,
            project_file_path,
            dealers ( name, email, mail_dealer )
          `)
          .eq("submission_id", id)
          .eq("typ", "support")
          .maybeSingle();

        if (subError || !submission) {
          console.error("⚠️ Keine Submission:", subError);
          toast.error(uiText.supportLoadFailed);
          setLoading(false);
          return;
        }

        const { data: items, error: itemsError } = await supabase
          .from("submission_items")
          .select("item_id, product_name, menge, preis")
          .eq("submission_id", id)
          .order("item_id", { ascending: true });

        if (itemsError) {
          console.error("itemsError:", itemsError);
          toast.error(uiText.supportItemsLoadFailed);
          setLoading(false);
          return;
        }

        let claim = null;
        if (submission.dealer_id) {
          const { data: claimData } = await supabase
            .from("support_claims")
            .select("*")
            .eq("dealer_id", submission.dealer_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          claim = claimData;
        }

        const { data: supportDetails, error: detailsError } = await supabase
          .from("support_details")
          .select("support_typ, betrag")
          .eq("submission_id", id)
          .maybeSingle();

        if (detailsError) {
          console.error("supportDetailsError:", detailsError);
        }

        const { data: logs, error: logsError } = await supabase
          .from("submission_logs")
          .select(
            "id, action, old_status, new_status, changed, counter_amount, note, created_at"
          )
          .eq("submission_id", id)
          .eq("typ", "support")
          .order("created_at", { ascending: true });

        if (logsError) {
          console.error("logsError:", logsError);
        }

        const { data: submissionFiles, error: filesError } = await supabase
          .from("submission_files")
          .select("id, file_name, file_path, bucket")
          .eq("submission_id", id)
          .order("id", { ascending: true });

        if (filesError) {
          console.error("submissionFilesError:", filesError);
        }

        setFilesLoading(true);

        let resolvedFiles: SubmissionFileWithUrl[] = [];

        if (submissionFiles && submissionFiles.length > 0) {
          resolvedFiles = await Promise.all(
            submissionFiles.map(async (file) => {
              const bucket = file.bucket || SUPPORT_BUCKET;

              const { data: signed, error: signedErr } = await supabase.storage
                .from(bucket)
                .createSignedUrl(file.file_path, 60 * 30);

              if (signedErr) {
                console.error("❌ Signed URL Error:", signedErr);
                return {
                  ...file,
                  signedUrl: null,
                };
              }

              return {
                ...file,
                signedUrl: signed?.signedUrl ?? null,
              };
            })
          );
        } else if (submission.project_file_path) {
          const { data: signed, error: signedErr } = await supabase.storage
            .from(SUPPORT_BUCKET)
            .createSignedUrl(submission.project_file_path, 60 * 30);

          resolvedFiles = [
            {
              id: -1,
              file_name:
                submission.project_file_path.split("/").pop() || uiText.receipts,
              file_path: submission.project_file_path,
              bucket: SUPPORT_BUCKET,
              signedUrl: signedErr ? null : (signed?.signedUrl ?? null),
            },
          ];
        }

        setFilesLoading(false);

        const loadedItems = (items ?? []) as Produkt[];
        const loadedDetails = (supportDetails ?? null) as SupportDetails | null;

        setEditableItems(loadedItems);
        setOriginalItems(loadedItems);
        setEditableSupportDetails(loadedDetails);
        setOriginalSupportDetails(loadedDetails);

        setData({
          submission,
          items: loadedItems,
          claim,
          supportDetails: loadedDetails ?? undefined,
          logs: (logs ?? []) as SubmissionLog[],
          files: resolvedFiles,
        });
      } catch (err: unknown) {
        console.error("💥 Fehler beim Laden:", err);
        toast.error(uiText.unexpectedError);
      } finally {
        setLoading(false);
        setFilesLoading(false);
      }
    })();
  }, [id, supabase, uiText]);

  const setProduktPreis = (itemId: number, value: string) => {
    const parsed = value.trim() === "" ? 0 : Number(value.replace(",", "."));

    setEditableItems((prev) =>
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

  const setSupportBetrag = (value: string) => {
    const parsed = value.trim() === "" ? 0 : Number(value.replace(",", "."));

    setEditableSupportDetails((prev) => ({
      ...(prev ?? {}),
      betrag: Number.isNaN(parsed) ? 0 : parsed,
    }));
  };

  const hasSelloutChanges = () => {
    if (editableItems.length !== originalItems.length) return true;

    return editableItems.some((p) => {
      const orig = originalItems.find((o) => o.item_id === p.item_id);
      return Number(p.preis || 0) !== Number(orig?.preis || 0);
    });
  };

  const hasNonSelloutChanges = () => {
    return (
      Number(editableSupportDetails?.betrag || 0) !==
      Number(originalSupportDetails?.betrag || 0)
    );
  };

  const isSelloutSupport = useMemo(() => {
    let kind = normalizeSupportKind(data?.supportDetails?.support_typ);
    if (kind === "unknown") {
      kind = editableItems.length > 0 ? "sellout" : "unknown";
    }
    return kind === "sellout";
  }, [data?.supportDetails?.support_typ, editableItems.length]);

  const totalSupport = editableItems.reduce(
    (sum, p) => sum + (Number(p.preis) || 0) * (Number(p.menge) || 1),
    0
  );

  const insertSubmissionLog = async ({
    action,
    oldStatus,
    newStatus,
    changed,
    counterAmount,
    note,
  }: {
    action: string;
    oldStatus: string | null;
    newStatus: string | null;
    changed: boolean;
    counterAmount?: number | null;
    note?: string | null;
  }) => {
    if (!data?.submission?.submission_id) return null;

    const payload = {
      submission_id: data.submission.submission_id,
      dealer_id: data.submission.dealer_id ?? null,
      typ: "support",
      action,
      old_status: oldStatus,
      new_status: newStatus,
      changed,
      counter_amount: counterAmount ?? null,
      note: note ?? null,
    };

    const { error } = await supabase
      .from("submission_logs" as any)
      .insert(payload);

    if (error) {
      console.error("submissionLogInsertError:", error);
      console.error("message:", error.message);
      console.error("details:", error.details);
      console.error("hint:", error.hint);
      console.error("code:", error.code);
      return null;
    }

    return {
      id: -Date.now(),
      action,
      old_status: oldStatus,
      new_status: newStatus,
      changed,
      counter_amount: counterAmount ?? null,
      note: note ?? null,
      created_at: new Date().toISOString(),
    } as SubmissionLog;
  };

  const updateStatus = async (
    newStatus: "approved" | "rejected" | "pending"
  ) => {
    if (!data?.submission?.submission_id) return;

    try {
      setSavingDecision(true);

      const oldStatus = data.submission.status ?? null;
      const changed = isSelloutSupport
        ? hasSelloutChanges()
        : hasNonSelloutChanges();

      if (newStatus === "approved" && changed) {
        if (isSelloutSupport) {
          for (const item of editableItems) {
            const { error: itemUpdateError } = await supabase
              .from("submission_items")
              .update({
                preis: Number(item.preis || 0),
                updated_at: new Date().toISOString(),
              })
              .eq("item_id", item.item_id);

            if (itemUpdateError) {
              console.error("itemUpdateError:", itemUpdateError);
              toast.error(
                `${uiText.priceSaveFailedPrefix} ${
                  item.product_name || uiText.product
                } ${uiText.couldNotBeSaved}`
              );
              return;
            }
          }
        } else if (editableSupportDetails) {
          const { error: detailsUpdateError } = await supabase
            .from("support_details")
            .update({
              betrag: Number(editableSupportDetails.betrag || 0),
            })
            .eq("submission_id", data.submission.submission_id);

          if (detailsUpdateError) {
            console.error("detailsUpdateError:", detailsUpdateError);
            toast.error(uiText.supportAmountSaveFailed);
            return;
          }
        }
      }

      const { error } = await supabase
        .from("submissions")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("submission_id", data.submission.submission_id);

      if (error) {
        console.error("submissionUpdateError:", error);
        toast.error(uiText.statusUpdateFailed);
        return;
      }

      let action = "";
      let note: string | null = null;
      let counterAmount: number | null = null;

      if (newStatus === "approved") {
        if (changed) {
          action = "approved_with_counter_offer";
          note = "Gegenvorschlag durch Admin";
          counterAmount = isSelloutSupport
            ? totalSupport
            : Number(editableSupportDetails?.betrag || 0);
        } else {
          action = "approved";
        }
      } else if (newStatus === "rejected") {
        action = "rejected";
      } else {
        action = "reset_to_pending";
      }

      const insertedLog = await insertSubmissionLog({
        action,
        oldStatus,
        newStatus,
        changed: newStatus === "approved" ? changed : false,
        counterAmount,
        note,
      });

      setData((prev) =>
        prev
          ? {
              ...prev,
              submission: { ...prev.submission, status: newStatus },
              items: editableItems,
              supportDetails: editableSupportDetails ?? undefined,
              logs: insertedLog
                ? [...(prev.logs ?? []), insertedLog]
                : prev.logs,
            }
          : prev
      );

      setOriginalItems(editableItems);
      setOriginalSupportDetails(editableSupportDetails);

      if (newStatus === "approved") {
        toast.success(
          changed ? uiText.approveSuccessChanged : uiText.approveSuccess
        );
      } else if (newStatus === "rejected") {
        toast.success(uiText.rejectSuccess);
      } else {
        toast.success(uiText.resetSuccess);
      }
    } catch (err) {
      console.error("updateStatus catch:", err);
      toast.error(uiText.actionFailed);
    } finally {
      setSavingDecision(false);
    }
  };

  if (loading) {
    return <p className="p-6 text-sm text-gray-500">{uiText.loading}</p>;
  }

  if (!data) {
    return <p className="p-6 text-sm text-gray-500">{uiText.notFound}</p>;
  }

  const { submission, logs, files } = data;

  let supportKind = normalizeSupportKind(data?.supportDetails?.support_typ);
  if (supportKind === "unknown") {
    supportKind = editableItems.length > 0 ? "sellout" : "unknown";
  }

  const supportTitle = supportLabelFromKind(supportKind, lang);
  const showNonSelloutBox =
    Boolean(editableSupportDetails) && supportKind !== "sellout";

  const dealerName = submission?.dealers?.name ?? uiText.unknownDealer;
  const dealerMail =
    submission?.dealers?.mail_dealer ||
    submission?.dealers?.email ||
    uiText.noDealerMail;

  const statusColor =
    submission?.status === "approved"
      ? "text-green-600"
      : submission?.status === "rejected"
      ? "text-red-600"
      : theme.color;

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className={`flex items-center gap-1 ${theme.border} ${theme.color}`}
        >
          <ArrowLeft className="w-4 h-4" /> {uiText.back}
        </Button>
      </div>

      <Card
        className={`rounded-2xl border ${theme.border} bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]`}
      >
        <CardHeader className="pb-4 border-b bg-white rounded-t-2xl">
          <h2 className="text-xl font-semibold">
            {supportTitle} – Submission #{submission?.submission_id}
          </h2>

          <div className="text-sm text-gray-700 mt-1 space-y-1">
            <p>
              <strong>{uiText.dealer}:</strong> {dealerName}
            </p>
            <p>
              <strong>{uiText.email}:</strong> {dealerMail}
            </p>
            <p>
              <strong>{uiText.date}:</strong>{" "}
              {submission?.datum
                ? new Date(submission.datum).toLocaleDateString("de-CH")
                : "-"}
            </p>
            <p className={`mt-1 font-medium ${statusColor}`}>
              {uiText.status}:{" "}
              {submission?.status === "approved"
                ? uiText.approved
                : submission?.status === "rejected"
                ? uiText.rejected
                : uiText.pending}
            </p>
          </div>

          <div
            className={savingDecision ? "pointer-events-none opacity-70" : ""}
          >
            <ThemedActionButtons
              onApprove={() => updateStatus("approved")}
              onReject={() => updateStatus("rejected")}
              onReset={() => updateStatus("pending")}
            />
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-5">
          {editableItems.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                  <tr>
                    <th className="px-3 py-2 text-left">{uiText.product}</th>
                    <th className="px-3 py-2 text-right">{uiText.quantity}</th>
                    <th className="px-3 py-2 text-right">
                      {uiText.unitPriceCounter}
                    </th>
                    <th className="px-3 py-2 text-right">{uiText.total}</th>
                  </tr>
                </thead>
                <tbody>
                  {editableItems.map((p) => {
                    const original = originalItems.find(
                      (o) => o.item_id === p.item_id
                    );
                    const changed =
                      Number(original?.preis || 0) !== Number(p.preis || 0);

                    return (
                      <tr
                        key={p.item_id}
                        className="border-t hover:bg-gray-100/60 transition-colors"
                      >
                        <td className="px-3 py-1">{p.product_name || "–"}</td>
                        <td className="px-3 py-1 text-right">
                          {p.menge ?? "-"}
                        </td>
                        <td className="px-3 py-1 text-right">
                          <div className="flex justify-end items-center gap-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={p.preis ?? 0}
                              onChange={(e) =>
                                setProduktPreis(p.item_id, e.target.value)
                              }
                              className={`w-28 rounded border px-2 py-1 text-right ${
                                changed
                                  ? "border-orange-400 bg-orange-50"
                                  : ""
                              }`}
                            />
                            <span>CHF</span>
                          </div>
                        </td>
                        <td className="px-3 py-1 text-right">
                          {(
                            (Number(p.preis) || 0) * (Number(p.menge) || 1)
                          ).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="font-semibold bg-gray-50 border-t">
                    <td colSpan={3} className="px-3 py-2 text-right">
                      {uiText.totalSupport}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {totalSupport.toFixed(2)} CHF
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">{uiText.noProducts}</p>
          )}

          {submission?.kommentar && (
            <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-700">
              <strong>{uiText.comment}</strong> {submission.kommentar}
            </div>
          )}

          {showNonSelloutBox && editableSupportDetails && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-3">
                {uiText.nonSelloutDetails}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">{uiText.supportType}</p>
                  <p className="font-medium text-gray-800">
                    {editableSupportDetails.support_typ || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 mb-1">{uiText.sonyShareCounter}</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editableSupportDetails.betrag ?? 0}
                      onChange={(e) => setSupportBetrag(e.target.value)}
                      className={`w-36 rounded border px-3 py-2 text-right ${
                        hasNonSelloutChanges()
                          ? "border-orange-400 bg-orange-50"
                          : ""
                      }`}
                    />
                    <span className="font-medium text-blue-700">CHF</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {filesLoading ? (
            <p className="text-sm text-gray-500">{uiText.receiptsLoading}</p>
          ) : files && files.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold">{uiText.receipts}</p>

              {files.map((file, index) =>
                file.signedUrl ? (
                  <a
                    key={`${file.id}-${index}`}
                    href={file.signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block ${theme.color} hover:underline text-sm`}
                  >
                    📎 {file.file_name || `${uiText.receipts} ${index + 1}`}
                  </a>
                ) : (
                  <div
                    key={`${file.id}-${index}`}
                    className="p-3 bg-gray-50 rounded-md text-sm text-gray-500 italic"
                  >
                    {file.file_name || `${uiText.receipts} ${index + 1}`}{" "}
                    {uiText.fileLinkFailedSuffix}
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-500 italic">
              {uiText.noReceipt}
            </div>
          )}

          {logs && logs.length > 0 && (
            <div className="text-sm space-y-2 border rounded p-3">
              <p className="font-semibold">{uiText.history}</p>

              {logs.map((l, index) => {
                const safeKey =
                  l.id != null
                    ? `support-log-${l.id}`
                    : `support-log-${l.action ?? "x"}-${
                        l.created_at ?? "no-date"
                      }-${index}`;

                return (
                  <p key={safeKey}>
                    {new Date(l.created_at || "").toLocaleString("de-CH")} –{" "}
                    {l.action === "approved_with_counter_offer"
                      ? uiText.changedApproved
                      : l.action === "approved"
                      ? uiText.approvedWord
                      : l.action === "rejected"
                      ? uiText.rejectedWord
                      : l.action === "reset_to_pending"
                      ? uiText.resetWord
                      : l.action}
                  </p>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
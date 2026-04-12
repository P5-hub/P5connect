export const adminProject = {
  detail: {
    title: "Projektanfrage",
    loading: {
      data: "Lade Daten…",
    },
    sections: {
      dealer: "Händler",
      projectInfo: "Projektinformationen",
      comment: "Kommentar",
      projectFiles: "Projektbelege",
      projectHistory: "Projektverlauf",
    },
    labels: {
      untitled: "(ohne Titel)",
      customerNumber: "Kd.-Nr.",
      projectNumber: "Projekt-Nr.",
      type: "Typ",
      customer: "Kunde",
      location: "Ort",
      period: "Zeitraum",
      status: "Status:",
      unknownProduct: "Produkt",
      created: "erstellt",
    },
    table: {
      product: "Produkt",
      quantity: "Menge",
      counterOffer: "Betrag / Gegenofferte",
      total: "Total",
    },
    actions: {
      back: "Zurück",
      upload: "Upload",
      uploading: "Lädt…",
      view: "Anzeigen",
    },
    status: {
      approved: "✅ Bestätigt",
      rejected: "❌ Abgelehnt",
      pending: "⏳ Offen",
    },
    empty: {
      noFiles: "Keine Dateien vorhanden.",
    },
    success: {
      fileUploaded: "Datei erfolgreich hochgeladen.",
      counterOfferSavedApproved:
        "Gegenofferte gespeichert und Projekt genehmigt.",
      projectApproved: "Projekt genehmigt.",
      projectRejected: "Projekt abgelehnt.",
      projectReset: "Projekt zurückgesetzt.",
    },
    errors: {
      requestLoadFailed: "Projektanfrage konnte nicht geladen werden.",
      requestNotFound: "Projektanfrage nicht gefunden.",
      projectLoadFailed: "Projekt konnte nicht geladen werden.",
      projectNotFound: "Projekt nicht gefunden.",
      productsLoadFailed: "Produkte konnten nicht geladen werden.",
      loadGeneric: "Fehler beim Laden der Projektdaten.",
      fileOpenFailed: "Datei konnte nicht geöffnet werden.",
      uploadFailed: "Upload fehlgeschlagen.",
      fileDbSaveFailed:
        "Datei wurde hochgeladen, aber nicht in der Datenbank gespeichert.",
      priceSaveFailed:
        "Preis für {product} konnte nicht gespeichert werden.",
      statusUpdateFailed: "Status konnte nicht aktualisiert werden.",
      actionFailed: "Aktion konnte nicht ausgeführt werden.",
      noRecord: "Kein Datensatz gefunden.",
    },
  },
} as const;
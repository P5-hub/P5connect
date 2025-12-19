export const project = {
  /* ------------------------------------------------------------------
     🟣 PROJECT – FORM (Step 1)
  ------------------------------------------------------------------- */
  details: {
    title: "Projektinformationen",

    name: "Projektname oder Projektnummer",
    customer: "Endkunde / Kunde",
    location: "Standort (z. B. Zürich, Bern)",
    type: "Projekt-Typ",
    start: "Startdatum",
    end: "Enddatum",
    comment: "Kommentar oder Beschreibung",

    next: "Weiter zu den Produkten",
    back: "Zurück",
  },

  type: {
    standard: "Standard",
    tender: "Ausschreibung",
    promo: "Promotion / Aktion",
  },

  /* ------------------------------------------------------------------
     📎 PROJECT – FILE UPLOAD
  ------------------------------------------------------------------- */
  files: {
    title: "Projektunterlagen",
    hint: "PDF, Excel, CSV oder Bilder – mehrere Dateien möglich",

    drop: "Dateien hier ablegen oder auswählen",
    uploading: "Datei wird hochgeladen…",
    remove: "Datei entfernen",
    empty: "Keine Dateien angehängt",

    error: {
      uploadFailed: "Datei-Upload fehlgeschlagen",
      bucketMissing: "Speicherort nicht gefunden",
      fileTooLarge: "Datei ist zu groß",
      unsupportedType: "Dateityp nicht unterstützt",
    },
  },

  /* ------------------------------------------------------------------
     🛒 PROJECT – CART / SHEET
  ------------------------------------------------------------------- */
  cart: {
    title: "Projektanfrage absenden",

    attachedFiles: "Angehängte Dateien",
    noProducts: "Noch keine Produkte im Projekt.",

    total: "Gesamt",
    totalPrice: "Projektpreis total",
    totalSavings: "Gesamtersparnis",

    submit: "Projekt absenden",
    sending: "Wird gesendet…",
    continue: "Weiter konfigurieren",

    validation: {
      noDealer: "❌ Kein Händler gefunden – bitte neu einloggen.",
      noProducts: "Keine Produkte im Projekt.",
      missingDistributor: "❌ Bitte Haupt-Distributor auswählen.",
      invalidDate: "Bitte gültiges Lieferdatum wählen (YYYY-MM-DD).",
      missingDisti: "❌ Distributor fehlt",
      missingSource: "❌ Anbieter fehlt",
    },

    success: {
      title: "🎉 Projekt gespeichert!",
      close: "Schließen",
    },
  },

  /* ------------------------------------------------------------------
     🔔 PROJECT – TOASTS / FEEDBACK
  ------------------------------------------------------------------- */
  toast: {
    saved: "✅ Projekt erfolgreich gespeichert",
    saveError: "❌ Fehler beim Speichern des Projekts",
    uploadError: "❌ Datei-Upload fehlgeschlagen",
  },
};

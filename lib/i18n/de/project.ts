export const project = {
  page: {
    title: "Projekt Preis anfragen",
    heading: "Projektmeldung",
    products: "Produkte auswählen",
  },

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

  summary: {
    title: "Zusammenfassung",
    filesAttached: "{count} Datei(en) angehängt",
  },

  files: {
    title: "Projektunterlagen",
    hint: "PDF, Excel, CSV oder Bilder – mehrere Dateien möglich",
    drop: "Dateien hier ablegen oder auswählen",
    uploading: "Datei wird hochgeladen…",
    remove: "Datei entfernen",
    empty: "Keine Dateien angehängt",
    attached: "Angehängte Dateien",
    uploadOptional: "Dateien anhängen (optional)",
    selected: "Ausgewählt:",
    removeAll: "Dateien entfernen",

    error: {
      uploadFailed: "Datei-Upload fehlgeschlagen",
      bucketMissing: "Speicherort nicht gefunden",
      fileTooLarge: "Datei ist zu groß",
      unsupportedType: "Dateityp nicht unterstützt",
    },
  },

  cart: {
    title: "Projektanfrage absenden",
    noProducts: "Noch keine Produkte im Projekt.",
    total: "Gesamt",
    totalPrice: "Projektpreis total",
    totalSavings: "Gesamtersparnis",
    submit: "Projekt absenden",
    sending: "Wird gesendet…",
    continue: "Weiter konfigurieren",

    projectInfo: "Projektangaben",
    mainDistributor: "Haupt-Distributor",
    mainDistributorHint: "Standardmäßig über ElectronicPartner Schweiz AG.",

    deliveryProjectInfo: "Liefer-/Projektangaben",
    delivery: "Lieferung",
    deliveryNow: "Sofort",
    deliveryOnDate: "Zum Termin",
    deliveryDateOptional: "Lieferdatum (optional)",
    projectOrderComment: "Wichtige Infos zur Projektbestellung (Kommentar)",
    projectOrderReference: "Ihre Projekt-/Bestell-Referenz",
    altDelivery: "Abweichende Lieferadresse / Direktlieferung",

    success: {
      title: "🎉 Projekt gespeichert!",
      close: "Schließen",
    },

    validation: {
      noDealer: "❌ Kein Händler gefunden – bitte neu einloggen.",
      noProducts: "Keine Produkte im Projekt.",
      missingDistributor: "❌ Bitte Haupt-Distributor auswählen.",
      invalidDate: "Bitte gültiges Lieferdatum wählen (YYYY-MM-DD).",
      missingDisti: "❌ Distributor fehlt",
      missingSource: "❌ Anbieter fehlt",
      unknownDisti: "❌ Unbekannter Distributor-Code",
      invalidQuantity: "Ungültige Eingabe",
    },
  },

  toast: {
    saved: "✅ Projekt erfolgreich gespeichert",
    saveError: "❌ Fehler beim Speichern des Projekts",
    uploadError: "❌ Datei-Upload fehlgeschlagen",
    filesAdded: "📎 {count} Datei(en) hinzugefügt",
  },
  productCard: {
    quantity: "Menge",
    targetPrice: "Zielpreis (CHF)",
    add: "Zum Projekt hinzufügen",
    added: "✅ Produkt zur Projektanfrage hinzugefügt.",
    addedShort: "Hinzugefügt",
    unknownProduct: "Unbekannt",
    addError: "Produkt konnte nicht hinzugefügt werden (fehlende product_id).",
  },
  addressFields: {
    name: "Name / Firma",
    street: "Straße / Nr.",
    zip: "PLZ",
    city: "Ort",
    country: "Land",
    phoneOptional: "Telefon (optional)",
    emailOptional: "E-Mail (optional)",
  },

  cartProduct: {
    quantity: "Anzahl",
    projectPrice: "Projektpreis (CHF)",
    ekNormal: "EK normal",
    cheapestSupplier: "Günstigster Anbieter",
    supplierNameRequired: "Bitte Namen des Anbieters angeben *",
    supplierNamePlaceholder: "Name des Händlers",
    supplierNameHint:
      "Pflichtfeld bei Auswahl von „Andere“ — bitte genaue Angabe.",
    cheapestPriceGross: "Günstigster Preis (inkl. MwSt.)",
    distributorRequired: "Distributor (Pflichtfeld)",
    pleaseSelect: "Bitte auswählen",
    specialDistribution: "Spezialvertrieb",
    remove: "Entfernen",
    ean: "EAN",
  }
} as const;
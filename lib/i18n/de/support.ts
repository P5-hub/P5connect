export const support = {
  page: {
    title: "Support beantragen",
  },

  title: "Support-Anfrage",
  heading: "Support-Anfrage",

  type: {
    sellout: "Sell-Out",
    werbung: "Werbung",
    event: "Event",
    sonstiges: "Sonstiges",
  },

  fields: {
    comment: "Kommentar",
    quantity: "Menge",
    amountPerUnit: "Support / Stück",
    supportType: "Support-Art",
    receipt: "Beleg / Nachweis (PDF, JPG, PNG)",
    totalCost: "Gesamtkosten (CHF)",
    sonyShare: "Sony Beteiligung (%)",
    sonyAmount: "Sony Support (CHF)",
  },

  actions: {
    add: "Hinzufügen",
    submit: "Support prüfen & absenden",
    submitButton: "Support absenden",
    sending: "Wird gesendet…",
    close: "Schließen",
    cancel: "Abbrechen",
    remove: "Entfernen",
    choose: "Bitte wählen…",
    openCart: "Support-Cart öffnen",
  },

  states: {
    success: "✅ Support-Antrag gespeichert",
    emptyCart: "Noch keine Produkte ausgewählt.",
    noReceipt: "Kein Beleg ausgewählt.",
    positions: "Positionen",
    totalAmount: "Supportbetrag gesamt",
    sendTitle: "Support senden",
    noSupportProducts: "Noch keine Produkte im Support.",
    selectProducts: "Produkte auswählen",
    costSharing: "Kostenbeteiligung",
    selectedFile: "Ausgewählt:",
    cartLabel: "Support",
  },

  files: {
    invoiceUpload: "Rechnung / Beleg hochladen (optional)",
    removed: "Beleg entfernt",
  },

  hints: {
    selloutOnly:
      "Hinweis: Positionen sind nur für Sell-Out relevant. Wähle oben „Sell-Out“, um Mengen/Beträge zu bearbeiten.",
    optionalComment: "Optionaler Kommentar",
    removeReceipt: "Beleg entfernen",
  },

  product: {
    unknown: "Unbekanntes Produkt",
    sku: "SKU",
    ean: "EAN",
    quantity: "Menge",
    amountPerUnit: "Support / Stk",
  },

  customcost: {
    title: "Individuelle Support-Anfrage",
    subtitle: "Wählen Sie die Art des Supports und fügen Sie Details hinzu",
    type: "Art des Supports",
    select: "Bitte Art des Supports auswählen",
    name: "Beschreibung",
    placeholder: "z. B. Werbemittel, Schaufenster, Flyer, Eventfläche",
  },

  error: {
    noDealer: "Kein Händler gefunden – bitte neu einloggen.",
    noProducts: "Bitte mindestens ein Produkt hinzufügen.",
    noUser: "Kein eingeloggter Benutzer gefunden.",
    save: "Fehler beim Speichern.",
    missingSupportType: "Bitte Support-Typ auswählen.",
    missingPositions: "Keine Support-Positionen vorhanden.",
    invalidValues: "Bitte Menge und Supportbetrag korrekt ausfüllen.",
    tooManyFiles: "Bitte nur 1 Beleg anhängen (aktuell).",
    missingDealerId: "dealer_id fehlt (Login/DealerContext/Cookie).",
    submitFailed: "Support konnte nicht gespeichert werden",
    missingDealerFromUrl: "Kein Händler gefunden (URL).",
    missingCosts: "Bitte Kosten und Beteiligung eingeben.",
    unknown: "Unbekannter Fehler",
  },

  success: {
    submitted: "Support erfolgreich eingereicht",
  },
} as const;
export const sofortrabatt = {
     page: {
      title: "Sofortrabatt beantragen",
      heading: "Sofortrabatt beantragen",
    },

    steps: {
      step1: "1. TV auswählen",
      step2: "2. Rabatt-Level wählen",
      step3: "3. Soundbar auswählen",
    },

    levels: {
      single: "Single (nur TV)",
      double: "Double (TV + Soundbar)",
      triple: "Triple (TV + Soundbar + Subwoofer)",
    },

    actions: {
      addToCart: "In den Warenkorb",
      changeTv: "TV ändern",
      showTvList: "TV-Liste anzeigen",
    },

    promo: {
      select: "Promotion auswählen",
      classicTitle: "Klassische Sofortrabatt-Promo",
      classicText: "Fixe Beträge gemäss hinterlegter Produkttabelle",
      percentTitle: "Neue Promo: 30% / 50%",
      percentText:
        "TV ab 55 Zoll + Soundbar = 30% auf Soundbar, mit Zubehör zusätzlich 50% auf kompatibles Zubehör",
    },

    summary: {
      tv: "TV",
      soundbar: "Soundbar",
      accessory: "Zubehör",
      notSelected: "Noch nicht gewählt",
      optional: "Optional",
    },

    tv: {
      select: "TV auswählen",
      help: "Zuerst TV wählen, danach erscheint die passende Zubehör-Auswahl.",
      search: "TV suchen nach Modell oder EAN",
      filterAll: "Alle Grössen",
      filter55Plus: "Nur ab 55 Zoll",
      noneFound: "Keine passenden TVs gefunden.",
      selected: "Gewählter TV",
      eligible: "Für neue Promo geeignet",
      notEligible: "Nicht für neue Promo geeignet",
    },

    soundbar: {
      optional: "Optional: Soundbar",
      required: "Soundbar auswählen (Pflicht)",
    },

    accessory: {
      select: "Optional: Zubehör auswählen",
      compatible: "Kompatibel zur gewählten Soundbar",
      none: "Für diese Soundbar ist kein zusätzliches Zubehör kompatibel.",
      subwoofer: "Subwoofer",
      rearSpeaker: "Rear Speaker",
    },

    hints: {
      a9m2:
        "Für HT-A9M2 sind nur Subwoofer kompatibel. Rear Speaker sind nicht möglich.",
      htb:
        "Für dieses Modell ist kein zusätzliches Zubehör kompatibel. Es gilt nur der 30%-Rabatt auf die Soundbar.",
      hta8kit: "Für dieses Kit sind nur SASW8 und SASW9 wählbar.",
      hta7100kit: "Für dieses Kit ist das komplette kompatible Zubehör wählbar.",
    },

    cart: {
      title: "Sofortrabatt beantragen",
      success: "🎉 Antrag erfolgreich gesendet",
      close: "Schließen",
      promotion: "Promotion",
      classicPromo: "Klassische Fixbetrag-Promo",
      percentPromo: "Neue 30% / 50%-Promo",
      tvSizeDetected: "TV-Grösse erkannt",
      tvSizeUnknown: "nicht erkannt",
      tvHint:
        "Der TV qualifiziert die Promo. Rabatt wird auf Soundbar/Zubehör berechnet.",
      salesPriceSoundbar: "Verkaufspreis Soundbar (CHF)",
      salesPriceAccessory: "Verkaufspreis Zubehör (CHF)",
      discount30: "30% Rabatt",
      discount50: "50% Rabatt",
      uploadInvoices: "Rechnungen hochladen",
      total: "Gesamt-Rabatt",
      tvMustBe55: "TV muss mindestens 55 Zoll haben",
      soundbarMandatory: "Für diese Promo ist eine Soundbar Pflicht",
      submit: "Sofortrabatt absenden",
      sending: "Wird gesendet…",
    },

    toast: {
      noDealer: "Kein Händler gefunden",
      uploadInvoice: "Bitte Rechnung hochladen",
      tvMissing: "TV fehlt",
      soundbarPriceRequired: "Bitte Verkaufspreis der Soundbar eingeben",
      accessoryPriceRequired: "Bitte Verkaufspreis des Zubehörs eingeben",
      selectTv: "Bitte zuerst einen TV auswählen",
      only55: "Die Promo gilt nur für TVs ab 55 Zoll",
      needSoundbar: "Für die neue Promo ist eine Soundbar erforderlich",
      success: "Sofortrabatt erfolgreich eingereicht",
      error: "Fehler beim Absenden",
    },
} as const;
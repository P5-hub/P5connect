export const adminPromotions = {
  page: {
    title: "Promotionen verwalten",
    description:
      "Hier erfasst du Promotionen, Messeaktionen und Monatsaktionen für das Frontend.",
  },

  sections: {
    masterData: "1. Stammdaten",
    products: "2. Produkte",
    dealerTargets: "3. Händler-Ziele (optional)",
    bonusTiers: "4. Bonus-Tiers (optional)",
    existingCampaigns: "Bestehende Promotionen / Kampagnen",
  },

  fields: {
    code: "Code",
    name: "Name",
    type: "Typ",
    active: "Aktiv",
    allowDisplay: "Display erlaubt",
    startDate: "Startdatum",
    endDate: "Enddatum",
    description: "Beschreibung",
    dealer: "Händler",
    targetValue: "Zielwert",
    unit: "Einheit",
    currentValue: "Ist-Wert",
    dealerOptional: "Händler optional",
    tierLevel: "Tier-Level",
    threshold: "Threshold",
    bonusType: "Bonus-Typ",
    bonusValue: "Bonus-Wert",
    label: "Label",
  },

  placeholders: {
    code: "z. B. PROMO-TV-2026",
    name: "z. B. Frühlingspromotion",
    description: "Beschreibung / Bedingungen",
    search: "Suche nach Name, Code, Typ, Datum...",
  },

  actions: {
    reset: "Reset",
    save: "Promotion speichern",
    saving: "Speichere...",
    addTarget: "Ziel hinzufügen",
    addBonusTier: "Bonus-Tier hinzufügen",
    reload: "Neu laden",
    activate: "Aktivieren",
    deactivate: "Deaktivieren",
    edit: "Bearbeiten",
    duplicate: "Duplizieren",
    delete: "Löschen",
  },

  select: {
    pleaseChoose: "Bitte wählen...",
  },

  filters: {
    allTypes: "Alle Typen",
    allStatuses: "Alle Stati",
    active: "Aktiv",
    inactive: "Inaktiv",
  },

  types: {
    promotion: "promotion",
    messe: "messe",
    monatsaktion: "monatsaktion",
  },

  units: {
    qty: "qty",
    revenue: "revenue",
    points: "points",
  },

  bonusTypes: {
    amount: "amount",
    percent: "percent",
    credit: "credit",
    gift: "gift",
  },

  badges: {
    active: "Aktiv",
    inactive: "Inaktiv",
  },

  labels: {
    noCode: "Kein Code",
    yes: "ja",
    no: "nein",
    to: "bis",
    displayOrders: "Display Orders",
    global: "Global",
    copy: "Kopie",
  },

  loading: {
    campaigns: "Lade Kampagnen…",
  },

  empty: {
    noDealerTargets: "Keine Händler-Ziele definiert.",
    noBonusTiers: "Keine Bonus-Tiers definiert.",
    noCampaigns: "Keine Kampagnen gefunden.",
  },

  validation: {
    nameRequired: "Bitte einen Kampagnennamen eingeben.",
    startDateRequired: "Bitte ein Startdatum wählen.",
    endDateRequired: "Bitte ein Enddatum wählen.",
    endBeforeStart:
      "Enddatum darf nicht vor dem Startdatum liegen.",
    productRequired: "Bitte mindestens ein Produkt hinzufügen.",
    duplicateProduct: "Ein Produkt wurde mehrfach ausgewählt.",
    targetDealerMissing:
      "Bei Händler-Zielen fehlt ein Händler.",
    targetValueInvalid:
      "Bei Händler-Zielen fehlt ein gültiger Zielwert.",
    targetDealerDuplicate:
      "Ein Händler wurde bei den Zielvorgaben mehrfach verwendet.",
    tierLevelMissing:
      "Bei Bonus-Tiers fehlt das Tier-Level.",
    thresholdInvalid:
      "Bei Bonus-Tiers fehlt ein gültiger Threshold-Wert.",
    bonusValueInvalid:
      "Bei Bonus-Tiers fehlt ein gültiger Bonus-Wert.",
    duplicateTier: "Tier-Level ist doppelt vorhanden.",
  },

  messages: {
    loadError: "Daten konnten nicht geladen werden.",
    saveSuccess:
      "Promotion / Kampagne erfolgreich gespeichert.",
    saveError: "Die Kampagne konnte nicht gespeichert werden.",
    activated: "Kampagne aktiviert.",
    deactivated: "Kampagne deaktiviert.",
    statusChangeError:
      "Der Status konnte nicht geändert werden.",
    duplicateSuccess:
      "Kampagne erfolgreich dupliziert.",
    duplicateError:
      "Kampagne konnte nicht dupliziert werden.",
    deleteSuccess: "Kampagne erfolgreich gelöscht.",
    deleteError: "Kampagne konnte nicht gelöscht werden.",
    confirmDelete:
      'Möchtest du die Kampagne "{name}" wirklich löschen?',
  },
} as const;
export const adminPromotionDetail = {
  page: {
    title: "Promotion bearbeiten",
    subtitle: "Kampagne #{id} bearbeiten und speichern.",
    invalidId: "Ungültige Kampagnen-ID.",
  },

  actions: {
    back: "Zurück",
    reload: "Neu laden",
    save: "Änderungen speichern",
    saving: "Speichere...",
    addTarget: "Ziel hinzufügen",
    addBonusTier: "Bonus-Tier hinzufügen",
  },

  sections: {
    masterData: "1. Stammdaten",
    products: "2. Produkte",
    dealerTargets: "3. Händler-Ziele (optional)",
    bonusTiers: "4. Bonus-Tiers (optional)",
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
  },

  select: {
    pleaseChoose: "Bitte wählen...",
    global: "Global",
  },

  empty: {
    noDealerTargets: "Keine Händler-Ziele definiert.",
    noBonusTiers: "Keine Bonus-Tiers definiert.",
  },

  loading: {
    campaign: "Lade Kampagne…",
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
    loadError: "Kampagne konnte nicht geladen werden.",
    saveSuccess:
      "Promotion / Kampagne erfolgreich aktualisiert.",
    saveError: "Die Kampagne konnte nicht gespeichert werden.",
  },
} as const;
export const adminPromotions = {
  page: {
    title: "Gestisci promozioni",
    description:
      "Qui puoi creare promozioni, campagne fiera e offerte mensili per il frontend.",
  },

  sections: {
    masterData: "1. Dati principali",
    products: "2. Prodotti",
    dealerTargets: "3. Obiettivi rivenditore (opzionale)",
    bonusTiers: "4. Livelli bonus (opzionale)",
    existingCampaigns: "Promozioni / campagne esistenti",
  },

  fields: {
    code: "Codice",
    name: "Nome",
    type: "Tipo",
    active: "Attivo",
    allowDisplay: "Display consentito",
    startDate: "Data inizio",
    endDate: "Data fine",
    description: "Descrizione",
    dealer: "Rivenditore",
    targetValue: "Valore obiettivo",
    unit: "Unità",
    currentValue: "Valore attuale",
    dealerOptional: "Rivenditore opzionale",
    tierLevel: "Livello tier",
    threshold: "Soglia",
    bonusType: "Tipo bonus",
    bonusValue: "Valore bonus",
    label: "Etichetta",
  },

  placeholders: {
    code: "es. PROMO-TV-2026",
    name: "es. Promozione primavera",
    description: "Descrizione / condizioni",
    search: "Cerca per nome, codice, tipo, data...",
  },

  actions: {
    reset: "Reset",
    save: "Salva promozione",
    saving: "Salvataggio...",
    addTarget: "Aggiungi obiettivo",
    addBonusTier: "Aggiungi livello bonus",
    reload: "Ricarica",
    activate: "Attiva",
    deactivate: "Disattiva",
    edit: "Modifica",
    duplicate: "Duplica",
    delete: "Elimina",
  },

  select: {
    pleaseChoose: "Seleziona...",
  },

  filters: {
    allTypes: "Tutti i tipi",
    allStatuses: "Tutti gli stati",
    active: "Attivo",
    inactive: "Inattivo",
  },

  types: {
    promotion: "promotion",
    messe: "messe",
    monatsaktion: "offerta_mensile",
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
    active: "Attivo",
    inactive: "Inattivo",
  },

  labels: {
    noCode: "Nessun codice",
    yes: "sì",
    no: "no",
    to: "fino a",
    displayOrders: "Ordini display",
    global: "Globale",
    copy: "Copia",
  },

  loading: {
    campaigns: "Caricamento campagne…",
  },

  empty: {
    noDealerTargets: "Nessun obiettivo rivenditore definito.",
    noBonusTiers: "Nessun livello bonus definito.",
    noCampaigns: "Nessuna campagna trovata.",
  },

  validation: {
    nameRequired: "Inserisci un nome campagna.",
    startDateRequired: "Seleziona una data di inizio.",
    endDateRequired: "Seleziona una data di fine.",
    endBeforeStart:
      "La data di fine non può essere precedente alla data di inizio.",
    productRequired: "Aggiungi almeno un prodotto.",
    duplicateProduct: "Un prodotto è stato selezionato più volte.",
    targetDealerMissing:
      "Manca un rivenditore negli obiettivi rivenditore.",
    targetValueInvalid:
      "Manca un valore obiettivo valido negli obiettivi rivenditore.",
    targetDealerDuplicate:
      "Un rivenditore è stato usato più volte nelle definizioni obiettivo.",
    tierLevelMissing:
      "Manca il livello tier nei livelli bonus.",
    thresholdInvalid:
      "Manca un valore soglia valido nei livelli bonus.",
    bonusValueInvalid:
      "Manca un valore bonus valido nei livelli bonus.",
    duplicateTier: "Il livello tier esiste più di una volta.",
  },

  messages: {
    loadError: "I dati non hanno potuto essere caricati.",
    saveSuccess: "Promozione / campagna salvata con successo.",
    saveError: "La campagna non ha potuto essere salvata.",
    activated: "Campagna attivata.",
    deactivated: "Campagna disattivata.",
    statusChangeError: "Lo stato non ha potuto essere modificato.",
    duplicateSuccess: "Campagna duplicata con successo.",
    duplicateError: "La campagna non ha potuto essere duplicata.",
    deleteSuccess: "Campagna eliminata con successo.",
    deleteError: "La campagna non ha potuto essere eliminata.",
    confirmDelete:
      'Vuoi davvero eliminare la campagna "{name}"?',
  },
} as const;
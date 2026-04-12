export const adminPromotionDetail = {
  page: {
    title: "Modifica promozione",
    subtitle: "Modifica e salva la campagna #{id}.",
    invalidId: "ID campagna non valido.",
  },

  actions: {
    back: "Indietro",
    reload: "Ricarica",
    save: "Salva modifiche",
    saving: "Salvataggio...",
    addTarget: "Aggiungi obiettivo",
    addBonusTier: "Aggiungi livello bonus",
  },

  sections: {
    masterData: "1. Dati principali",
    products: "2. Prodotti",
    dealerTargets: "3. Obiettivi rivenditore (opzionale)",
    bonusTiers: "4. Livelli bonus (opzionale)",
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
  },

  select: {
    pleaseChoose: "Seleziona...",
    global: "Globale",
  },

  empty: {
    noDealerTargets: "Nessun obiettivo rivenditore definito.",
    noBonusTiers: "Nessun livello bonus definito.",
  },

  loading: {
    campaign: "Caricamento campagna…",
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
    loadError: "La campagna non ha potuto essere caricata.",
    saveSuccess: "Promozione / campagna aggiornata con successo.",
    saveError: "La campagna non ha potuto essere salvata.",
  },
} as const;
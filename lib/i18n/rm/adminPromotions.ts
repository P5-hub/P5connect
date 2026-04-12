export const adminPromotions = {
  page: {
    title: "Administrar promotiuns",
    description:
      "Qua pos crear promotiuns, campagnas da fiera ed novitads mensilas per il frontend.",
  },

  sections: {
    masterData: "1. Datas principalas",
    products: "2. Products",
    dealerTargets: "3. Finamiras dal commerziant (opziunal)",
    bonusTiers: "4. Stgalims da bonus (opziunal)",
    existingCampaigns: "Promotiuns / campagnas existentAs",
  },

  fields: {
    code: "Code",
    name: "Num",
    type: "Tip",
    active: "Activ",
    allowDisplay: "Display permess",
    startDate: "Data da cumenzament",
    endDate: "Data da fin",
    description: "Descripziun",
    dealer: "Commerziant",
    targetValue: "Valur finamira",
    unit: "Unitad",
    currentValue: "Valur actuala",
    dealerOptional: "Commerziant opziunal",
    tierLevel: "Nivel dal tier",
    threshold: "Pragl",
    bonusType: "Tip da bonus",
    bonusValue: "Valur da bonus",
    label: "Etichetta",
  },

  placeholders: {
    code: "p.ex. PROMO-TV-2026",
    name: "p.ex. Promotiun da primavaira",
    description: "Descripziun / cundiziuns",
    search: "Tschertgar tenor num, code, tip, data...",
  },

  actions: {
    reset: "Reset",
    save: "Memorisar promotiun",
    saving: "Memorisaziun...",
    addTarget: "Agiuntar finamira",
    addBonusTier: "Agiuntar stgalim bonus",
    reload: "Chargiar da nov",
    activate: "Activar",
    deactivate: "Deactivar",
    edit: "Bearbeitar",
    duplicate: "Duplicar",
    delete: "Stizzar",
  },

  select: {
    pleaseChoose: "Tscherna...",
  },

  filters: {
    allTypes: "Tut ils tips",
    allStatuses: "Tut ils status",
    active: "Activ",
    inactive: "Inactiv",
  },

  types: {
    promotion: "promotion",
    messe: "messe",
    monatsaktion: "offerta_mensila",
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
    active: "Activ",
    inactive: "Inactiv",
  },

  labels: {
    noCode: "Nagìn code",
    yes: "gea",
    no: "na",
    to: "fin",
    displayOrders: "Cumondas display",
    global: "Global",
    copy: "Copia",
  },

  loading: {
    campaigns: "Chargiar campagnas…",
  },

  empty: {
    noDealerTargets: "Naginas finamiras dal commerziant definidas.",
    noBonusTiers: "Nagins stgalims da bonus definids.",
    noCampaigns: "Naginas campagnas chattadas.",
  },

  validation: {
    nameRequired: "Endatescha per plaschair in num da campagna.",
    startDateRequired: "Tscherna per plaschair ina data da cumenzament.",
    endDateRequired: "Tscherna per plaschair ina data da fin.",
    endBeforeStart:
      "La data da fin na dastga betg esser avant la data da cumenzament.",
    productRequired: "Agiunta per plaschair almain in product.",
    duplicateProduct: "In product è vegnì tschernì pliras giadas.",
    targetDealerMissing:
      "I manca in commerziant tar las finamiras dal commerziant.",
    targetValueInvalid:
      "I manca ina valur finamira valida tar las finamiras dal commerziant.",
    targetDealerDuplicate:
      "In commerziant è vegnì utilisà pliras giadas tar las finamiras.",
    tierLevelMissing:
      "I manca il nivel dal tier tar ils stgalims da bonus.",
    thresholdInvalid:
      "I manca ina valur da pragl valida tar ils stgalims da bonus.",
    bonusValueInvalid:
      "I manca ina valur da bonus valida tar ils stgalims da bonus.",
    duplicateTier: "Il nivel dal tier exista pliras giadas.",
  },

  messages: {
    loadError: "Las datas n’han betg pudì vegnir chargiadas.",
    saveSuccess: "Promotiun / campagna memorisada cun success.",
    saveError: "La campagna n’ha betg pudì vegnir memorisada.",
    activated: "Campagna activada.",
    deactivated: "Campagna deactivada.",
    statusChangeError: "Il status n’ha betg pudì vegnir midà.",
    duplicateSuccess: "Campagna duplitgada cun success.",
    duplicateError: "La campagna n’ha betg pudì vegnir duplitgada.",
    deleteSuccess: "Campagna stizzada cun success.",
    deleteError: "La campagna n’ha betg pudì vegnir stizzada.",
    confirmDelete:
      'Vuls ti propi stizzar la campagna "{name}"?',
  },
} as const;
export const adminPromotionDetail = {
  page: {
    title: "Bearbeitar promotiun",
    subtitle: "Bearbeitar e memorisar campagna #{id}.",
    invalidId: "ID da campagna nunvalida.",
  },

  actions: {
    back: "Enavos",
    reload: "Chargiar da nov",
    save: "Memorisar novitads",
    saving: "Memorisaziun...",
    addTarget: "Agiuntar finamira",
    addBonusTier: "Agiuntar stgalim bonus",
  },

  sections: {
    masterData: "1. Datas principalas",
    products: "2. Products",
    dealerTargets: "3. Finamiras dal commerziant (opziunal)",
    bonusTiers: "4. Stgalims da bonus (opziunal)",
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
  },

  select: {
    pleaseChoose: "Tscherna...",
    global: "Global",
  },

  empty: {
    noDealerTargets: "Naginas finamiras dal commerziant definidas.",
    noBonusTiers: "Nagins stgalims da bonus definids.",
  },

  loading: {
    campaign: "Chargiar campagna…",
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
    loadError: "La campagna n’ha betg pudì vegnir chargiada.",
    saveSuccess: "Promotiun / campagna actualisada cun success.",
    saveError: "La campagna n’ha betg pudì vegnir memorisada.",
  },
} as const;
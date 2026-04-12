export const adminPromotionDetail = {
  page: {
    title: "Modifier la promotion",
    subtitle: "Modifier et enregistrer la campagne #{id}.",
    invalidId: "ID de campagne invalide.",
  },

  actions: {
    back: "Retour",
    reload: "Recharger",
    save: "Enregistrer les modifications",
    saving: "Enregistrement...",
    addTarget: "Ajouter un objectif",
    addBonusTier: "Ajouter un palier bonus",
  },

  sections: {
    masterData: "1. Données de base",
    products: "2. Produits",
    dealerTargets: "3. Objectifs revendeurs (optionnel)",
    bonusTiers: "4. Paliers bonus (optionnel)",
  },

  fields: {
    code: "Code",
    name: "Nom",
    type: "Type",
    active: "Actif",
    allowDisplay: "Display autorisé",
    startDate: "Date de début",
    endDate: "Date de fin",
    description: "Description",
    dealer: "Revendeur",
    targetValue: "Valeur cible",
    unit: "Unité",
    currentValue: "Valeur actuelle",
    dealerOptional: "Revendeur optionnel",
    tierLevel: "Niveau du palier",
    threshold: "Seuil",
    bonusType: "Type de bonus",
    bonusValue: "Valeur du bonus",
    label: "Label",
  },

  placeholders: {
    code: "p. ex. PROMO-TV-2026",
    name: "p. ex. Promotion de printemps",
    description: "Description / conditions",
  },

  select: {
    pleaseChoose: "Veuillez choisir...",
    global: "Global",
  },

  empty: {
    noDealerTargets: "Aucun objectif revendeur défini.",
    noBonusTiers: "Aucun palier bonus défini.",
  },

  loading: {
    campaign: "Chargement de la campagne…",
  },

  validation: {
    nameRequired: "Veuillez saisir un nom de campagne.",
    startDateRequired: "Veuillez choisir une date de début.",
    endDateRequired: "Veuillez choisir une date de fin.",
    endBeforeStart:
      "La date de fin ne doit pas être antérieure à la date de début.",
    productRequired: "Veuillez ajouter au moins un produit.",
    duplicateProduct: "Un produit a été sélectionné plusieurs fois.",
    targetDealerMissing:
      "Un revendeur manque dans les objectifs revendeurs.",
    targetValueInvalid:
      "Une valeur cible valide manque dans les objectifs revendeurs.",
    targetDealerDuplicate:
      "Un revendeur a été utilisé plusieurs fois dans les objectifs.",
    tierLevelMissing:
      "Le niveau du palier manque dans les paliers bonus.",
    thresholdInvalid:
      "Une valeur de seuil valide manque dans les paliers bonus.",
    bonusValueInvalid:
      "Une valeur de bonus valide manque dans les paliers bonus.",
    duplicateTier: "Le niveau du palier existe plusieurs fois.",
  },

  messages: {
    loadError: "La campagne n’a pas pu être chargée.",
    saveSuccess: "Promotion / campagne mise à jour avec succès.",
    saveError: "La campagne n’a pas pu être enregistrée.",
  },
} as const;
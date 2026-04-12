export const adminPromotions = {
  page: {
    title: "Gérer les promotions",
    description:
      "Ici, vous pouvez créer des promotions, des actions salon et des offres mensuelles pour le frontend.",
  },

  sections: {
    masterData: "1. Données de base",
    products: "2. Produits",
    dealerTargets: "3. Objectifs revendeurs (optionnel)",
    bonusTiers: "4. Paliers bonus (optionnel)",
    existingCampaigns: "Promotions / campagnes existantes",
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
    search: "Rechercher par nom, code, type, date...",
  },

  actions: {
    reset: "Réinitialiser",
    save: "Enregistrer la promotion",
    saving: "Enregistrement...",
    addTarget: "Ajouter un objectif",
    addBonusTier: "Ajouter un palier bonus",
    reload: "Recharger",
    activate: "Activer",
    deactivate: "Désactiver",
    edit: "Modifier",
    duplicate: "Dupliquer",
    delete: "Supprimer",
  },

  select: {
    pleaseChoose: "Veuillez choisir...",
  },

  filters: {
    allTypes: "Tous les types",
    allStatuses: "Tous les statuts",
    active: "Actif",
    inactive: "Inactif",
  },

  types: {
    promotion: "promotion",
    messe: "messe",
    monatsaktion: "offre_mensuelle",
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
    active: "Actif",
    inactive: "Inactif",
  },

  labels: {
    noCode: "Aucun code",
    yes: "oui",
    no: "non",
    to: "au",
    displayOrders: "Commandes display",
    global: "Global",
    copy: "Copie",
  },

  loading: {
    campaigns: "Chargement des campagnes…",
  },

  empty: {
    noDealerTargets: "Aucun objectif revendeur défini.",
    noBonusTiers: "Aucun palier bonus défini.",
    noCampaigns: "Aucune campagne trouvée.",
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
    loadError: "Les données n’ont pas pu être chargées.",
    saveSuccess: "Promotion / campagne enregistrée avec succès.",
    saveError: "La campagne n’a pas pu être enregistrée.",
    activated: "Campagne activée.",
    deactivated: "Campagne désactivée.",
    statusChangeError: "Le statut n’a pas pu être modifié.",
    duplicateSuccess: "Campagne dupliquée avec succès.",
    duplicateError: "La campagne n’a pas pu être dupliquée.",
    deleteSuccess: "Campagne supprimée avec succès.",
    deleteError: "La campagne n’a pas pu être supprimée.",
    confirmDelete:
      'Voulez-vous vraiment supprimer la campagne "{name}" ?',
  },
} as const;
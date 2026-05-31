export const sofortrabatt = {
  page: {
    title: "Demander une remise immédiate",
    heading: "Demander une remise immédiate",
  },

  steps: {
    step1: "1. Sélectionner le téléviseur",
    step2: "2. Choisir le niveau de remise",
    step3: "3. Sélectionner la barre de son",
  },

  levels: {
    single: "Single (TV uniquement)",
    double: "Double (TV + barre de son)",
    triple: "Triple (TV + barre de son + caisson de basses)",
  },

  actions: {
    addToCart: "Ajouter au panier",
    changeTv: "Changer le téléviseur",
    showTvList: "Afficher la liste des téléviseurs",
  },

  promo: {
    select: "Sélectionner la promotion",
    classicTitle: "Promotion classique de remise immédiate",
    classicText: "Montants fixes selon le tableau des produits configuré",
    percentTitle: "Nouvelle promo : 30 % / 50 %",
    percentText:
      "TV dès 55 pouces + barre de son = 30 % sur la barre de son, avec accessoires supplémentaires 50 % sur les accessoires compatibles",
  },

  summary: {
    tv: "TV",
    soundbar: "Barre de son",
    accessory: "Accessoire",
    notSelected: "Non sélectionné",
    optional: "Optionnel",
  },

  tv: {
    select: "Sélectionner le téléviseur",
    help: "Sélectionnez d’abord un téléviseur, puis les accessoires compatibles apparaîtront.",
    search: "Rechercher un téléviseur par modèle ou EAN",
    filterAll: "Toutes les tailles",
    filter55Plus: "À partir de 55 pouces",
    noneFound: "Aucun téléviseur correspondant trouvé.",
    selected: "Téléviseur sélectionné",
    eligible: "Éligible à la nouvelle promotion",
    notEligible: "Non éligible à la nouvelle promotion",
    reset: "Réinitialiser",
    searchPlaceholder: "Rechercher un téléviseur par modèle ou EAN",
    promoValid: "Éligible à la promotion sélectionnée",
    promoInvalid: "Non éligible à la promotion sélectionnée",
    validity: "Promotion valable",
    product: "Produit",
    role: "Rôle",
    category: "Catégorie",
    unknown: "inconnu",
  },

  soundbar: {
    optional: "Optionnel : barre de son",
    required: "Sélectionner une barre de son (obligatoire)",
    search: "Rechercher une barre de son",
    noneFound: "Aucune barre de son correspondante trouvée.",
  },

  accessory: {
    select: "Optionnel : sélectionner un accessoire",
    compatible: "Compatible avec la barre de son sélectionnée",
    none: "Aucun accessoire compatible avec cette barre de son.",
    subwoofer: "Caisson de basses",
    rearSpeaker: "Haut-parleurs arrière",
    search: "Rechercher un accessoire",
    validity: "Promotion valable",
  },

  hints: {
    a9m2:
      "Seuls les caissons de basses sont compatibles avec le HT-A9M2. Les haut-parleurs arrière ne sont pas pris en charge.",
    htb:
      "Aucun accessoire supplémentaire n’est compatible avec ce modèle. Seule la remise de 30 % sur la barre de son s’applique.",
    hta8kit:
      "Seuls les modèles SASW8 et SASW9 peuvent être sélectionnés pour ce kit.",
    hta7100kit:
      "Tous les accessoires compatibles sont disponibles pour ce kit.",
  },

  cart: {
    title: "Demander une remise immédiate",
    success: "🎉 Demande envoyée avec succès",
    close: "Fermer",
    promotion: "Promotion",
    classicPromo: "Promotion classique à montant fixe",
    percentPromo: "Nouvelle promotion 30 % / 50 %",
    tvSizeDetected: "Taille du téléviseur détectée",
    tvSizeUnknown: "non détectée",
    tvHint:
      "Le téléviseur est éligible à la promotion. La remise est appliquée à la barre de son et aux accessoires.",
    salesPriceSoundbar: "Prix de vente de la barre de son (CHF)",
    salesPriceAccessory: "Prix de vente de l’accessoire (CHF)",
    discount30: "Remise de 30 %",
    discount50: "Remise de 50 %",
    uploadInvoices: "Télécharger les factures",
    total: "Remise totale",
    tvMustBe55: "Le téléviseur doit mesurer au moins 55 pouces",
    soundbarMandatory:
      "Une barre de son est obligatoire pour cette promotion",
    submit: "Envoyer la demande de remise immédiate",
    sending: "Envoi en cours…",
    validity: "Validité",
    validFrom: "Valable à partir du",
    validUntil: "Valable jusqu’au",
    validRange: "Valable",

    tvSerialNumber: "Numéro de série du téléviseur",
    soundbarSerialNumber: "Numéro de série de la barre de son",
    subwooferSerialNumber: "Numéro de série du caisson de basses",

    serialPlaceholder: "Numéro de série à 7 chiffres",

    tvDiscount: "Remise immédiate TV",

    classicValidity: "Période de promotion",
    percentValidity: "Période de promotion",

    serialMustBeSevenDigits:
      "Le numéro de série doit contenir exactement 7 chiffres.",

    requiredSerials:
      "Veuillez saisir tous les numéros de série requis avec 7 chiffres.",
  },

  form: {
    productsLoadError:
      "Impossible de charger les produits",

    loadingProducts:
      "Chargement des produits…",
  },

  toast: {
    noDealer: "Aucun revendeur trouvé",
    uploadInvoice: "Veuillez télécharger une facture",
    tvMissing: "Téléviseur manquant",
    soundbarPriceRequired:
      "Veuillez saisir le prix de vente de la barre de son",
    accessoryPriceRequired:
      "Veuillez saisir le prix de vente de l’accessoire",
    selectTv: "Veuillez d’abord sélectionner un téléviseur",
    only55:
      "Cette promotion est valable uniquement pour les téléviseurs de 55 pouces et plus",
    needSoundbar:
      "Une barre de son est requise pour cette promotion",
    success:
      "Demande de remise immédiate envoyée avec succès",
    error:
      "Erreur lors de l’envoi",

    invalidTvSerial:
      "Veuillez saisir un numéro de série TV valide à 7 chiffres",

    invalidSoundbarSerial:
      "Veuillez saisir un numéro de série de barre de son valide à 7 chiffres",

    invalidSubwooferSerial:
      "Veuillez saisir un numéro de série de caisson de basses valide à 7 chiffres",

    duplicateSerial:
      "Ce numéro de série a déjà été utilisé pour une demande de remise immédiate",
  },
} as const;
export const sofortrabatt = {

  page: {
    title: "Demander une remise immédiate",
    heading: "Demander une remise immédiate",
  },

  steps: {
    step1: "1. Sélectionner le TV",
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
    changeTv: "Changer le TV",
    showTvList: "Afficher la liste des TV",
  },

  promo: {
    select: "Sélectionner la promotion",
    classicTitle: "Promotion classique de remise immédiate",
    classicText: "Montants fixes selon le tableau des produits",
    percentTitle: "Nouvelle promo : 30% / 50%",
    percentText:
      "TV dès 55 pouces + barre de son = 30% sur la barre de son, avec accessoires en plus 50% sur les accessoires compatibles",
  },

  summary: {
    tv: "TV",
    soundbar: "Barre de son",
    accessory: "Accessoire",
    notSelected: "Pas encore sélectionné",
    optional: "Optionnel",
  },

  tv: {
    select: "Sélectionner le TV",
    help: "Sélectionnez d’abord un TV, puis les accessoires compatibles apparaîtront.",
    search: "Rechercher un TV par modèle ou EAN",
    filterAll: "Toutes les tailles",
    filter55Plus: "À partir de 55 pouces",
    noneFound: "Aucun TV correspondant trouvé.",
    selected: "TV sélectionné",
    eligible: "Éligible à la nouvelle promo",
    notEligible: "Non éligible à la nouvelle promo",
  },

  soundbar: {
    optional: "Optionnel : barre de son",
    required: "Sélectionner une barre de son (obligatoire)",
  },

  accessory: {
    select: "Optionnel : sélectionner un accessoire",
    compatible: "Compatible avec la barre de son sélectionnée",
    none: "Aucun accessoire supplémentaire compatible avec cette barre de son.",
    subwoofer: "Caisson de basses",
    rearSpeaker: "Haut-parleurs arrière",
  },

  hints: {
    a9m2:
      "Pour le HT-A9M2, seuls les caissons de basses sont compatibles. Les haut-parleurs arrière ne sont pas possibles.",
    htb:
      "Pour ce modèle, aucun accessoire supplémentaire n’est compatible. Seule la remise de 30% sur la barre de son s’applique.",
    hta8kit: "Pour ce kit, seuls les modèles SASW8 et SASW9 sont disponibles.",
    hta7100kit: "Pour ce kit, tous les accessoires compatibles sont disponibles.",
  },

  cart: {
    title: "Demander une remise immédiate",
    success: "🎉 Demande envoyée avec succès",
    close: "Fermer",
    promotion: "Promotion",
    classicPromo: "Promotion classique à montant fixe",
    percentPromo: "Nouvelle promo 30% / 50%",
    tvSizeDetected: "Taille du TV détectée",
    tvSizeUnknown: "non détectée",
    tvHint:
      "Le TV permet d’accéder à la promo. La remise est calculée sur la barre de son/les accessoires.",
    salesPriceSoundbar: "Prix de vente barre de son (CHF)",
    salesPriceAccessory: "Prix de vente accessoire (CHF)",
    discount30: "Remise de 30%",
    discount50: "Remise de 50%",
    uploadInvoices: "Télécharger les factures",
    total: "Remise totale",
    tvMustBe55: "Le TV doit faire au moins 55 pouces",
    soundbarMandatory: "Une barre de son est obligatoire pour cette promo",
    submit: "Envoyer la demande",
    sending: "Envoi en cours…",
  },

  toast: {
    noDealer: "Aucun revendeur trouvé",
    uploadInvoice: "Veuillez télécharger la facture",
    tvMissing: "TV manquant",
    soundbarPriceRequired: "Veuillez saisir le prix de vente de la barre de son",
    accessoryPriceRequired: "Veuillez saisir le prix de vente de l’accessoire",
    selectTv: "Veuillez d’abord sélectionner un TV",
    only55: "La promo est valable uniquement pour les TV à partir de 55 pouces",
    needSoundbar: "Une barre de son est requise pour cette promo",
    success: "Remise immédiate envoyée avec succès",
    error: "Erreur lors de l’envoi",
  },
} as const;
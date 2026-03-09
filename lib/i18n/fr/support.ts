export const support = {
  page: {
    title: "Demande de support",
  },

  title: "Demande de support",
  heading: "Demande de support",

  type: {
    sellout: "Sell-Out",
    werbung: "Publicité",
    event: "Événement",
    sonstiges: "Autre",
  },

  fields: {
    comment: "Commentaire",
    quantity: "Quantité",
    amountPerUnit: "Support / pièce",
    supportType: "Type de support",
    receipt: "Justificatif / preuve (PDF, JPG, PNG)",
    totalCost: "Coût total (CHF)",
    sonyShare: "Part Sony (%)",
    sonyAmount: "Support Sony (CHF)",
  },

  actions: {
    add: "Ajouter",
    submit: "Vérifier et envoyer le support",
    submitButton: "Envoyer le support",
    sending: "Envoi en cours…",
    close: "Fermer",
    cancel: "Annuler",
    remove: "Supprimer",
    choose: "Veuillez choisir…",
    openCart: "Ouvrir le panier support",
  },

  states: {
    success: "✅ Demande de support enregistrée",
    emptyCart: "Aucun produit sélectionné.",
    noReceipt: "Aucun justificatif sélectionné.",
    positions: "Positions",
    totalAmount: "Montant total du support",
    sendTitle: "Envoyer le support",
    noSupportProducts: "Aucun produit de support.",
    selectProducts: "Sélectionner des produits",
    costSharing: "Participation aux coûts",
    selectedFile: "Sélectionné :",
    cartLabel: "Support",
  },

  files: {
    invoiceUpload: "Télécharger facture / justificatif (optionnel)",
    removed: "Justificatif supprimé",
  },

  hints: {
    selloutOnly:
      "Remarque : les positions ne sont pertinentes que pour le Sell-Out. Sélectionnez « Sell-Out » ci-dessus pour modifier les quantités et montants.",
    optionalComment: "Commentaire optionnel",
    removeReceipt: "Supprimer le justificatif",
  },

  product: {
    unknown: "Produit inconnu",
    sku: "SKU",
    ean: "EAN",
    quantity: "Quantité",
    amountPerUnit: "Support / pièce",
  },

  customcost: {
    title: "Demande de support individuelle",
    subtitle: "Choisissez le type de support et ajoutez les détails",
    type: "Type de support",
    select: "Veuillez sélectionner le type de support",
    name: "Description",
    placeholder: "p. ex. matériel publicitaire, vitrine, flyer, espace événementiel",
  },

  error: {
    noDealer: "Aucun revendeur trouvé – veuillez vous reconnecter.",
    noProducts: "Veuillez ajouter au moins un produit.",
    noUser: "Aucun utilisateur connecté trouvé.",
    save: "Erreur lors de l’enregistrement.",
    missingSupportType: "Veuillez sélectionner un type de support.",
    missingPositions: "Aucune position de support disponible.",
    invalidValues: "Veuillez saisir une quantité et un montant valides.",
    tooManyFiles: "Veuillez joindre un seul justificatif.",
    missingDealerId: "dealer_id manquant.",
    submitFailed: "Le support n’a pas pu être enregistré",
    missingDealerFromUrl: "Aucun revendeur trouvé (URL).",
    missingCosts: "Veuillez saisir les coûts et la participation.",
    unknown: "Erreur inconnue",
  },

  success: {
    submitted: "Support envoyé avec succès",
  },
} as const;
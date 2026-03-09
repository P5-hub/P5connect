export const project = {
  page: {
    title: "Demande de prix projet",
    heading: "Demande de projet",
    products: "Sélectionner des produits",
  },

  details: {
    title: "Informations sur le projet",
    name: "Nom ou numéro du projet",
    customer: "Client final / Client",
    location: "Lieu (p. ex. Zurich, Berne)",
    type: "Type de projet",
    start: "Date de début",
    end: "Date de fin",
    comment: "Commentaire ou description",
    next: "Continuer vers les produits",
    back: "Retour",
  },

  type: {
    standard: "Standard",
    tender: "Appel d’offres",
    promo: "Promotion / action",
  },

  summary: {
    title: "Résumé",
    filesAttached: "{count} fichier(s) joint(s)",
  },

  files: {
    title: "Documents du projet",
    hint: "PDF, Excel, CSV ou images – plusieurs fichiers possibles",
    drop: "Déposer les fichiers ici ou les sélectionner",
    uploading: "Téléchargement du fichier…",
    remove: "Supprimer le fichier",
    empty: "Aucun fichier joint",
    attached: "Fichiers joints",
    uploadOptional: "Joindre des fichiers (optionnel)",
    selected: "Sélectionné :",
    removeAll: "Supprimer les fichiers",

    error: {
      uploadFailed: "Échec du téléchargement du fichier",
      bucketMissing: "Emplacement de stockage introuvable",
      fileTooLarge: "Le fichier est trop volumineux",
      unsupportedType: "Type de fichier non pris en charge",
    },
  },

  cart: {
    title: "Envoyer la demande de projet",
    noProducts: "Aucun produit dans le projet.",
    total: "Total",
    totalPrice: "Prix total du projet",
    totalSavings: "Économies totales",
    submit: "Envoyer le projet",
    sending: "Envoi en cours…",
    continue: "Continuer la configuration",

    projectInfo: "Informations du projet",
    mainDistributor: "Distributeur principal",
    mainDistributorHint: "Par défaut via ElectronicPartner Suisse SA.",

    deliveryProjectInfo: "Informations livraison / projet",
    delivery: "Livraison",
    deliveryNow: "Immédiate",
    deliveryOnDate: "À une date donnée",
    deliveryDateOptional: "Date de livraison (optionnelle)",
    projectOrderComment: "Informations importantes pour la commande projet (commentaire)",
    projectOrderReference: "Votre référence projet / commande",
    altDelivery: "Adresse de livraison différente / livraison directe",

    success: {
      title: "🎉 Projet enregistré !",
      close: "Fermer",
    },

    validation: {
      noDealer: "❌ Aucun revendeur trouvé – veuillez vous reconnecter.",
      noProducts: "Aucun produit dans le projet.",
      missingDistributor: "❌ Veuillez sélectionner un distributeur principal.",
      invalidDate: "Veuillez choisir une date de livraison valide (AAAA-MM-JJ).",
      missingDisti: "❌ Distributeur manquant",
      missingSource: "❌ Fournisseur manquant",
      unknownDisti: "❌ Code distributeur inconnu",
      invalidQuantity: "Saisie invalide",
    },
  },

  toast: {
    saved: "✅ Projet enregistré avec succès",
    saveError: "❌ Erreur lors de l’enregistrement du projet",
    uploadError: "❌ Échec du téléchargement du fichier",
    filesAdded: "📎 {count} fichier(s) ajouté(s)",
  },
  productCard: {
    quantity: "Quantité",
    targetPrice: "Prix cible (CHF)",
    add: "Ajouter au projet",
    added: "✅ Produit ajouté à la demande de projet.",
    addedShort: "Ajouté",
    unknownProduct: "Inconnu",
    addError: "Le produit n’a pas pu être ajouté (product_id manquant).",
    },
  addressFields: {
    name: "Nom / Société",
    street: "Rue / N°",
    zip: "Code postal",
    city: "Ville",
    country: "Pays",
    phoneOptional: "Téléphone (optionnel)",
    emailOptional: "E-mail (optionnel)",
    },

    cartProduct: {
    quantity: "Quantité",
    projectPrice: "Prix projet (CHF)",
    ekNormal: "Prix d'achat normal",
    cheapestSupplier: "Fournisseur le moins cher",
    supplierNameRequired: "Veuillez indiquer le nom du fournisseur *",
    supplierNamePlaceholder: "Nom du fournisseur",
    supplierNameHint:
        "Champ obligatoire si « Autre » est sélectionné — veuillez préciser.",
    cheapestPriceGross: "Prix le plus bas (TTC)",
    distributorRequired: "Distributeur (obligatoire)",
    pleaseSelect: "Veuillez sélectionner",
    specialDistribution: "Distribution spéciale",
    remove: "Supprimer",
    ean: "EAN",
    }  
} as const;
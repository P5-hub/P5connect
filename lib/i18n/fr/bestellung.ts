export const bestellung = {
  common: {
    unknown: "Inconnu",
    unknownProduct: "Produit inconnu",
    remove: "Supprimer",
    reset: "Réinitialiser",
    close: "Fermer",
    continueShopping: "Continuer les achats",
    addToCart: "Ajouter au panier",
    cartOpen: "Ouvrir le panier",
    loading: "Chargement…",
    quantity: "Quantité",
    price: "Prix",
    total: "Total",
    totalPrice: "Prix total",
    summary: "Résumé",
    pieces: "pièces",
    filesAttached: "{count} fichier(s) joint(s)",
  },

  viewMode: {
    both: "Afficher les deux",
    campaignOnly: "Produits salon uniquement",
    standardOnly: "Produits standard uniquement",
  },

  toast: {
    productAddedTitle: "Produit ajouté",
    productAddedText: "{product} a été ajouté au panier.",

    maxCampaignQtyTitle: "Quantité promotionnelle maximale atteinte",
    maxCampaignQtyText:
      "Un maximum de {count} pièces par revendeur est autorisé pour {product}.",

    noDealer: "❌ Aucun revendeur trouvé – veuillez vous reconnecter.",
    needDistributor: "❌ Veuillez sélectionner un distributeur principal.",
    needValidDate: "Veuillez choisir une date de livraison valide (YYYY-MM-DD).",

    invalidInputTitle: "Saisie invalide",
    invalidQuantityText: "Veuillez saisir une quantité valide pour {product} !",

    missingDistributorTitle: "❌ Distributeur manquant",
    missingDistributorText:
      "Veuillez sélectionner un distributeur pour {product}.",

    missingProviderTitle: "❌ Fournisseur manquant",
    missingProviderText:
      'Veuillez indiquer le nom du revendeur pour « Autre » pour {product}.',

    missingDisplayReasonTitle:
      "Justification pour un display supplémentaire manquante",
    missingDisplayReasonText:
      "Veuillez indiquer dans le champ commentaire pourquoi un display supplémentaire est nécessaire pour {product}.",

    unknownDistributorCodeTitle:
      "❌ Code distributeur inconnu",
    unknownDistributorCodeText:
      'Le distributeur "{code}" est introuvable.',

    orderSavedTitle: "✅ Commande enregistrée",
    orderSavedText:
      "La commande a été transmise avec succès.",

    orderSaveErrorTitle: "❌ Erreur lors de l’enregistrement",
    orderSaveErrorText: "Erreur inconnue",

    displayAlreadyOrderedTitle: "Display déjà commandé",
    displayAlreadyOrderedText:
      "Au moins un display a déjà été commandé pour {product}. Veuillez expliquer dans le champ commentaire pourquoi un display supplémentaire est nécessaire (p. ex. deuxième site).",

    displayLimitReachedTitle: "Limite de display atteinte",
    displayLimitReachedText:
      "Un maximum de {max} pièces display est autorisé pour {product}. Déjà commandé : {ordered}. Encore disponible pour cette position : {free}.",

    totalLimitReachedTitle: "Limite totale atteinte",
    totalLimitReachedText:
      "Un total maximum de {max} pièces promotionnelles est autorisé pour {product}. Déjà commandé : {ordered}. Encore disponible pour cette position : {free}.",

    campaignLimitReachedTitle: "Limite {mode} atteinte",
    campaignLimitReachedText:
      "Pour {product}, il reste encore {allowed} pièce(s) possible(s) au prix {modeLower}. Déjà commandé : {ordered}. {overflow} pièce(s) ont été automatiquement reprises comme position séparée au prix normal.",

    campaignExhaustedTitle:
      "Contingent {mode} épuisé",
    campaignExhaustedText:
      "Il n’y a plus de contingent {modeLower} disponible pour {product}. Déjà commandé : {ordered}. La quantité entière a été automatiquement reprise au prix normal.",

    orderNotPossibleTitle: "Commande impossible",
    orderNotPossibleText:
      "La commande n’a pas pu être enregistrée.",

    uploadFailed: "Échec du téléversement du fichier",
    projectIdCopied: "ID du projet copié",
  },

  provider: {
    pleaseSelect: "Veuillez sélectionner",
    cheapestProvider: "Fournisseur le moins cher",
    providerName: "Veuillez indiquer le nom du fournisseur",
    providerNamePlaceholder: "Nom du revendeur",
    providerNameRequiredHint:
      "Champ obligatoire si « Autre » est sélectionné.",
    cheapestPriceGross:
      "Prix le plus bas (TVA incl.)",
    other: "Autre",
  },

  campaign: {
    campaign: "Campagne",
    activeTradefairCampaign: "Campagne salon active",
    validFromTo: "Valable du {start} au {end}",

    campaignProductsCount: "{count} produits promotionnels",
    campaignProducts: "Produits salon",
    campaignProductsIntro:
      "Ces produits font actuellement partie de la campagne salon.",
    noCampaignProducts: "Aucun produit salon trouvé.",

    badge: {
      display: "Display",
      mixed: "Salon + Display",
      messe: "Prix salon",
      standard: "Promotion",
    },

    pricing: {
      upeGross: "PVC brut",
      dealerPrice: "Prix revendeur",
      messePriceNet: "Prix salon net",
      displayPriceNet: "Prix display net",
      pricingMode: "Mode de tarification",
      pricingModeDisplay: "Display",
      pricingModeMesse: "Salon",
      pricingModeStandard: "Standard",
      discountVsHrp: "Remise vs PVC",
    },

    filters: {
      searchPlaceholder: "Recherche par article, nom, EAN, marque …",
      allGroups: "Tous les groupes",
      allCategories: "Toutes les catégories",
    },

    progress: {
      title: "Progression du bonus",
      afterSubmit: "Après envoi",
      progress: "Progression",
      already: "Déjà",
      cart: "Panier",
      total: "Total",
      nextTier: "Prochain niveau de bonus",
      highestTierReached: "Niveau de bonus maximal atteint",
      missingToNext: "Il manque encore : {amount}",
      noTierAvailable: "Aucun niveau de bonus disponible pour l’instant.",
      bonus: "Bonus",
      level: "Niveau {level}",
    },

    limits: {
      displayMax:
        "Display max. {max} · déjà commandé {ordered} · encore disponible {free}",
      messeMax:
        "Salon max. {max} · déjà commandé {ordered} · encore disponible {free}",
      campaignMax:
        "Promo max. {max} · déjà commandé {ordered} · encore disponible {free}",
      totalCampaignMax:
        "Total promo max. {max} · déjà commandé {ordered} · encore disponible {free}",

      rowDisplayMax:
        "Dans cette position display, encore max. {count} pièce(s) au prix display possible(s)",
      rowMesseMax:
        "Dans cette position salon, encore max. {count} pièce(s) au prix salon possible(s)",
      rowCampaignMax:
        "Dans cette position, encore max. {count} pièce(s) au prix promotionnel possible(s)",
    },
  },

  cartSheet: {
    title: "Commande au meilleur prix",
    empty: "Aucun produit sélectionné pour le moment.",

    linkedProject: {
      title: "Projet lié",
      customer: "Client",
      project: "Projet",
      open: "Ouvrir le projet",
      remove: "Supprimer le projet",
      copied: "ID du projet copié",
    },

    dealerInfo: {
      title: "Informations revendeur",
      customerNumber: "N° client",
      contactPerson: "Contact",
      phone: "Tél.",
      email: "E-mail",
      city: "Lieu",
      kam: "KAM",
    },

    distributor: {
      title: "Distributeur principal",
      placeholder: "Veuillez sélectionner",
      defaultHint:
        "Par défaut via ElectronicPartner Schweiz AG.",
    },

    order: {
      title: "Informations de commande",
      delivery: "Livraison",
      deliveryImmediate: "Immédiate",
      deliveryScheduled: "À la date prévue",
      deliveryDateOptional: "Date de livraison (optionnelle)",
      comment:
        "Informations importantes sur la commande (commentaire)",
      commentPlaceholder:
        "p. ex. 'Doit impérativement être livré avant le 15.10'…",
      referenceNumber: "Votre n° de commande / référence",
      referencePlaceholder: "p. ex. 45001234",
    },

    altDelivery: {
      title:
        "Adresse de livraison différente / livraison directe",
      useAdditionalAddress:
        "Utiliser une adresse de livraison supplémentaire",
      name: "Nom / Société",
      street: "Rue / N°",
      zip: "NPA",
      city: "Lieu",
      country: "Pays",
      phoneOptional: "Téléphone (optionnel)",
      emailOptional: "E-mail (optionnel)",
    },

    files: {
      title: "Fichiers pour la commande",
      attached: "{count} fichier(s) joint(s)",
    },

    summary: {
      title: "Résumé",
      total: "Total",
      totalPrice: "Prix total",
      bonusProgress: "Progression du bonus",
      piecesValue: "{count} pièces",
      totalSavings: "Économie totale : {amount}",
      savings: "Économie totale : {amount} CHF",
      missingToNext: "Encore {amount} jusqu’à {tier}",
      highestTierReached:
        "Niveau de bonus maximal atteint",
      send: "Envoyer la commande",
      sending: "Envoi…",
      continueShopping: "Continuer les achats",
      pieces: "pièces",
    },

    product: {
      unknown: "Inconnu",
      ean: "EAN",
      specialDistribution: "Distribution spéciale",
      bonusRelevant: "Pertinent pour le bonus",
      normalPrice: "Prix normal",

      quantity: "Quantité",
      price: "Prix (CHF)",
      ekNormal: "PA normal",
      saved:
        "{amount} CHF économisés ({percent}%)",

      pricingMode: "Mode de tarification",
      pricingModeDisplay: "Display",
      pricingModeMesse: "Salon",
      pricingModeStandard: "Standard",

      upeGross: "PVC brut",
      displayPriceNet: "Prix display net",
      messePriceNet: "Prix salon net",
      discountVsHrp: "Remise vs PVC",

      orderAsDisplay:
        "Commander comme display",

      reasonForAdditionalDisplay:
        "Justification pour un display supplémentaire",
      reasonPlaceholder:
        "p. ex. deuxième site, rénovation, nouvelle surface de vente …",
      reasonHint:
        "Un display a déjà été commandé pour ce produit. Veuillez justifier le besoin supplémentaire.",

      cheapestProvider:
        "Fournisseur le moins cher",
      providerName:
        "Veuillez indiquer le nom du fournisseur",
      providerNamePlaceholder:
        "Nom du revendeur",
      providerNameHint:
        "Champ obligatoire si « Autre » est sélectionné.",

      cheapestPriceGross:
        "Prix le plus bas (TVA incl.)",

      distributor: "Distributeur",
      distributorPlaceholder:
        "Veuillez sélectionner",

      remove: "Supprimer",
      other: "Autre",
    },
  },

  preview: {
    title: "Aperçu du panier",
    positions: "Positions dans le panier",
    quantityTotal: "Quantité totale",
    cartValue: "Valeur du panier",
  },

  loading: {
    dealerData: "Chargement des données revendeur…",
    campaign: "Chargement de la campagne salon…",
  },
} as const;
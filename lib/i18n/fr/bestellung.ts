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
    campaignOnly: "Produits promo uniquement",
    standardOnly: "Produits standard uniquement",
  },

  toast: {
    productAddedTitle: "Produit ajouté",
    productAddedText: "{product} a été ajouté au panier.",

    maxCampaignQtyTitle: "Quantité promo maximale atteinte",
    maxCampaignQtyText:
      "Un maximum de {count} pièces par revendeur est autorisé pour {product}.",

    noDealer: "❌ Aucun revendeur trouvé – veuillez vous reconnecter.",
    needDistributor: "❌ Veuillez sélectionner un distributeur principal.",
    needValidDate: "Veuillez choisir une date de livraison valide (YYYY-MM-DD).",

    invalidInputTitle: "Saisie invalide",
    invalidQuantityText: "Veuillez saisir une quantité valide pour {product}.",

    missingDistributorTitle: "❌ Distributeur manquant",
    missingDistributorText:
      "Veuillez sélectionner un distributeur pour {product}.",

    missingProviderTitle: "❌ Fournisseur manquant",
    missingProviderText:
      'Veuillez indiquer le nom du revendeur pour « Autre » pour {product}.',

    missingDisplayReasonTitle:
      "Justification du display supplémentaire manquante",
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
      "Au moins un display a déjà été commandé pour {product}. Veuillez indiquer dans le commentaire pourquoi un display supplémentaire est nécessaire (p. ex. deuxième site).",

    displayLimitReachedTitle: "Limite de display atteinte",
    displayLimitReachedText:
      "Un maximum de {max} pièces display est autorisé pour {product}. Déjà commandé : {ordered}. Encore disponible pour cette ligne : {free}.",

    displayNotAllowedTitle: "Display non disponible",
    displayNotAllowedText:
      "Aucune commande display n’est définie pour ce produit.",

    totalLimitReachedTitle: "Limite totale atteinte",
    totalLimitReachedText:
      "Un maximum total de {max} pièces promo est autorisé pour {product}. Déjà commandé : {ordered}. Encore disponible pour cette ligne : {free}.",

    campaignLimitReachedTitle: "Limite {mode} atteinte",
    campaignLimitReachedText:
      "{allowed} pièce(s) pour {product} sont encore possibles au prix {modeLower}. Déjà commandé : {ordered}. {overflow} pièce(s) ont été automatiquement ajoutées comme ligne séparée au prix normal.",

    campaignExhaustedTitle:
      "Quota {mode} épuisé",
    campaignExhaustedText:
      "Il ne reste plus de quota {modeLower} pour {product}. Déjà commandé : {ordered}. La quantité totale a été automatiquement reprise au prix normal.",

    orderNotPossibleTitle: "Commande impossible",
    orderNotPossibleText:
      "La commande n’a pas pu être enregistrée.",

    uploadFailed: "Échec du téléversement du fichier",
    fileUploadFailed: "Échec du téléversement du fichier",
    fileUploadPartialFailure:
      "La commande a été enregistrée, mais le téléversement du fichier a échoué.",
    projectIdCopied: "ID du projet copiée",
  },

  provider: {
    pleaseSelect: "Veuillez choisir",
    cheapestProvider: "Fournisseur le moins cher",
    providerName: "Veuillez indiquer le nom du fournisseur",
    providerNamePlaceholder: "Nom du revendeur",
    providerNameRequiredHint:
      "Champ obligatoire lorsque « Autre » est sélectionné.",
    cheapestPriceGross:
      "Prix le plus bas (TVA incl.)",
    other: "Autre",
  },

  campaign: {
    campaign: "Campagne",
    activeTradefairCampaign: "Campagne salon active",
    validFromTo: "Valable du {start} au {end}",

    campaignProductsCount: "{count} produits promotionnels",
    campaignProducts: "Produits promo",
    campaignProductsIntro:
      "Ces produits font actuellement partie de la campagne.",
    noCampaignProducts: "Aucun produit promo trouvé.",

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
      discountVsHrp: "Remise vs HRP",
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
      already: "Déjà commandé",
      cart: "Panier",
      total: "Total",
      nextTier: "Prochain niveau de bonus",
      highestTierReached: "Niveau de bonus maximal atteint",
      missingToNext: "Il manque encore : {amount}",
      noTierAvailable: "Aucun niveau de bonus disponible pour le moment.",
      bonus: "Bonus",
      level: "Niveau {level}",
    },

    limits: {
      displayMax:
        "Display max. {max} · déjà commandé {ordered} · reste {free}",
      messeMax:
        "Salon max. {max} · déjà commandé {ordered} · reste {free}",
      campaignMax:
        "Promo max. {max} · déjà commandé {ordered} · reste {free}",
      totalCampaignMax:
        "Promo total max. {max} · déjà commandé {ordered} · reste {free}",

      rowDisplayMax:
        "Dans cette ligne display, max. {count} pièce(s) encore possible(s) au prix display",
      rowMesseMax:
        "Dans cette ligne salon, max. {count} pièce(s) encore possible(s) au prix salon",
      rowCampaignMax:
        "Dans cette ligne, max. {count} pièce(s) encore possible(s) au prix promo",
    },
  },

  cartSheet: {
    title: "Commande au meilleur prix",
    empty: "Aucun produit sélectionné.",

    linkedProject: {
      title: "Projet lié",
      customer: "Client",
      project: "Projet",
      open: "Ouvrir le projet",
      remove: "Retirer le projet",
      copied: "ID du projet copiée",
      copyId: "Copier l’ID du projet",
    },

    dealerInfo: {
      title: "Informations du revendeur",
      customerNumber: "N° client",
      contactPerson: "Contact",
      phone: "Téléphone",
      email: "E-mail",
      city: "Lieu",
      kam: "KAM",
    },

    distributor: {
      title: "Distributeur principal",
      placeholder: "Veuillez choisir",
      defaultHint:
        "Par défaut via ElectronicPartner Schweiz AG.",
    },

    order: {
      title: "Informations de commande",
      delivery: "Livraison",
      deliveryImmediate: "Immédiate",
      deliveryScheduled: "À une date précise",
      deliveryPlaceholder: "Veuillez choisir",
      deliveryDateOptional: "Date de livraison (optionnelle)",
      comment:
        "Informations importantes pour la commande (commentaire)",
      commentPlaceholder:
        "p. ex. « Doit impérativement être livré au plus tard le 15.10 »…",
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
      city: "Localité",
      country: "Pays",
      phoneOptional: "Téléphone (optionnel)",
      emailOptional: "E-mail (optionnel)",
      defaultCountry: "Suisse",
    },

    files: {
      title: "Fichiers pour la commande",
      attached: "{count} fichier(s) joint(s)",
    },

    bonus: {
      title: "Bonus live dans le panier",
      activeCampaign: "Campagne active",
      from: "De",
      to: "À",
      alreadyBooked: "Déjà commandé",
      thisOrder: "Cette commande",
      afterSubmit: "Après envoi",
      currentTier: "Niveau actuellement atteint",
      noneYet: "Aucun pour le moment",
      progressToNext: "Progression vers le niveau suivant",
      nextTier: "Prochain niveau de bonus",
      fromThreshold: "dès",
      bonus: "Bonus",
      estimatedBonus: "Bonus",
      highestTierReached: "Niveau de bonus maximal atteint",
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
      close: "Fermer",
    },

    product: {
      unknown: "Inconnu",
      empty: "Aucun produit sélectionné.",
      ean: "EAN",
      specialDistribution: "Distribution spéciale",
      bonusRelevant: "Éligible au bonus",
      normalPrice: "Prix normal",

      quantity: "Quantité",
      price: "Prix (CHF)",
      ekNormal: "Prix d’achat normal",
      normalEk: "Prix d’achat normal",
      saved:
        "{amount} CHF économisés ({percent}%)",

      pricingMode: "Mode de tarification",
      pricingModeDisplay: "Display",
      pricingModeMesse: "Salon",
      pricingModeStandard: "Standard",

      modeDisplay: "Display",
      modeMesse: "Salon",
      modeStandard: "Standard",
      modeCampaign: "Promotion",

      upeGross: "PVC brut",
      displayPriceNet: "Prix display net",
      messePriceNet: "Prix salon net",
      discountVsHrp: "Remise vs HRP",

      orderAsDisplay:
        "Commander comme display",

      reasonForAdditionalDisplay:
        "Justification du display supplémentaire",
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
        "Champ obligatoire lorsque « Autre » est sélectionné.",

      cheapestPriceGross:
        "Prix le plus bas (TVA incl.)",

      distributor: "Distributeur",
      distributorPlaceholder:
        "Veuillez choisir",

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
    dealerData: "Chargement des données du revendeur…",
    campaign: "Chargement de la campagne salon…",
  },
} as const;
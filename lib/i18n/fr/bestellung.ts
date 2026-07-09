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
    campaignOnly: "Uniquement les produits salon",
    promotionOnly: "Uniquement les produits promotionnels",
    standardOnly: "Uniquement les produits standard",
  },

  toast: {
    productAddedTitle: "Produit ajouté",
    productAddedText: "{product} a été ajouté au panier.",

    maxCampaignQtyTitle: "Quantité maximale de campagne atteinte",
    maxCampaignQtyText:
      "Un maximum de {count} pièce(s) par revendeur est autorisé pour {product}.",

    noDealer: "❌ Aucun revendeur trouvé – veuillez vous reconnecter.",
    needDistributor: "❌ Veuillez sélectionner un distributeur principal.",
    needValidDate:
      "Veuillez sélectionner une date de livraison valide (YYYY-MM-DD).",

    missingDeliveryPhoneTitle: "Numéro de téléphone manquant",
    missingDeliveryPhoneText:
      "Veuillez indiquer un numéro de téléphone pour l'adresse de livraison alternative.",

    invalidInputTitle: "Saisie non valide",
    invalidQuantityText:
      "Veuillez saisir une quantité valide pour {product}.",

    missingDistributorTitle: "❌ Distributeur manquant",
    missingDistributorText:
      "Veuillez sélectionner un distributeur pour {product}.",

    missingProviderTitle: "❌ Fournisseur manquant",
    missingProviderText:
      'Veuillez saisir le nom du revendeur pour "Autre" pour {product}.',

    missingDisplayReasonTitle:
      "Justification pour display supplémentaire manquante",
    missingDisplayReasonText:
      "Veuillez indiquer dans le champ commentaire pourquoi un display supplémentaire est nécessaire pour {product}.",

    unknownDistributorCodeTitle: "❌ Code distributeur inconnu",
    unknownDistributorCodeText:
      'Le distributeur "{code}" est introuvable.',

    orderSavedTitle: "✅ Commande enregistrée",
    orderSavedText: "La commande a été transmise avec succès.",

    orderSaveErrorTitle: "❌ Erreur lors de l'enregistrement",
    orderSaveErrorText: "Erreur inconnue",

    displayAlreadyOrderedTitle: "Display déjà commandé",
    displayAlreadyOrderedText:
      "Au moins un display a déjà été commandé pour {product}. Veuillez expliquer dans le champ commentaire pourquoi un display supplémentaire est nécessaire (p. ex. deuxième emplacement).",

    displayLimitReachedTitle: "Limite display atteinte",
    displayLimitReachedText:
      "Un maximum de {max} display(s) est valable pour {product}. Déjà commandé: {ordered}. Encore disponible pour cette position: {free}.",

    displayNotAllowedTitle: "Display non disponible",
    displayNotAllowedText:
      "Aucune option de commande display n'est enregistrée pour ce produit.",

    totalLimitReachedTitle: "Limite totale atteinte",
    totalLimitReachedText:
      "Un total maximal de {max} pièce(s) de campagne est valable pour {product}. Déjà commandé: {ordered}. Encore disponible pour cette position: {free}.",

    campaignLimitReachedTitle: "Limite {mode} atteinte",
    campaignLimitReachedText:
      "{allowed} pièce(s) de {product} sont encore possibles au prix {modeLower}. Déjà commandé: {ordered}. {overflow} pièce(s) ont été automatiquement ajoutées comme position séparée au prix normal.",

    campaignExhaustedTitle: "Quota {mode} épuisé",
    campaignExhaustedText:
      "Il ne reste plus de quota {modeLower} pour {product}. Déjà commandé: {ordered}. La quantité complète a été automatiquement transférée au prix normal.",

    orderNotPossibleTitle: "Commande impossible",
    orderNotPossibleText: "La commande n'a pas pu être enregistrée.",

    uploadFailed: "Échec du téléchargement du fichier",
    fileUploadFailed: "Échec du téléchargement du fichier",
    fileUploadPartialFailure:
      "La commande a été enregistrée, mais le téléchargement du fichier a échoué.",
    projectIdCopied: "ID projet copié",
  },

  provider: {
    pleaseSelect: "Veuillez sélectionner",
    cheapestProvider: "Fournisseur au prix le plus bas",
    providerName: "Veuillez saisir le nom du fournisseur",
    providerNamePlaceholder: "Nom du revendeur",
    providerNameRequiredHint:
      'Champ obligatoire lorsque "Autre" est sélectionné.',
    cheapestPriceGross: "Prix le plus bas (TVA incl.)",
    other: "Autre",
  },

  campaign: {
    campaign: "Campagne",
    activeTradefairCampaign: "Campagne salon active",
    activePromotion: "Promotion active",
    activeCampaign: "Campagne active",
    validFromTo: "Valable du {start} au {end}",

    campaignProductsCount: "{count} produits de campagne",
    campaignProducts: "Produits salon",
    promotionProducts: "Produits promotionnels",
    campaignProductsIntro:
      "Ces produits font actuellement partie de l'action salon.",
    promotionProductsIntro:
      "Ces produits font actuellement partie de la promotion.",
    noCampaignProducts: "Aucun produit salon trouvé.",
    noPromotionProducts: "Aucun produit promotionnel trouvé.",

    badge: {
      display: "Display",
      mixed: "Salon + display",
      messe: "Prix salon",
      promotion: "Prix promotionnel",
      standard: "Action",
    },

    pricing: {
      upeGross: "PVR brut",
      dealerPrice: "Prix revendeur",
      messePriceNet: "Prix salon net",
      promotionPriceNet: "Prix promotionnel net",
      displayPriceNet: "Prix display net",
      pricingMode: "Mode de prix",
      pricingModeDisplay: "Display",
      pricingModeMesse: "Salon",
      pricingModePromotion: "Promotion",
      pricingModeStandard: "Standard",
      discountVsHrp: "Remise vs HRP",
    },

    filters: {
      searchPlaceholder: "Recherche par article, nom, EAN, marque …",
      allGroups: "Tous les groupes",
      allCategories: "Toutes les catégories",
    },

    progress: {
      title: "Progression bonus",
      afterSubmit: "Après envoi",
      progress: "Progression",
      already: "Déjà commandé",
      cart: "Panier",
      total: "Total",
      nextTier: "Prochain palier bonus",
      highestTierReached: "Palier bonus le plus élevé atteint",
      missingToNext: "Il manque encore: {amount}",
      noTierAvailable: "Aucun palier bonus disponible pour le moment.",
      bonus: "Bonus",
      level: "Palier {level}",
    },

    limits: {
      displayMax:
        "Display max. {max} · déjà commandé {ordered} · encore disponible {free}",
      messeMax:
        "Salon max. {max} · déjà commandé {ordered} · encore disponible {free}",
      campaignMax:
        "Action max. {max} · déjà commandé {ordered} · encore disponible {free}",
      totalCampaignMax:
        "Total action max. {max} · déjà commandé {ordered} · encore disponible {free}",

      rowDisplayMax:
        "Dans cette position display, encore max. {count} pièce(s) possibles au prix display",
      rowMesseMax:
        "Dans cette position salon, encore max. {count} pièce(s) possibles au prix salon",
      rowCampaignMax:
        "Dans cette position, encore max. {count} pièce(s) possibles au prix action",
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
      copied: "ID projet copié",
      copyId: "Copier l'ID projet",
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
      title: "Données de commande",
      delivery: "Livraison",
      deliveryImmediate: "Immédiate",
      deliveryScheduled: "À une date",
      deliveryPlaceholder: "Veuillez choisir",
      deliveryDateOptional: "Date de livraison (optionnelle)",
      comment: "Informations importantes pour la commande (commentaire)",
      commentPlaceholder:
        "p. ex. 'Doit impérativement être livré avant le 15.10.'…",
      referenceNumber: "Votre n° de commande/référence",
      referencePlaceholder: "p. ex. 45001234",
    },

    altDelivery: {
      title: "Adresse de livraison différente / livraison directe",
      useAdditionalAddress: "Utiliser une adresse de livraison supplémentaire",
      name: "Nom / Société",
      street: "Rue / N°",
      zip: "NPA",
      city: "Lieu",
      country: "Pays",
      phone: "Téléphone",
      phoneOptional: "Téléphone (optionnel)",
      emailOptional: "E-mail (optionnel)",
      defaultCountry: "Suisse",
    },

    files: {
      title: "Fichiers pour la commande",
      attached: "{count} fichier(s) joint(s)",
    },

    bonus: {
      title: "Bonus en direct dans le panier",
      activeCampaign: "Campagne active",
      from: "De",
      to: "À",
      alreadyBooked: "Déjà commandé",
      thisOrder: "Cette commande",
      afterSubmit: "Après envoi",
      currentTier: "Palier actuellement atteint",
      noneYet: "Aucun pour l'instant",
      progressToNext: "Progression vers le prochain palier",
      nextTier: "Prochain palier bonus",
      fromThreshold: "dès",
      bonus: "Bonus",
      estimatedBonus: "Bonus",
      highestTierReached: "Palier bonus le plus élevé atteint",
    },

    summary: {
      title: "Résumé",
      total: "Total",
      totalPrice: "Prix total",
      bonusProgress: "Progression bonus",
      piecesValue: "{count} pièces",
      totalSavings: "Économie totale: {amount}",
      savings: "Économie totale: {amount} CHF",
      missingToNext: "Encore {amount} jusqu'à {tier}",
      highestTierReached: "Palier bonus le plus élevé atteint",
      send: "Envoyer la commande",
      sending: "Envoi…",
      continueShopping: "Continuer les achats",
      pieces: "pièces",
      close: "Fermer",
    },

    product: {
      unknown: "Inconnu",
      empty: "Aucun produit sélectionné pour le moment.",
      ean: "EAN",
      specialDistribution: "Distribution spéciale",
      bonusRelevant: "Pertinent pour le bonus",
      normalPrice: "Prix normal",
      messePrice: "Prix salon",

      quantity: "Quantité",
      price: "Prix (CHF)",
      ekNormal: "Prix revendeur normal",
      normalEk: "Prix revendeur normal",
      saved: "{amount} CHF économisés ({percent}%)",

      pricingMode: "Mode de prix",
      pricingModeDisplay: "Display",
      pricingModeMesse: "Salon",
      pricingModePromotion: "Promotion",
      pricingModeStandard: "Standard",

      modeDisplay: "Display",
      modeMesse: "Salon",
      modePromotion: "Promotion",
      modeStandard: "Standard",
      modeCampaign: "Action",

      upeGross: "PVR brut",
      displayPriceNet: "Prix display net",
      messePriceNet: "Prix salon net",
      promotionPriceNet: "Prix promotionnel net",
      discountVsHrp: "Remise vs HRP",

      orderAsDisplay: "Commander comme display",

      reasonForAdditionalDisplay: "Justification pour display supplémentaire",
      reasonPlaceholder:
        "p. ex. deuxième emplacement, rénovation, nouvelle surface de vente …",
      reasonHint:
        "Un display a déjà été commandé pour ce produit. Veuillez justifier le besoin supplémentaire.",

      cheapestProvider: "Fournisseur au prix le plus bas",
      providerName: "Veuillez saisir le nom du fournisseur",
      providerNamePlaceholder: "Nom du revendeur",
      providerNameHint:
        'Champ obligatoire lorsque "Autre" est sélectionné.',

      cheapestPriceGross: "Prix le plus bas (TVA incl.)",

      distributor: "Distributeur",
      distributorPlaceholder: "Veuillez sélectionner",

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
    campaign: "Chargement de la campagne…",
  },
} as const;
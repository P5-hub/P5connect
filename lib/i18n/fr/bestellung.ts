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
    pieces: "Pièces",
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

    maxCampaignQtyTitle: "Quantité maximale atteinte",
    maxCampaignQtyText:
      "Pour {product}, un maximum de {count} pièces par revendeur est autorisé.",

    noDealer: "❌ Aucun revendeur trouvé – veuillez vous reconnecter.",
    needDistributor: "❌ Veuillez sélectionner le distributeur principal.",
    needValidDate: "Veuillez choisir une date de livraison valide (YYYY-MM-DD).",

    invalidInputTitle: "Saisie invalide",
    invalidQuantityText: "Veuillez saisir une quantité valide pour {product} !",

    missingDistributorTitle: "❌ Distributeur manquant",
    missingDistributorText:
      "Veuillez sélectionner un distributeur pour {product}.",

    missingProviderTitle: "❌ Fournisseur manquant",
    missingProviderText:
      "Veuillez indiquer le nom du fournisseur pour « Autre » pour {product}.",

    missingDisplayReasonTitle:
      "Justification pour affichage supplémentaire manquante",
    missingDisplayReasonText:
      "Veuillez indiquer dans le commentaire pourquoi un affichage supplémentaire est nécessaire pour {product}.",

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
      "Un display a déjà été commandé pour {product}. Veuillez justifier un display supplémentaire dans le champ commentaire.",

    displayLimitReachedTitle: "Limite display atteinte",
    displayLimitReachedText:
      "Pour {product}, maximum {max} display autorisés. Déjà commandés: {ordered}. Encore disponibles: {free}.",

    totalLimitReachedTitle: "Limite totale atteinte",
    totalLimitReachedText:
      "Pour {product}, maximum {max} pièces promotionnelles autorisées. Déjà commandées: {ordered}. Encore disponibles: {free}.",

    campaignLimitReachedTitle: "Limite {mode} atteinte",
    campaignLimitReachedText:
      "Pour {product}, encore {allowed} pièces au prix {modeLower}. Déjà commandées: {ordered}. {overflow} pièces ont été ajoutées au prix standard.",

    campaignExhaustedTitle:
      "Contingent {mode} épuisé",
    campaignExhaustedText:
      "Plus aucun contingent {modeLower} disponible pour {product}. Déjà commandé: {ordered}. Toute la quantité a été reprise au prix normal.",

    orderNotPossibleTitle: "Commande impossible",
    orderNotPossibleText:
      "La commande n’a pas pu être enregistrée.",

    uploadFailed: "Échec du téléchargement du fichier",

    projectIdCopied: "ID projet copié",
  },

  provider: {
    pleaseSelect: "Veuillez sélectionner",
    cheapestProvider: "Fournisseur le moins cher",
    providerName: "Veuillez indiquer le nom du fournisseur",
    providerNamePlaceholder: "Nom du revendeur",
    providerNameRequiredHint:
      "Champ obligatoire si « Autre » est sélectionné.",
    cheapestPriceGross:
      "Prix le plus bas (TVA incluse)",
    other: "Autre",
  },

  campaign: {
    campaign: "Campagne",
    activeTradefairCampaign: "Campagne salon active",
    validFromTo: "Valable du {start} au {end}",

    campaignProductsCount: "{count} produits promotionnels",
    campaignProducts: "Produits salon",
    campaignProductsIntro:
      "Ces produits font actuellement partie de l’action salon.",
    noCampaignProducts: "Aucun produit salon trouvé.",

    badge: {
      display: "Display",
      mixed: "Salon + Display",
      messe: "Prix salon",
      standard: "Promotion",
    },
    
    filters: {
      searchPlaceholder: "Rechercher par article, nom, EAN, marque …",
      allGroups: "Tous les groupes",
      allCategories: "Toutes les catégories",
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
      discountVsHrp: "Remise vs. PVC",
    },

    progress: {
      title: "Progression bonus",
      afterSubmit: "Après envoi",
      progress: "Progression",
      already: "Déjà",
      cart: "Panier",
      total: "Total",
      nextTier: "Prochaine étape bonus",
      highestTierReached: "Niveau bonus maximum atteint",
      missingToNext: "Il manque encore : {amount}",
      noTierAvailable: "Aucun niveau bonus disponible.",
      bonus: "Bonus",
      level: "Niveau {level}",
    },

    limits: {
      displayMax:
        "Display max. {max} · déjà commandé {ordered} · restant {free}",
      messeMax:
        "Salon max. {max} · déjà commandé {ordered} · restant {free}",
      campaignMax:
        "Action max. {max} · déjà commandé {ordered} · restant {free}",
      totalCampaignMax:
        "Total action max. {max} · déjà commandé {ordered} · restant {free}",

      rowDisplayMax:
        "Dans cette position display encore max. {count} pièces au prix display",
      rowMesseMax:
        "Dans cette position salon encore max. {count} pièces au prix salon",
      rowCampaignMax:
        "Dans cette position encore max. {count} pièces au prix promotion",
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
      remove: "Supprimer le projet",
      copied: "ID projet copié",
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
        "Par défaut via ElectronicPartner Suisse SA.",
    },

    order: {
      title: "Informations de commande",
      delivery: "Livraison",
      deliveryImmediate: "Immédiate",
      deliveryScheduled: "À la date",
      deliveryDateOptional: "Date de livraison (optionnel)",
      comment:
        "Informations importantes concernant la commande (commentaire)",
      commentPlaceholder:
        "p. ex. 'Doit être livré avant le 15.10.'…",
      referenceNumber: "Votre n° de référence",
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
      bonusProgress: "Progression bonus",
      savings: "Économie totale : {amount} CHF",
      missingToNext:
        "Encore {amount} jusqu’à {tier}",
      highestTierReached:
        "Niveau bonus maximum atteint",
      send: "Envoyer la commande",
      sending: "Envoi…",
      continueShopping: "Continuer les achats",
      pieces: "Pièces",
    },

    product: {
      unknown: "Inconnu",
      ean: "EAN",
      specialDistribution: "Distribution spéciale",
      bonusRelevant: "Pertinent pour bonus",
      normalPrice: "Prix normal",

      quantity: "Quantité",
      price: "Prix (CHF)",
      ekNormal: "Prix d’achat normal",
      saved:
        "{amount} CHF économisés ({percent}%)",

      pricingMode: "Mode de tarification",
      pricingModeDisplay: "Display",
      pricingModeMesse: "Salon",
      pricingModeStandard: "Standard",

      upeGross: "PVC brut",
      displayPriceNet: "Prix display net",
      messePriceNet: "Prix salon net",
      discountVsHrp: "Remise vs. PVC",

      orderAsDisplay:
        "Commander comme display",

      reasonForAdditionalDisplay:
        "Justification display supplémentaire",
      reasonPlaceholder:
        "p. ex. deuxième site, rénovation, nouvelle surface…",
      reasonHint:
        "Un display a déjà été commandé. Veuillez justifier le besoin supplémentaire.",

      cheapestProvider:
        "Fournisseur le moins cher",
      providerName:
        "Veuillez indiquer le fournisseur",
      providerNamePlaceholder:
        "Nom du revendeur",
      providerNameHint:
        "Champ obligatoire si « Autre ».",

      cheapestPriceGross:
        "Prix le plus bas (TVA incluse)",

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
    campaign: "Chargement campagne salon…",
  },
} as const;
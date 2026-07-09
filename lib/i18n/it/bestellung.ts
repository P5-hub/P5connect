export const bestellung = {
  common: {
    unknown: "Sconosciuto",
    unknownProduct: "Prodotto sconosciuto",
    remove: "Rimuovi",
    reset: "Ripristina",
    close: "Chiudi",
    continueShopping: "Continua gli acquisti",
    addToCart: "Aggiungi al carrello",
    cartOpen: "Apri carrello",
    loading: "Caricamento…",
    quantity: "Quantità",
    price: "Prezzo",
    total: "Totale",
    totalPrice: "Prezzo totale",
    summary: "Riepilogo",
    pieces: "pz",
    filesAttached: "{count} file allegato/i",
  },

  viewMode: {
    both: "Mostra entrambi",
    campaignOnly: "Solo prodotti fiera",
    promotionOnly: "Solo prodotti promozionali",
    standardOnly: "Solo prodotti standard",
  },

  toast: {
    productAddedTitle: "Prodotto aggiunto",
    productAddedText: "{product} è stato aggiunto al carrello.",

    maxCampaignQtyTitle: "Quantità massima campagna raggiunta",
    maxCampaignQtyText:
      "Per {product} sono consentiti al massimo {count} pezzi per rivenditore.",

    noDealer: "❌ Nessun rivenditore trovato – effettua nuovamente il login.",
    needDistributor: "❌ Seleziona un distributore principale.",
    needValidDate:
      "Seleziona una data di consegna valida (YYYY-MM-DD).",

    missingDeliveryPhoneTitle: "Numero di telefono mancante",
    missingDeliveryPhoneText:
      "Inserisci un numero di telefono per l'indirizzo di consegna alternativo.",

    invalidInputTitle: "Inserimento non valido",
    invalidQuantityText:
      "Inserisci una quantità valida per {product}.",

    missingDistributorTitle: "❌ Distributore mancante",
    missingDistributorText:
      "Seleziona un distributore per {product}.",

    missingProviderTitle: "❌ Fornitore mancante",
    missingProviderText:
      'Inserisci il nome del rivenditore per "Altro" per {product}.',

    missingDisplayReasonTitle:
      "Motivazione per display aggiuntivo mancante",
    missingDisplayReasonText:
      "Indica nel campo commento perché è necessario un display aggiuntivo per {product}.",

    unknownDistributorCodeTitle: "❌ Codice distributore sconosciuto",
    unknownDistributorCodeText:
      'Il distributore "{code}" non è stato trovato.',

    orderSavedTitle: "✅ Ordine salvato",
    orderSavedText: "L'ordine è stato inviato con successo.",

    orderSaveErrorTitle: "❌ Errore durante il salvataggio",
    orderSaveErrorText: "Errore sconosciuto",

    displayAlreadyOrderedTitle: "Display già ordinato",
    displayAlreadyOrderedText:
      "Per {product} è già stato ordinato almeno un display. Indica nel campo commento perché è necessario un display aggiuntivo (ad es. seconda sede).",

    displayLimitReachedTitle: "Limite display raggiunto",
    displayLimitReachedText:
      "Per {product} sono validi al massimo {max} display. Già ordinati: {ordered}. Ancora disponibili per questa posizione: {free}.",

    displayNotAllowedTitle: "Display non disponibile",
    displayNotAllowedText:
      "Per questo prodotto non è registrata alcuna opzione di ordine display.",

    totalLimitReachedTitle: "Limite totale raggiunto",
    totalLimitReachedText:
      "Per {product} sono validi al massimo {max} pezzi campagna totali. Già ordinati: {ordered}. Ancora disponibili per questa posizione: {free}.",

    campaignLimitReachedTitle: "Limite {mode} raggiunto",
    campaignLimitReachedText:
      "Per {product} sono ancora possibili {allowed} pezzi al prezzo {modeLower}. Già ordinati: {ordered}. {overflow} pezzi sono stati aggiunti automaticamente come posizione separata al prezzo normale.",

    campaignExhaustedTitle: "Contingente {mode} esaurito",
    campaignExhaustedText:
      "Per {product} non è più disponibile alcun contingente {modeLower}. Già ordinati: {ordered}. L'intera quantità è stata automaticamente trasferita al prezzo normale.",

    orderNotPossibleTitle: "Ordine non possibile",
    orderNotPossibleText: "Non è stato possibile salvare l'ordine.",

    uploadFailed: "Caricamento file non riuscito",
    fileUploadFailed: "Caricamento file non riuscito",
    fileUploadPartialFailure:
      "L'ordine è stato salvato, ma il caricamento del file non è riuscito.",
    projectIdCopied: "ID progetto copiato",
  },

  provider: {
    pleaseSelect: "Seleziona",
    cheapestProvider: "Fornitore con prezzo più basso",
    providerName: "Inserisci il nome del fornitore",
    providerNamePlaceholder: "Nome del rivenditore",
    providerNameRequiredHint:
      'Campo obbligatorio se è selezionato "Altro".',
    cheapestPriceGross: "Prezzo più basso (IVA incl.)",
    other: "Altro",
  },

  campaign: {
    campaign: "Campagna",
    activeTradefairCampaign: "Campagna fiera attiva",
    activePromotion: "Promozione attiva",
    activeCampaign: "Campagna attiva",
    validFromTo: "Valida dal {start} al {end}",

    campaignProductsCount: "{count} prodotti campagna",
    campaignProducts: "Prodotti fiera",
    promotionProducts: "Prodotti promozionali",
    campaignProductsIntro:
      "Questi prodotti fanno attualmente parte dell'azione fiera.",
    promotionProductsIntro:
      "Questi prodotti fanno attualmente parte della promozione.",
    noCampaignProducts: "Nessun prodotto fiera trovato.",
    noPromotionProducts: "Nessun prodotto promozionale trovato.",

    badge: {
      display: "Display",
      mixed: "Fiera + display",
      messe: "Prezzo fiera",
      promotion: "Prezzo promozionale",
      standard: "Azione",
    },

    pricing: {
      upeGross: "PVP lordo",
      dealerPrice: "Prezzo rivenditore",
      messePriceNet: "Prezzo fiera netto",
      promotionPriceNet: "Prezzo promozionale netto",
      displayPriceNet: "Prezzo display netto",
      pricingMode: "Modalità prezzo",
      pricingModeDisplay: "Display",
      pricingModeMesse: "Fiera",
      pricingModePromotion: "Promozione",
      pricingModeStandard: "Standard",
      discountVsHrp: "Sconto vs HRP",
    },

    filters: {
      searchPlaceholder: "Cerca per articolo, nome, EAN, marca …",
      allGroups: "Tutti i gruppi",
      allCategories: "Tutte le categorie",
    },

    progress: {
      title: "Avanzamento bonus",
      afterSubmit: "Dopo l'invio",
      progress: "Avanzamento",
      already: "Già ordinato",
      cart: "Carrello",
      total: "Totale",
      nextTier: "Prossimo livello bonus",
      highestTierReached: "Livello bonus massimo raggiunto",
      missingToNext: "Mancano ancora: {amount}",
      noTierAvailable: "Nessun livello bonus ancora disponibile.",
      bonus: "Bonus",
      level: "Livello {level}",
    },

    limits: {
      displayMax:
        "Display max. {max} · già ordinati {ordered} · ancora disponibili {free}",
      messeMax:
        "Fiera max. {max} · già ordinati {ordered} · ancora disponibili {free}",
      campaignMax:
        "Azione max. {max} · già ordinati {ordered} · ancora disponibili {free}",
      totalCampaignMax:
        "Totale azione max. {max} · già ordinati {ordered} · ancora disponibili {free}",

      rowDisplayMax:
        "In questa posizione display sono ancora possibili max. {count} pezzi al prezzo display",
      rowMesseMax:
        "In questa posizione fiera sono ancora possibili max. {count} pezzi al prezzo fiera",
      rowCampaignMax:
        "In questa posizione sono ancora possibili max. {count} pezzi al prezzo azione",
    },
  },

  cartSheet: {
    title: "Ordine al miglior prezzo",
    empty: "Nessun prodotto selezionato.",

    linkedProject: {
      title: "Progetto collegato",
      customer: "Cliente",
      project: "Progetto",
      open: "Apri progetto",
      remove: "Rimuovi progetto",
      copied: "ID progetto copiato",
      copyId: "Copia ID progetto",
    },

    dealerInfo: {
      title: "Informazioni rivenditore",
      customerNumber: "N. cliente",
      contactPerson: "Contatto",
      phone: "Tel.",
      email: "E-mail",
      city: "Località",
      kam: "KAM",
    },

    distributor: {
      title: "Distributore principale",
      placeholder: "Seleziona",
      defaultHint:
        "Per impostazione predefinita tramite ElectronicPartner Schweiz AG.",
    },

    order: {
      title: "Dati ordine",
      delivery: "Consegna",
      deliveryImmediate: "Subito",
      deliveryScheduled: "A data programmata",
      deliveryPlaceholder: "Seleziona",
      deliveryDateOptional: "Data di consegna (opzionale)",
      comment: "Informazioni importanti per l'ordine (commento)",
      commentPlaceholder:
        "ad es. 'Deve essere consegnato entro il 15.10.'…",
      referenceNumber: "Il tuo n. ordine/riferimento",
      referencePlaceholder: "ad es. 45001234",
    },

    altDelivery: {
      title: "Indirizzo di consegna diverso / consegna diretta",
      useAdditionalAddress: "Utilizza indirizzo di consegna aggiuntivo",
      name: "Nome / Azienda",
      street: "Via / N.",
      zip: "CAP",
      city: "Località",
      country: "Paese",
      phone: "Telefono",
      phoneOptional: "Telefono (opzionale)",
      emailOptional: "E-mail (opzionale)",
      defaultCountry: "Svizzera",
    },

    files: {
      title: "File per l'ordine",
      attached: "{count} file allegato/i",
    },

    bonus: {
      title: "Bonus live nel carrello",
      activeCampaign: "Campagna attiva",
      from: "Da",
      to: "A",
      alreadyBooked: "Già ordinato",
      thisOrder: "Questo ordine",
      afterSubmit: "Dopo l'invio",
      currentTier: "Livello attualmente raggiunto",
      noneYet: "Ancora nessuno",
      progressToNext: "Avanzamento al prossimo livello",
      nextTier: "Prossimo livello bonus",
      fromThreshold: "da",
      bonus: "Bonus",
      estimatedBonus: "Bonus",
      highestTierReached: "Livello bonus massimo raggiunto",
    },

    summary: {
      title: "Riepilogo",
      total: "Totale",
      totalPrice: "Prezzo totale",
      bonusProgress: "Avanzamento bonus",
      piecesValue: "{count} pz",
      totalSavings: "Risparmio totale: {amount}",
      savings: "Risparmio totale: {amount} CHF",
      missingToNext: "Ancora {amount} fino a {tier}",
      highestTierReached: "Livello bonus massimo raggiunto",
      send: "Invia ordine",
      sending: "Invio…",
      continueShopping: "Continua gli acquisti",
      pieces: "pz",
      close: "Chiudi",
    },

    product: {
      unknown: "Sconosciuto",
      empty: "Nessun prodotto selezionato.",
      ean: "EAN",
      specialDistribution: "Distribuzione speciale",
      bonusRelevant: "Rilevante per il bonus",
      normalPrice: "Prezzo normale",
      messePrice: "Prezzo fiera",

      quantity: "Quantità",
      price: "Prezzo (CHF)",
      ekNormal: "Prezzo rivenditore normale",
      normalEk: "Prezzo rivenditore normale",
      saved: "{amount} CHF risparmiati ({percent}%)",

      pricingMode: "Modalità prezzo",
      pricingModeDisplay: "Display",
      pricingModeMesse: "Fiera",
      pricingModePromotion: "Promozione",
      pricingModeStandard: "Standard",

      modeDisplay: "Display",
      modeMesse: "Fiera",
      modePromotion: "Promozione",
      modeStandard: "Standard",
      modeCampaign: "Azione",

      upeGross: "PVP lordo",
      displayPriceNet: "Prezzo display netto",
      messePriceNet: "Prezzo fiera netto",
      promotionPriceNet: "Prezzo promozionale netto",
      discountVsHrp: "Sconto vs HRP",

      orderAsDisplay: "Ordinare come display",

      reasonForAdditionalDisplay: "Motivazione per display aggiuntivo",
      reasonPlaceholder:
        "ad es. seconda sede, ristrutturazione, nuova area vendita …",
      reasonHint:
        "Per questo prodotto è già stato ordinato un display. Indica il fabbisogno aggiuntivo.",

      cheapestProvider: "Fornitore con prezzo più basso",
      providerName: "Inserisci il nome del fornitore",
      providerNamePlaceholder: "Nome del rivenditore",
      providerNameHint:
        'Campo obbligatorio se è selezionato "Altro".',

      cheapestPriceGross: "Prezzo più basso (IVA incl.)",

      distributor: "Distributore",
      distributorPlaceholder: "Seleziona",

      remove: "Rimuovi",
      other: "Altro",
    },
  },

  preview: {
    title: "Anteprima carrello",
    positions: "Posizioni nel carrello",
    quantityTotal: "Quantità totale",
    cartValue: "Valore carrello",
  },

  loading: {
    dealerData: "Caricamento dati rivenditore…",
    campaign: "Caricamento campagna…",
  },
} as const;
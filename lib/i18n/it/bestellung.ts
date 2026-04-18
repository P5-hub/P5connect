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
    pieces: "pezzi",
    filesAttached: "{count} file allegato/i",
  },

  viewMode: {
    both: "Mostra entrambi",
    campaignOnly: "Solo prodotti promozionali",
    standardOnly: "Solo prodotti standard",
  },

  toast: {
    productAddedTitle: "Prodotto aggiunto",
    productAddedText: "{product} è stato aggiunto al carrello.",

    maxCampaignQtyTitle: "Quantità promozionale massima raggiunta",
    maxCampaignQtyText:
      "Per {product} sono consentiti al massimo {count} pezzi per rivenditore.",

    noDealer: "❌ Nessun rivenditore trovato – effettua nuovamente il login.",
    needDistributor: "❌ Seleziona un distributore principale.",
    needValidDate: "Seleziona una data di consegna valida (YYYY-MM-DD).",

    invalidInputTitle: "Inserimento non valido",
    invalidQuantityText: "Inserisci una quantità valida per {product}.",

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

    unknownDistributorCodeTitle:
      "❌ Codice distributore sconosciuto",
    unknownDistributorCodeText:
      'Il distributore "{code}" non è stato trovato.',

    orderSavedTitle: "✅ Ordine salvato",
    orderSavedText:
      "L’ordine è stato inviato con successo.",

    orderSaveErrorTitle: "❌ Errore durante il salvataggio",
    orderSaveErrorText: "Errore sconosciuto",

    displayAlreadyOrderedTitle: "Display già ordinato",
    displayAlreadyOrderedText:
      "Per {product} è già stato ordinato almeno un display. Indica nel commento perché è necessario un display aggiuntivo (ad es. secondo punto vendita).",

    displayLimitReachedTitle: "Limite display raggiunto",
    displayLimitReachedText:
      "Per {product} sono validi al massimo {max} pezzi display. Già ordinati: {ordered}. Ancora disponibili per questa riga: {free}.",

    displayNotAllowedTitle: "Display non disponibile",
    displayNotAllowedText:
      "Per questo prodotto non è disponibile l’ordine come display.",

    totalLimitReachedTitle: "Limite totale raggiunto",
    totalLimitReachedText:
      "Per {product} sono validi al massimo {max} pezzi promozionali totali. Già ordinati: {ordered}. Ancora disponibili per questa riga: {free}.",

    campaignLimitReachedTitle: "Limite {mode} raggiunto",
    campaignLimitReachedText:
      "Per {product} sono ancora possibili {allowed} pezzi al prezzo {modeLower}. Già ordinati: {ordered}. {overflow} pezzo/i sono stati aggiunti automaticamente come riga separata al prezzo normale.",

    campaignExhaustedTitle:
      "Contingente {mode} esaurito",
    campaignExhaustedText:
      "Per {product} non è più disponibile alcun contingente {modeLower}. Già ordinati: {ordered}. L’intera quantità è stata automaticamente trasferita al prezzo normale.",

    orderNotPossibleTitle: "Ordine non possibile",
    orderNotPossibleText:
      "L’ordine non ha potuto essere salvato.",

    uploadFailed: "Caricamento file non riuscito",
    fileUploadFailed: "Caricamento file non riuscito",
    fileUploadPartialFailure:
      "L’ordine è stato salvato, ma il caricamento del file non è riuscito.",
    projectIdCopied: "ID progetto copiato",
  },

  provider: {
    pleaseSelect: "Seleziona",
    cheapestProvider: "Fornitore più conveniente",
    providerName: "Inserisci il nome del fornitore",
    providerNamePlaceholder: "Nome del rivenditore",
    providerNameRequiredHint:
      'Campo obbligatorio quando è selezionato "Altro".',
    cheapestPriceGross:
      "Prezzo più basso (IVA incl.)",
    other: "Altro",
  },

  campaign: {
    campaign: "Campagna",
    activeTradefairCampaign: "Campagna fiera attiva",
    validFromTo: "Valida dal {start} al {end}",

    campaignProductsCount: "{count} prodotti promozionali",
    campaignProducts: "Prodotti promozionali",
    campaignProductsIntro:
      "Questi prodotti fanno attualmente parte della campagna.",
    noCampaignProducts: "Nessun prodotto promozionale trovato.",

    badge: {
      display: "Display",
      mixed: "Fiera + Display",
      messe: "Prezzo fiera",
      standard: "Promozione",
    },

    pricing: {
      upeGross: "PVC lordo",
      dealerPrice: "Prezzo rivenditore",
      messePriceNet: "Prezzo fiera netto",
      displayPriceNet: "Prezzo display netto",
      pricingMode: "Modalità prezzo",
      pricingModeDisplay: "Display",
      pricingModeMesse: "Fiera",
      pricingModeStandard: "Standard",
      discountVsHrp: "Sconto vs HRP",
    },

    filters: {
      searchPlaceholder: "Cerca per articolo, nome, EAN, marca …",
      allGroups: "Tutti i gruppi",
      allCategories: "Tutte le categorie",
    },

    progress: {
      title: "Progresso bonus",
      afterSubmit: "Dopo invio",
      progress: "Progresso",
      already: "Già ordinato",
      cart: "Carrello",
      total: "Totale",
      nextTier: "Prossimo livello bonus",
      highestTierReached: "Livello bonus massimo raggiunto",
      missingToNext: "Mancano ancora: {amount}",
      noTierAvailable: "Nessun livello bonus disponibile al momento.",
      bonus: "Bonus",
      level: "Livello {level}",
    },

    limits: {
      displayMax:
        "Display max. {max} · già ordinato {ordered} · ancora disponibile {free}",
      messeMax:
        "Fiera max. {max} · già ordinato {ordered} · ancora disponibile {free}",
      campaignMax:
        "Promo max. {max} · già ordinato {ordered} · ancora disponibile {free}",
      totalCampaignMax:
        "Promo totale max. {max} · già ordinato {ordered} · ancora disponibile {free}",

      rowDisplayMax:
        "In questa riga display sono ancora possibili max. {count} pezzi al prezzo display",
      rowMesseMax:
        "In questa riga fiera sono ancora possibili max. {count} pezzi al prezzo fiera",
      rowCampaignMax:
        "In questa riga sono ancora possibili max. {count} pezzi al prezzo promozionale",
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
      title: "Informazioni sul rivenditore",
      customerNumber: "N. cliente",
      contactPerson: "Contatto",
      phone: "Telefono",
      email: "E-mail",
      city: "Luogo",
      kam: "KAM",
    },

    distributor: {
      title: "Distributore principale",
      placeholder: "Seleziona",
      defaultHint:
        "Di default tramite ElectronicPartner Schweiz AG.",
    },

    order: {
      title: "Informazioni ordine",
      delivery: "Consegna",
      deliveryImmediate: "Immediata",
      deliveryScheduled: "A data stabilita",
      deliveryPlaceholder: "Seleziona",
      deliveryDateOptional: "Data di consegna (opzionale)",
      comment:
        "Informazioni importanti per l’ordine (commento)",
      commentPlaceholder:
        "ad es. 'Deve essere consegnato tassativamente entro il 15.10'…",
      referenceNumber: "Il vostro n. ordine / riferimento",
      referencePlaceholder: "ad es. 45001234",
    },

    altDelivery: {
      title:
        "Indirizzo di consegna diverso / consegna diretta",
      useAdditionalAddress:
        "Usa indirizzo di consegna aggiuntivo",
      name: "Nome / Azienda",
      street: "Via / N.",
      zip: "CAP",
      city: "Località",
      country: "Paese",
      phoneOptional: "Telefono (opzionale)",
      emailOptional: "E-mail (opzionale)",
      defaultCountry: "Svizzera",
    },

    files: {
      title: "File per l’ordine",
      attached: "{count} file allegato/i",
    },

    bonus: {
      title: "Bonus live nel carrello",
      activeCampaign: "Campagna attiva",
      from: "Da",
      to: "A",
      alreadyBooked: "Già ordinato",
      thisOrder: "Questo ordine",
      afterSubmit: "Dopo invio",
      currentTier: "Livello attualmente raggiunto",
      noneYet: "Ancora nessuno",
      progressToNext: "Progresso verso il prossimo livello",
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
      bonusProgress: "Progresso bonus",
      piecesValue: "{count} pezzi",
      totalSavings: "Risparmio totale: {amount}",
      savings: "Risparmio totale: {amount} CHF",
      missingToNext: "Ancora {amount} fino a {tier}",
      highestTierReached:
        "Livello bonus massimo raggiunto",
      send: "Invia ordine",
      sending: "Invio…",
      continueShopping: "Continua gli acquisti",
      pieces: "pezzi",
      close: "Chiudi",
    },

    product: {
      unknown: "Sconosciuto",
      empty: "Nessun prodotto selezionato.",
      ean: "EAN",
      specialDistribution: "Distribuzione speciale",
      bonusRelevant: "Rilevante per il bonus",
      normalPrice: "Prezzo normale",

      quantity: "Quantità",
      price: "Prezzo (CHF)",
      ekNormal: "Prezzo d’acquisto normale",
      normalEk: "Prezzo d’acquisto normale",
      saved:
        "{amount} CHF risparmiati ({percent}%)",

      pricingMode: "Modalità prezzo",
      pricingModeDisplay: "Display",
      pricingModeMesse: "Fiera",
      pricingModeStandard: "Standard",

      modeDisplay: "Display",
      modeMesse: "Fiera",
      modeStandard: "Standard",
      modeCampaign: "Promozione",

      upeGross: "PVC lordo",
      displayPriceNet: "Prezzo display netto",
      messePriceNet: "Prezzo fiera netto",
      discountVsHrp: "Sconto vs HRP",

      orderAsDisplay:
        "Ordina come display",

      reasonForAdditionalDisplay:
        "Motivazione per display aggiuntivo",
      reasonPlaceholder:
        "ad es. secondo punto vendita, ristrutturazione, nuova area espositiva …",
      reasonHint:
        "Per questo prodotto è già stato ordinato un display. Indicare il motivo del fabbisogno aggiuntivo.",

      cheapestProvider:
        "Fornitore più conveniente",
      providerName:
        "Inserisci il nome del fornitore",
      providerNamePlaceholder:
        "Nome del rivenditore",
      providerNameHint:
        'Campo obbligatorio quando è selezionato "Altro".',

      cheapestPriceGross:
        "Prezzo più basso (IVA incl.)",

      distributor: "Distributore",
      distributorPlaceholder:
        "Seleziona",

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
    campaign: "Caricamento campagna fiera…",
  },
} as const;
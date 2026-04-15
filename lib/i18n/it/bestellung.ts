export const bestellung = {
  common: {
    unknown: "Sconosciuto",
    unknownProduct: "Prodotto sconosciuto",
    remove: "Rimuovi",
    reset: "Reimposta",
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
    campaignOnly: "Solo prodotti fiera",
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
    invalidQuantityText: "Inserisci una quantità valida per {product}!",

    missingDistributorTitle: "❌ Distributore mancante",
    missingDistributorText:
      "Seleziona un distributore per {product}.",

    missingProviderTitle: "❌ Fornitore mancante",
    missingProviderText:
      'Inserisci il nome del rivenditore per “Altro” per {product}.',

    missingDisplayReasonTitle:
      "Manca la motivazione per il display aggiuntivo",
    missingDisplayReasonText:
      "Indica nel campo commento perché è necessario un display aggiuntivo per {product}.",

    unknownDistributorCodeTitle:
      "❌ Codice distributore sconosciuto",
    unknownDistributorCodeText:
      'Il distributore "{code}" non è stato trovato.',

    orderSavedTitle: "✅ Ordine salvato",
    orderSavedText:
      "L’ordine è stato trasmesso con successo.",

    orderSaveErrorTitle: "❌ Errore durante il salvataggio",
    orderSaveErrorText: "Errore sconosciuto",

    displayAlreadyOrderedTitle: "Display già ordinato",
    displayAlreadyOrderedText:
      "Per {product} è già stato ordinato almeno un display. Indica nel campo commento perché è necessario un display aggiuntivo (ad es. seconda sede).",

    displayLimitReachedTitle: "Limite display raggiunto",
    displayLimitReachedText:
      "Per {product} sono validi al massimo {max} pezzi display. Già ordinati: {ordered}. Ancora disponibili per questa posizione: {free}.",

    totalLimitReachedTitle: "Limite totale raggiunto",
    totalLimitReachedText:
      "Per {product} sono validi complessivamente al massimo {max} pezzi promozionali. Già ordinati: {ordered}. Ancora disponibili per questa posizione: {free}.",

    campaignLimitReachedTitle: "Limite {mode} raggiunto",
    campaignLimitReachedText:
      "Per {product} sono ancora possibili {allowed} pezzi al prezzo {modeLower}. Già ordinati: {ordered}. {overflow} pezzo/i sono stati automaticamente trasferiti come posizione separata al prezzo normale.",

    campaignExhaustedTitle:
      "Contingente {mode} esaurito",
    campaignExhaustedText:
      "Per {product} non è più disponibile alcun contingente {modeLower}. Già ordinati: {ordered}. L’intera quantità è stata automaticamente trasferita al prezzo normale.",

    orderNotPossibleTitle: "Ordine non possibile",
    orderNotPossibleText:
      "Non è stato possibile salvare l’ordine.",

    uploadFailed: "Caricamento del file non riuscito",
    projectIdCopied: "ID progetto copiato",
  },

  provider: {
    pleaseSelect: "Seleziona",
    cheapestProvider: "Fornitore più conveniente",
    providerName: "Inserisci il nome del fornitore",
    providerNamePlaceholder: "Nome del rivenditore",
    providerNameRequiredHint:
      'Campo obbligatorio se si seleziona "Altro".',
    cheapestPriceGross:
      "Prezzo più basso (IVA inclusa)",
    other: "Altro",
  },

  campaign: {
    campaign: "Campagna",
    activeTradefairCampaign: "Campagna fiera attiva",
    validFromTo: "Valida dal {start} al {end}",

    campaignProductsCount: "{count} prodotti promozionali",
    campaignProducts: "Prodotti fiera",
    campaignProductsIntro:
      "Questi prodotti fanno attualmente parte della campagna fiera.",
    noCampaignProducts: "Nessun prodotto fiera trovato.",

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
      discountVsHrp: "Sconto vs PVC",
    },

    filters: {
      searchPlaceholder: "Cerca per articolo, nome, EAN, marca …",
      allGroups: "Tutti i gruppi",
      allCategories: "Tutte le categorie",
    },

    progress: {
      title: "Progresso bonus",
      afterSubmit: "Dopo l’invio",
      progress: "Progresso",
      already: "Già",
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
        "Display max. {max} · già ordinati {ordered} · ancora disponibili {free}",
      messeMax:
        "Fiera max. {max} · già ordinati {ordered} · ancora disponibili {free}",
      campaignMax:
        "Promo max. {max} · già ordinati {ordered} · ancora disponibili {free}",
      totalCampaignMax:
        "Totale promo max. {max} · già ordinati {ordered} · ancora disponibili {free}",

      rowDisplayMax:
        "In questa posizione display sono ancora possibili max. {count} pezzi al prezzo display",
      rowMesseMax:
        "In questa posizione fiera sono ancora possibili max. {count} pezzi al prezzo fiera",
      rowCampaignMax:
        "In questa posizione sono ancora possibili max. {count} pezzi al prezzo promozionale",
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
        "Predefinito tramite ElectronicPartner Schweiz AG.",
    },

    order: {
      title: "Dati ordine",
      delivery: "Consegna",
      deliveryImmediate: "Immediata",
      deliveryScheduled: "Alla data prevista",
      deliveryDateOptional: "Data di consegna (opzionale)",
      comment:
        "Informazioni importanti sull’ordine (commento)",
      commentPlaceholder:
        "ad es. 'Deve essere consegnato tassativamente entro il 15.10'…",
      referenceNumber: "Il tuo n. ordine / riferimento",
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
    },

    files: {
      title: "File per l’ordine",
      attached: "{count} file allegato/i",
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
    },

    product: {
      unknown: "Sconosciuto",
      ean: "EAN",
      specialDistribution: "Distribuzione speciale",
      bonusRelevant: "Rilevante per il bonus",
      normalPrice: "Prezzo normale",

      quantity: "Quantità",
      price: "Prezzo (CHF)",
      ekNormal: "PA normale",
      saved:
        "{amount} CHF risparmiati ({percent}%)",

      pricingMode: "Modalità prezzo",
      pricingModeDisplay: "Display",
      pricingModeMesse: "Fiera",
      pricingModeStandard: "Standard",

      upeGross: "PVC lordo",
      displayPriceNet: "Prezzo display netto",
      messePriceNet: "Prezzo fiera netto",
      discountVsHrp: "Sconto vs PVC",

      orderAsDisplay:
        "Ordina come display",

      reasonForAdditionalDisplay:
        "Motivazione per display aggiuntivo",
      reasonPlaceholder:
        "ad es. seconda sede, ristrutturazione, nuova area vendita …",
      reasonHint:
        "Per questo prodotto è già stato ordinato un display. Giustifica il fabbisogno aggiuntivo.",

      cheapestProvider:
        "Fornitore più conveniente",
      providerName:
        "Inserisci il nome del fornitore",
      providerNamePlaceholder:
        "Nome del rivenditore",
      providerNameHint:
        'Campo obbligatorio se si seleziona "Altro".',

      cheapestPriceGross:
        "Prezzo più basso (IVA inclusa)",

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
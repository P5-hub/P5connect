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
    pieces: "Pezzi",
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

    maxCampaignQtyTitle: "Quantità massima promozione raggiunta",
    maxCampaignQtyText:
      "Per {product} sono consentiti al massimo {count} pezzi per rivenditore.",

    noDealer: "❌ Nessun rivenditore trovato – effettuare nuovamente il login.",
    needDistributor: "❌ Selezionare il distributore principale.",
    needValidDate: "Selezionare una data di consegna valida (YYYY-MM-DD).",

    invalidInputTitle: "Inserimento non valido",
    invalidQuantityText:
      "Inserire una quantità valida per {product}!",

    missingDistributorTitle: "❌ Distributore mancante",
    missingDistributorText:
      "Selezionare il distributore per {product}.",

    missingProviderTitle: "❌ Fornitore mancante",
    missingProviderText:
      "Inserire il nome del fornitore per «Altro» per {product}.",

    missingDisplayReasonTitle:
      "Motivazione per display aggiuntivo mancante",
    missingDisplayReasonText:
      "Inserire nel campo commento il motivo per cui è necessario un display aggiuntivo per {product}.",

    unknownDistributorCodeTitle:
      "❌ Codice distributore sconosciuto",
    unknownDistributorCodeText:
      'Distributore "{code}" non trovato.',

    orderSavedTitle: "✅ Ordine salvato",
    orderSavedText:
      "L’ordine è stato trasmesso con successo.",

    orderSaveErrorTitle: "❌ Errore durante il salvataggio",
    orderSaveErrorText: "Errore sconosciuto",

    displayAlreadyOrderedTitle: "Display già ordinato",
    displayAlreadyOrderedText:
      "Per {product} è già stato ordinato almeno un display. Indicare il motivo per un display aggiuntivo nel commento.",

    displayLimitReachedTitle: "Limite display raggiunto",
    displayLimitReachedText:
      "Per {product} massimo {max} display consentiti. Già ordinati: {ordered}. Ancora disponibili: {free}.",

    totalLimitReachedTitle: "Limite totale raggiunto",
    totalLimitReachedText:
      "Per {product} massimo {max} pezzi promozionali consentiti. Già ordinati: {ordered}. Ancora disponibili: {free}.",

    campaignLimitReachedTitle: "Limite {mode} raggiunto",
    campaignLimitReachedText:
      "Per {product} ancora {allowed} pezzi al prezzo {modeLower}. Già ordinati: {ordered}. {overflow} pezzi aggiunti automaticamente al prezzo standard.",

    campaignExhaustedTitle:
      "Contingente {mode} esaurito",
    campaignExhaustedText:
      "Per {product} non è più disponibile alcun contingente {modeLower}. Già ordinati: {ordered}. Tutta la quantità è stata inserita al prezzo normale.",

    orderNotPossibleTitle: "Ordine non possibile",
    orderNotPossibleText:
      "L’ordine non può essere salvato.",

    uploadFailed: "Caricamento file non riuscito",

    projectIdCopied: "ID progetto copiato",
  },

  provider: {
    pleaseSelect: "Selezionare",
    cheapestProvider: "Fornitore più conveniente",
    providerName: "Inserire il nome del fornitore",
    providerNamePlaceholder: "Nome del rivenditore",
    providerNameRequiredHint:
      "Campo obbligatorio se selezionato «Altro».",
    cheapestPriceGross:
      "Prezzo più basso (IVA inclusa)",
    other: "Altro",
  },

  campaign: {
    campaign: "Campagna",
    activeTradefairCampaign: "Campagna fiera attiva",
    validFromTo: "Valido dal {start} al {end}",

    campaignProductsCount: "{count} prodotti promozionali",
    campaignProducts: "Prodotti fiera",
    campaignProductsIntro:
      "Questi prodotti fanno attualmente parte della promozione fiera.",
    noCampaignProducts: "Nessun prodotto fiera trovato.",

    badge: {
      display: "Display",
      mixed: "Fiera + Display",
      messe: "Prezzo fiera",
      standard: "Promozione",
    },

    filters: {
      searchPlaceholder: "Cerca per articolo, nome, EAN, marca …",
      allGroups: "Tutti i gruppi",
      allCategories: "Tutte le categorie",
    },
    
    pricing: {
      upeGross: "Prezzo consigliato lordo",
      dealerPrice: "Prezzo rivenditore",
      messePriceNet: "Prezzo fiera netto",
      displayPriceNet: "Prezzo display netto",
      pricingMode: "Modalità prezzo",
      pricingModeDisplay: "Display",
      pricingModeMesse: "Fiera",
      pricingModeStandard: "Standard",
      discountVsHrp: "Sconto vs. prezzo listino",
    },

    progress: {
      title: "Progresso bonus",
      afterSubmit: "Dopo invio",
      progress: "Progresso",
      already: "Già",
      cart: "Carrello",
      total: "Totale",
      nextTier: "Prossimo livello bonus",
      highestTierReached: "Livello bonus massimo raggiunto",
      missingToNext: "Mancano ancora: {amount}",
      noTierAvailable: "Nessun livello bonus disponibile.",
      bonus: "Bonus",
      level: "Livello {level}",
    },

    limits: {
      displayMax:
        "Display max. {max} · già ordinati {ordered} · disponibili {free}",
      messeMax:
        "Fiera max. {max} · già ordinati {ordered} · disponibili {free}",
      campaignMax:
        "Promo max. {max} · già ordinati {ordered} · disponibili {free}",
      totalCampaignMax:
        "Totale promo max. {max} · già ordinati {ordered} · disponibili {free}",

      rowDisplayMax:
        "In questa posizione display ancora max. {count} pezzi al prezzo display",
      rowMesseMax:
        "In questa posizione fiera ancora max. {count} pezzi al prezzo fiera",
      rowCampaignMax:
        "In questa posizione ancora max. {count} pezzi al prezzo promozione",
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
      customerNumber: "N° cliente",
      contactPerson: "Referente",
      phone: "Tel.",
      email: "E-mail",
      city: "Località",
      kam: "KAM",
    },

    distributor: {
      title: "Distributore principale",
      placeholder: "Selezionare",
      defaultHint:
        "Predefinito tramite ElectronicPartner Svizzera SA.",
    },

    order: {
      title: "Dettagli ordine",
      delivery: "Consegna",
      deliveryImmediate: "Subito",
      deliveryScheduled: "A data",
      deliveryDateOptional: "Data consegna (opzionale)",
      comment: "Informazioni importanti sull’ordine (commento)",
      commentPlaceholder:
        "es. 'Deve essere consegnato entro il 15.10.'…",
      referenceNumber: "Numero riferimento ordine",
      referencePlaceholder: "es. 45001234",
    },

    altDelivery: {
      title:
        "Indirizzo di consegna diverso / consegna diretta",
      useAdditionalAddress:
        "Usare indirizzo di consegna aggiuntivo",
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
      savings: "Risparmio totale: {amount} CHF",
      missingToNext: "Ancora {amount} fino a {tier}",
      highestTierReached:
        "Livello bonus massimo raggiunto",
      send: "Invia ordine",
      sending: "Invio…",
      continueShopping: "Continua acquisti",
      pieces: "Pezzi",
    },

    product: {
      unknown: "Sconosciuto",
      ean: "EAN",
      specialDistribution: "Distribuzione speciale",
      bonusRelevant: "Rilevante per bonus",
      normalPrice: "Prezzo normale",

      quantity: "Quantità",
      price: "Prezzo (CHF)",
      ekNormal: "Costo normale",
      saved:
        "{amount} CHF risparmiati ({percent}%)",

      pricingMode: "Modalità prezzo",
      pricingModeDisplay: "Display",
      pricingModeMesse: "Fiera",
      pricingModeStandard: "Standard",

      upeGross: "Prezzo consigliato lordo",
      displayPriceNet: "Prezzo display netto",
      messePriceNet: "Prezzo fiera netto",
      discountVsHrp: "Sconto vs. listino",

      orderAsDisplay:
        "Ordinare come display",

      reasonForAdditionalDisplay:
        "Motivazione display aggiuntivo",
      reasonPlaceholder:
        "es. secondo punto vendita, ristrutturazione…",
      reasonHint:
        "Per questo prodotto è già stato ordinato un display. Indicare il motivo.",

      cheapestProvider:
        "Fornitore più conveniente",
      providerName:
        "Inserire il nome del fornitore",
      providerNamePlaceholder:
        "Nome rivenditore",
      providerNameHint:
        "Campo obbligatorio se «Altro».",

      cheapestPriceGross:
        "Prezzo più basso (IVA inclusa)",

      distributor: "Distributore",
      distributorPlaceholder:
        "Selezionare",

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
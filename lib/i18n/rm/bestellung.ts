export const bestellung = {
  common: {
    unknown: "Nunenconuschent",
    unknownProduct: "Product nunenconuschent",
    remove: "Allontanar",
    reset: "Reinitialisar",
    close: "Serrar",
    continueShopping: "Cuntinuar cumpraziuns",
    addToCart: "Agiuntar al charret",
    cartOpen: "Avrir charret",
    loading: "Chargiar…",
    quantity: "Quantitad",
    price: "Pretsch",
    total: "Total",
    totalPrice: "Pretsch total",
    summary: "Resumaziun",
    pieces: "Tocs",
    filesAttached: "{count} datoteca(s) agiuntada(s)",
  },

  viewMode: {
    both: "Mussar omadus",
    campaignOnly: "Be mo products da fiera",
    standardOnly: "Be mo products standard",
  },

  toast: {
    productAddedTitle: "Product agiuntà",
    productAddedText: "{product} è vegnì agiuntà al charret.",

    maxCampaignQtyTitle: "Quantitad maximala da promoziun cuntanschida",
    maxCampaignQtyText:
      "Per {product} èn maximalmain {count} tocs per commerziant permess.",

    noDealer: "❌ Nagin commerziant chattà – per plaschair s’annunziar danovamain.",
    needDistributor: "❌ Tscherner il distributur principal.",
    needValidDate: "Tscherner ina data da furniziun valida (YYYY-MM-DD).",

    invalidInputTitle: "Endataziun nunvalaivla",
    invalidQuantityText:
      "Per plaschair endatar ina quantitad valida per {product}.",

    missingDistributorTitle: "❌ Distributur manca",
    missingDistributorText:
      "Per plaschair tscherner in distributur per {product}.",

    missingProviderTitle: "❌ Furnitur manca",
    missingProviderText:
      "Inditgar il num dal furnitur per «Auter» per {product}.",

    missingDisplayReasonTitle:
      "Motivaziun per display supplementar manca",
    missingDisplayReasonText:
      "Per plaschair inditgar en il commentar pertge che in ulteriur display è necessari per {product}.",

    unknownDistributorCodeTitle:
      "❌ Code distributur nunenconuschent",
    unknownDistributorCodeText:
      'Distributur "{code}" betg chattà.',

    orderSavedTitle: "✅ Empustaziun memorisada",
    orderSavedText:
      "L’empustaziun è vegnida tramessa cun success.",

    orderSaveErrorTitle: "❌ Errur durant memorisar",
    orderSaveErrorText: "Errur nunenconuschenta",

    displayAlreadyOrderedTitle: "Display gia empustà",
    displayAlreadyOrderedText:
      "Per {product} è gia vegnì empustà in display. Per plaschair motivar in display supplementar.",

    displayLimitReachedTitle: "Limit display cuntanschì",
    displayLimitReachedText:
      "Per {product} maximalmain {max} displays permess. Gia empustà: {ordered}. Anc liber: {free}.",

    totalLimitReachedTitle: "Limit total cuntanschì",
    totalLimitReachedText:
      "Per {product} maximalmain {max} tocs promoziunals. Gia empustà: {ordered}. Anc liber: {free}.",

    campaignLimitReachedTitle: "Limit {mode} cuntanschì",
    campaignLimitReachedText:
      "Per {product} anc {allowed} tocs al pretsch {modeLower}. Gia empustà: {ordered}. {overflow} tocs èn vegnids agiuntads al pretsch normal.",

    campaignExhaustedTitle:
      "Contingent {mode} exaurì",
    campaignExhaustedText:
      "Nagin contingent {modeLower} pli disponibel per {product}. Gia empustà: {ordered}. L’entira quantitad è vegnida surpigliada al pretsch normal.",

    orderNotPossibleTitle: "Empustaziun betg pussaivla",
    orderNotPossibleText:
      "L’empustaziun na po betg vegnir memorisada.",

    uploadFailed: "Upload da datoteca fallì",

    projectIdCopied: "ID project copià",
  },

  provider: {
    pleaseSelect: "Per plaschair tscherner",
    cheapestProvider: "Furnitur il pli favuraivel",
    providerName: "Inditgar il num dal furnitur",
    providerNamePlaceholder: "Num dal commerziant",
    providerNameRequiredHint:
      "Champ obligatoric tar «Auter».",
    cheapestPriceGross:
      "Pretsch il pli bass (incl. VAT)",
    other: "Auter",
  },

  campaign: {
    campaign: "Campagna",
    activeTradefairCampaign: "Campagna fiera activa",
    validFromTo: "Valida da {start} fin {end}",

    campaignProductsCount: "{count} products promoziunals",
    campaignProducts: "Products fiera",
    campaignProductsIntro:
      "Quests products fan actualmain part da l’acziun fiera.",
    noCampaignProducts: "Nagins products fiera chattads.",

    badge: {
      display: "Display",
      mixed: "Fiera + Display",
      messe: "Pretsch fiera",
      standard: "Promoziun",
    },
    filters: {
      searchPlaceholder: "Tschertgar tenor artitgel, num, EAN, marca …",
      allGroups: "Tut las gruppas",
      allCategories: "Tuttas las categorias",
    },
    pricing: {
      upeGross: "Pretsch recumandà brut",
      dealerPrice: "Pretsch commerziant",
      messePriceNet: "Pretsch fiera netto",
      displayPriceNet: "Pretsch display netto",
      pricingMode: "Modus da pretsch",
      pricingModeDisplay: "Display",
      pricingModeMesse: "Fiera",
      pricingModeStandard: "Standard",
      discountVsHrp: "Rabatt vs. pretsch recumandà",
    },

    progress: {
      title: "Progress bonus",
      afterSubmit: "Suenter trametter",
      progress: "Progress",
      already: "Gia",
      cart: "Charret",
      total: "Total",
      nextTier: "Proxima stgala bonus",
      highestTierReached: "Stgala bonus maximala cuntanschida",
      missingToNext: "Anc mancan: {amount}",
      noTierAvailable: "Naginas stgalas bonus disponiblas.",
      bonus: "Bonus",
      level: "Stgala {level}",
    },

    limits: {
      displayMax:
        "Display max. {max} · gia empustà {ordered} · anc liber {free}",
      messeMax:
        "Fiera max. {max} · gia empustà {ordered} · anc liber {free}",
      campaignMax:
        "Promoziun max. {max} · gia empustà {ordered} · anc liber {free}",
      totalCampaignMax:
        "Total promoziun max. {max} · gia empustà {ordered} · anc liber {free}",

      rowDisplayMax:
        "En questa posiziun display anc max. {count} tocs al pretsch display",
      rowMesseMax:
        "En questa posiziun fiera anc max. {count} tocs al pretsch fiera",
      rowCampaignMax:
        "En questa posiziun anc max. {count} tocs al pretsch promoziun",
    },
  },

  cartSheet: {
    title: "Empustaziun al meglier pretsch",
    empty: "Anc nagins products tschernids.",

    linkedProject: {
      title: "Project collià",
      customer: "Client",
      project: "Project",
      open: "Avrir project",
      remove: "Allontanar project",
      copied: "ID project copià",
    },

    dealerInfo: {
      title: "Infurmaziuns commerziant",
      customerNumber: "Nr. client",
      contactPerson: "Contact",
      phone: "Tel.",
      email: "E-mail",
      city: "Lieu",
      kam: "KAM",
    },

    distributor: {
      title: "Distributur principal",
      placeholder: "Per plaschair tscherner",
      defaultHint:
        "Standard via ElectronicPartner Svizra SA.",
    },

    order: {
      title: "Indicaziuns empustaziun",
      delivery: "Furniziun",
      deliveryImmediate: "Subit",
      deliveryScheduled: "Ad in termin",
      deliveryDateOptional: "Data furniziun (opziunal)",
      comment: "Infurmaziuns impurtantas davart empustaziun",
      commentPlaceholder:
        "p.ex. 'Sto vegnir furnì fin ils 15.10.'…",
      referenceNumber: "Vossa referenza",
      referencePlaceholder: "p.ex. 45001234",
    },

    altDelivery: {
      title:
        "Adressa da furniziun divergenta / furniziun directa",
      useAdditionalAddress:
        "Utilisar ina adressa supplementara",
      name: "Num / Firma",
      street: "Via / Nr.",
      zip: "NPA",
      city: "Lieu",
      country: "Pajais",
      phoneOptional: "Telefon (opziunal)",
      emailOptional: "E-mail (opziunal)",
    },

    files: {
      title: "Datotecas per empustaziun",
      attached: "{count} datoteca(s) agiuntada(s)",
    },

    summary: {
      title: "Resumaziun",
      total: "Total",
      totalPrice: "Pretsch total",
      bonusProgress: "Progress bonus",
      savings: "Economia totala: {amount} CHF",
      missingToNext:
        "Anc {amount} fin {tier}",
      highestTierReached:
        "Stgala bonus maximala cuntanschida",
      send: "Trametter empustaziun",
      sending: "Trametter…",
      continueShopping: "Cuntinuar cumpraziuns",
      pieces: "Tocs",
    },

    product: {
      unknown: "Nunenconuschent",
      ean: "EAN",
      specialDistribution: "Distribuziun speziala",
      bonusRelevant: "Relevant per bonus",
      normalPrice: "Pretsch normal",

      quantity: "Quantitad",
      price: "Pretsch (CHF)",
      ekNormal: "Pretsch acquist normal",
      saved:
        "{amount} CHF spargnads ({percent}%)",

      pricingMode: "Modus pretsch",
      pricingModeDisplay: "Display",
      pricingModeMesse: "Fiera",
      pricingModeStandard: "Standard",

      upeGross: "Pretsch recumandà brut",
      displayPriceNet: "Pretsch display netto",
      messePriceNet: "Pretsch fiera netto",
      discountVsHrp: "Rabatt vs. pretsch recumandà",

      orderAsDisplay:
        "Empustar sco display",

      reasonForAdditionalDisplay:
        "Motivaziun display supplementar",
      reasonPlaceholder:
        "p.ex. segunda filiala, renovaziun…",
      reasonHint:
        "Per quest product è gia vegnì empustà in display.",

      cheapestProvider:
        "Furnitur il pli favuraivel",
      providerName:
        "Inditgar furnitur",
      providerNamePlaceholder:
        "Num commerziant",
      providerNameHint:
        "Champ obligatoric tar «Auter».",

      cheapestPriceGross:
        "Pretsch il pli bass (incl. VAT)",

      distributor: "Distributur",
      distributorPlaceholder:
        "Per plaschair tscherner",

      remove: "Allontanar",
      other: "Auter",
    },
  },

  preview: {
    title: "Prevista charret",
    positions: "Posiziuns en il charret",
    quantityTotal: "Quantitad totala",
    cartValue: "Valur charret",
  },

  loading: {
    dealerData: "Datas commerziant vegnan chargiadas…",
    campaign: "Chargiar campagna fiera…",
  },
} as const;
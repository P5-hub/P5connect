export const bestellung = {
  common: {
    unknown: "Nunenconuschent",
    unknownProduct: "Product nunenconuschent",
    remove: "Allontanar",
    reset: "Redefinir",
    close: "Serrar",
    continueShopping: "Cuntinuar cun cumprar",
    addToCart: "Agiuntar al chantun",
    cartOpen: "Avrir chantun",
    loading: "Chargia…",
    quantity: "Quantitad",
    price: "Pretsch",
    total: "Total",
    totalPrice: "Pretsch total",
    summary: "Survista",
    pieces: "tocs",
    filesAttached: "{count} datoteca(s) agiuntada(s)",
  },

  viewMode: {
    both: "Mussar tuts dus",
    campaignOnly: "Mo products da promoziun",
    standardOnly: "Mo products standards",
  },

  toast: {
    productAddedTitle: "Product agiuntà",
    productAddedText: "{product} è vegnì agiuntà al chantun.",

    maxCampaignQtyTitle: "Quantitad maximala da promoziun cuntanschida",
    maxCampaignQtyText:
      "Per {product} èn maximalmain {count} tocs lubids per commerziant.",

    noDealer: "❌ Nagin commerziant chattà – annunzia p.pl. danovamain.",
    needDistributor: "❌ Tscherna p.pl. in distributur principal.",
    needValidDate: "Tscherna p.pl. ina data da furniziun valaivla (YYYY-MM-DD).",

    invalidInputTitle: "Endataziun nunvalaivla",
    invalidQuantityText: "Endatescha p.pl. ina quantitad valaivla per {product}.",

    missingDistributorTitle: "❌ Distributur manca",
    missingDistributorText:
      "Tscherna p.pl. in distributur per {product}.",

    missingProviderTitle: "❌ Furnitur manca",
    missingProviderText:
      'Endatescha p.pl. il num dal commerziant per "Auter" per {product}.',

    missingDisplayReasonTitle:
      "Motivaziun per display supplementar manca",
    missingDisplayReasonText:
      "Inditgescha p.pl. en il champ da commentari pertge che in display supplementar è necessari per {product}.",

    unknownDistributorCodeTitle:
      "❌ Code da distributur nunenconuschent",
    unknownDistributorCodeText:
      'Il distributur "{code}" n’ha betg pudì vegnir chattà.',

    orderSavedTitle: "✅ Empustaziun memorisada",
    orderSavedText:
      "L’empustaziun è vegnida tramessa cun success.",

    orderSaveErrorTitle: "❌ Errur tar memorisar",
    orderSaveErrorText: "Errur nunenconuschenta",

    displayAlreadyOrderedTitle: "Display gia empustà",
    displayAlreadyOrderedText:
      "Per {product} è gia vegnì empustà almain in display. Inditgescha p.pl. en il commentari pertge che in display supplementar è necessari (p.ex. segund lieu).",

    displayLimitReachedTitle: "Limita da display cuntanschida",
    displayLimitReachedText:
      "Per {product} èn maximalmain {max} tocs display valaivels. Gia empustà: {ordered}. Anc liber per questa lingia: {free}.",

    displayNotAllowedTitle: "Display betg disponibel",
    displayNotAllowedText:
      "Per quest product n’è nagina empustaziun da display registrada.",

    totalLimitReachedTitle: "Limita totala cuntanschida",
    totalLimitReachedText:
      "Per {product} èn maximalmain {max} tocs da promoziun totals valaivels. Gia empustà: {ordered}. Anc liber per questa lingia: {free}.",

    campaignLimitReachedTitle: "Limita {mode} cuntanschida",
    campaignLimitReachedText:
      "Per {product} èn anc {allowed} toc(s) pussaivels al pretsch {modeLower}. Gia empustà: {ordered}. {overflow} toc(s) èn stads surpigliads automaticamain sco posiziun separada al pretsch normal.",

    campaignExhaustedTitle:
      "Contingent {mode} exaust",
    campaignExhaustedText:
      "Per {product} na datti nagin contingent {modeLower} pli. Gia empustà: {ordered}. L’entira quantitad è vegnida automaticamain surpigliada al pretsch normal.",

    orderNotPossibleTitle: "Empustaziun betg pussaivla",
    orderNotPossibleText:
      "L’empustaziun n’ha betg pudì vegnir memorisada.",

    uploadFailed: "Upload da datoteca nunreussì",
    fileUploadFailed: "Upload da datoteca nunreussì",
    fileUploadPartialFailure:
      "L’empustaziun è vegnida memorisada, ma l’upload da datoteca n’è betg reussì.",
    projectIdCopied: "ID dal project copiada",
  },

  provider: {
    pleaseSelect: "Tscherna p.pl.",
    cheapestProvider: "Furnitur il pli favuraivel",
    providerName: "Endatescha p.pl. il num dal furnitur",
    providerNamePlaceholder: "Num dal commerziant",
    providerNameRequiredHint:
      'Champ obligatoric cura che "Auter" è tschernì.',
    cheapestPriceGross:
      "Pretsch il pli bass (incl. MWST)",
    other: "Auter",
  },

  campaign: {
    campaign: "Campagna",
    activeTradefairCampaign: "Campagna da fiera activa",
    validFromTo: "Valida dal {start} al {end}",

    campaignProductsCount: "{count} products da promoziun",
    campaignProducts: "Products da promoziun",
    campaignProductsIntro:
      "Quests products fan actualmain part da la campagna.",
    noCampaignProducts: "Nagins products da promoziun chattads.",

    badge: {
      display: "Display",
      mixed: "Fiera + Display",
      messe: "Pretsch da fiera",
      standard: "Promoziun",
    },

    pricing: {
      upeGross: "PVC brut",
      dealerPrice: "Pretsch dal commerziant",
      messePriceNet: "Pretsch da fiera net",
      displayPriceNet: "Pretsch display net",
      pricingMode: "Moda da pretsch",
      pricingModeDisplay: "Display",
      pricingModeMesse: "Fiera",
      pricingModeStandard: "Standard",
      discountVsHrp: "Rabatt vs. HRP",
    },

    filters: {
      searchPlaceholder: "Tschertga tenor artitgel, num, EAN, marca …",
      allGroups: "Tut las gruppas",
      allCategories: "Tuttas las categorias",
    },

    progress: {
      title: "Progress dal bonus",
      afterSubmit: "Suenter trametter",
      progress: "Progress",
      already: "Gia empustà",
      cart: "Chantun",
      total: "Total",
      nextTier: "Proxim nivel da bonus",
      highestTierReached: "Il pli aut nivel da bonus cuntanschì",
      missingToNext: "Anc mancan: {amount}",
      noTierAvailable: "Anc nagin nivel da bonus disponibel.",
      bonus: "Bonus",
      level: "Nivel {level}",
    },

    limits: {
      displayMax:
        "Display max. {max} · gia empustà {ordered} · anc liber {free}",
      messeMax:
        "Fiera max. {max} · gia empustà {ordered} · anc liber {free}",
      campaignMax:
        "Promo max. {max} · gia empustà {ordered} · anc liber {free}",
      totalCampaignMax:
        "Promo total max. {max} · gia empustà {ordered} · anc liber {free}",

      rowDisplayMax:
        "En questa lingia da display èn anc max. {count} toc(s) pussaivels al pretsch da display",
      rowMesseMax:
        "En questa lingia da fiera èn anc max. {count} toc(s) pussaivels al pretsch da fiera",
      rowCampaignMax:
        "En questa lingia èn anc max. {count} toc(s) pussaivels al pretsch da promoziun",
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
      copied: "ID dal project copiada",
      copyId: "Copiar ID dal project",
    },

    dealerInfo: {
      title: "Infurmaziuns dal commerziant",
      customerNumber: "Nr. client",
      contactPerson: "Contact",
      phone: "Telefon",
      email: "E-mail",
      city: "Lieu",
      kam: "KAM",
    },

    distributor: {
      title: "Distributur principal",
      placeholder: "Tscherna p.pl.",
      defaultHint:
        "Standardmain via ElectronicPartner Schweiz AG.",
    },

    order: {
      title: "Indicaziuns da l’empustaziun",
      delivery: "Furniziun",
      deliveryImmediate: "Immediat",
      deliveryScheduled: "A termin",
      deliveryPlaceholder: "Tscherna p.pl.",
      deliveryDateOptional: "Data da furniziun (opziunala)",
      comment:
        "Infurmaziuns impurtantas tar l’empustaziun (commentari)",
      commentPlaceholder:
        "p.ex. 'Sto vegnir furnì obligatori fin ils 15.10'…",
      referenceNumber: "Tes nr. d’empustaziun / referenza",
      referencePlaceholder: "p.ex. 45001234",
    },

    altDelivery: {
      title:
        "Autra adressa da furniziun / furniziun directa",
      useAdditionalAddress:
        "Duvrar adressa da furniziun supplementara",
      name: "Num / Firma",
      street: "Via / Nr.",
      zip: "PLZ",
      city: "Lieu",
      country: "Pajais",
      phoneOptional: "Telefon (opziunal)",
      emailOptional: "E-mail (opziunal)",
      defaultCountry: "Svizra",
    },

    files: {
      title: "Datotecas per l’empustaziun",
      attached: "{count} datoteca(s) agiuntada(s)",
    },

    bonus: {
      title: "Bonus live en il chantun",
      activeCampaign: "Campagna activa",
      from: "Da",
      to: "Fin",
      alreadyBooked: "Gia empustà",
      thisOrder: "Questa empustaziun",
      afterSubmit: "Suenter trametter",
      currentTier: "Nivel actualmain cuntanschì",
      noneYet: "Anc nagin",
      progressToNext: "Progress fin al proxim nivel",
      nextTier: "Proxim nivel da bonus",
      fromThreshold: "a partir da",
      bonus: "Bonus",
      estimatedBonus: "Bonus",
      highestTierReached: "Il pli aut nivel da bonus cuntanschì",
    },

    summary: {
      title: "Survista",
      total: "Total",
      totalPrice: "Pretsch total",
      bonusProgress: "Progress dal bonus",
      piecesValue: "{count} tocs",
      totalSavings: "Respargn total: {amount}",
      savings: "Respargn total: {amount} CHF",
      missingToNext: "Anc {amount} fin {tier}",
      highestTierReached:
        "Il pli aut nivel da bonus cuntanschì",
      send: "Trametter empustaziun",
      sending: "Trametta…",
      continueShopping: "Cuntinuar cun cumprar",
      pieces: "tocs",
      close: "Serrar",
    },

    product: {
      unknown: "Nunenconuschent",
      empty: "Anc nagins products tschernids.",
      ean: "EAN",
      specialDistribution: "Distribuziun speziala",
      bonusRelevant: "Relevant per bonus",
      normalPrice: "Pretsch normal",

      quantity: "Quantitad",
      price: "Pretsch (CHF)",
      ekNormal: "Pretsch d’acquist normal",
      normalEk: "Pretsch d’acquist normal",
      saved:
        "{amount} CHF spargnads ({percent}%)",

      pricingMode: "Moda da pretsch",
      pricingModeDisplay: "Display",
      pricingModeMesse: "Fiera",
      pricingModeStandard: "Standard",

      modeDisplay: "Display",
      modeMesse: "Fiera",
      modeStandard: "Standard",
      modeCampaign: "Promoziun",

      upeGross: "PVC brut",
      displayPriceNet: "Pretsch display net",
      messePriceNet: "Pretsch da fiera net",
      discountVsHrp: "Rabatt vs. HRP",

      orderAsDisplay:
        "Empustar sco display",

      reasonForAdditionalDisplay:
        "Motivaziun per display supplementar",
      reasonPlaceholder:
        "p.ex. segund lieu, renovaziun, nova surfatscha da vendita …",
      reasonHint:
        "Per quest product è gia vegnì empustà in display. Motivai p.pl. il basegn supplementar.",

      cheapestProvider:
        "Furnitur il pli favuraivel",
      providerName:
        "Endatescha p.pl. il num dal furnitur",
      providerNamePlaceholder:
        "Num dal commerziant",
      providerNameHint:
        'Champ obligatoric cura che "Auter" è tschernì.',

      cheapestPriceGross:
        "Pretsch il pli bass (incl. MWST)",

      distributor: "Distributur",
      distributorPlaceholder:
        "Tscherna p.pl.",

      remove: "Allontanar",
      other: "Auter",
    },
  },

  preview: {
    title: "Prevista dal chantun",
    positions: "Posiziuns en il chantun",
    quantityTotal: "Quantitad totala",
    cartValue: "Valur dal chantun",
  },

  loading: {
    dealerData: "Chargiar las datas dal commerziant…",
    campaign: "Chargiar la campagna da fiera…",
  },
} as const;
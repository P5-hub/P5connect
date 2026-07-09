export const bestellung = {
  common: {
    unknown: "Nunenconuschent",
    unknownProduct: "Product nunenconuschent",
    remove: "Allontanar",
    reset: "Resetar",
    close: "Serrar",
    continueShopping: "Cuntinuar a cumprar",
    addToCart: "Metter en il chanaster",
    cartOpen: "Avrir il chanaster",
    loading: "Chargiar…",
    quantity: "Quantitad",
    price: "Pretsch",
    total: "Total",
    totalPrice: "Pretsch total",
    summary: "Resumaziun",
    pieces: "toc",
    filesAttached: "{count} datoteca(s) agiuntada(s)",
  },

  viewMode: {
    both: "Mussar omadus",
    campaignOnly: "Mo products da fiera",
    promotionOnly: "Mo products da promoziun",
    standardOnly: "Mo products da standard",
  },

  toast: {
    productAddedTitle: "Product agiuntà",
    productAddedText: "{product} è vegnì mess en il chanaster.",

    maxCampaignQtyTitle: "Quantitad maximala da campagna cuntanschida",
    maxCampaignQtyText:
      "Per {product} èn permess maximalmain {count} tocs per commerziant.",

    noDealer: "❌ Nagins commerziants chattads – per plaschair s'annunziar danovamain.",
    needDistributor: "❌ Per plaschair tscherner in distributur principal.",
    needValidDate:
      "Per plaschair tscherner ina data da furniziun valida (YYYY-MM-DD).",

    missingDeliveryPhoneTitle: "Numer da telefon manca",
    missingDeliveryPhoneText:
      "Per plaschair inditgar in numer da telefon per l'adressa da furniziun alternativa.",

    invalidInputTitle: "Endataziun nunvalida",
    invalidQuantityText:
      "Per plaschair inditgar ina quantitad valida per {product}.",

    missingDistributorTitle: "❌ Distributur manca",
    missingDistributorText:
      "Per plaschair tscherner in distributur per {product}.",

    missingProviderTitle: "❌ Furnitur manca",
    missingProviderText:
      'Per plaschair inditgar il num dal commerziant per "Auter" tar {product}.',

    missingDisplayReasonTitle:
      "Motivaziun per display supplementar manca",
    missingDisplayReasonText:
      "Per plaschair declerar en il champ da commentari pertge ch'in display supplementar è necessari per {product}.",

    unknownDistributorCodeTitle: "❌ Code da distributur nunenconuschent",
    unknownDistributorCodeText:
      'Il distributur "{code}" n\'è betg vegnì chattà.',

    orderSavedTitle: "✅ Empustaziun memorisada",
    orderSavedText:
      "L'empustaziun è vegnida tramessa cun success.",

    orderSaveErrorTitle: "❌ Errur durant memorisar",
    orderSaveErrorText: "Errur nunenconuschenta",

    displayAlreadyOrderedTitle: "Display gia empustà",
    displayAlreadyOrderedText:
      "Per {product} è gia vegnì empustà almain in display. Per plaschair declerar en il champ da commentari pertge ch'in display supplementar è necessari (p. ex. segunda localitad).",

    displayLimitReachedTitle: "Limit da display cuntanschì",
    displayLimitReachedText:
      "Per {product} èn valids maximalmain {max} displays. Gia empustà: {ordered}. Anc liber per questa posiziun: {free}.",

    displayNotAllowedTitle: "Display betg disponibel",
    displayNotAllowedText:
      "Per quest product n'è nagina opziun d'empustaziun da display registrada.",

    totalLimitReachedTitle: "Limit total cuntanschì",
    totalLimitReachedText:
      "Per {product} èn valids maximalmain {max} tocs da campagna total. Gia empustà: {ordered}. Anc liber per questa posiziun: {free}.",

    campaignLimitReachedTitle: "Limit {mode} cuntanschì",
    campaignLimitReachedText:
      "Per {product} èn anc pussaivels {allowed} tocs al pretsch {modeLower}. Gia empustà: {ordered}. {overflow} tocs èn vegnids transferids automaticamain sco posiziun separada al pretsch normal.",

    campaignExhaustedTitle: "Contingent {mode} exaurì",
    campaignExhaustedText:
      "Per {product} na resta nagin contingent {modeLower}. Gia empustà: {ordered}. L'entira quantitad è vegnida transferida automaticamain al pretsch normal.",

    orderNotPossibleTitle: "Empustaziun betg pussaivla",
    orderNotPossibleText:
      "L'empustaziun n'ha betg pudì vegnir memorisada.",

    uploadFailed: "Upload da datoteca betg reussì",
    fileUploadFailed: "Upload da datoteca betg reussì",
    fileUploadPartialFailure:
      "L'empustaziun è vegnida memorisada, ma l'upload da la datoteca n'è betg reussì.",
    projectIdCopied: "ID dal project copià",
  },

  provider: {
    pleaseSelect: "Per plaschair tscherner",
    cheapestProvider: "Furnitur cun il pretsch il pli bass",
    providerName: "Per plaschair inditgar il num dal furnitur",
    providerNamePlaceholder: "Num dal commerziant",
    providerNameRequiredHint:
      'Champ obligatoric sche "Auter" è tschernì.',
    cheapestPriceGross: "Pretsch il pli bass (incl. TPV)",
    other: "Auter",
  },

  campaign: {
    campaign: "Campagna",
    activeTradefairCampaign: "Campagna da fiera activa",
    activePromotion: "Promoziun activa",
    activeCampaign: "Campagna activa",
    validFromTo: "Valabel dals {start} fin ils {end}",

    campaignProductsCount: "{count} products da campagna",
    campaignProducts: "Products da fiera",
    promotionProducts: "Products da promoziun",
    campaignProductsIntro:
      "Quests products fan actualmain part da l'acziun da fiera.",
    promotionProductsIntro:
      "Quests products fan actualmain part da la promoziun.",
    noCampaignProducts: "Nagins products da fiera chattads.",
    noPromotionProducts: "Nagins products da promoziun chattads.",

    badge: {
      display: "Display",
      mixed: "Fiera + display",
      messe: "Pretsch da fiera",
      promotion: "Pretsch da promoziun",
      standard: "Acziun",
    },

    pricing: {
      upeGross: "Pretsch recumandà brut",
      dealerPrice: "Pretsch commerziant",
      messePriceNet: "Pretsch netto da fiera",
      promotionPriceNet: "Pretsch netto da promoziun",
      displayPriceNet: "Pretsch netto da display",
      pricingMode: "Modus da pretsch",
      pricingModeDisplay: "Display",
      pricingModeMesse: "Fiera",
      pricingModePromotion: "Promoziun",
      pricingModeStandard: "Standard",
      discountVsHrp: "Rabatt vs. HRP",
    },

    filters: {
      searchPlaceholder: "Tschertgar tenor artitgel, num, EAN, marca …",
      allGroups: "Tut las gruppas",
      allCategories: "Tut las categorias",
    },

    progress: {
      title: "Progress dal bonus",
      afterSubmit: "Suenter trametter",
      progress: "Progress",
      already: "Gia empustà",
      cart: "Chanaster",
      total: "Total",
      nextTier: "Proxim stgalim da bonus",
      highestTierReached: "Il pli aut stgalim da bonus cuntanschì",
      missingToNext: "I mancan anc: {amount}",
      noTierAvailable: "Anc nagin stgalim da bonus disponibel.",
      bonus: "Bonus",
      level: "Stgalim {level}",
    },

    limits: {
      displayMax:
        "Display max. {max} · gia empustà {ordered} · anc liber {free}",
      messeMax:
        "Fiera max. {max} · gia empustà {ordered} · anc liber {free}",
      campaignMax:
        "Acziun max. {max} · gia empustà {ordered} · anc liber {free}",
      totalCampaignMax:
        "Total acziun max. {max} · gia empustà {ordered} · anc liber {free}",

      rowDisplayMax:
        "En questa posiziun da display èn anc pussaivels max. {count} tocs al pretsch da display",
      rowMesseMax:
        "En questa posiziun da fiera èn anc pussaivels max. {count} tocs al pretsch da fiera",
      rowCampaignMax:
        "En questa posiziun èn anc pussaivels max. {count} tocs al pretsch d'acziun",
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
      copied: "ID dal project copià",
      copyId: "Copiar ID dal project",
    },

    dealerInfo: {
      title: "Infurmaziuns dal commerziant",
      customerNumber: "Nr. client",
      contactPerson: "Persuna da contact",
      phone: "Tel.",
      email: "E-mail",
      city: "Lieu",
      kam: "KAM",
    },

    distributor: {
      title: "Distributur principal",
      placeholder: "Per plaschair tscherner",
      defaultHint:
        "Da standard sur ElectronicPartner Schweiz AG.",
    },

    order: {
      title: "Indicaziuns d'empustaziun",
      delivery: "Furniziun",
      deliveryImmediate: "Immediat",
      deliveryScheduled: "Sin termin",
      deliveryPlaceholder: "Per plaschair tscherner",
      deliveryDateOptional: "Data da furniziun (opziunala)",
      comment: "Infurmaziuns impurtantas per l'empustaziun (commentari)",
      commentPlaceholder:
        "p. ex. 'Sto vegnir furnì enfin ils 15.10.'…",
      referenceNumber: "Voss nr. d'empustaziun/referenza",
      referencePlaceholder: "p. ex. 45001234",
    },

    altDelivery: {
      title: "Adressa da furniziun divergenta / furniziun directa",
      useAdditionalAddress: "Utilisar in'adressa da furniziun supplementara",
      name: "Num / Firma",
      street: "Via / Nr.",
      zip: "NP",
      city: "Lieu",
      country: "Pajais",
      phone: "Telefon",
      phoneOptional: "Telefon (opziunal)",
      emailOptional: "E-mail (opziunal)",
      defaultCountry: "Svizra",
    },

    files: {
      title: "Datotecas per l'empustaziun",
      attached: "{count} datoteca(s) agiuntada(s)",
    },

    bonus: {
      title: "Bonus live en il chanaster",
      activeCampaign: "Campagna activa",
      from: "Da",
      to: "Fin",
      alreadyBooked: "Gia empustà",
      thisOrder: "Questa empustaziun",
      afterSubmit: "Suenter trametter",
      currentTier: "Stgalim actualmain cuntanschì",
      noneYet: "Anc nagin",
      progressToNext: "Progress vers il proxim stgalim",
      nextTier: "Proxim stgalim da bonus",
      fromThreshold: "a partir da",
      bonus: "Bonus",
      estimatedBonus: "Bonus",
      highestTierReached: "Il pli aut stgalim da bonus cuntanschì",
    },

    summary: {
      title: "Resumaziun",
      total: "Total",
      totalPrice: "Pretsch total",
      bonusProgress: "Progress dal bonus",
      piecesValue: "{count} tocs",
      totalSavings: "Respargn total: {amount}",
      savings: "Respargn total: {amount} CHF",
      missingToNext: "Anc {amount} enfin {tier}",
      highestTierReached: "Il pli aut stgalim da bonus cuntanschì",
      send: "Trametter empustaziun",
      sending: "Trametter…",
      continueShopping: "Cuntinuar a cumprar",
      pieces: "tocs",
      close: "Serrar",
    },

    product: {
      unknown: "Nunenconuschent",
      empty: "Anc nagins products tschernids.",
      ean: "EAN",
      specialDistribution: "Distribuziun speziala",
      bonusRelevant: "Relevant per il bonus",
      normalPrice: "Pretsch normal",
      messePrice: "Pretsch da fiera",

      quantity: "Quantitad",
      price: "Pretsch (CHF)",
      ekNormal: "Pretsch commerziant normal",
      normalEk: "Pretsch commerziant normal",
      saved: "{amount} CHF respargnads ({percent}%)",

      pricingMode: "Modus da pretsch",
      pricingModeDisplay: "Display",
      pricingModeMesse: "Fiera",
      pricingModePromotion: "Promoziun",
      pricingModeStandard: "Standard",

      modeDisplay: "Display",
      modeMesse: "Fiera",
      modePromotion: "Promoziun",
      modeStandard: "Standard",
      modeCampaign: "Acziun",

      upeGross: "Pretsch recumandà brut",
      displayPriceNet: "Pretsch netto da display",
      messePriceNet: "Pretsch netto da fiera",
      promotionPriceNet: "Pretsch netto da promoziun",
      discountVsHrp: "Rabatt vs. HRP",

      orderAsDisplay: "Empustar sco display",

      reasonForAdditionalDisplay: "Motivaziun per display supplementar",
      reasonPlaceholder:
        "p. ex. segunda localitad, renovaziun, nova surfatscha da vendita …",
      reasonHint:
        "Per quest product è gia vegnì empustà in display. Per plaschair declerar il basegn supplementar.",

      cheapestProvider: "Furnitur cun il pretsch il pli bass",
      providerName: "Per plaschair inditgar il num dal furnitur",
      providerNamePlaceholder: "Num dal commerziant",
      providerNameHint:
        'Champ obligatoric sche "Auter" è tschernì.',

      cheapestPriceGross: "Pretsch il pli bass (incl. TPV)",

      distributor: "Distributur",
      distributorPlaceholder: "Per plaschair tscherner",

      remove: "Allontanar",
      other: "Auter",
    },
  },

  preview: {
    title: "Prevista dal chanaster",
    positions: "Posiziuns en il chanaster",
    quantityTotal: "Quantitad totala",
    cartValue: "Valur dal chanaster",
  },

  loading: {
    dealerData: "Chargiar datas dal commerziant…",
    campaign: "Chargiar campagna…",
  },
} as const;
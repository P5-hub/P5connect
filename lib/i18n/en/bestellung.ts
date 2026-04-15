export const bestellung = {
  common: {
    unknown: "Unknown",
    unknownProduct: "Unknown product",
    remove: "Remove",
    reset: "Reset",
    close: "Close",
    continueShopping: "Continue shopping",
    addToCart: "Add to cart",
    cartOpen: "Open cart",
    loading: "Loading…",
    quantity: "Quantity",
    price: "Price",
    total: "Total",
    totalPrice: "Total price",
    summary: "Summary",
    pieces: "pieces",
    filesAttached: "{count} file(s) attached",
  },

  viewMode: {
    both: "Show both",
    campaignOnly: "Trade fair products only",
    standardOnly: "Standard products only",
  },

  toast: {
    productAddedTitle: "Product added",
    productAddedText: "{product} was added to the cart.",

    maxCampaignQtyTitle: "Maximum campaign quantity reached",
    maxCampaignQtyText:
      "A maximum of {count} units per dealer is allowed for {product}.",

    noDealer: "❌ No dealer found – please log in again.",
    needDistributor: "❌ Please select a main distributor.",
    needValidDate: "Please choose a valid delivery date (YYYY-MM-DD).",

    invalidInputTitle: "Invalid input",
    invalidQuantityText: "Please enter a valid quantity for {product}!",

    missingDistributorTitle: "❌ Distributor missing",
    missingDistributorText:
      "Please select a distributor for {product}.",

    missingProviderTitle: "❌ Provider missing",
    missingProviderText:
      'Please enter the dealer name for "Other" for {product}.',

    missingDisplayReasonTitle:
      "Reason for additional display missing",
    missingDisplayReasonText:
      "Please explain in the comment field why an additional display is needed for {product}.",

    unknownDistributorCodeTitle:
      "❌ Unknown distributor code",
    unknownDistributorCodeText:
      'Distributor "{code}" could not be found.',

    orderSavedTitle: "✅ Order saved",
    orderSavedText:
      "The order was submitted successfully.",

    orderSaveErrorTitle: "❌ Error while saving",
    orderSaveErrorText: "Unknown error",

    displayAlreadyOrderedTitle: "Display already ordered",
    displayAlreadyOrderedText:
      "At least one display has already been ordered for {product}. Please explain in the comment field why an additional display is needed (e.g. second location).",

    displayLimitReachedTitle: "Display limit reached",
    displayLimitReachedText:
      "A maximum of {max} display units is valid for {product}. Already ordered: {ordered}. Still available for this position: {free}.",

    totalLimitReachedTitle: "Total limit reached",
    totalLimitReachedText:
      "A maximum total of {max} campaign units is valid for {product}. Already ordered: {ordered}. Still available for this position: {free}.",

    campaignLimitReachedTitle: "{mode} limit reached",
    campaignLimitReachedText:
      "For {product}, only {allowed} units at the {modeLower} price are still possible. Already ordered: {ordered}. {overflow} unit(s) were automatically transferred as a separate position at the regular price.",

    campaignExhaustedTitle:
      "{mode} quota exhausted",
    campaignExhaustedText:
      "No {modeLower} quota is available anymore for {product}. Already ordered: {ordered}. The entire quantity was automatically transferred to the regular price.",

    orderNotPossibleTitle: "Order not possible",
    orderNotPossibleText:
      "The order could not be saved.",

    uploadFailed: "File upload failed",
    projectIdCopied: "Project ID copied",
  },

  provider: {
    pleaseSelect: "Please select",
    cheapestProvider: "Cheapest provider",
    providerName: "Please enter provider name",
    providerNamePlaceholder: "Dealer name",
    providerNameRequiredHint:
      'Required field when selecting "Other".',
    cheapestPriceGross:
      "Lowest price (incl. VAT)",
    other: "Other",
  },

  campaign: {
    campaign: "Campaign",
    activeTradefairCampaign: "Active trade fair campaign",
    validFromTo: "Valid from {start} to {end}",

    campaignProductsCount: "{count} campaign products",
    campaignProducts: "Trade fair products",
    campaignProductsIntro:
      "These products are currently part of the trade fair campaign.",
    noCampaignProducts: "No trade fair products found.",

    badge: {
      display: "Display",
      mixed: "Trade fair + Display",
      messe: "Trade fair price",
      standard: "Campaign",
    },

    pricing: {
      upeGross: "RRP gross",
      dealerPrice: "Dealer price",
      messePriceNet: "Trade fair price net",
      displayPriceNet: "Display price net",
      pricingMode: "Pricing mode",
      pricingModeDisplay: "Display",
      pricingModeMesse: "Trade fair",
      pricingModeStandard: "Standard",
      discountVsHrp: "Discount vs. RRP",
    },

    filters: {
      searchPlaceholder: "Search by item, name, EAN, brand …",
      allGroups: "All groups",
      allCategories: "All categories",
    },

    progress: {
      title: "Bonus progress",
      afterSubmit: "After submission",
      progress: "Progress",
      already: "Already",
      cart: "Cart",
      total: "Total",
      nextTier: "Next bonus level",
      highestTierReached: "Highest bonus level reached",
      missingToNext: "{amount} still missing",
      noTierAvailable: "No bonus level available yet.",
      bonus: "Bonus",
      level: "Level {level}",
    },

    limits: {
      displayMax:
        "Display max. {max} · already ordered {ordered} · remaining {free}",
      messeMax:
        "Trade fair max. {max} · already ordered {ordered} · remaining {free}",
      campaignMax:
        "Campaign max. {max} · already ordered {ordered} · remaining {free}",
      totalCampaignMax:
        "Campaign total max. {max} · already ordered {ordered} · remaining {free}",

      rowDisplayMax:
        "In this display position, a maximum of {count} unit(s) at display price is still possible",
      rowMesseMax:
        "In this trade fair position, a maximum of {count} unit(s) at trade fair price is still possible",
      rowCampaignMax:
        "In this position, a maximum of {count} unit(s) at campaign price is still possible",
    },
  },

  cartSheet: {
    title: "Best price order",
    empty: "No products selected yet.",

    linkedProject: {
      title: "Linked project",
      customer: "Customer",
      project: "Project",
      open: "Open project",
      remove: "Remove project",
      copied: "Project ID copied",
    },

    dealerInfo: {
      title: "Dealer information",
      customerNumber: "Customer no.",
      contactPerson: "Contact",
      phone: "Phone",
      email: "Email",
      city: "City",
      kam: "KAM",
    },

    distributor: {
      title: "Main distributor",
      placeholder: "Please select",
      defaultHint:
        "By default via ElectronicPartner Schweiz AG.",
    },

    order: {
      title: "Order details",
      delivery: "Delivery",
      deliveryImmediate: "Immediate",
      deliveryScheduled: "Scheduled",
      deliveryDateOptional: "Delivery date (optional)",
      comment:
        "Important order information (comment)",
      commentPlaceholder:
        "e.g. 'Must be delivered by 15.10 at the latest'…",
      referenceNumber: "Your order/reference no.",
      referencePlaceholder: "e.g. 45001234",
    },

    altDelivery: {
      title:
        "Alternative delivery address / direct delivery",
      useAdditionalAddress:
        "Use additional delivery address",
      name: "Name / Company",
      street: "Street / No.",
      zip: "ZIP",
      city: "City",
      country: "Country",
      phoneOptional: "Phone (optional)",
      emailOptional: "Email (optional)",
    },

    files: {
      title: "Files for the order",
      attached: "{count} file(s) attached",
    },

    summary: {
      title: "Summary",
      total: "Total",
      totalPrice: "Total price",
      bonusProgress: "Bonus progress",
      piecesValue: "{count} pieces",
      totalSavings: "Total savings: {amount}",
      savings: "Total savings: {amount} CHF",
      missingToNext: "{amount} until {tier}",
      highestTierReached:
        "Highest bonus level reached",
      send: "Submit order",
      sending: "Sending…",
      continueShopping: "Continue shopping",
      pieces: "pieces",
    },

    product: {
      unknown: "Unknown",
      ean: "EAN",
      specialDistribution: "Special distribution",
      bonusRelevant: "Bonus relevant",
      normalPrice: "Regular price",

      quantity: "Quantity",
      price: "Price (CHF)",
      ekNormal: "Normal purchase price",
      saved:
        "Saved {amount} CHF ({percent}%)",

      pricingMode: "Pricing mode",
      pricingModeDisplay: "Display",
      pricingModeMesse: "Trade fair",
      pricingModeStandard: "Standard",

      upeGross: "RRP gross",
      displayPriceNet: "Display price net",
      messePriceNet: "Trade fair price net",
      discountVsHrp: "Discount vs. RRP",

      orderAsDisplay:
        "Order as display",

      reasonForAdditionalDisplay:
        "Reason for additional display",
      reasonPlaceholder:
        "e.g. second location, renovation, new sales area …",
      reasonHint:
        "A display has already been ordered for this product. Please justify the additional need.",

      cheapestProvider:
        "Cheapest provider",
      providerName:
        "Please enter provider name",
      providerNamePlaceholder:
        "Dealer name",
      providerNameHint:
        'Required field when selecting "Other".',

      cheapestPriceGross:
        "Lowest price (incl. VAT)",

      distributor: "Distributor",
      distributorPlaceholder:
        "Please select",

      remove: "Remove",
      other: "Other",
    },
  },

  preview: {
    title: "Cart preview",
    positions: "Positions in cart",
    quantityTotal: "Total quantity",
    cartValue: "Cart value",
  },

  loading: {
    dealerData: "Loading dealer data…",
    campaign: "Loading trade fair campaign…",
  },
} as const;
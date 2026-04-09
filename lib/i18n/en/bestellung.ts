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
    pieces: "pcs",
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
    needValidDate: "Please select a valid delivery date (YYYY-MM-DD).",

    invalidInputTitle: "Invalid input",
    invalidQuantityText: "Please enter a valid quantity for {product}.",

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
      "The order was successfully submitted.",

    orderSaveErrorTitle: "❌ Error while saving",
    orderSaveErrorText: "Unknown error",

    displayAlreadyOrderedTitle: "Display already ordered",
    displayAlreadyOrderedText:
      "At least one display has already been ordered for {product}. Please explain in the comment field why an additional display is needed (e.g. second location).",

    displayLimitReachedTitle: "Display limit reached",
    displayLimitReachedText:
      "A maximum of {max} display units is valid for {product}. Already ordered: {ordered}. Still available for this line: {free}.",

    totalLimitReachedTitle: "Total limit reached",
    totalLimitReachedText:
      "A maximum of {max} total campaign units is valid for {product}. Already ordered: {ordered}. Still available for this line: {free}.",

    campaignLimitReachedTitle: "{mode} limit reached",
    campaignLimitReachedText:
      "{allowed} units for {product} are still available at the {modeLower} price. Already ordered: {ordered}. {overflow} units were automatically added as a separate line at the regular price.",

    campaignExhaustedTitle:
      "{mode} quota exhausted",
    campaignExhaustedText:
      "No more {modeLower} quota is available for {product}. Already ordered: {ordered}. The full quantity was automatically transferred to the regular price.",

    orderNotPossibleTitle: "Order not possible",
    orderNotPossibleText:
      "The order could not be saved.",

    uploadFailed: "File upload failed",

    projectIdCopied: "Project ID copied",
  },

  provider: {
    pleaseSelect: "Please select",
    cheapestProvider: "Lowest-priced provider",
    providerName: "Please enter the provider name",
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
      searchPlaceholder: "Search by article, name, EAN, brand …",
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
      nextTier: "Next bonus tier",
      highestTierReached: "Highest bonus tier reached",
      missingToNext: "{amount} still missing",
      noTierAvailable: "No bonus tier available yet.",
      bonus: "Bonus",
      level: "Tier {level}",
    },

    limits: {
      displayMax:
        "Display max. {max} · already ordered {ordered} · still available {free}",
      messeMax:
        "Trade fair max. {max} · already ordered {ordered} · still available {free}",
      campaignMax:
        "Campaign max. {max} · already ordered {ordered} · still available {free}",
      totalCampaignMax:
        "Total campaign max. {max} · already ordered {ordered} · still available {free}",

      rowDisplayMax:
        "A maximum of {count} units at display price is still possible in this display line",
      rowMesseMax:
        "A maximum of {count} units at trade fair price is still possible in this trade fair line",
      rowCampaignMax:
        "A maximum of {count} units at campaign price is still possible in this line",
    },
  },

  cartSheet: {
    title: "Best-price order",
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
      email: "E-mail",
      city: "Location",
      kam: "KAM",
    },

    distributor: {
      title: "Main distributor",
      placeholder: "Please select",
      defaultHint:
        "Default via ElectronicPartner Schweiz AG.",
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
        "e.g. 'Must be delivered by 15.10.'…",
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
      emailOptional: "E-mail (optional)",
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
      savings: "Total savings: {amount} CHF",
      missingToNext:
        "{amount} until {tier}",
      highestTierReached:
        "Highest bonus tier reached",
      send: "Submit order",
      sending: "Sending…",
      continueShopping: "Continue shopping",
      pieces: "pcs",
    },

    product: {
      unknown: "Unknown",
      ean: "EAN",
      specialDistribution: "Special distribution",
      bonusRelevant: "Bonus-relevant",
      normalPrice: "Regular price",

      quantity: "Quantity",
      price: "Price (CHF)",
      ekNormal: "Standard cost price",
      saved:
        "{amount} CHF saved ({percent}%)",

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
        "A display has already been ordered for this product. Please explain the additional need.",

      cheapestProvider:
        "Lowest-priced provider",
      providerName:
        "Please enter the provider name",
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
    positions: "Items in cart",
    quantityTotal: "Total quantity",
    cartValue: "Cart value",
  },

  loading: {
    dealerData: "Loading dealer data…",
    campaign: "Loading trade fair campaign…",
  },
} as const;
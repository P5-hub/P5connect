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
    campaignOnly: "Campaign products only",
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
      'Please enter the retailer name for "Other" for {product}.',

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
      "The order has been submitted successfully.",

    orderSaveErrorTitle: "❌ Error while saving",
    orderSaveErrorText: "Unknown error",

    displayAlreadyOrderedTitle: "Display already ordered",
    displayAlreadyOrderedText:
      "At least one display has already been ordered for {product}. Please explain in the comment field why an additional display is required (e.g. second location).",

    displayLimitReachedTitle: "Display limit reached",
    displayLimitReachedText:
      "A maximum of {max} display units is valid for {product}. Already ordered: {ordered}. Still available for this row: {free}.",

    displayNotAllowedTitle: "Display not available",
    displayNotAllowedText:
      "No display ordering option is stored for this product.",

    totalLimitReachedTitle: "Total limit reached",
    totalLimitReachedText:
      "A maximum total of {max} campaign units is valid for {product}. Already ordered: {ordered}. Still available for this row: {free}.",

    campaignLimitReachedTitle: "{mode} limit reached",
    campaignLimitReachedText:
      "{allowed} unit(s) for {product} are still possible at the {modeLower} price. Already ordered: {ordered}. {overflow} unit(s) were automatically added as a separate line at the regular price.",

    campaignExhaustedTitle:
      "{mode} quota exhausted",
    campaignExhaustedText:
      "No {modeLower} quota is left for {product}. Already ordered: {ordered}. The full quantity was automatically moved to regular price.",

    orderNotPossibleTitle: "Order not possible",
    orderNotPossibleText:
      "The order could not be saved.",

    uploadFailed: "File upload failed",
    fileUploadFailed: "File upload failed",
    fileUploadPartialFailure:
      "The order was saved, but the file upload failed.",
    projectIdCopied: "Project ID copied",
  },

  provider: {
    pleaseSelect: "Please select",
    cheapestProvider: "Lowest-price provider",
    providerName: "Please enter provider name",
    providerNamePlaceholder: "Retailer name",
    providerNameRequiredHint:
      'Required field when "Other" is selected.',
    cheapestPriceGross:
      "Lowest price (incl. VAT)",
    other: "Other",
  },

  campaign: {
    campaign: "Campaign",
    activeTradefairCampaign: "Active trade fair campaign",
    validFromTo: "Valid from {start} to {end}",

    campaignProductsCount: "{count} campaign products",
    campaignProducts: "Campaign products",
    campaignProductsIntro:
      "These products are currently part of the campaign.",
    noCampaignProducts: "No campaign products found.",

    badge: {
      display: "Display",
      mixed: "Trade fair + display",
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
      discountVsHrp: "Discount vs. HRP",
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
      already: "Already ordered",
      cart: "Cart",
      total: "Total",
      nextTier: "Next bonus tier",
      highestTierReached: "Highest bonus tier reached",
      missingToNext: "{amount} remaining",
      noTierAvailable: "No bonus tier available yet.",
      bonus: "Bonus",
      level: "Tier {level}",
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
        "In this display row, max. {count} unit(s) are still possible at display price",
      rowMesseMax:
        "In this trade fair row, max. {count} unit(s) are still possible at trade fair price",
      rowCampaignMax:
        "In this row, max. {count} unit(s) are still possible at campaign price",
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
      copyId: "Copy project ID",
    },

    dealerInfo: {
      title: "Dealer information",
      customerNumber: "Customer no.",
      contactPerson: "Contact",
      phone: "Phone",
      email: "Email",
      city: "Location",
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
      deliveryPlaceholder: "Please choose",
      deliveryDateOptional: "Delivery date (optional)",
      comment:
        "Important information for the order (comment)",
      commentPlaceholder:
        "e.g. 'Must be delivered no later than 15.10.'…",
      referenceNumber: "Your order/reference no.",
      referencePlaceholder: "e.g. 45001234",
    },

    altDelivery: {
      title:
        "Different delivery address / direct delivery",
      useAdditionalAddress:
        "Use additional delivery address",
      name: "Name / Company",
      street: "Street / No.",
      zip: "ZIP",
      city: "City",
      country: "Country",
      phoneOptional: "Phone (optional)",
      emailOptional: "Email (optional)",
      defaultCountry: "Switzerland",
    },

    files: {
      title: "Files for the order",
      attached: "{count} file(s) attached",
    },

    bonus: {
      title: "Live bonus in cart",
      activeCampaign: "Active campaign",
      from: "From",
      to: "To",
      alreadyBooked: "Already ordered",
      thisOrder: "This order",
      afterSubmit: "After submission",
      currentTier: "Currently reached tier",
      noneYet: "None yet",
      progressToNext: "Progress to next tier",
      nextTier: "Next bonus tier",
      fromThreshold: "from",
      bonus: "Bonus",
      estimatedBonus: "Bonus",
      highestTierReached: "Highest bonus tier reached",
    },

    summary: {
      title: "Summary",
      total: "Total",
      totalPrice: "Total price",
      bonusProgress: "Bonus progress",
      piecesValue: "{count} pcs",
      totalSavings: "Total savings: {amount}",
      savings: "Total savings: {amount} CHF",
      missingToNext: "{amount} left until {tier}",
      highestTierReached:
        "Highest bonus tier reached",
      send: "Submit order",
      sending: "Sending…",
      continueShopping: "Continue shopping",
      pieces: "pcs",
      close: "Close",
    },

    product: {
      unknown: "Unknown",
      empty: "No products selected yet.",
      ean: "EAN",
      specialDistribution: "Special distribution",
      bonusRelevant: "Bonus-relevant",
      normalPrice: "Regular price",

      quantity: "Quantity",
      price: "Price (CHF)",
      ekNormal: "Regular dealer price",
      normalEk: "Regular dealer price",
      saved:
        "{amount} CHF saved ({percent}%)",

      pricingMode: "Pricing mode",
      pricingModeDisplay: "Display",
      pricingModeMesse: "Trade fair",
      pricingModeStandard: "Standard",

      modeDisplay: "Display",
      modeMesse: "Trade fair",
      modeStandard: "Standard",
      modeCampaign: "Campaign",

      upeGross: "RRP gross",
      displayPriceNet: "Display price net",
      messePriceNet: "Trade fair price net",
      discountVsHrp: "Discount vs. HRP",

      orderAsDisplay:
        "Order as display",

      reasonForAdditionalDisplay:
        "Reason for additional display",
      reasonPlaceholder:
        "e.g. second location, renovation, new retail area …",
      reasonHint:
        "A display has already been ordered for this product. Please explain the additional need.",

      cheapestProvider:
        "Lowest-price provider",
      providerName:
        "Please enter provider name",
      providerNamePlaceholder:
        "Retailer name",
      providerNameHint:
        'Required field when "Other" is selected.',

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
export const sofortrabatt = {
    page: {
      title: "Apply instant rebate",
      heading: "Apply instant rebate",
    },

    steps: {
      step1: "1. Select TV",
      step2: "2. Choose discount level",
      step3: "3. Select soundbar",
    },

    levels: {
      single: "Single (TV only)",
      double: "Double (TV + soundbar)",
      triple: "Triple (TV + soundbar + subwoofer)",
    },

    actions: {
      addToCart: "Add to cart",
      changeTv: "Change TV",
      showTvList: "Show TV list",
    },

    promo: {
      select: "Select promotion",
      classicTitle: "Classic instant rebate promo",
      classicText: "Fixed amounts based on product table",
      percentTitle: "New promo: 30% / 50%",
      percentText:
        "TV from 55 inches + soundbar = 30% on soundbar, with accessories additional 50% on compatible accessories",
    },

    summary: {
      tv: "TV",
      soundbar: "Soundbar",
      accessory: "Accessory",
      notSelected: "Not selected",
      optional: "Optional",
    },

    tv: {
      select: "Select TV",
      help: "First select a TV, then matching accessories will appear.",
      search: "Search TV by model or EAN",
      filterAll: "All sizes",
      filter55Plus: "Only 55 inches and above",
      noneFound: "No matching TVs found.",
      selected: "Selected TV",
      eligible: "Eligible for new promo",
      notEligible: "Not eligible for new promo",
    },

    soundbar: {
      optional: "Optional: Soundbar",
      required: "Select soundbar (required)",
    },

    accessory: {
      select: "Optional: Select accessory",
      compatible: "Compatible with selected soundbar",
      none: "No accessories compatible with this soundbar.",
      subwoofer: "Subwoofer",
      rearSpeaker: "Rear speaker",
    },

    hints: {
      a9m2: "Only subwoofers are compatible",
      htb: "No accessories possible (only 30%)",
      hta8kit: "Only SASW8 and SASW9 available",
      hta7100kit: "All compatible accessories available",
    },

    cart: {
      title: "Apply instant rebate",
      success: "🎉 Request successfully submitted",
      close: "Close",
      promotion: "Promotion",
      classicPromo: "Classic fixed discount promo",
      percentPromo: "New 30% / 50% promo",
      tvSizeDetected: "TV size detected",
      tvSizeUnknown: "not detected",
      tvHint:
        "The TV qualifies the promo. Discount applies to soundbar/accessories.",
      salesPriceSoundbar: "Sales price soundbar (CHF)",
      salesPriceAccessory: "Sales price accessory (CHF)",
      discount30: "30% discount",
      discount50: "50% discount",
      uploadInvoices: "Upload invoices",
      total: "Total discount",
      tvMustBe55: "TV must be at least 55 inches",
      soundbarMandatory: "Soundbar required for this promo",
      submit: "Submit instant rebate",
      sending: "Submitting…",
    },

    toast: {
      noDealer: "No dealer found",
      uploadInvoice: "Please upload invoice",
      tvMissing: "TV missing",
      soundbarPriceRequired: "Enter soundbar price",
      accessoryPriceRequired: "Enter accessory price",
      selectTv: "Please select a TV first",
      only55: "Promo only valid for TVs 55 inches and above",
      needSoundbar: "Soundbar required",
      success: "Successfully submitted",
      error: "Error while submitting",
    },
} as const;
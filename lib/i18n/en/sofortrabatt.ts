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
    classicText: "Fixed amounts based on the configured product table",
    percentTitle: "New promo: 30% / 50%",
    percentText:
      "TV from 55 inches + soundbar = 30% on soundbar, with accessories an additional 50% on compatible accessories",
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
    help: "First select a TV, then the matching accessory options will appear.",
    search: "Search TV by model or EAN",
    filterAll: "All sizes",
    filter55Plus: "55 inches and above only",
    noneFound: "No matching TVs found.",
    selected: "Selected TV",
    eligible: "Eligible for new promo",
    notEligible: "Not eligible for new promo",
    reset: "Reset",
    searchPlaceholder: "Search TV by model or EAN",
    promoValid: "Eligible for selected promotion",
    promoInvalid: "Not eligible for selected promotion",
    validity: "Promotion valid",
    product: "Product",
    role: "Role",
    category: "Category",
    unknown: "unknown",
  },

  soundbar: {
    optional: "Optional: Soundbar",
    required: "Select soundbar (required)",
    search: "Search soundbar",
    noneFound: "No matching soundbars found.",
  },

  accessory: {
    select: "Optional: Select accessory",
    compatible: "Compatible with selected soundbar",
    none: "No accessories compatible with this soundbar.",
    subwoofer: "Subwoofer",
    rearSpeaker: "Rear speaker",
    search: "Search accessory",
    validity: "Promotion valid",
  },

  hints: {
    a9m2:
      "Only subwoofers are compatible with HT-A9M2. Rear speakers are not supported.",
    htb:
      "No additional accessories are compatible with this model. Only the 30% discount on the soundbar applies.",
    hta8kit: "Only SASW8 and SASW9 can be selected for this kit.",
    hta7100kit:
      "All compatible accessories are available for this kit.",
  },

  cart: {
    title: "Apply instant rebate",
    success: "🎉 Request submitted successfully",
    close: "Close",
    promotion: "Promotion",
    classicPromo: "Classic fixed discount promo",
    percentPromo: "New 30% / 50% promo",
    tvSizeDetected: "TV size detected",
    tvSizeUnknown: "not detected",
    tvHint:
      "The TV qualifies for the promotion. Discount is applied to soundbar/accessories.",
    salesPriceSoundbar: "Sales price soundbar (CHF)",
    salesPriceAccessory: "Sales price accessory (CHF)",
    discount30: "30% discount",
    discount50: "50% discount",
    uploadInvoices: "Upload invoices",
    total: "Total discount",
    tvMustBe55: "TV must be at least 55 inches",
    soundbarMandatory: "Soundbar required for this promotion",
    submit: "Submit instant rebate",
    sending: "Submitting…",
    validity: "Validity",
    validFrom: "Valid from",
    validUntil: "Valid until",
    validRange: "Valid",

    tvSerialNumber: "TV Serial Number",
    soundbarSerialNumber: "Soundbar Serial Number",
    subwooferSerialNumber: "Subwoofer Serial Number",

    serialPlaceholder: "7-digit serial number",

    tvDiscount: "TV Instant Discount",

    classicValidity: "Promotion Period",
    percentValidity: "Promotion Period",

    serialMustBeSevenDigits:
      "Serial number must contain exactly 7 digits.",
    requiredSerials:
      "Please enter all required serial numbers with 7 digits.",
  },

  form: {
    productsLoadError:
      "Products could not be loaded",

    loadingProducts:
      "Loading products…",
  },

  toast: {
    noDealer: "No dealer found",
    uploadInvoice: "Please upload invoice",
    tvMissing: "TV missing",
    soundbarPriceRequired: "Please enter the soundbar sales price",
    accessoryPriceRequired: "Please enter the accessory sales price",
    selectTv: "Please select a TV first",
    only55: "This promotion is only valid for TVs 55 inches and above",
    needSoundbar: "A soundbar is required for the new promotion",
    success: "Instant rebate submitted successfully",
    error: "Error while submitting",

    invalidTvSerial:
      "Please enter a valid 7-digit TV serial number",

    invalidSoundbarSerial:
      "Please enter a valid 7-digit soundbar serial number",

    invalidSubwooferSerial:
      "Please enter a valid 7-digit subwoofer serial number",

    duplicateSerial:
      "This serial number has already been used for an instant rebate claim",
  },
} as const;
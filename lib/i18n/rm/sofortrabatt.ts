export const sofortrabatt = {
  page: {
    title: "Dumandar rabat immediat",
    heading: "Dumandar rabat immediat",
  },

  steps: {
    step1: "1. Tscherner TV",
    step2: "2. Tscherner nivel da rabat",
    step3: "3. Tscherner soundbar",
  },

  levels: {
    single: "Single (mo TV)",
    double: "Double (TV + soundbar)",
    triple: "Triple (TV + soundbar + subwoofer)",
  },

  actions: {
    addToCart: "Agiuntar al charret",
    changeTv: "Midar TV",
    showTvList: "Mussar glista da TVs",
  },

  promo: {
    select: "Tscherner promoziun",
    classicTitle: "Promoziun classica da rabat immediat",
    classicText: "Imports fixs tenor la tabella da products configurada",
    percentTitle: "Nova promo: 30% / 50%",
    percentText:
      "TV a partir da 55 polesch + soundbar = 30% sin la soundbar, cun accessoris supplementarmain 50% sin accessoris cumpatibels",
  },

  summary: {
    tv: "TV",
    soundbar: "Soundbar",
    accessory: "Accessori",
    notSelected: "Betg tschernì",
    optional: "Opziunal",
  },

  tv: {
    select: "Tscherner TV",
    help:
      "Tscherna l'emprim in TV, lura vegnan mussads ils accessoris cumpatibels.",
    search: "Tschertgar TV tenor model u EAN",
    filterAll: "Tut las grondezzas",
    filter55Plus: "Mo a partir da 55 polesch",
    noneFound: "Nagins TVs correspundents chattads.",
    selected: "TV tschernì",
    eligible: "Adattà per la nova promoziun",
    notEligible: "Betg adattà per la nova promoziun",
    reset: "Reset",
    searchPlaceholder: "Tschertgar TV tenor model u EAN",
    promoValid: "Adattà per la promoziun tschernida",
    promoInvalid: "Betg adattà per la promoziun tschernida",
    validity: "Promoziun valaivla",
    product: "Product",
    role: "Rolla",
    category: "Categoria",
    unknown: "nunconuschent",
  },

  soundbar: {
    optional: "Opziunal: soundbar",
    required: "Tscherner soundbar (obligatori)",
    search: "Tschertgar soundbar",
    noneFound: "Naginas soundbars correspundentas chattadas.",
  },

  accessory: {
    select: "Opziunal: tscherner accessori",
    compatible: "Cumpatibel cun la soundbar tschernida",
    none: "Nagins accessoris cumpatibels cun questa soundbar.",
    subwoofer: "Subwoofer",
    rearSpeaker: "Autpledaders davos",
    search: "Tschertgar accessori",
    validity: "Promoziun valaivla",
  },

  hints: {
    a9m2:
      "Mo subwoofers èn cumpatibels cun HT-A9M2. Autpledaders davos na vegnan betg sustegnids.",
    htb:
      "Nagins accessoris supplementars èn cumpatibels cun quest model. I vala mo il rabat da 30% sin la soundbar.",
    hta8kit:
      "Per quest kit pon vegnir tschernids mo SASW8 e SASW9.",
    hta7100kit:
      "Per quest kit èn disponibels tut ils accessoris cumpatibels.",
  },

  cart: {
    title: "Dumandar rabat immediat",
    success: "🎉 Dumonda tramessa cun success",
    close: "Serrar",
    promotion: "Promoziun",
    classicPromo: "Promoziun classica cun import fix",
    percentPromo: "Nova promo 30% / 50%",
    tvSizeDetected: "Grondezza dal TV identifitgada",
    tvSizeUnknown: "betg identifitgada",
    tvHint:
      "Il TV è adattà per la promoziun. Il rabat vegn applitgà sin soundbar ed accessoris.",
    salesPriceSoundbar: "Pretsch da vendita soundbar (CHF)",
    salesPriceAccessory: "Pretsch da vendita accessori (CHF)",
    discount30: "Rabat da 30%",
    discount50: "Rabat da 50%",
    uploadInvoices: "Chargiar si quints",
    total: "Rabat total",
    tvMustBe55: "Il TV sto avair almain 55 polesch",
    soundbarMandatory:
      "Per questa promoziun è ina soundbar obligatorica",
    submit: "Trametter dumonda da rabat immediat",
    sending: "Trametter…",
    validity: "Valabilitad",
    validFrom: "Valabel davent da",
    validUntil: "Valabel fin",
    validRange: "Valabel",

    tvSerialNumber: "Numer da seria TV",
    soundbarSerialNumber: "Numer da seria soundbar",
    subwooferSerialNumber: "Numer da seria subwoofer",

    serialPlaceholder: "Numer da seria cun 7 cifras",

    tvDiscount: "Rabat immediat TV",

    classicValidity: "Durada da promoziun",
    percentValidity: "Durada da promoziun",

    serialMustBeSevenDigits:
      "Il numer da seria sto cuntegnair exactamain 7 cifras.",

    requiredSerials:
      "Endatescha per plaschair tut ils numers da seria necessaris cun 7 cifras.",
  },

  form: {
    productsLoadError:
      "Ils products n'han betg pudì vegnir chargiads",

    loadingProducts:
      "Ils products vegnan chargiads…",
  },

  toast: {
    noDealer: "Nagin commerziant chattà",
    uploadInvoice: "Per plaschair chargiar si in quint",
    tvMissing: "TV manca",
    soundbarPriceRequired:
      "Per plaschair endatar il pretsch da vendita da la soundbar",
    accessoryPriceRequired:
      "Per plaschair endatar il pretsch da vendita da l'accessori",
    selectTv: "Per plaschair tscherner l'emprim in TV",
    only55:
      "Questa promoziun vala mo per TVs a partir da 55 polesch",
    needSoundbar:
      "Per questa promoziun è ina soundbar necessaria",
    success:
      "Dumonda da rabat immediat tramessa cun success",
    error:
      "Errur tar il trametter",

    invalidTvSerial:
      "Endatescha in numer da seria TV valid cun 7 cifras",

    invalidSoundbarSerial:
      "Endatescha in numer da seria soundbar valid cun 7 cifras",

    invalidSubwooferSerial:
      "Endatescha in numer da seria subwoofer valid cun 7 cifras",

    duplicateSerial:
      "Quest numer da seria è gia vegnì utilisà per ina dumonda da rabat immediat",
  },
} as const;
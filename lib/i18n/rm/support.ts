export const support = {
  page: {
    title: "Dumonda da sustegn",
  },

  title: "Dumonda da sustegn",
  heading: "Dumonda da sustegn",

  type: {
    sellout: "Sell-Out",
    werbung: "Reclama",
    event: "Eveniment",
    sonstiges: "Auter",
  },

  fields: {
    comment: "Commentari",
    quantity: "Quantitad",
    amountPerUnit: "Sustegn / toc",
    supportType: "Tip da sustegn",
    receipt: "Cumprova / mussament (PDF, JPG, PNG)",
    totalCost: "Custs totals (CHF)",
    sonyShare: "Part Sony (%)",
    sonyAmount: "Sustegn Sony (CHF)",
  },

  actions: {
    add: "Agiuntar",
    submit: "Controllar e trametter il sustegn",
    submitButton: "Trametter sustegn",
    sending: "Vegn tramess…",
    close: "Serrar",
    cancel: "Interrumper",
    remove: "Allontanar",
    choose: "Tscherna per plaschair…",
    openCart: "Avrir cart da sustegn",
  },

  states: {
    success: "✅ Dumonda da sustegn memorisada",
    emptyCart: "Anc nagins products tschernids.",
    noReceipt: "Nagina cumprova tschernida.",
    positions: "Posiziuns",
    totalAmount: "Import total dal sustegn",
    sendTitle: "Trametter sustegn",
    noSupportProducts: "Nagins products da sustegn.",
    selectProducts: "Tscherner products",
    costSharing: "Participaziun als custs",
    selectedFile: "Tschernì:",
    cartLabel: "Sustegn",
  },

  files: {
    invoiceUpload: "Telechargiar factura / cumprova (opziunal)",
    removed: "Cumprova allontanada",
  },

  hints: {
    selloutOnly:
      "Avis: posiziuns èn relevantas mo per Sell-Out. Tscherna survart «Sell-Out» per midar quantitads ed imports.",
    optionalComment: "Commentari opziunal",
    removeReceipt: "Allontanar cumprova",
  },

  product: {
    unknown: "Product nunenconuschent",
    sku: "SKU",
    ean: "EAN",
    quantity: "Quantitad",
    amountPerUnit: "Sustegn / toc",
  },

  customcost: {
    title: "Dumonda da sustegn individuala",
    subtitle: "Tscherna il tip da sustegn ed agiunta detagls",
    type: "Tip da sustegn",
    select: "Tscherna il tip da sustegn",
    name: "Descripziun",
    placeholder: "p.ex. material da reclama, fanestra, flyer, spazi per eveniment",
  },

  error: {
    noDealer: "Nagin commerziant chattà – s'annunzia p.pl. anc ina giada.",
    noProducts: "Agiunta almain in product.",
    noUser: "Nagin utilisader annunzià chattà.",
    save: "Errur cun memorisar.",
    missingSupportType: "Tscherna in tip da sustegn.",
    missingPositions: "Naginas posiziuns da sustegn disponiblas.",
    invalidValues: "Endatescha quantitad ed import valids.",
    tooManyFiles: "Agiuntar mo ina cumprova.",
    missingDealerId: "dealer_id manca.",
    submitFailed: "Il sustegn n'ha betg pudì vegnir memorisà",
    missingDealerFromUrl: "Nagin commerziant chattà (URL).",
    missingCosts: "Endatescha custs e participaziun.",
    unknown: "Errur nunenconuschenta",
  },

  success: {
    submitted: "Sustegn tramess cun success",
  },
} as const;
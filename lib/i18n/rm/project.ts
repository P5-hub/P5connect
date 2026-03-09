export const project = {
  page: {
    title: "Dumonda da pretsch da project",
    heading: "Dumonda da project",
    products: "Tscherner products",
  },

  details: {
    title: "Infurmaziuns dal project",
    name: "Num u numer dal project",
    customer: "Client final / Client",
    location: "Lieu (p. ex. Turitg, Berna)",
    type: "Tip da project",
    start: "Data d’inizi",
    end: "Data da fin",
    comment: "Commentari u descripziun",
    next: "Cuntinuar als products",
    back: "Enavos",
  },

  type: {
    standard: "Standard",
    tender: "Licitaziun",
    promo: "Promoziun / acziun",
  },

  summary: {
    title: "Resumaziun",
    filesAttached: "{count} datoteca(s) agiuntada(s)",
  },

  files: {
    title: "Documents dal project",
    hint: "PDF, Excel, CSV u maletgs – pliras datotecas pussaivlas",
    drop: "Deponer las datotecas qua u tscherner ellas",
    uploading: "Chargiar datoteca…",
    remove: "Allontanar datoteca",
    empty: "Naginas datotecas agiuntadas",
    attached: "Datotecas agiuntadas",
    uploadOptional: "Agiuntar datotecas (opziunal)",
    selected: "Tscherniú:",
    removeAll: "Allontanar datotecas",

    error: {
      uploadFailed: "Chargiament da datoteca betg reussì",
      bucketMissing: "Lieu da memorisaziun betg chattà",
      fileTooLarge: "La datoteca è memia gronda",
      unsupportedType: "Tip da datoteca betg sustegnì",
    },
  },

  cart: {
    title: "Trametter la dumonda da project",
    noProducts: "Anc nagins products en il project.",
    total: "Total",
    totalPrice: "Pretsch total dal project",
    totalSavings: "Spargn total",
    submit: "Trametter il project",
    sending: "Tramet…",
    continue: "Cuntinuar cun configurer",

    projectInfo: "Indicaziuns dal project",
    mainDistributor: "Distribuider principal",
    mainDistributorHint: "Standard via ElectronicPartner Svizra SA.",

    deliveryProjectInfo: "Indicaziuns da furniziun / project",
    delivery: "Furniziun",
    deliveryNow: "Immediat",
    deliveryOnDate: "Al termin",
    deliveryDateOptional: "Data da furniziun (opziunala)",
    projectOrderComment: "Infurmaziuns impurtantas per la cumanda dal project (commentari)",
    projectOrderReference: "Vossa referenza da project / cumanda",
    altDelivery: "Autra adressa da furniziun / furniziun directa",

    success: {
      title: "🎉 Project memorisà!",
      close: "Serrar",
    },

    validation: {
      noDealer: "❌ Nagin commerziant chattà – per plaschair s'annunziar danovamain.",
      noProducts: "Nagins products en il project.",
      missingDistributor: "❌ Tscherna in distributur principal.",
      invalidDate: "Endatescha ina data da furniziun valida (AAAA-MM-DD).",
      missingDisti: "❌ Distributur manca",
      missingSource: "❌ Furnitur manca",
      unknownDisti: "❌ Code da distributur nunenconuschent",
      invalidQuantity: "Valur nunvalida",
    },
  },

  toast: {
    saved: "✅ Project memorisà cun success",
    saveError: "❌ Errur tar il memorisar dal project",
    uploadError: "❌ Chargiament da datoteca betg reussì",
    filesAdded: "📎 {count} datoteca(s) agiuntada(s)",
  },
  productCard: {
    quantity: "Quantitad",
    targetPrice: "Pretsch mira (CHF)",
    add: "Agiuntar al project",
    added: "✅ Product agiuntà a la dumonda dal project.",
    addedShort: "Agiuntà",
    unknownProduct: "Nunenconuschent",
    addError: "Il product n'ha betg pudì vegnir agiuntà (product_id manca).",
    },
  addressFields: {
    name: "Num / Firma",
    street: "Via / Nr.",
    zip: "CAP",
    city: "Citad",
    country: "Pajais",
    phoneOptional: "Telefon (opziunal)",
    emailOptional: "E-mail (opziunal)",
    },

    cartProduct: {
    quantity: "Quantitad",
    projectPrice: "Pretsch dal project (CHF)",
    ekNormal: "Pretsch da cumpra normal",
    cheapestSupplier: "Purschider il pli favuraivel",
    supplierNameRequired: "Inditgar il num dal purschider *",
    supplierNamePlaceholder: "Num dal purschider",
    supplierNameHint:
        "Champ obligatoric sche 'Auter' è tschernì — per plaschair inditgar exact.",
    cheapestPriceGross: "Pretsch il pli bass (incl. TVA)",
    distributorRequired: "Distribuider (obligatoric)",
    pleaseSelect: "Per plaschair tscherner",
    specialDistribution: "Distribuziun speziala",
    remove: "Allontanar",
    ean: "EAN",
    }  
} as const;
export const sofortrabatt = {
  page: {
    title: "Richiedi sconto immediato",
    heading: "Richiedi sconto immediato",
  },

  steps: {
    step1: "1. Seleziona il TV",
    step2: "2. Scegli il livello di sconto",
    step3: "3. Seleziona la soundbar",
  },

  levels: {
    single: "Single (solo TV)",
    double: "Double (TV + soundbar)",
    triple: "Triple (TV + soundbar + subwoofer)",
  },

  actions: {
    addToCart: "Aggiungi al carrello",
    changeTv: "Modifica TV",
    showTvList: "Mostra elenco TV",
  },

  promo: {
    select: "Seleziona la promozione",
    classicTitle: "Promozione classica con sconto immediato",
    classicText: "Importi fissi secondo la tabella prodotti configurata",
    percentTitle: "Nuova promo: 30% / 50%",
    percentText:
      "TV da 55 pollici + soundbar = 30% sulla soundbar, con accessori aggiuntivi 50% sugli accessori compatibili",
  },

  summary: {
    tv: "TV",
    soundbar: "Soundbar",
    accessory: "Accessorio",
    notSelected: "Non selezionato",
    optional: "Opzionale",
  },

  tv: {
    select: "Seleziona il TV",
    help:
      "Seleziona prima il TV, poi verranno visualizzati gli accessori compatibili.",
    search: "Cerca TV per modello o EAN",
    filterAll: "Tutte le dimensioni",
    filter55Plus: "Solo da 55 pollici in su",
    noneFound: "Nessun TV corrispondente trovato.",
    selected: "TV selezionato",
    eligible: "Idoneo per la nuova promozione",
    notEligible: "Non idoneo per la nuova promozione",
    reset: "Reimposta",
    searchPlaceholder: "Cerca TV per modello o EAN",
    promoValid: "Idoneo alla promozione selezionata",
    promoInvalid: "Non idoneo alla promozione selezionata",
    validity: "Promozione valida",
    product: "Prodotto",
    role: "Ruolo",
    category: "Categoria",
    unknown: "sconosciuto",
  },

  soundbar: {
    optional: "Opzionale: soundbar",
    required: "Seleziona una soundbar (obbligatoria)",
    search: "Cerca soundbar",
    noneFound: "Nessuna soundbar corrispondente trovata.",
  },

  accessory: {
    select: "Opzionale: seleziona un accessorio",
    compatible: "Compatibile con la soundbar selezionata",
    none: "Nessun accessorio compatibile con questa soundbar.",
    subwoofer: "Subwoofer",
    rearSpeaker: "Speaker posteriori",
    search: "Cerca accessorio",
    validity: "Promozione valida",
  },

  hints: {
    a9m2:
      "Solo i subwoofer sono compatibili con HT-A9M2. Gli speaker posteriori non sono supportati.",
    htb:
      "Nessun accessorio aggiuntivo è compatibile con questo modello. Si applica solo lo sconto del 30% sulla soundbar.",
    hta8kit:
      "Per questo kit sono selezionabili solo SASW8 e SASW9.",
    hta7100kit:
      "Per questo kit sono disponibili tutti gli accessori compatibili.",
  },

  cart: {
    title: "Richiedi sconto immediato",
    success: "🎉 Richiesta inviata con successo",
    close: "Chiudi",
    promotion: "Promozione",
    classicPromo: "Promozione classica a importo fisso",
    percentPromo: "Nuova promozione 30% / 50%",
    tvSizeDetected: "Dimensione TV rilevata",
    tvSizeUnknown: "non rilevata",
    tvHint:
      "Il TV è idoneo alla promozione. Lo sconto viene applicato a soundbar e accessori.",
    salesPriceSoundbar: "Prezzo di vendita soundbar (CHF)",
    salesPriceAccessory: "Prezzo di vendita accessorio (CHF)",
    discount30: "Sconto 30%",
    discount50: "Sconto 50%",
    uploadInvoices: "Carica fatture",
    total: "Sconto totale",
    tvMustBe55: "Il TV deve essere di almeno 55 pollici",
    soundbarMandatory:
      "Per questa promozione è obbligatoria una soundbar",
    submit: "Invia richiesta di sconto immediato",
    sending: "Invio in corso…",
    validity: "Validità",
    validFrom: "Valido dal",
    validUntil: "Valido fino al",
    validRange: "Valido",

    tvSerialNumber: "Numero di serie TV",
    soundbarSerialNumber: "Numero di serie soundbar",
    subwooferSerialNumber: "Numero di serie subwoofer",

    serialPlaceholder: "Numero di serie a 7 cifre",

    tvDiscount: "Sconto immediato TV",

    classicValidity: "Periodo promozionale",
    percentValidity: "Periodo promozionale",

    serialMustBeSevenDigits:
      "Il numero di serie deve contenere esattamente 7 cifre.",

    requiredSerials:
      "Inserire tutti i numeri di serie richiesti con 7 cifre.",
  },

  form: {
    productsLoadError:
      "Impossibile caricare i prodotti",

    loadingProducts:
      "Caricamento prodotti in corso…",
  },

  toast: {
    noDealer: "Nessun rivenditore trovato",
    uploadInvoice: "Caricare una fattura",
    tvMissing: "TV mancante",
    soundbarPriceRequired:
      "Inserire il prezzo di vendita della soundbar",
    accessoryPriceRequired:
      "Inserire il prezzo di vendita dell'accessorio",
    selectTv: "Selezionare prima un TV",
    only55:
      "Questa promozione è valida solo per TV da 55 pollici in su",
    needSoundbar:
      "Per questa promozione è necessaria una soundbar",
    success:
      "Richiesta di sconto immediato inviata con successo",
    error:
      "Errore durante l'invio",

    invalidTvSerial:
      "Inserire un numero di serie TV valido di 7 cifre",

    invalidSoundbarSerial:
      "Inserire un numero di serie soundbar valido di 7 cifre",

    invalidSubwooferSerial:
      "Inserire un numero di serie subwoofer valido di 7 cifre",

    duplicateSerial:
      "Questo numero di serie è già stato utilizzato per una richiesta di sconto immediato",
  },
} as const;
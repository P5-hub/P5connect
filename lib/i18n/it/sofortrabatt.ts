export const sofortrabatt = {
  page: {
    title: "Richiedi sconto immediato",
    heading: "Richiedi sconto immediato",
  },

  steps: {
    step1: "1. Selezionare il TV",
    step2: "2. Scegliere il livello di sconto",
    step3: "3. Selezionare la soundbar",
  },

  levels: {
    single: "Single (solo TV)",
    double: "Double (TV + soundbar)",
    triple: "Triple (TV + soundbar + subwoofer)",
  },

  actions: {
    addToCart: "Aggiungi al carrello",
    changeTv: "Modifica TV",
    showTvList: "Mostra lista TV",
  },

  promo: {
    select: "Selezionare la promozione",
    classicTitle: "Promozione classica sconto immediato",
    classicText: "Importi fissi secondo la tabella prodotti",
    percentTitle: "Nuova promo: 30% / 50%",
    percentText:
      "TV da 55 pollici + soundbar = 30% sulla soundbar, con accessori ulteriori 50% sugli accessori compatibili",
  },

  summary: {
    tv: "TV",
    soundbar: "Soundbar",
    accessory: "Accessorio",
    notSelected: "Non ancora selezionato",
    optional: "Opzionale",
  },

  tv: {
    select: "Selezionare il TV",
    help: "Seleziona prima il TV, poi verranno mostrati gli accessori compatibili.",
    search: "Cerca TV per modello o EAN",
    filterAll: "Tutte le dimensioni",
    filter55Plus: "Solo da 55 pollici",
    noneFound: "Nessun TV trovato.",
    selected: "TV selezionato",
    eligible: "Idoneo per la nuova promo",
    notEligible: "Non idoneo per la nuova promo",
  },

  soundbar: {
    optional: "Opzionale: soundbar",
    required: "Selezionare soundbar (obbligatorio)",
  },

  accessory: {
    select: "Opzionale: selezionare accessorio",
    compatible: "Compatibile con la soundbar selezionata",
    none: "Nessun accessorio compatibile con questa soundbar.",
    subwoofer: "Subwoofer",
    rearSpeaker: "Speaker posteriori",
  },

  hints: {
    a9m2:
      "Per HT-A9M2 sono compatibili solo i subwoofer. Gli speaker posteriori non sono disponibili.",
    htb:
      "Per questo modello non sono compatibili accessori aggiuntivi. Si applica solo lo sconto del 30% sulla soundbar.",
    hta8kit: "Per questo kit sono disponibili solo SASW8 e SASW9.",
    hta7100kit: "Per questo kit sono disponibili tutti gli accessori compatibili.",
  },

  cart: {
    title: "Richiedi sconto immediato",
    success: "🎉 Richiesta inviata con successo",
    close: "Chiudi",
    promotion: "Promozione",
    classicPromo: "Promozione classica a importo fisso",
    percentPromo: "Nuova promo 30% / 50%",
    tvSizeDetected: "Dimensione TV rilevata",
    tvSizeUnknown: "non rilevata",
    tvHint:
      "Il TV abilita la promo. Lo sconto viene calcolato su soundbar/accessori.",
    salesPriceSoundbar: "Prezzo di vendita soundbar (CHF)",
    salesPriceAccessory: "Prezzo di vendita accessorio (CHF)",
    discount30: "Sconto 30%",
    discount50: "Sconto 50%",
    uploadInvoices: "Caricare le fatture",
    total: "Sconto totale",
    tvMustBe55: "Il TV deve essere almeno 55 pollici",
    soundbarMandatory: "Per questa promo è obbligatoria una soundbar",
    submit: "Inviare richiesta",
    sending: "Invio in corso…",
  },

  toast: {
    noDealer: "Nessun rivenditore trovato",
    uploadInvoice: "Caricare la fattura",
    tvMissing: "TV mancante",
    soundbarPriceRequired: "Inserire il prezzo della soundbar",
    accessoryPriceRequired: "Inserire il prezzo dell'accessorio",
    selectTv: "Selezionare prima un TV",
    only55: "La promo è valida solo per TV da 55 pollici",
    needSoundbar: "È richiesta una soundbar per questa promo",
    success: "Sconto immediato inviato con successo",
    error: "Errore durante l'invio",
  },

} as const;
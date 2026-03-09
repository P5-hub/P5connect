export const project = {
  page: {
    title: "Richiedi prezzo progetto",
    heading: "Richiesta progetto",
    products: "Seleziona prodotti",
  },

  details: {
    title: "Informazioni sul progetto",
    name: "Nome o numero del progetto",
    customer: "Cliente finale / Cliente",
    location: "Località (es. Zurigo, Berna)",
    type: "Tipo di progetto",
    start: "Data di inizio",
    end: "Data di fine",
    comment: "Commento o descrizione",
    next: "Continua ai prodotti",
    back: "Indietro",
  },

  type: {
    standard: "Standard",
    tender: "Gara d’appalto",
    promo: "Promozione / azione",
  },

  summary: {
    title: "Riepilogo",
    filesAttached: "{count} file allegato/i",
  },

  files: {
    title: "Documenti del progetto",
    hint: "PDF, Excel, CSV o immagini – più file possibili",
    drop: "Trascina qui i file oppure selezionali",
    uploading: "Caricamento file…",
    remove: "Rimuovi file",
    empty: "Nessun file allegato",
    attached: "File allegati",
    uploadOptional: "Allega file (facoltativo)",
    selected: "Selezionato:",
    removeAll: "Rimuovi file",

    error: {
      uploadFailed: "Caricamento file non riuscito",
      bucketMissing: "Posizione di archiviazione non trovata",
      fileTooLarge: "Il file è troppo grande",
      unsupportedType: "Tipo di file non supportato",
    },
  },

  cart: {
    title: "Invia richiesta progetto",
    noProducts: "Nessun prodotto nel progetto.",
    total: "Totale",
    totalPrice: "Prezzo totale progetto",
    totalSavings: "Risparmio totale",
    submit: "Invia progetto",
    sending: "Invio in corso…",
    continue: "Continua configurazione",

    projectInfo: "Dati del progetto",
    mainDistributor: "Distributore principale",
    mainDistributorHint: "Standard tramite ElectronicPartner Svizzera SA.",

    deliveryProjectInfo: "Informazioni consegna / progetto",
    delivery: "Consegna",
    deliveryNow: "Immediata",
    deliveryOnDate: "A data fissa",
    deliveryDateOptional: "Data di consegna (facoltativa)",
    projectOrderComment: "Informazioni importanti per l’ordine progetto (commento)",
    projectOrderReference: "Vostro riferimento progetto / ordine",
    altDelivery: "Indirizzo di consegna diverso / consegna diretta",

    success: {
      title: "🎉 Progetto salvato!",
      close: "Chiudi",
    },

    validation: {
      noDealer: "❌ Nessun rivenditore trovato – effettua nuovamente il login.",
      noProducts: "Nessun prodotto nel progetto.",
      missingDistributor: "❌ Seleziona un distributore principale.",
      invalidDate: "Inserisci una data di consegna valida (AAAA-MM-GG).",
      missingDisti: "❌ Distributore mancante",
      missingSource: "❌ Fornitore mancante",
      unknownDisti: "❌ Codice distributore sconosciuto",
      invalidQuantity: "Valore non valido",
    },
  },

  toast: {
    saved: "✅ Progetto salvato con successo",
    saveError: "❌ Errore durante il salvataggio del progetto",
    uploadError: "❌ Caricamento file non riuscito",
    filesAdded: "📎 {count} file aggiunto/i",
  },
  productCard: {
    quantity: "Quantità",
    targetPrice: "Prezzo obiettivo (CHF)",
    add: "Aggiungi al progetto",
    added: "✅ Prodotto aggiunto alla richiesta progetto.",
    addedShort: "Aggiunto",
    unknownProduct: "Sconosciuto",
    addError: "Impossibile aggiungere il prodotto (product_id mancante).",
    },
  addressFields: {
    name: "Nome / Azienda",
    street: "Via / N°",
    zip: "CAP",
    city: "Città",
    country: "Paese",
    phoneOptional: "Telefono (facoltativo)",
    emailOptional: "Email (facoltativa)",
    },

    cartProduct: {
    quantity: "Quantità",
    projectPrice: "Prezzo progetto (CHF)",
    ekNormal: "Prezzo d'acquisto normale",
    cheapestSupplier: "Fornitore più economico",
    supplierNameRequired: "Indicare il nome del fornitore *",
    supplierNamePlaceholder: "Nome del fornitore",
    supplierNameHint:
        "Campo obbligatorio se si seleziona 'Altro' — indicare il fornitore.",
    cheapestPriceGross: "Prezzo più basso (IVA inclusa)",
    distributorRequired: "Distributore (obbligatorio)",
    pleaseSelect: "Selezionare",
    specialDistribution: "Distribuzione speciale",
    remove: "Rimuovi",
    ean: "EAN",
    }  
} as const;
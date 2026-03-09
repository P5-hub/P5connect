export const support = {
  page: {
    title: "Richiedi supporto",
  },

  title: "Richiesta di supporto",
  heading: "Richiesta di supporto",

  type: {
    sellout: "Sell-Out",
    werbung: "Pubblicità",
    event: "Evento",
    sonstiges: "Altro",
  },

  fields: {
    comment: "Commento",
    quantity: "Quantità",
    amountPerUnit: "Supporto / pezzo",
    supportType: "Tipo di supporto",
    receipt: "Ricevuta / prova (PDF, JPG, PNG)",
    totalCost: "Costo totale (CHF)",
    sonyShare: "Quota Sony (%)",
    sonyAmount: "Supporto Sony (CHF)",
  },

  actions: {
    add: "Aggiungi",
    submit: "Verifica e invia supporto",
    submitButton: "Invia supporto",
    sending: "Invio…",
    close: "Chiudi",
    cancel: "Annulla",
    remove: "Rimuovi",
    choose: "Seleziona…",
    openCart: "Apri carrello supporto",
  },

  states: {
    success: "✅ Richiesta di supporto salvata",
    emptyCart: "Nessun prodotto selezionato.",
    noReceipt: "Nessuna ricevuta selezionata.",
    positions: "Posizioni",
    totalAmount: "Importo totale del supporto",
    sendTitle: "Invia supporto",
    noSupportProducts: "Nessun prodotto di supporto.",
    selectProducts: "Seleziona prodotti",
    costSharing: "Partecipazione ai costi",
    selectedFile: "Selezionato:",
    cartLabel: "Supporto",
  },

  files: {
    invoiceUpload: "Carica fattura / ricevuta (opzionale)",
    removed: "Ricevuta rimossa",
  },

  hints: {
    selloutOnly:
      "Nota: le posizioni sono rilevanti solo per il Sell-Out. Seleziona sopra «Sell-Out» per modificare quantità e importi.",
    optionalComment: "Commento opzionale",
    removeReceipt: "Rimuovi ricevuta",
  },

  product: {
    unknown: "Prodotto sconosciuto",
    sku: "SKU",
    ean: "EAN",
    quantity: "Quantità",
    amountPerUnit: "Supporto / pezzo",
  },

  customcost: {
    title: "Richiesta di supporto personalizzata",
    subtitle: "Scegli il tipo di supporto e aggiungi i dettagli",
    type: "Tipo di supporto",
    select: "Seleziona tipo di supporto",
    name: "Descrizione",
    placeholder: "es. materiale pubblicitario, vetrina, flyer, spazio evento",
  },

  error: {
    noDealer: "Nessun rivenditore trovato – effettua di nuovo il login.",
    noProducts: "Aggiungi almeno un prodotto.",
    noUser: "Nessun utente connesso trovato.",
    save: "Errore durante il salvataggio.",
    missingSupportType: "Seleziona un tipo di supporto.",
    missingPositions: "Nessuna posizione di supporto disponibile.",
    invalidValues: "Inserisci quantità e importo validi.",
    tooManyFiles: "Allega solo una ricevuta.",
    missingDealerId: "dealer_id mancante.",
    submitFailed: "Impossibile salvare il supporto",
    missingDealerFromUrl: "Nessun rivenditore trovato (URL).",
    missingCosts: "Inserisci costi e partecipazione.",
    unknown: "Errore sconosciuto",
  },

  success: {
    submitted: "Supporto inviato con successo",
  },
} as const;
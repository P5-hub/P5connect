export const adminProject = {
  detail: {
    title: "Richiesta progetto",
    loading: {
      data: "Caricamento dati…",
    },
    sections: {
      dealer: "Rivenditore",
      projectInfo: "Informazioni sul progetto",
      comment: "Commento",
      projectFiles: "Documenti del progetto",
      projectHistory: "Storico del progetto",
    },
    labels: {
      untitled: "(senza titolo)",
      customerNumber: "N. cliente",
      projectNumber: "N. progetto",
      type: "Tipo",
      customer: "Cliente",
      location: "Luogo",
      period: "Periodo",
      status: "Stato:",
      unknownProduct: "Prodotto",
      created: "creato",
    },
    table: {
      product: "Prodotto",
      quantity: "Quantità",
      counterOffer: "Importo / controfferta",
      total: "Totale",
    },
    actions: {
      back: "Indietro",
      upload: "Upload",
      uploading: "Caricamento…",
      view: "Visualizza",
    },
    status: {
      approved: "✅ Approvato",
      rejected: "❌ Rifiutato",
      pending: "⏳ Aperto",
    },
    empty: {
      noFiles: "Nessun file disponibile.",
    },
    success: {
      fileUploaded: "File caricato con successo.",
      counterOfferSavedApproved:
        "Controfferta salvata e progetto approvato.",
      projectApproved: "Progetto approvato.",
      projectRejected: "Progetto rifiutato.",
      projectReset: "Progetto reimpostato.",
    },
    errors: {
      requestLoadFailed: "La richiesta progetto non ha potuto essere caricata.",
      requestNotFound: "Richiesta progetto non trovata.",
      projectLoadFailed: "Il progetto non ha potuto essere caricato.",
      projectNotFound: "Progetto non trovato.",
      productsLoadFailed: "I prodotti non hanno potuto essere caricati.",
      loadGeneric: "Errore durante il caricamento dei dati progetto.",
      fileOpenFailed: "Il file non ha potuto essere aperto.",
      uploadFailed: "Upload non riuscito.",
      fileDbSaveFailed:
        "Il file è stato caricato, ma non salvato nel database.",
      priceSaveFailed:
        "Il prezzo per {product} non ha potuto essere salvato.",
      statusUpdateFailed: "Lo stato non ha potuto essere aggiornato.",
      actionFailed: "L’azione non ha potuto essere eseguita.",
      noRecord: "Nessun record trovato.",
    },
  },
} as const;
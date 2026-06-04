export const sales = {
  page: {
    title: "Comunicare i dati di vendita",
    heading: "Comunicare i dati di vendita",
    manualTitle: "Inserimento manuale",
    uploadTitle: "Upload CSV / Excel",
    manual: "Inserimento manuale",
    upload: "Upload CSV / Excel",
    uploadTemplate: "Modello CSV",
    template: "Modello CSV",
    next: "Avanti",
    back: "Indietro",
    clearCsv: "Svuota CSV",
    modalTitle: "Comunicare i dati di vendita",
    quantity: "Quantità",
    priceOptional: "Prezzo (opzionale)",
    date: "Data",
    inhouseShare: "Quota inhouse (%)",
    calendarWeek: "Settimana calendario",
    noteForAllProducts:
      "Si applica automaticamente a tutti i prodotti di questa comunicazione.",
    noteForUpload:
      "Si applica automaticamente a tutti i record dell’upload.",
    totalQuantity: "Quantità totale",
    totalRevenue: "Fatturato totale",
    reportSale: "Comunicare vendita",
    submit: "Comunicare i dati di vendita",
    submitSingle: "Comunicare vendita",
    saving: "Salvataggio…",
    saved: "Dati di vendita salvati",
    success: "Dati di vendita comunicati con successo",
    saveError: "Errore durante il salvataggio",
    submitError: "Errore durante l’invio",
    serverError: "Errore del server",
    fileReadError: "Errore durante la lettura del file",
  },

  loading: {
    dealer: "⏳ Caricamento rivenditore…",
    dealerData: "⏳ Caricamento dati rivenditore…",
  },

  errors: {
    dealerNotFound: "Rivenditore non trovato",
    dealerLoadFailed: "Impossibile caricare il rivenditore.",
    noDealer: "Nessun rivenditore trovato.",
    emptyCart: "Nessun prodotto nel carrello.",
    confirmSonyShare:
      "Confermare la quota SONY per pezzi e fatturato.",
  },

  card: {
    unknownModel: "Modello sconosciuto",
    ean: "EAN",
    quantity: "Quantità",
    stock: "Giacenza",
    price: "Prezzo (CHF)",
    serialNumber: "N. di serie",
    serialPlaceholder: "SN...",
    added: "✅ Aggiunto",
    report: "📊 Comunicare",
  },

  choose: {
    manual: "Inserimento manuale",
    upload: "Upload CSV / Excel",
  },

  upload: {
    fileTable: {
      ean: "EAN",
      product: "Prodotto",
      quantity: "Quantità",
      stockQuantity: "Giacenza",
      price: "Prezzo",
      date: "Data",
      stockDate: "Data giacenza",
    },

    calendarWeek: "Settimana calendario",
    sonyShareQty: "Quota SONY pezzi (%)",
    sonyShareRevenue: "Quota SONY fatturato (%)",
    sonyQty: "Quantità Sony",
    totalQty: "Quantità totale rivenditore",
    sonyRevenue: "Fatturato Sony",
    totalRevenue: "Fatturato totale rivenditore",
    reportedStock: "Giacenza comunicata",
    confirmSonyShare:
      "Confermo che le quote SONY comunicate (pezzi e fatturato) corrispondono alle effettive proporzioni di vendita di questa settimana calendario.",
  },

  cart: {
    title: "Comunicare i dati di vendita",
    close: "Chiudi",
    submit: "Comunicare vendita",
    saving: "Salvataggio…",
    sonyShareQty: "Quota SONY pezzi (%)",
    sonyShareRevenue: "Quota SONY fatturato (%)",

    reportedProducts: "Prodotti comunicati",
    totalSale: "Totale vendite",
    totalStock: "Totale giacenza",

    item: {
      ean: "EAN",
      sale: "Vendita",
      stock: "Giacenza",
      price: "Prezzo",
      serialNumber: "Numero di serie",
      stockDate: "Data giacenza",
    },

    dealer: {
      customerNo: "N. cliente",
      contact: "Contatto",
      phone: "Tel.",
      email: "E-mail",
      city: "Località",
      kam: "KAM",
    },
    placeholders: {
      price: "ad es. 499",
    },
  },
} as const;
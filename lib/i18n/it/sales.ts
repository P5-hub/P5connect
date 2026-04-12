export const sales = {

    page: {
        title: "Segnalare dati di vendita",
        heading: "Segnalare dati di vendita",
        manualTitle: "Segnala manualmente",
        uploadTitle: "Upload CSV / Excel",
        manual: "Segnala manualmente",
        upload: "Upload CSV / Excel",
        uploadTemplate: "Modello CSV",
        template: "Modello CSV",
        next: "Avanti",
        back: "Indietro",
        clearCsv: "Svuota CSV",
        modalTitle: "Segnalare dati di vendita",
        quantity: "Quantità",
        priceOptional: "Prezzo (opzionale)",
        date: "Data",
        inhouseShare: "Quota interna (%)",
        calendarWeek: "Settimana calendario",
        noteForAllProducts:
        "Valido automaticamente per tutti i prodotti in questa segnalazione.",
        noteForUpload:
        "Valido automaticamente per tutte le righe del file caricato.",
        totalQuantity: "Quantità totale",
        totalRevenue: "Fatturato totale",
        reportSale: "Segnala vendita",
        submit: "Invia dati di vendita",
        submitSingle: "Segnala vendita",
        saving: "Salvataggio…",
        saved: "Dati di vendita salvati",
        success: "Dati di vendita inviati con successo",
        saveError: "Errore durante il salvataggio",
        submitError: "Errore durante l’invio",
        serverError: "Errore del server",
        fileReadError: "Errore durante la lettura del file",
    },

    loading: {
        dealer: "⏳ Caricamento rivenditore…",
        dealerData: "⏳ Caricamento dati del rivenditore…",
    },

    errors: {
        dealerNotFound: "Rivenditore non trovato",
        dealerLoadFailed: "Impossibile caricare il rivenditore.",
        noDealer: "Nessun rivenditore trovato.",
        emptyCart: "Nessun prodotto nel carrello.",
        confirmSonyShare:
        "Conferma la quota SONY per pezzi e fatturato.",
    },

    card: {
        unknownModel: "Modello sconosciuto",
        ean: "EAN",
        quantity: "Quantità",
        price: "Prezzo (CHF)",
        serialNumber: "N. seriale",
        serialPlaceholder: "SN...",
        added: "✅ Aggiunto",
        report: "📊 Segnala",
    },

    choose: {
        manual: "Segnala manualmente",
        upload: "Upload CSV / Excel",
    },

    upload: {
        fileTable: {
        ean: "EAN",
        product: "Prodotto",
        quantity: "Quantità",
        price: "Prezzo",
        date: "Data",
        },
        calendarWeek: "Settimana calendario",
        sonyShareQty: "Quota SONY pezzi (%)",
        sonyShareRevenue: "Quota SONY fatturato (%)",
        sonyQty: "Quantità Sony",
        totalQty: "Quantità totale rivenditore",
        sonyRevenue: "Fatturato Sony",
        totalRevenue: "Fatturato totale rivenditore",
        confirmSonyShare:
        "Confermo che le quote SONY dichiarate (pezzi e fatturato) corrispondono alle effettive vendite di questa settimana calendario.",
    },

    cart: {
        title: "Segnalare dati di vendita",
        close: "Chiudi",
        submit: "Segnala vendita",
        saving: "Salvataggio…",
        sonyShareQty: "Quota SONY pezzi (%)",
        sonyShareRevenue: "Quota SONY fatturato (%)",
        dealer: {
        customerNo: "N. cliente",
        contact: "Contatto",
        phone: "Telefono",
        email: "E-mail",
        city: "Località",
        kam: "KAM",
        },
    },    
} as const;  
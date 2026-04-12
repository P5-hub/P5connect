export const admin = {
  promotions: "Promozioni",
  instantDiscount: "Sconto immediato",
  projects: "Progetti",
  orders: "Ordini",
  support: "Supporto",
  monthlyOffers: "Azioni mensili",
  reports: "Report",
  info: "Info",
  actAsDealer: "Agisci come rivenditore",

  common: {
    logout: "Logout",
    language: "Lingua",
    navigation: "Navigazione",
    adminMenu: "Menu admin",
    open: "Apri",
    close: "Chiudi",
    save: "Salva",
    cancel: "Annulla",
    loading: "Salvataggio...",
    myLogin: "Il mio login",
    show: "Mostra",
    hide: "Nascondi",
    searchDealer: "Cerca rivenditore...",
    pendingItems: "Punti aperti",
  },

  account: {
    button: "🔐 Login / Password",
    modalTitle: "Modifica login / password",
    currentLogin: "Login attuale / n. login *",
    currentLoginPlaceholder: "es. VAdminP5 o n. login rivenditore",
    newLogin: "Nuovo login (opzionale)",
    newLoginPlaceholder: "Lascia vuoto se il login deve rimanere invariato",
    newLoginHint: 'Consentiti: lettere, numeri, "-" e "_".',
    newPassword: "Nuova password *",
    newPasswordPlaceholder: "Almeno 6 caratteri",
    generatePassword: "Genera password casuale",
    passwordGenerated: "Password casuale generata.",
    passwordGeneratedCopied: "Password casuale generata e copiata.",
    loginRequired: "Login / numero di login obbligatorio.",
    passwordMinLength:
      "La nuova password deve contenere almeno 6 caratteri.",
    invalidLoginFormat:
      "Il nuovo login può contenere solo lettere, numeri, '-' e '_'.",
    updateFailed: "Errore sconosciuto durante l’aggiornamento.",
    requestFailed: "Errore durante l’invio della richiesta.",
    successDefault: "Accesso aggiornato con successo.",
    successLogin: "Login aggiornato con successo.",
    successPassword: "Password aggiornata con successo.",
    successLoginAndPassword:
      "Login e password aggiornati con successo.",
    reloginNow: "Verrai autenticato di nuovo ora...",
    logoutRunning: "Disconnessione in corso...",
    confirmTitle: "Conferma modifica",
    confirmLoginChange:
      'Stai cambiando il login da "{old}" a "{new}". Continuare?',
    confirmPasswordChange:
      "Stai impostando una nuova password. Continuare?",
    confirmLoginAndPasswordChange:
      'Stai cambiando il login da "{old}" a "{new}" e stai anche impostando una nuova password. Continuare?',
  },

  users: {
    title: "Gestione utenti",
    updateExisting: "Aggiorna utente esistente",
    createNew: "Crea nuovo utente",
    oldLogin: "Login precedente (login_nr)",
    newLogin: "Nuovo login (login_nr)",
    newPasswordOptional: "Nuova password (opzionale)",
    updateButton: "Aggiorna utente",
    updating: "Aggiornamento...",
    signingOut: "Disconnessione...",
    createButton: "Crea utente",
    creating: "Creazione...",
    loginNr: "N. login (login_nr)",
    email: "E-mail",
    password: "Password",
    name: "Nome",
    optional: "opzionale",
    role: "Ruolo",
    dealer: "Rivenditore",
    admin: "Admin",
    ownAccessChanged:
      "Il tuo accesso è stato modificato. Ora verrai disconnesso...",
    loginChangedSuccess: "Login aggiornato con successo.",
    passwordChangedSuccess: "Password aggiornata con successo.",
    loginAndPasswordChangedSuccess:
      "Login e password aggiornati con successo.",
    userUpdatedSuccess: "Utente aggiornato con successo.",
    userCreatedSuccess: "Utente creato con successo.",
    updateError: "Errore durante l’aggiornamento.",
    createError: "Errore durante la creazione.",
  },
  aktionen: {
    description:
      "Panoramica di tutte le promozioni attive o scadute. È possibile modificare lo stato o attivare/disattivare le campagne.",
  },
  bestellungen: {
    searchPlaceholder:
      "Cerca ordine (rivenditore, e-mail, #ID, campagna)…",
    open: "Aperto",
    approved: "Confermato",
    rejected: "Rifiutato",
    all: "Tutti",
    reload: "Ricarica",
    type: "Tipo",
    allTypes: "Tutti i tipi",
    onlyMesse: "Solo fiera",
    onlyDisplay: "Solo display",
    onlyStandard: "Solo standard",
    loading: "Caricamento ordini…",
    empty: "Nessun ordine trovato.",
    unknownDealer: "Rivenditore sconosciuto",
    fromProject: "da progetto",
    pos: "pos.",
    statusApproved: "Confermato",
    statusRejected: "Rifiutato",
    statusPending: "Aperto",
    messeOrder: "Ordine fiera",
  },
  adminProject: {
    detail: {
      title: "Richiesta progetto",
      loading: {
        data: "Caricamento dati…",
      },
      sections: {
        dealer: "Rivenditore",
        projectInfo: "Informazioni progetto",
        comment: "Commento",
        projectFiles: "Documenti progetto",
        projectHistory: "Cronologia progetto",
      },
      labels: {
        untitled: "(senza titolo)",
        customerNumber: "N° cliente",
        projectNumber: "N° progetto",
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
        upload: "Carica",
        uploading: "Caricamento…",
        view: "Visualizza",
      },
      status: {
        approved: "✅ Approvato",
        rejected: "❌ Rifiutato",
        pending: "⏳ In attesa",
      },
      empty: {
        noFiles: "Nessun file disponibile.",
      },
      success: {
        fileUploaded: "File caricato con successo.",
        counterOfferSavedApproved: "Controfferta salvata e progetto approvato.",
        projectApproved: "Progetto approvato.",
        projectRejected: "Progetto rifiutato.",
        projectReset: "Progetto ripristinato.",
      },
      errors: {
        requestLoadFailed: "Impossibile caricare la richiesta progetto.",
        requestNotFound: "Richiesta progetto non trovata.",
        projectLoadFailed: "Impossibile caricare il progetto.",
        projectNotFound: "Progetto non trovato.",
        productsLoadFailed: "Impossibile caricare i prodotti.",
        loadGeneric: "Errore durante il caricamento dei dati progetto.",
        fileOpenFailed: "Impossibile aprire il file.",
        uploadFailed: "Caricamento fallito.",
        fileDbSaveFailed: "File caricato ma non salvato nel database.",
        priceSaveFailed: "Il prezzo per {product} non può essere salvato.",
        statusUpdateFailed: "Impossibile aggiornare lo stato.",
        actionFailed: "Impossibile eseguire l’azione.",
        noRecord: "Nessun record trovato.",
      },
    },
  },
  adminPromotions: {
    page: {
      title: "Gestire le promozioni",
      description:
        "Qui puoi creare promozioni, campagne fiera e azioni mensili per il frontend.",
    },

    sections: {
      masterData: "1. Dati principali",
      products: "2. Prodotti",
      dealerTargets: "3. Obiettivi rivenditori (opzionale)",
      bonusTiers: "4. Livelli bonus (opzionale)",
      existingCampaigns: "Promozioni / campagne esistenti",
    },

    fields: {
      code: "Codice",
      name: "Nome",
      type: "Tipo",
      active: "Attivo",
      allowDisplay: "Display consentito",
      startDate: "Data di inizio",
      endDate: "Data di fine",
      description: "Descrizione",
      dealer: "Rivenditore",
      targetValue: "Valore obiettivo",
      unit: "Unità",
      currentValue: "Valore attuale",
      dealerOptional: "Rivenditore opzionale",
      tierLevel: "Livello",
      threshold: "Soglia",
      bonusType: "Tipo bonus",
      bonusValue: "Valore bonus",
      label: "Etichetta",
    },

    placeholders: {
      code: "es. PROMO-TV-2026",
      name: "es. Promozione primaverile",
      description: "Descrizione / condizioni",
      search: "Cerca per nome, codice, tipo, data...",
    },

    actions: {
      reset: "Reset",
      save: "Salva promozione",
      saving: "Salvataggio...",
      addTarget: "Aggiungi obiettivo",
      addBonusTier: "Aggiungi livello bonus",
      reload: "Ricarica",
      activate: "Attiva",
      deactivate: "Disattiva",
      edit: "Modifica",
      duplicate: "Duplica",
      delete: "Elimina",
    },

    select: {
      pleaseChoose: "Seleziona...",
    },

    filters: {
      allTypes: "Tutti i tipi",
      allStatuses: "Tutti gli stati",
      active: "Attivo",
      inactive: "Inattivo",
    },

    types: {
      promotion: "promotion",
      messe: "fiera",
      monatsaktion: "azione mensile",
    },

    units: {
      qty: "qty",
      revenue: "revenue",
      points: "points",
    },

    bonusTypes: {
      amount: "amount",
      percent: "percent",
      credit: "credit",
      gift: "gift",
    },

    badges: {
      active: "Attivo",
      inactive: "Inattivo",
    },

    labels: {
      noCode: "Nessun codice",
      yes: "sì",
      no: "no",
      to: "a",
      displayOrders: "Ordini display",
      global: "Globale",
      copy: "Copia",
    },

    loading: {
      campaigns: "Caricamento campagne…",
    },

    empty: {
      noDealerTargets: "Nessun obiettivo rivenditore definito.",
      noBonusTiers: "Nessun livello bonus definito.",
      noCampaigns: "Nessuna campagna trovata.",
    },

    validation: {
      nameRequired: "Inserisci un nome per la campagna.",
      startDateRequired: "Seleziona una data di inizio.",
      endDateRequired: "Seleziona una data di fine.",
      endBeforeStart: "La data di fine non può essere precedente alla data di inizio.",
      productRequired: "Aggiungi almeno un prodotto.",
      duplicateProduct: "Un prodotto è stato selezionato più di una volta.",
      targetDealerMissing: "Manca un rivenditore negli obiettivi rivenditori.",
      targetValueInvalid: "Manca un valore obiettivo valido negli obiettivi rivenditori.",
      targetDealerDuplicate: "Un rivenditore è stato utilizzato più volte negli obiettivi.",
      tierLevelMissing: "Manca il livello nei bonus tiers.",
      thresholdInvalid: "Manca un valore soglia valido nei bonus tiers.",
      bonusValueInvalid: "Manca un valore bonus valido nei bonus tiers.",
      duplicateTier: "Il livello è presente più volte.",
    },

    messages: {
      loadError: "Impossibile caricare i dati.",
      saveSuccess: "Promozione / campagna salvata con successo.",
      saveError: "Impossibile salvare la campagna.",
      activated: "Campagna attivata.",
      deactivated: "Campagna disattivata.",
      statusChangeError: "Impossibile modificare lo stato.",
      duplicateSuccess: "Campagna duplicata con successo.",
      duplicateError: "Impossibile duplicare la campagna.",
      deleteSuccess: "Campagna eliminata con successo.",
      deleteError: "Impossibile eliminare la campagna.",
      confirmDelete: 'Vuoi davvero eliminare la campagna "{name}"?',
    },
  },
  adminPromotionDetail: {
    page: {
      title: "Modifica promozione",
      subtitle: "Modifica e salva la campagna #{id}.",
      invalidId: "ID campagna non valido.",
    },

    actions: {
      back: "Indietro",
      reload: "Ricarica",
      save: "Salva modifiche",
      saving: "Salvataggio...",
      addTarget: "Aggiungi obiettivo",
      addBonusTier: "Aggiungi livello bonus",
    },

    sections: {
      masterData: "1. Dati principali",
      products: "2. Prodotti",
      dealerTargets: "3. Obiettivi rivenditori (opzionale)",
      bonusTiers: "4. Livelli bonus (opzionale)",
    },

    fields: {
      code: "Codice",
      name: "Nome",
      type: "Tipo",
      active: "Attivo",
      allowDisplay: "Display consentito",
      startDate: "Data inizio",
      endDate: "Data fine",
      description: "Descrizione",
      dealer: "Rivenditore",
      targetValue: "Valore obiettivo",
      unit: "Unità",
      currentValue: "Valore attuale",
      dealerOptional: "Rivenditore opzionale",
      tierLevel: "Livello",
      threshold: "Soglia",
      bonusType: "Tipo bonus",
      bonusValue: "Valore bonus",
      label: "Etichetta",
    },

    placeholders: {
      code: "es. PROMO-TV-2026",
      name: "es. Promozione primavera",
      description: "Descrizione / condizioni",
    },

    select: {
      pleaseChoose: "Seleziona...",
      global: "Globale",
    },

    empty: {
      noDealerTargets: "Nessun obiettivo rivenditore definito.",
      noBonusTiers: "Nessun livello bonus definito.",
    },

    loading: {
      campaign: "Caricamento campagna…",
    },

    validation: {
      nameRequired: "Inserisci nome campagna.",
      startDateRequired: "Seleziona data inizio.",
      endDateRequired: "Seleziona data fine.",
      endBeforeStart: "La data fine non può essere prima della data inizio.",
      productRequired: "Aggiungi almeno un prodotto.",
      duplicateProduct: "Prodotto selezionato più volte.",
      targetDealerMissing: "Rivenditore mancante.",
      targetValueInvalid: "Valore obiettivo non valido.",
      targetDealerDuplicate: "Rivenditore duplicato.",
      tierLevelMissing: "Livello mancante.",
      thresholdInvalid: "Soglia non valida.",
      bonusValueInvalid: "Bonus non valido.",
      duplicateTier: "Livello duplicato.",
    },

    messages: {
      loadError: "Impossibile caricare la campagna.",
      saveSuccess: "Promozione / campagna aggiornata.",
      saveError: "Impossibile salvare la campagna.",
    },
  },
  adminReports: {
    title: "Esportazione dati & Report",

    fields: {
      type: "Tipo",
      from: "Da",
      to: "A",
    },

    placeholders: {
      search: "Cerca prodotto o rivenditore…",
    },

    actions: {
      exportExcel: "Esporta (Excel)",
      exportRunning: "Esportazione in corso…",
      reset: "Reset",
    },

    types: {
      bestellung: "Ordini",
      verkauf: "Vendite",
      projekt: "Progetti",
      support: "Supporto",
    },

    labels: {
      lastExport: "Ultima esportazione",
      hint: "Nota",
      hintText:
        "Visualizzazione, KPI ed export Excel utilizzano esattamente gli stessi filtri.",
    },

    messages: {
      exportError: "Esportazione non riuscita",
    },
  },
} as const;
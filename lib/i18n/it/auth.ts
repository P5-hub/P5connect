export const auth = {
  login: {
    portalTitle: "Portale partner P5",
    portalDesc:
      "Benvenuto nel portale P5connect. Accedi con il tuo numero di login e la tua password.",
    loginNr: "Numero di login",
    loginNrPlaceholder: "ad es. 2612400162",
    password: "Password",
    passwordPlaceholder: "Inserisci la password",
    submit: "Accedi",
    securityNote: "Il tuo accesso è crittografato e sicuro.",
    footerLine1: "© {year} P5connect. Tutti i diritti riservati.",
    footerLine2: "Programma partner Sony Svizzera",
    legalImprint: "Note legali",
    legalPrivacy: "Protezione dei dati",
    forgotPassword: "Password dimenticata?",
    error: {
      unknownLogin: "Numero di login sconosciuto.",
      failed: "Accesso non riuscito.",
      noEmail: "Per questo utente non è registrato alcun indirizzo e-mail.",
      invalidCredentials: "Dati di accesso non validi.",
    },
  },

  password: {
    pageTitle: "🔒 Cambia password",
    pageDescription:
      "Modifica qui la password del tuo accesso attualmente autenticato.",
    securityTitle: "Dati di sicurezza",
    securityDescription:
      "Dopo la modifica verrai disconnesso automaticamente e dovrai accedere di nuovo con la nuova password.",
    notesTitle: "Note",
    noteMinLength: "Usa almeno 8 caratteri.",
    noteLoggedInOnly:
      "Questa pagina è destinata solo agli utenti autenticati.",
    noteForgotPassword:
      "Se hai dimenticato la password, usa la funzione “Password dimenticata” nella pagina di login.",
    newPassword: "Nuova password",
    confirmPassword: "Conferma password",
    submit: "Cambia password",
    submitting: "⏳ Cambio password in corso...",
    successChanged:
      "Password modificata con successo. Verrai autenticato di nuovo...",
    notLoggedIn: "Non hai effettuato l’accesso.",
    errorMismatch: "Le password non coincidono.",
    errorMinLength: "La password deve contenere almeno 8 caratteri.",
  },

  reset: {
    title: "Imposta una nuova password",
    loading: "Verifica del link in corso...",
    newPassword: "Nuova password",
    confirm: "Conferma password",
    submit: "Cambia password",
    requestNew: "Richiedi un nuovo link di reset",
    invalidLink: "Il link di reset non è valido.",
    expired: "Il link di reset è scaduto o non è valido.",
    mismatch: "Le password non coincidono.",
    short: "La password deve contenere almeno 8 caratteri.",
    success: "Password impostata con successo.",
    requestTitle: "Reimposta password",
    requestDesc:
      "Inserisci il tuo numero di login. Riceverai un’e-mail per reimpostare la password.",
    mailSent:
      "Se l’utente esiste, è stata inviata un’e-mail per reimpostare la password.",
    send: "Invia e-mail di reset",
    backToLogin: "Torna al login",
  },

  navigation: {
    changePassword: "Cambia password",
  },

  common: {
    save: "Salva",
    cancel: "Annulla",
    show: "Mostra",
    hide: "Nascondi",
  },
} as const;
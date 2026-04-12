export const auth = {
  login: {
    portalTitle: "Portal da partenaris P5",
    portalDesc:
      "Bainvegni en il portal P5connect. Per plaschair t'annunzia cun tes numer da login e tes pled-clav.",
    loginNr: "Numer da login",
    loginNrPlaceholder: "p.ex. 2612400162",
    password: "Pled-clav",
    passwordPlaceholder: "Endatescha il pled-clav",
    submit: "Annunziar",
    securityNote: "Tia annunzia è criptada e segira.",
    footerLine1: "© {year} P5connect. Tut ils dretgs resalvads.",
    footerLine2: "Program da partenaris Sony Svizra",
    legalImprint: "Impressum",
    legalPrivacy: "Protecziun da datas",
    forgotPassword: "Emblidà il pled-clav?",
    error: {
      unknownLogin: "Numer da login nunenconuschent.",
      failed: "L'annunzia n'è betg reussida.",
      noEmail: "Per quest utilisader n'è nagina adressa e-mail registrada.",
      invalidCredentials: "Datas d'annunzia nunvalidas.",
    },
  },

  password: {
    pageTitle: "🔒 Midar pled-clav",
    pageDescription:
      "Mida qua il pled-clav da tes access actualmain annunzià.",
    securityTitle: "Datas da segirezza",
    securityDescription:
      "Suenter la midada vegns ti automaticamain deconnex e stos t'annunziar danovamain cun il nov pled-clav.",
    notesTitle: "Indicaziuns",
    noteMinLength: "Utilisescha almain 8 segns.",
    noteLoggedInOnly:
      "Questa pagina è mo destinada per utilisaders annunziads.",
    noteForgotPassword:
      "Sche ti has emblidà tes pled-clav, utilisescha per plaschair la funcziun « Emblidà il pled-clav » sin la pagina da login.",
    newPassword: "Nov pled-clav",
    confirmPassword: "Confermar pled-clav",
    submit: "Midar pled-clav",
    submitting: "⏳ Il pled-clav vegn midà...",
    successChanged:
      "Pled-clav midà cun success. Ti vegns annunzià da nov...",
    notLoggedIn: "Ti n'es betg annunzià.",
    errorMismatch: "Ils pleds-clav na correspundan betg.",
    errorMinLength:
      "Il pled-clav sto avair almain 8 segns.",
  },

  reset: {
    title: "Metter in nov pled-clav",
    loading: "Il link vegn controllà...",
    newPassword: "Nov pled-clav",
    confirm: "Confermar pled-clav",
    submit: "Midar pled-clav",
    requestNew: "Dumandar in nov link da reset",
    invalidLink: "Il link da reset è nunvalid.",
    expired: "Il link da reset è scrudà giu u nunvalid.",
    mismatch: "Ils pleds-clav na correspundan betg.",
    short: "Il pled-clav sto avair almain 8 segns.",
    success: "Pled-clav definì cun success.",
    requestTitle: "Resetar pled-clav",
    requestDesc:
      "Per plaschair inditgescha tes numer da login. Ti survegns in e-mail per resetar il pled-clav.",
    mailSent:
      "Sche l'utilisader exista, è vegnì tramess in e-mail per resetar il pled-clav.",
    send: "Trametter e-mail da reset",
    backToLogin: "Enavos al login",
  },

  navigation: {
    changePassword: "Midar pled-clav",
  },

  common: {
    save: "Memorisar",
    cancel: "Interrumper",
    show: "Mussar",
    hide: "Zuppentar",
  },
} as const;
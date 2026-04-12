export const auth = {
  login: {
    portalTitle: "P5 Partnerportal",
    portalDesc:
      "Willkommen im P5connect Portal. Bitte melden Sie sich mit Ihrer Login-Nr und Ihrem Passwort an.",
    loginNr: "Login-Nr",
    loginNrPlaceholder: "z. B. 2612400162",
    password: "Passwort",
    passwordPlaceholder: "Passwort eingeben",
    submit: "Login",
    securityNote: "Ihre Anmeldung erfolgt verschlüsselt und sicher.",
    footerLine1: "© {year} P5connect. Alle Rechte vorbehalten.",
    footerLine2: "Sony Partnerprogramm Schweiz",
    legalImprint: "Impressum",
    legalPrivacy: "Datenschutz",
    forgotPassword: "Passwort vergessen?",
    error: {
      unknownLogin: "Unbekannte Login-Nr.",
      failed: "Login fehlgeschlagen.",
      noEmail: "Für diesen Benutzer ist keine E-Mail hinterlegt.",
      invalidCredentials: "Ungültige Login-Daten.",
    },
  },

  password: {
    pageTitle: "🔒 Passwort ändern",
    pageDescription:
      "Ändere hier dein Passwort für deinen aktuell eingeloggten Zugang.",
    securityTitle: "Sicherheitsdaten",
    securityDescription:
      "Nach der Änderung wirst du automatisch abgemeldet und musst dich mit dem neuen Passwort erneut einloggen.",
    notesTitle: "Hinweise",
    noteMinLength: "Verwende mindestens 8 Zeichen.",
    noteLoggedInOnly:
      "Diese Seite ist nur für eingeloggte Benutzer gedacht.",
    noteForgotPassword:
      "Falls du dein Passwort vergessen hast, nutze bitte auf der Login-Seite die Funktion „Passwort vergessen“.",
    newPassword: "Neues Passwort",
    confirmPassword: "Passwort bestätigen",
    submit: "Passwort ändern",
    submitting: "⏳ Passwort wird geändert...",
    successChanged:
      "Passwort erfolgreich geändert. Du wirst neu angemeldet...",
    notLoggedIn: "Du bist nicht eingeloggt.",
    errorMismatch: "Die Passwörter stimmen nicht überein.",
    errorMinLength: "Das Passwort muss mindestens 8 Zeichen lang sein.",
  },

  reset: {
    title: "Neues Passwort setzen",
    loading: "Link wird geprüft...",
    newPassword: "Neues Passwort",
    confirm: "Passwort bestätigen",
    submit: "Passwort ändern",
    requestNew: "Neuen Reset-Link anfordern",
    invalidLink: "Reset-Link ist ungültig.",
    expired: "Der Reset-Link ist abgelaufen oder ungültig.",
    mismatch: "Die Passwörter stimmen nicht überein.",
    short: "Das Passwort muss mindestens 8 Zeichen lang sein.",
    success: "Passwort erfolgreich gesetzt.",
    requestTitle: "Passwort zurücksetzen",
    requestDesc:
      "Bitte geben Sie Ihre Login-Nr ein. Sie erhalten eine E-Mail zum Zurücksetzen des Passworts.",
    mailSent:
      "Falls der Benutzer existiert, wurde eine E-Mail zum Zurücksetzen gesendet.",
    send: "Reset-Mail senden",
    backToLogin: "Zurück zum Login",
  },

  navigation: {
    changePassword: "Passwort ändern",
  },

  common: {
    save: "Speichern",
    cancel: "Abbrechen",
    show: "Anzeigen",
    hide: "Verbergen",
  },
} as const;
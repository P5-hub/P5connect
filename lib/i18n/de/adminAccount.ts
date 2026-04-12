export const adminAccount = {
  button: "🔐 Login / Passwort",
  modalTitle: "Login / Passwort ändern",
  currentLogin: "Aktueller Login / LoginNr *",
  currentLoginPlaceholder: "z.B. VAdminP5 oder Händler-LoginNr",
  newLogin: "Neuer Login (optional)",
  newLoginPlaceholder: "Leer lassen, wenn Login gleich bleiben soll",
  newLoginHint: "Erlaubt: Buchstaben, Zahlen, „-“, „_“.",
  newPassword: "Neues Passwort *",
  newPasswordPlaceholder: "Mindestens 6 Zeichen",
  generatePassword: "Zufallspasswort erzeugen",
  passwordGenerated: "Zufallspasswort generiert.",
  passwordGeneratedCopied: "Zufallspasswort generiert und kopiert.",
  loginRequired: "Login / LoginNr ist erforderlich.",
  passwordMinLength: "Das neue Passwort muss mindestens 6 Zeichen haben.",
  invalidLoginFormat:
    "Neuer Login darf nur Buchstaben, Zahlen, '-' und '_' enthalten.",
  updateFailed: "Unbekannter Fehler bei der Aktualisierung.",
  requestFailed: "Fehler beim Senden der Anfrage.",
  successDefault: "Zugang erfolgreich aktualisiert.",
  successLogin: "Login erfolgreich aktualisiert.",
  successPassword: "Passwort erfolgreich aktualisiert.",
  successLoginAndPassword: "Login und Passwort erfolgreich aktualisiert.",
  reloginNow: "Du wirst jetzt neu angemeldet...",
  logoutRunning: "Abmeldung läuft...",
  confirmTitle: "Änderung bestätigen",
  confirmLoginChange:
    'Sie ändern den Login von "{old}" auf "{new}". Fortfahren?',
  confirmPasswordChange:
    "Sie setzen ein neues Passwort. Fortfahren?",
  confirmLoginAndPasswordChange:
    'Sie ändern den Login von "{old}" auf "{new}" und setzen zusätzlich ein neues Passwort. Fortfahren?',
} as const;
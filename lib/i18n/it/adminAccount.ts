export const adminAccount = {
  button: "🔐 Login / Password",
  modalTitle: "Modifica login / password",
  currentLogin: "Login attuale / N. login *",
  currentLoginPlaceholder: "es. VAdminP5 o n. login rivenditore",
  newLogin: "Nuovo login (opzionale)",
  newLoginPlaceholder: "Lascia vuoto se il login deve restare invariato",
  newLoginHint: "Consentiti: lettere, numeri, “-”, “_”.",
  newPassword: "Nuova password *",
  newPasswordPlaceholder: "Almeno 6 caratteri",
  generatePassword: "Genera password casuale",
  passwordGenerated: "Password casuale generata.",
  passwordGeneratedCopied: "Password casuale generata e copiata.",
  loginRequired: "Login / n. login obbligatorio.",
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
  reloginNow: "Verrai ora autenticato di nuovo...",
  logoutRunning: "Logout in corso...",
  confirmTitle: "Conferma modifica",
  confirmLoginChange:
    'Stai modificando il login da "{old}" a "{new}". Continuare?',
  confirmPasswordChange:
    "Stai impostando una nuova password. Continuare?",
  confirmLoginAndPasswordChange:
    'Stai modificando il login da "{old}" a "{new}" e impostando anche una nuova password. Continuare?',
} as const;
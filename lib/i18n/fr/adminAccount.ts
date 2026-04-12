export const adminAccount = {
  button: "🔐 Login / Mot de passe",
  modalTitle: "Modifier login / mot de passe",
  currentLogin: "Login actuel / N° de login *",
  currentLoginPlaceholder: "p. ex. VAdminP5 ou n° de login revendeur",
  newLogin: "Nouveau login (optionnel)",
  newLoginPlaceholder: "Laisser vide si le login doit rester inchangé",
  newLoginHint: "Autorisé : lettres, chiffres, « - », « _ ».",
  newPassword: "Nouveau mot de passe *",
  newPasswordPlaceholder: "Au moins 6 caractères",
  generatePassword: "Générer un mot de passe aléatoire",
  passwordGenerated: "Mot de passe aléatoire généré.",
  passwordGeneratedCopied: "Mot de passe aléatoire généré et copié.",
  loginRequired: "Le login / n° de login est requis.",
  passwordMinLength:
    "Le nouveau mot de passe doit comporter au moins 6 caractères.",
  invalidLoginFormat:
    "Le nouveau login ne peut contenir que des lettres, chiffres, '-' et '_'.",
  updateFailed: "Erreur inconnue lors de la mise à jour.",
  requestFailed: "Erreur lors de l’envoi de la requête.",
  successDefault: "Accès mis à jour avec succès.",
  successLogin: "Login mis à jour avec succès.",
  successPassword: "Mot de passe mis à jour avec succès.",
  successLoginAndPassword:
    "Login et mot de passe mis à jour avec succès.",
  reloginNow: "Vous allez maintenant être reconnecté...",
  logoutRunning: "Déconnexion en cours...",
  confirmTitle: "Confirmer la modification",
  confirmLoginChange:
    'Vous modifiez le login de "{old}" à "{new}". Continuer ?',
  confirmPasswordChange:
    "Vous définissez un nouveau mot de passe. Continuer ?",
  confirmLoginAndPasswordChange:
    'Vous modifiez le login de "{old}" à "{new}" et définissez également un nouveau mot de passe. Continuer ?',
} as const;
export const auth = {
  login: {
    portalTitle: "Portail partenaire P5",
    portalDesc:
      "Bienvenue sur le portail P5connect. Veuillez vous connecter avec votre numéro de login et votre mot de passe.",
    loginNr: "N° de login",
    loginNrPlaceholder: "p. ex. 2612400162",
    password: "Mot de passe",
    passwordPlaceholder: "Saisir le mot de passe",
    submit: "Connexion",
    securityNote: "Votre connexion est chiffrée et sécurisée.",
    footerLine1: "© {year} P5connect. Tous droits réservés.",
    footerLine2: "Programme partenaires Sony Suisse",
    legalImprint: "Mentions légales",
    legalPrivacy: "Protection des données",
    forgotPassword: "Mot de passe oublié ?",
    error: {
      unknownLogin: "Numéro de login inconnu.",
      failed: "Échec de la connexion.",
      noEmail: "Aucune adresse e-mail n’est enregistrée pour cet utilisateur.",
      invalidCredentials: "Données de connexion invalides.",
    },
  },

  password: {
    pageTitle: "🔒 Modifier le mot de passe",
    pageDescription:
      "Modifiez ici le mot de passe de votre accès actuellement connecté.",
    securityTitle: "Données de sécurité",
    securityDescription:
      "Après la modification, vous serez automatiquement déconnecté et devrez vous reconnecter avec le nouveau mot de passe.",
    notesTitle: "Remarques",
    noteMinLength: "Utilisez au moins 8 caractères.",
    noteLoggedInOnly:
      "Cette page est uniquement destinée aux utilisateurs connectés.",
    noteForgotPassword:
      "Si vous avez oublié votre mot de passe, utilisez la fonction « Mot de passe oublié » sur la page de connexion.",
    newPassword: "Nouveau mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    submit: "Modifier le mot de passe",
    submitting: "⏳ Modification du mot de passe...",
    successChanged:
      "Mot de passe modifié avec succès. Vous allez être reconnecté...",
    notLoggedIn: "Vous n’êtes pas connecté.",
    errorMismatch: "Les mots de passe ne correspondent pas.",
    errorMinLength:
      "Le mot de passe doit contenir au moins 8 caractères.",
  },

  reset: {
    title: "Définir un nouveau mot de passe",
    loading: "Vérification du lien...",
    newPassword: "Nouveau mot de passe",
    confirm: "Confirmer le mot de passe",
    submit: "Modifier le mot de passe",
    requestNew: "Demander un nouveau lien de réinitialisation",
    invalidLink: "Le lien de réinitialisation est invalide.",
    expired: "Le lien de réinitialisation a expiré ou n’est pas valide.",
    mismatch: "Les mots de passe ne correspondent pas.",
    short: "Le mot de passe doit contenir au moins 8 caractères.",
    success: "Mot de passe défini avec succès.",
    requestTitle: "Réinitialiser le mot de passe",
    requestDesc:
      "Veuillez saisir votre numéro de login. Vous recevrez un e-mail pour réinitialiser votre mot de passe.",
    mailSent:
      "Si l’utilisateur existe, un e-mail de réinitialisation a été envoyé.",
    send: "Envoyer l’e-mail de réinitialisation",
    backToLogin: "Retour à la connexion",
  },

  navigation: {
    changePassword: "Modifier le mot de passe",
  },

  common: {
    save: "Enregistrer",
    cancel: "Annuler",
    show: "Afficher",
    hide: "Masquer",
  },
} as const;
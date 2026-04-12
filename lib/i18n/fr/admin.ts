export const admin = {
  promotions: "Promotions",
  instantDiscount: "Remise immédiate",
  projects: "Projets",
  orders: "Commandes",
  support: "Support",
  monthlyOffers: "Actions mensuelles",
  reports: "Rapports",
  info: "Infos",
  actAsDealer: "Agir comme revendeur",

  common: {
    logout: "Déconnexion",
    language: "Langue",
    navigation: "Navigation",
    adminMenu: "Menu admin",
    open: "Ouvrir",
    close: "Fermer",
    save: "Enregistrer",
    cancel: "Annuler",
    loading: "Enregistrement...",
    myLogin: "Mon login",
    show: "Afficher",
    hide: "Masquer",
    searchDealer: "Rechercher un revendeur...",
    pendingItems: "Points ouverts",
  },

  account: {
    button: "🔐 Login / Mot de passe",
    modalTitle: "Modifier le login / mot de passe",
    currentLogin: "Login actuel / n° de login *",
    currentLoginPlaceholder: "p. ex. VAdminP5 ou n° de login revendeur",
    newLogin: "Nouveau login (optionnel)",
    newLoginPlaceholder: "Laisser vide si le login doit rester identique",
    newLoginHint: 'Autorisé : lettres, chiffres, "-" et "_".',
    newPassword: "Nouveau mot de passe *",
    newPasswordPlaceholder: "Au moins 6 caractères",
    generatePassword: "Générer un mot de passe aléatoire",
    passwordGenerated: "Mot de passe aléatoire généré.",
    passwordGeneratedCopied: "Mot de passe aléatoire généré et copié.",
    loginRequired: "Le login / n° de login est requis.",
    passwordMinLength:
      "Le nouveau mot de passe doit contenir au moins 6 caractères.",
    invalidLoginFormat:
      "Le nouveau login ne peut contenir que des lettres, des chiffres, '-' et '_'.",
    updateFailed: "Erreur inconnue lors de la mise à jour.",
    requestFailed: "Erreur lors de l’envoi de la demande.",
    successDefault: "Accès mis à jour avec succès.",
    successLogin: "Login mis à jour avec succès.",
    successPassword: "Mot de passe mis à jour avec succès.",
    successLoginAndPassword:
      "Login et mot de passe mis à jour avec succès.",
    reloginNow: "Vous allez être reconnecté maintenant...",
    logoutRunning: "Déconnexion en cours...",
    confirmTitle: "Confirmer la modification",
    confirmLoginChange:
      'Vous modifiez le login de "{old}" vers "{new}". Continuer ?',
    confirmPasswordChange:
      "Vous définissez un nouveau mot de passe. Continuer ?",
    confirmLoginAndPasswordChange:
      'Vous modifiez le login de "{old}" vers "{new}" et définissez aussi un nouveau mot de passe. Continuer ?',
  },

  users: {
    title: "Gestion des utilisateurs",
    updateExisting: "Mettre à jour un utilisateur existant",
    createNew: "Créer un nouvel utilisateur",
    oldLogin: "Ancien login (login_nr)",
    newLogin: "Nouveau login (login_nr)",
    newPasswordOptional: "Nouveau mot de passe (optionnel)",
    updateButton: "Mettre à jour l’utilisateur",
    updating: "Mise à jour...",
    signingOut: "Déconnexion...",
    createButton: "Créer l’utilisateur",
    creating: "Création...",
    loginNr: "N° de login (login_nr)",
    email: "E-mail",
    password: "Mot de passe",
    name: "Nom",
    optional: "optionnel",
    role: "Rôle",
    dealer: "Revendeur",
    admin: "Admin",
    ownAccessChanged:
      "Votre propre accès a été modifié. Vous allez maintenant être déconnecté...",
    loginChangedSuccess: "Login mis à jour avec succès.",
    passwordChangedSuccess: "Mot de passe mis à jour avec succès.",
    loginAndPasswordChangedSuccess:
      "Login et mot de passe ont été mis à jour avec succès.",
    userUpdatedSuccess: "Utilisateur mis à jour avec succès.",
    userCreatedSuccess: "Utilisateur créé avec succès.",
    updateError: "Erreur lors de la mise à jour.",
    createError: "Erreur lors de la création.",
  },
  aktionen: {
    description:
      "Vue d’ensemble de toutes les promotions actives ou expirées. Vous pouvez modifier le statut ou activer/désactiver les actions.",
  },
  bestellungen: {
    searchPlaceholder:
      "Rechercher commande (revendeur, e-mail, #ID, campagne)…",
    open: "Ouvert",
    approved: "Confirmé",
    rejected: "Refusé",
    all: "Tous",
    reload: "Recharger",
    type: "Type",
    allTypes: "Tous les types",
    onlyMesse: "Uniquement salon",
    onlyDisplay: "Uniquement display",
    onlyStandard: "Uniquement standard",
    loading: "Chargement des commandes…",
    empty: "Aucune commande trouvée.",
    unknownDealer: "Revendeur inconnu",
    fromProject: "depuis projet",
    pos: "positions",
    statusApproved: "Confirmé",
    statusRejected: "Refusé",
    statusPending: "Ouvert",
    messeOrder: "Commande salon",
  },
  adminProject: {
    detail: {
      title: "Demande de projet",
      loading: {
        data: "Chargement des données…",
      },
      sections: {
        dealer: "Revendeur",
        projectInfo: "Informations du projet",
        comment: "Commentaire",
        projectFiles: "Documents du projet",
        projectHistory: "Historique du projet",
      },
      labels: {
        untitled: "(sans titre)",
        customerNumber: "N° client",
        projectNumber: "N° projet",
        type: "Type",
        customer: "Client",
        location: "Lieu",
        period: "Période",
        status: "Statut :",
        unknownProduct: "Produit",
        created: "créé",
      },
      table: {
        product: "Produit",
        quantity: "Quantité",
        counterOffer: "Montant / contre-offre",
        total: "Total",
      },
      actions: {
        back: "Retour",
        upload: "Téléverser",
        uploading: "Téléversement…",
        view: "Afficher",
      },
      status: {
        approved: "✅ Approuvé",
        rejected: "❌ Refusé",
        pending: "⏳ En attente",
      },
      empty: {
        noFiles: "Aucun fichier disponible.",
      },
      success: {
        fileUploaded: "Fichier téléversé avec succès.",
        counterOfferSavedApproved: "Contre-offre enregistrée et projet approuvé.",
        projectApproved: "Projet approuvé.",
        projectRejected: "Projet refusé.",
        projectReset: "Projet réinitialisé.",
      },
      errors: {
        requestLoadFailed: "Impossible de charger la demande de projet.",
        requestNotFound: "Demande de projet introuvable.",
        projectLoadFailed: "Impossible de charger le projet.",
        projectNotFound: "Projet introuvable.",
        productsLoadFailed: "Impossible de charger les produits.",
        loadGeneric: "Erreur lors du chargement des données du projet.",
        fileOpenFailed: "Impossible d’ouvrir le fichier.",
        uploadFailed: "Échec du téléversement.",
        fileDbSaveFailed: "Fichier téléversé mais non enregistré en base.",
        priceSaveFailed: "Le prix pour {product} n’a pas pu être enregistré.",
        statusUpdateFailed: "Impossible de mettre à jour le statut.",
        actionFailed: "Impossible d’exécuter l’action.",
        noRecord: "Aucune donnée trouvée.",
      },
    },
  },
  adminPromotions: {
    page: {
      title: "Gérer les promotions",
      description:
        "Vous pouvez ici créer des promotions, des campagnes salon et des actions mensuelles pour le frontend.",
    },

    sections: {
      masterData: "1. Données de base",
      products: "2. Produits",
      dealerTargets: "3. Objectifs revendeurs (optionnel)",
      bonusTiers: "4. Niveaux de bonus (optionnel)",
      existingCampaigns: "Promotions / campagnes existantes",
    },

    fields: {
      code: "Code",
      name: "Nom",
      type: "Type",
      active: "Actif",
      allowDisplay: "Display autorisé",
      startDate: "Date de début",
      endDate: "Date de fin",
      description: "Description",
      dealer: "Revendeur",
      targetValue: "Valeur cible",
      unit: "Unité",
      currentValue: "Valeur actuelle",
      dealerOptional: "Revendeur optionnel",
      tierLevel: "Niveau",
      threshold: "Seuil",
      bonusType: "Type de bonus",
      bonusValue: "Valeur du bonus",
      label: "Libellé",
    },

    placeholders: {
      code: "p. ex. PROMO-TV-2026",
      name: "p. ex. Promotion de printemps",
      description: "Description / conditions",
      search: "Recherche par nom, code, type, date...",
    },

    actions: {
      reset: "Réinitialiser",
      save: "Enregistrer la promotion",
      saving: "Enregistrement...",
      addTarget: "Ajouter un objectif",
      addBonusTier: "Ajouter un niveau de bonus",
      reload: "Recharger",
      activate: "Activer",
      deactivate: "Désactiver",
      edit: "Modifier",
      duplicate: "Dupliquer",
      delete: "Supprimer",
    },

    select: {
      pleaseChoose: "Veuillez choisir...",
    },

    filters: {
      allTypes: "Tous les types",
      allStatuses: "Tous les statuts",
      active: "Actif",
      inactive: "Inactif",
    },

    types: {
      promotion: "promotion",
      messe: "salon",
      monatsaktion: "action mensuelle",
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
      active: "Actif",
      inactive: "Inactif",
    },

    labels: {
      noCode: "Aucun code",
      yes: "oui",
      no: "non",
      to: "à",
      displayOrders: "Commandes display",
      global: "Global",
      copy: "Copie",
    },

    loading: {
      campaigns: "Chargement des campagnes…",
    },

    empty: {
      noDealerTargets: "Aucun objectif revendeur défini.",
      noBonusTiers: "Aucun niveau de bonus défini.",
      noCampaigns: "Aucune campagne trouvée.",
    },

    validation: {
      nameRequired: "Veuillez saisir un nom de campagne.",
      startDateRequired: "Veuillez choisir une date de début.",
      endDateRequired: "Veuillez choisir une date de fin.",
      endBeforeStart: "La date de fin ne peut pas être antérieure à la date de début.",
      productRequired: "Veuillez ajouter au moins un produit.",
      duplicateProduct: "Un produit a été sélectionné plusieurs fois.",
      targetDealerMissing: "Un revendeur manque dans les objectifs revendeurs.",
      targetValueInvalid: "Une valeur cible valide manque dans les objectifs revendeurs.",
      targetDealerDuplicate: "Un revendeur a été utilisé plusieurs fois dans les objectifs.",
      tierLevelMissing: "Un niveau manque dans les bonus tiers.",
      thresholdInvalid: "Une valeur de seuil valide manque dans les bonus tiers.",
      bonusValueInvalid: "Une valeur de bonus valide manque dans les bonus tiers.",
      duplicateTier: "Le niveau existe plusieurs fois.",
    },

    messages: {
      loadError: "Les données n'ont pas pu être chargées.",
      saveSuccess: "Promotion / campagne enregistrée avec succès.",
      saveError: "La campagne n'a pas pu être enregistrée.",
      activated: "Campagne activée.",
      deactivated: "Campagne désactivée.",
      statusChangeError: "Le statut n'a pas pu être modifié.",
      duplicateSuccess: "Campagne dupliquée avec succès.",
      duplicateError: "La campagne n'a pas pu être dupliquée.",
      deleteSuccess: "Campagne supprimée avec succès.",
      deleteError: "La campagne n'a pas pu être supprimée.",
      confirmDelete: 'Voulez-vous vraiment supprimer la campagne "{name}" ?',
    },
  },
  adminPromotionDetail: {
    page: {
      title: "Modifier la promotion",
      subtitle: "Modifier et enregistrer la campagne #{id}.",
      invalidId: "ID de campagne invalide.",
    },

    actions: {
      back: "Retour",
      reload: "Recharger",
      save: "Enregistrer les modifications",
      saving: "Enregistrement...",
      addTarget: "Ajouter un objectif",
      addBonusTier: "Ajouter un niveau bonus",
    },

    sections: {
      masterData: "1. Données de base",
      products: "2. Produits",
      dealerTargets: "3. Objectifs revendeurs (optionnel)",
      bonusTiers: "4. Niveaux bonus (optionnel)",
    },

    fields: {
      code: "Code",
      name: "Nom",
      type: "Type",
      active: "Actif",
      allowDisplay: "Display autorisé",
      startDate: "Date de début",
      endDate: "Date de fin",
      description: "Description",
      dealer: "Revendeur",
      targetValue: "Valeur cible",
      unit: "Unité",
      currentValue: "Valeur actuelle",
      dealerOptional: "Revendeur optionnel",
      tierLevel: "Niveau",
      threshold: "Seuil",
      bonusType: "Type de bonus",
      bonusValue: "Valeur du bonus",
      label: "Libellé",
    },

    placeholders: {
      code: "p. ex. PROMO-TV-2026",
      name: "p. ex. Promotion printemps",
      description: "Description / conditions",
    },

    select: {
      pleaseChoose: "Veuillez choisir...",
      global: "Global",
    },

    empty: {
      noDealerTargets: "Aucun objectif revendeur défini.",
      noBonusTiers: "Aucun niveau bonus défini.",
    },

    loading: {
      campaign: "Chargement de la campagne…",
    },

    validation: {
      nameRequired: "Veuillez saisir un nom de campagne.",
      startDateRequired: "Veuillez choisir une date de début.",
      endDateRequired: "Veuillez choisir une date de fin.",
      endBeforeStart: "La date de fin ne peut pas être avant la date de début.",
      productRequired: "Veuillez ajouter au moins un produit.",
      duplicateProduct: "Un produit a été sélectionné plusieurs fois.",
      targetDealerMissing: "Revendeur manquant.",
      targetValueInvalid: "Valeur cible invalide.",
      targetDealerDuplicate: "Revendeur utilisé plusieurs fois.",
      tierLevelMissing: "Niveau manquant.",
      thresholdInvalid: "Valeur seuil invalide.",
      bonusValueInvalid: "Valeur bonus invalide.",
      duplicateTier: "Niveau dupliqué.",
    },

    messages: {
      loadError: "La campagne n'a pas pu être chargée.",
      saveSuccess: "Promotion / campagne mise à jour.",
      saveError: "La campagne n'a pas pu être enregistrée.",
    },
  },
  adminReports: {
    title: "Export de données & Rapports",

    fields: {
      type: "Type",
      from: "De",
      to: "À",
    },

    placeholders: {
      search: "Rechercher produit ou revendeur…",
    },

    actions: {
      exportExcel: "Exporter (Excel)",
      exportRunning: "Export en cours…",
      reset: "Réinitialiser",
    },

    types: {
      bestellung: "Commandes",
      verkauf: "Ventes",
      projekt: "Projets",
      support: "Support",
    },

    labels: {
      lastExport: "Dernier export",
      hint: "Remarque",
      hintText:
        "Affichage, KPI et export Excel utilisent exactement les mêmes filtres.",
    },

    messages: {
      exportError: "Échec de l’export",
    },
  },
} as const;
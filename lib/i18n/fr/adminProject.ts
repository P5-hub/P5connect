export const adminProject = {
  detail: {
    title: "Demande de projet",
    loading: {
      data: "Chargement des données…",
    },
    sections: {
      dealer: "Revendeur",
      projectInfo: "Informations sur le projet",
      comment: "Commentaire",
      projectFiles: "Pièces justificatives du projet",
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
      upload: "Upload",
      uploading: "Chargement…",
      view: "Afficher",
    },
    status: {
      approved: "✅ Approuvé",
      rejected: "❌ Refusé",
      pending: "⏳ Ouvert",
    },
    empty: {
      noFiles: "Aucun fichier disponible.",
    },
    success: {
      fileUploaded: "Fichier téléchargé avec succès.",
      counterOfferSavedApproved:
        "Contre-offre enregistrée et projet approuvé.",
      projectApproved: "Projet approuvé.",
      projectRejected: "Projet refusé.",
      projectReset: "Projet réinitialisé.",
    },
    errors: {
      requestLoadFailed: "La demande de projet n’a pas pu être chargée.",
      requestNotFound: "Demande de projet introuvable.",
      projectLoadFailed: "Le projet n’a pas pu être chargé.",
      projectNotFound: "Projet introuvable.",
      productsLoadFailed: "Les produits n’ont pas pu être chargés.",
      loadGeneric: "Erreur lors du chargement des données du projet.",
      fileOpenFailed: "Le fichier n’a pas pu être ouvert.",
      uploadFailed: "Échec de l’upload.",
      fileDbSaveFailed:
        "Le fichier a été téléchargé, mais pas enregistré dans la base de données.",
      priceSaveFailed:
        "Le prix pour {product} n’a pas pu être enregistré.",
      statusUpdateFailed: "Le statut n’a pas pu être mis à jour.",
      actionFailed: "L’action n’a pas pu être exécutée.",
      noRecord: "Aucun enregistrement trouvé.",
    },
  },
} as const;
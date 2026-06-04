export const sales = {
  page: {
    title: "Saisir les données de vente",
    heading: "Saisir les données de vente",
    manualTitle: "Saisie manuelle",
    uploadTitle: "Import CSV / Excel",
    manual: "Saisie manuelle",
    upload: "Import CSV / Excel",
    uploadTemplate: "Modèle CSV",
    template: "Modèle CSV",
    next: "Continuer",
    back: "Retour",
    clearCsv: "Vider le CSV",
    modalTitle: "Saisir les données de vente",
    quantity: "Quantité",
    priceOptional: "Prix (optionnel)",
    date: "Date",
    inhouseShare: "Part inhouse (%)",
    calendarWeek: "Semaine calendrier",
    noteForAllProducts:
      "S’applique automatiquement à tous les produits de cette annonce.",
    noteForUpload:
      "S’applique automatiquement à toutes les lignes de l’import.",
    totalQuantity: "Quantité totale",
    totalRevenue: "Chiffre d’affaires total",
    reportSale: "Déclarer une vente",
    submit: "Saisir les données de vente",
    submitSingle: "Déclarer une vente",
    saving: "Enregistrement…",
    saved: "Données de vente enregistrées",
    success: "Données de vente transmises avec succès",
    saveError: "Erreur lors de l’enregistrement",
    submitError: "Erreur lors de la transmission",
    serverError: "Erreur serveur",
    fileReadError: "Erreur lors de la lecture du fichier",
  },

  loading: {
    dealer: "⏳ Chargement du revendeur…",
    dealerData: "⏳ Chargement des données du revendeur…",
  },

  errors: {
    dealerNotFound: "Revendeur introuvable",
    dealerLoadFailed: "Le revendeur n’a pas pu être chargé.",
    noDealer: "Aucun revendeur trouvé.",
    emptyCart: "Aucun produit dans le panier.",
    confirmSonyShare:
      "Veuillez confirmer la part SONY pour les unités et le chiffre d’affaires.",
  },

  card: {
    unknownModel: "Modèle inconnu",
    ean: "EAN",
    quantity: "Quantité",
    stock: "Stock",
    price: "Prix (CHF)",
    serialNumber: "N° de série",
    serialPlaceholder: "SN...",
    added: "✅ Ajouté",
    report: "📊 Déclarer",
  },

  choose: {
    manual: "Saisie manuelle",
    upload: "Import CSV / Excel",
  },

  upload: {
    fileTable: {
      ean: "EAN",
      product: "Produit",
      quantity: "Quantité",
      stockQuantity: "Stock",
      price: "Prix",
      date: "Date",
      stockDate: "Date du stock",
    },

    calendarWeek: "Semaine calendrier",
    sonyShareQty: "Part SONY unités (%)",
    sonyShareRevenue: "Part SONY chiffre d’affaires (%)",
    sonyQty: "Unités Sony",
    totalQty: "Quantité totale du revendeur",
    sonyRevenue: "Chiffre d’affaires Sony",
    totalRevenue: "Chiffre d’affaires total du revendeur",
    reportedStock: "Stock déclaré",
    confirmSonyShare:
      "Je confirme que les parts SONY déclarées (unités & chiffre d’affaires) correspondent aux rapports de vente réels de cette semaine calendrier.",
  },

  cart: {
    title: "Saisir les données de vente",
    close: "Fermer",
    submit: "Déclarer une vente",
    saving: "Enregistrement…",
    sonyShareQty: "Part SONY unités (%)",
    sonyShareRevenue: "Part SONY chiffre d’affaires (%)",

    reportedProducts: "Produits déclarés",
    totalSale: "Total ventes",
    totalStock: "Total stock",

    item: {
      ean: "EAN",
      sale: "Vente",
      stock: "Stock",
      price: "Prix",
      serialNumber: "Numéro de série",
      stockDate: "Date du stock",
    },

    dealer: {
      customerNo: "N° client",
      contact: "Contact",
      phone: "Tél.",
      email: "E-mail",
      city: "Lieu",
      kam: "KAM",
    },
    placeholders: {
      price: "p. ex. 499",
    },
  },
} as const;
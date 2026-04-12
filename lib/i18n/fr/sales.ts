export const sales = {
    page: {
        title: "Déclarer les ventes",
        heading: "Déclarer les ventes",
        manualTitle: "Déclarer manuellement",
        uploadTitle: "Upload CSV / Excel",
        manual: "Déclarer manuellement",
        upload: "Upload CSV / Excel",
        uploadTemplate: "Modèle CSV",
        template: "Modèle CSV",
        next: "Suivant",
        back: "Retour",
        clearCsv: "Vider le CSV",
        modalTitle: "Déclarer les ventes",
        quantity: "Quantité",
        priceOptional: "Prix (optionnel)",
        date: "Date",
        inhouseShare: "Part interne (%)",
        calendarWeek: "Semaine calendrier",
        noteForAllProducts:
        "S’applique automatiquement à tous les produits de cette déclaration.",
        noteForUpload:
        "S’applique automatiquement à toutes les lignes du fichier uploadé.",
        totalQuantity: "Quantité totale",
        totalRevenue: "Chiffre d’affaires total",
        reportSale: "Déclarer la vente",
        submit: "Envoyer les données de vente",
        submitSingle: "Déclarer la vente",
        saving: "Enregistrement…",
        saved: "Données de vente enregistrées",
        success: "Données de vente transmises avec succès",
        saveError: "Erreur lors de l’enregistrement",
        submitError: "Erreur lors de l’envoi",
        serverError: "Erreur du serveur",
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
        "Veuillez confirmer la part SONY en quantité et en chiffre d’affaires.",
    },

    card: {
        unknownModel: "Modèle inconnu",
        ean: "EAN",
        quantity: "Quantité",
        price: "Prix (CHF)",
        serialNumber: "N° de série",
        serialPlaceholder: "SN...",
        added: "✅ Ajouté",
        report: "📊 Déclarer",
    },

    choose: {
        manual: "Déclarer manuellement",
        upload: "Upload CSV / Excel",
    },

    upload: {
        fileTable: {
        ean: "EAN",
        product: "Produit",
        quantity: "Quantité",
        price: "Prix",
        date: "Date",
        },
        calendarWeek: "Semaine calendrier",
        sonyShareQty: "Part SONY quantité (%)",
        sonyShareRevenue: "Part SONY chiffre d’affaires (%)",
        sonyQty: "Quantité Sony",
        totalQty: "Quantité totale du revendeur",
        sonyRevenue: "Chiffre d’affaires Sony",
        totalRevenue: "Chiffre d’affaires total du revendeur",
        confirmSonyShare:
        "Je confirme que les parts SONY déclarées (quantité et chiffre d’affaires) correspondent aux ventes réelles de cette semaine calendrier.",
    },

    cart: {
        title: "Déclarer les ventes",
        close: "Fermer",
        submit: "Déclarer la vente",
        saving: "Enregistrement…",
        sonyShareQty: "Part SONY quantité (%)",
        sonyShareRevenue: "Part SONY chiffre d’affaires (%)",
        dealer: {
        customerNo: "N° client",
        contact: "Contact",
        phone: "Téléphone",
        email: "E-mail",
        city: "Localité",
        kam: "KAM",
        },
    },
} as const;  
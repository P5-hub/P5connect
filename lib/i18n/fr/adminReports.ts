export const adminReports = {
  title: "Export de données & rapports",

  fields: {
    type: "Type",
    from: "De",
    to: "À",
  },

  placeholders: {
    search: "Rechercher un produit ou un revendeur…",
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
      "L’affichage, les KPI et l’export Excel reposent exactement sur les mêmes filtres.",
  },

  messages: {
    exportError: "Échec de l’export",
  },
} as const;
export const adminReports = {
  title: "Export da novitads & rapports",

  fields: {
    type: "Tip",
    from: "Da",
    to: "Fin",
  },

  placeholders: {
    search: "Tschertgar product u commerziant…",
  },

  actions: {
    exportExcel: "Exportar (Excel)",
    exportRunning: "Export en lavur…",
    reset: "Reset",
  },

  types: {
    bestellung: "Cumondas",
    verkauf: "Venditas",
    projekt: "Projects",
    support: "Support",
  },

  labels: {
    lastExport: "Ultim export",
    hint: "Remartga",
    hintText:
      "Vista, KPIs ed export Excel sa basan exactamain sin ils medems filters.",
  },

  messages: {
    exportError: "Export betg reussì",
  },
} as const;
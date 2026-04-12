export const adminReports = {
  title: "Esportazione dati & report",

  fields: {
    type: "Tipo",
    from: "Da",
    to: "A",
  },

  placeholders: {
    search: "Cerca prodotto o rivenditore…",
  },

  actions: {
    exportExcel: "Esporta (Excel)",
    exportRunning: "Esportazione in corso…",
    reset: "Reset",
  },

  types: {
    bestellung: "Ordini",
    verkauf: "Vendite",
    projekt: "Progetti",
    support: "Supporto",
  },

  labels: {
    lastExport: "Ultima esportazione",
    hint: "Nota",
    hintText:
      "Vista, KPI ed esportazione Excel si basano esattamente sugli stessi filtri.",
  },

  messages: {
    exportError: "Esportazione non riuscita",
  },
} as const;
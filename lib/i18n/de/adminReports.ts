export const adminReports = {
  title: "Datenexport & Berichte",

  fields: {
    type: "Typ",
    from: "Von",
    to: "Bis",
  },

  placeholders: {
    search: "Produkt oder Händler suchen…",
  },

  actions: {
    exportExcel: "Exportieren (Excel)",
    exportRunning: "Export läuft…",
    reset: "Reset",
  },

  types: {
    bestellung: "Bestellungen",
    verkauf: "Verkäufe",
    projekt: "Projekte",
    support: "Support",
  },

  labels: {
    lastExport: "Letzter Export",
    hint: "Hinweis",
    hintText:
      "Anzeige, KPIs und Excel-Export basieren auf exakt denselben Filtern.",
  },

  messages: {
    exportError: "Export fehlgeschlagen",
  },
} as const;
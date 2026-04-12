export const adminReports = {
  title: "Data export & reports",

  fields: {
    type: "Type",
    from: "From",
    to: "To",
  },

  placeholders: {
    search: "Search product or dealer…",
  },

  actions: {
    exportExcel: "Export (Excel)",
    exportRunning: "Export running…",
    reset: "Reset",
  },

  types: {
    bestellung: "Orders",
    verkauf: "Sales",
    projekt: "Projects",
    support: "Support",
  },

  labels: {
    lastExport: "Last export",
    hint: "Hint",
    hintText:
      "Display, KPIs and Excel export are based on exactly the same filters.",
  },

  messages: {
    exportError: "Export failed",
  },
} as const;
export const adminDashboardList = {
  searchPlaceholder: "Search by dealer, email or ID…",
  loading: "Loading {type} entries…",
  empty: "No matching entries found.",
  reload: "Reload",
  status: {
    pending: "Open",
    approved: "Approved",
    rejected: "Rejected",
    all: "All",
  },
  supportTypes: {
    all: "All support types",
    sellout: "Sell-Out",
    marketing: "Marketing",
    event: "Event",
    other: "Other",
    unknown: "Unknown",
  },
  supportKind: {
    sellout: "Sell-Out",
    marketing: "Marketing",
    event: "Event",
    other: "Other",
    unknown: "Unknown",
  },
  labels: {
    unknown: "Unknown",
    status: "Status",
    document: "📎 Document",
  },
  types: {
    projekt: "Project",
    bestellung: "Order",
    support: "Support",
    aktion: "Campaign",
    sofortrabatt: "Instant discount",
  },
} as const;
export const adminPromotions = {
  page: {
    title: "Manage promotions",
    description:
      "Here you can create promotions, trade fair campaigns and monthly offers for the frontend.",
  },

  sections: {
    masterData: "1. Master data",
    products: "2. Products",
    dealerTargets: "3. Dealer targets (optional)",
    bonusTiers: "4. Bonus tiers (optional)",
    existingCampaigns: "Existing promotions / campaigns",
  },

  fields: {
    code: "Code",
    name: "Name",
    type: "Type",
    active: "Active",
    allowDisplay: "Display allowed",
    startDate: "Start date",
    endDate: "End date",
    description: "Description",
    dealer: "Dealer",
    targetValue: "Target value",
    unit: "Unit",
    currentValue: "Current value",
    dealerOptional: "Dealer optional",
    tierLevel: "Tier level",
    threshold: "Threshold",
    bonusType: "Bonus type",
    bonusValue: "Bonus value",
    label: "Label",
  },

  placeholders: {
    code: "e.g. PROMO-TV-2026",
    name: "e.g. Spring promotion",
    description: "Description / conditions",
    search: "Search by name, code, type, date...",
  },

  actions: {
    reset: "Reset",
    save: "Save promotion",
    saving: "Saving...",
    addTarget: "Add target",
    addBonusTier: "Add bonus tier",
    reload: "Reload",
    activate: "Activate",
    deactivate: "Deactivate",
    edit: "Edit",
    duplicate: "Duplicate",
    delete: "Delete",
  },

  select: {
    pleaseChoose: "Please choose...",
  },

  filters: {
    allTypes: "All types",
    allStatuses: "All statuses",
    active: "Active",
    inactive: "Inactive",
  },

  types: {
    promotion: "promotion",
    messe: "messe",
    monatsaktion: "monthly_offer",
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
    active: "Active",
    inactive: "Inactive",
  },

  labels: {
    noCode: "No code",
    yes: "yes",
    no: "no",
    to: "to",
    displayOrders: "Display orders",
    global: "Global",
    copy: "Copy",
  },

  loading: {
    campaigns: "Loading campaigns…",
  },

  empty: {
    noDealerTargets: "No dealer targets defined.",
    noBonusTiers: "No bonus tiers defined.",
    noCampaigns: "No campaigns found.",
  },

  validation: {
    nameRequired: "Please enter a campaign name.",
    startDateRequired: "Please choose a start date.",
    endDateRequired: "Please choose an end date.",
    endBeforeStart: "End date must not be before start date.",
    productRequired: "Please add at least one product.",
    duplicateProduct: "A product has been selected more than once.",
    targetDealerMissing: "A dealer is missing in dealer targets.",
    targetValueInvalid: "A valid target value is missing in dealer targets.",
    targetDealerDuplicate:
      "A dealer has been used more than once in target definitions.",
    tierLevelMissing: "Tier level is missing in bonus tiers.",
    thresholdInvalid: "A valid threshold value is missing in bonus tiers.",
    bonusValueInvalid: "A valid bonus value is missing in bonus tiers.",
    duplicateTier: "Tier level exists more than once.",
  },

  messages: {
    loadError: "Data could not be loaded.",
    saveSuccess: "Promotion / campaign saved successfully.",
    saveError: "The campaign could not be saved.",
    activated: "Campaign activated.",
    deactivated: "Campaign deactivated.",
    statusChangeError: "The status could not be changed.",
    duplicateSuccess: "Campaign duplicated successfully.",
    duplicateError: "Campaign could not be duplicated.",
    deleteSuccess: "Campaign deleted successfully.",
    deleteError: "Campaign could not be deleted.",
    confirmDelete:
      'Do you really want to delete the campaign "{name}"?',
  },
} as const;
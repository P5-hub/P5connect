export const adminPromotionDetail = {
  page: {
    title: "Edit promotion",
    subtitle: "Edit and save campaign #{id}.",
    invalidId: "Invalid campaign ID.",
  },

  actions: {
    back: "Back",
    reload: "Reload",
    save: "Save changes",
    saving: "Saving...",
    addTarget: "Add target",
    addBonusTier: "Add bonus tier",
  },

  sections: {
    masterData: "1. Master data",
    products: "2. Products",
    dealerTargets: "3. Dealer targets (optional)",
    bonusTiers: "4. Bonus tiers (optional)",
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
  },

  select: {
    pleaseChoose: "Please choose...",
    global: "Global",
  },

  empty: {
    noDealerTargets: "No dealer targets defined.",
    noBonusTiers: "No bonus tiers defined.",
  },

  loading: {
    campaign: "Loading campaign…",
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
    loadError: "Campaign could not be loaded.",
    saveSuccess: "Promotion / campaign updated successfully.",
    saveError: "The campaign could not be saved.",
  },
} as const;
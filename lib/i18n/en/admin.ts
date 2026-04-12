export const admin = {
  promotions: "Promotions",
  instantDiscount: "Instant discount",
  projects: "Projects",
  orders: "Orders",
  support: "Support",
  monthlyOffers: "Monthly offers",
  reports: "Reports",
  info: "Info",
  actAsDealer: "Act as dealer",

  common: {
    logout: "Log out",
    language: "Language",
    navigation: "Navigation",
    adminMenu: "Admin menu",
    open: "Open",
    close: "Close",
    save: "Save",
    cancel: "Cancel",
    loading: "Saving...",
    myLogin: "My login",
    show: "Show",
    hide: "Hide",
    searchDealer: "Search dealer...",
    pendingItems: "Open items",
  },

  account: {
    button: "🔐 Login / Password",
    modalTitle: "Change login / password",
    currentLogin: "Current login / login no. *",
    currentLoginPlaceholder: "e.g. VAdminP5 or dealer login no.",
    newLogin: "New login (optional)",
    newLoginPlaceholder: "Leave empty if the login should stay the same",
    newLoginHint: 'Allowed: letters, numbers, "-" and "_".',
    newPassword: "New password *",
    newPasswordPlaceholder: "At least 6 characters",
    generatePassword: "Generate random password",
    passwordGenerated: "Random password generated.",
    passwordGeneratedCopied: "Random password generated and copied.",
    loginRequired: "Login / login number is required.",
    passwordMinLength: "The new password must be at least 6 characters.",
    invalidLoginFormat:
      "New login may only contain letters, numbers, '-' and '_'.",
    updateFailed: "Unknown error while updating.",
    requestFailed: "Error while sending the request.",
    successDefault: "Access updated successfully.",
    successLogin: "Login updated successfully.",
    successPassword: "Password updated successfully.",
    successLoginAndPassword: "Login and password updated successfully.",
    reloginNow: "You are now being signed in again...",
    logoutRunning: "Signing out...",
    confirmTitle: "Confirm change",
    confirmLoginChange: 'You are changing the login from "{old}" to "{new}". Continue?',
    confirmPasswordChange: "You are setting a new password. Continue?",
    confirmLoginAndPasswordChange:
      'You are changing the login from "{old}" to "{new}" and also setting a new password. Continue?',
  },

  users: {
    title: "User management",
    updateExisting: "Update existing user",
    createNew: "Create new user",
    oldLogin: "Old login (login_nr)",
    newLogin: "New login (login_nr)",
    newPasswordOptional: "New password (optional)",
    updateButton: "Update user",
    updating: "Updating...",
    signingOut: "Signing out...",
    createButton: "Create user",
    creating: "Creating...",
    loginNr: "Login no. (login_nr)",
    email: "Email",
    password: "Password",
    name: "Name",
    optional: "optional",
    role: "Role",
    dealer: "Dealer",
    admin: "Admin",
    ownAccessChanged:
      "Your own account was changed. You are now being signed out...",
    loginChangedSuccess: "Login updated successfully.",
    passwordChangedSuccess: "Password updated successfully.",
    loginAndPasswordChangedSuccess:
      "Login and password were updated successfully.",
    userUpdatedSuccess: "User updated successfully.",
    userCreatedSuccess: "User created successfully.",
    updateError: "Error while updating.",
    createError: "Error while creating.",
  },
  aktionen: {
    description:
      "Overview of all active or expired promotions. You can change the status or activate/deactivate campaigns.",
  },
  bestellungen: {
    searchPlaceholder:
      "Search order (dealer, email, #ID, campaign)…",
    open: "Open",
    approved: "Approved",
    rejected: "Rejected",
    all: "All",
    reload: "Reload",
    type: "Type",
    allTypes: "All types",
    onlyMesse: "Trade fair only",
    onlyDisplay: "Display only",
    onlyStandard: "Standard only",
    loading: "Loading orders…",
    empty: "No orders found.",
    unknownDealer: "Unknown dealer",
    fromProject: "from project",
    pos: "items",
    statusApproved: "Approved",
    statusRejected: "Rejected",
    statusPending: "Open",
    messeOrder: "Trade fair order",
  },
  adminProject: {
    detail: {
      title: "Project request",
      loading: {
        data: "Loading data…",
      },
      sections: {
        dealer: "Dealer",
        projectInfo: "Project information",
        comment: "Comment",
        projectFiles: "Project documents",
        projectHistory: "Project history",
      },
      labels: {
        untitled: "(untitled)",
        customerNumber: "Customer no.",
        projectNumber: "Project no.",
        type: "Type",
        customer: "Customer",
        location: "Location",
        period: "Period",
        status: "Status:",
        unknownProduct: "Product",
        created: "created",
      },
      table: {
        product: "Product",
        quantity: "Quantity",
        counterOffer: "Amount / counter offer",
        total: "Total",
      },
      actions: {
        back: "Back",
        upload: "Upload",
        uploading: "Uploading…",
        view: "View",
      },
      status: {
        approved: "✅ Approved",
        rejected: "❌ Rejected",
        pending: "⏳ Pending",
      },
      empty: {
        noFiles: "No files available.",
      },
      success: {
        fileUploaded: "File uploaded successfully.",
        counterOfferSavedApproved: "Counter offer saved and project approved.",
        projectApproved: "Project approved.",
        projectRejected: "Project rejected.",
        projectReset: "Project reset.",
      },
      errors: {
        requestLoadFailed: "Project request could not be loaded.",
        requestNotFound: "Project request not found.",
        projectLoadFailed: "Project could not be loaded.",
        projectNotFound: "Project not found.",
        productsLoadFailed: "Products could not be loaded.",
        loadGeneric: "Error loading project data.",
        fileOpenFailed: "File could not be opened.",
        uploadFailed: "Upload failed.",
        fileDbSaveFailed: "File uploaded but not saved in database.",
        priceSaveFailed: "Price for {product} could not be saved.",
        statusUpdateFailed: "Status could not be updated.",
        actionFailed: "Action could not be executed.",
        noRecord: "No record found.",
      },
    },
  },
  adminPromotions: {
    page: {
      title: "Manage promotions",
      description:
        "Here you can create promotions, trade fair campaigns and monthly campaigns for the frontend.",
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
      messe: "trade fair",
      monatsaktion: "monthly campaign",
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
      startDateRequired: "Please select a start date.",
      endDateRequired: "Please select an end date.",
      endBeforeStart: "End date cannot be before the start date.",
      productRequired: "Please add at least one product.",
      duplicateProduct: "A product has been selected more than once.",
      targetDealerMissing: "A dealer is missing in the dealer targets.",
      targetValueInvalid: "A valid target value is missing in the dealer targets.",
      targetDealerDuplicate: "A dealer has been used more than once in the target settings.",
      tierLevelMissing: "A tier level is missing in the bonus tiers.",
      thresholdInvalid: "A valid threshold value is missing in the bonus tiers.",
      bonusValueInvalid: "A valid bonus value is missing in the bonus tiers.",
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
      confirmDelete: 'Do you really want to delete the campaign "{name}"?',
    },
  },
  adminPromotionDetail: {
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
      startDateRequired: "Please select a start date.",
      endDateRequired: "Please select an end date.",
      endBeforeStart: "End date cannot be before start date.",
      productRequired: "Please add at least one product.",
      duplicateProduct: "A product was selected more than once.",
      targetDealerMissing: "Dealer missing in dealer targets.",
      targetValueInvalid: "Invalid target value.",
      targetDealerDuplicate: "Dealer used more than once.",
      tierLevelMissing: "Tier level missing.",
      thresholdInvalid: "Invalid threshold value.",
      bonusValueInvalid: "Invalid bonus value.",
      duplicateTier: "Tier level duplicated.",
    },

    messages: {
      loadError: "Campaign could not be loaded.",
      saveSuccess: "Promotion / campaign updated successfully.",
      saveError: "Campaign could not be saved.",
    },
  },
  adminReports: {
    title: "Data Export & Reports",

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
      hint: "Note",
      hintText:
        "Display, KPIs and Excel export use exactly the same filters.",
    },

    messages: {
      exportError: "Export failed",
    },
  },
} as const;
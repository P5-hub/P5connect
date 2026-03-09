export const support = {
  page: {
    title: "Request Support",
  },

  title: "Support Request",
  heading: "Support Request",

  type: {
    sellout: "Sell-Out",
    werbung: "Marketing",
    event: "Event",
    sonstiges: "Other",
  },

  fields: {
    comment: "Comment",
    quantity: "Quantity",
    amountPerUnit: "Support / unit",
    supportType: "Support type",
    receipt: "Receipt / Proof (PDF, JPG, PNG)",
    totalCost: "Total cost (CHF)",
    sonyShare: "Sony share (%)",
    sonyAmount: "Sony support (CHF)",
  },

  actions: {
    add: "Add",
    submit: "Review & submit support",
    submitButton: "Submit support",
    sending: "Sending…",
    close: "Close",
    cancel: "Cancel",
    remove: "Remove",
    choose: "Please choose…",
    openCart: "Open support cart",
  },

  states: {
    success: "✅ Support request saved",
    emptyCart: "No products selected yet.",
    noReceipt: "No receipt selected.",
    positions: "Items",
    totalAmount: "Total support amount",
    sendTitle: "Send support",
    noSupportProducts: "No support products yet.",
    selectProducts: "Select products",
    costSharing: "Cost contribution",
    selectedFile: "Selected:",
    cartLabel: "Support",
  },

  files: {
    invoiceUpload: "Upload invoice / receipt (optional)",
    removed: "Receipt removed",
  },

  hints: {
    selloutOnly:
      "Note: Items are only relevant for Sell-Out. Select 'Sell-Out' above to edit quantities and amounts.",
    optionalComment: "Optional comment",
    removeReceipt: "Remove receipt",
  },

  product: {
    unknown: "Unknown product",
    sku: "SKU",
    ean: "EAN",
    quantity: "Quantity",
    amountPerUnit: "Support / unit",
  },

  customcost: {
    title: "Custom support request",
    subtitle: "Choose the support type and add details",
    type: "Support type",
    select: "Please select support type",
    name: "Description",
    placeholder: "e.g. advertising material, window display, flyer, event space",
  },

  error: {
    noDealer: "No dealer found – please log in again.",
    noProducts: "Please add at least one product.",
    noUser: "No logged-in user found.",
    save: "Error while saving.",
    missingSupportType: "Please select a support type.",
    missingPositions: "No support positions available.",
    invalidValues: "Please enter valid quantity and support amount.",
    tooManyFiles: "Please attach only one receipt.",
    missingDealerId: "dealer_id missing.",
    submitFailed: "Support could not be saved",
    missingDealerFromUrl: "No dealer found (URL).",
    missingCosts: "Please enter costs and participation.",
    unknown: "Unknown error",
  },

  success: {
    submitted: "Support submitted successfully",
  },
} as const;
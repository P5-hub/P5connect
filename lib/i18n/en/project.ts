export const project = {
  page: {
    title: "Request project pricing",
    heading: "Project request",
    products: "Select products",
  },

  details: {
    title: "Project information",
    name: "Project name or project number",
    customer: "End customer / Client",
    location: "Location (e.g. Zurich, Bern)",
    type: "Project type",
    start: "Start date",
    end: "End date",
    comment: "Comment or description",
    next: "Continue to products",
    back: "Back",
  },

  type: {
    standard: "Standard",
    tender: "Tender",
    promo: "Promotion / campaign",
  },

  summary: {
    title: "Summary",
    filesAttached: "{count} file(s) attached",
  },

  files: {
    title: "Project documents",
    hint: "PDF, Excel, CSV or images – multiple files possible",
    drop: "Drop files here or select files",
    uploading: "Uploading file…",
    remove: "Remove file",
    empty: "No files attached",
    attached: "Attached files",
    uploadOptional: "Attach files (optional)",
    selected: "Selected:",
    removeAll: "Remove files",

    error: {
      uploadFailed: "File upload failed",
      bucketMissing: "Storage location not found",
      fileTooLarge: "File is too large",
      unsupportedType: "File type not supported",
    },
  },

  cart: {
    title: "Submit project request",
    noProducts: "No products in the project yet.",
    total: "Total",
    totalPrice: "Total project price",
    totalSavings: "Total savings",
    submit: "Submit project",
    sending: "Submitting…",
    continue: "Continue configuring",

    projectInfo: "Project details",
    mainDistributor: "Main distributor",
    mainDistributorHint: "By default via ElectronicPartner Switzerland AG.",

    deliveryProjectInfo: "Delivery / project details",
    delivery: "Delivery",
    deliveryNow: "Immediate",
    deliveryOnDate: "On date",
    deliveryDateOptional: "Delivery date (optional)",
    projectOrderComment: "Important information for the project order (comment)",
    projectOrderReference: "Your project / order reference",
    altDelivery: "Different delivery address / direct delivery",

    success: {
      title: "🎉 Project saved!",
      close: "Close",
    },

    validation: {
      noDealer: "❌ No dealer found – please log in again.",
      noProducts: "No products in the project.",
      missingDistributor: "❌ Please select a main distributor.",
      invalidDate: "Please select a valid delivery date (YYYY-MM-DD).",
      missingDisti: "❌ Distributor missing",
      missingSource: "❌ Supplier missing",
      unknownDisti: "❌ Unknown distributor code",
      invalidQuantity: "Invalid input",
    },
  },

  toast: {
    saved: "✅ Project saved successfully",
    saveError: "❌ Error while saving the project",
    uploadError: "❌ File upload failed",
    filesAdded: "📎 {count} file(s) added",
  },
  productCard: {
    quantity: "Quantity",
    targetPrice: "Target price (CHF)",
    add: "Add to project",
    added: "✅ Product added to the project request.",
    addedShort: "Added",
    unknownProduct: "Unknown",
    addError: "Product could not be added (missing product_id).",
    },
  addressFields: {
    name: "Name / Company",
    street: "Street / No.",
    zip: "ZIP",
    city: "City",
    country: "Country",
    phoneOptional: "Phone (optional)",
    emailOptional: "Email (optional)",
    },

    cartProduct: {
    quantity: "Quantity",
    projectPrice: "Project price (CHF)",
    ekNormal: "Normal cost price",
    cheapestSupplier: "Cheapest supplier",
    supplierNameRequired: "Please specify the supplier name *",
    supplierNamePlaceholder: "Supplier name",
    supplierNameHint:
        "Required when selecting 'Other' — please specify the exact supplier.",
    cheapestPriceGross: "Lowest price (incl. VAT)",
    distributorRequired: "Distributor (required)",
    pleaseSelect: "Please select",
    specialDistribution: "Special distribution",
    remove: "Remove",
    ean: "EAN",
    }
} as const;
export const sales = {
  page: {
    title: "Report sales data",
    heading: "Report sales data",
    manualTitle: "Manual entry",
    uploadTitle: "CSV / Excel upload",
    manual: "Manual entry",
    upload: "CSV / Excel upload",
    uploadTemplate: "CSV template",
    template: "CSV template",
    next: "Next",
    back: "Back",
    clearCsv: "Clear CSV",
    modalTitle: "Report sales data",
    quantity: "Quantity",
    priceOptional: "Price (optional)",
    date: "Date",
    inhouseShare: "Inhouse share (%)",
    calendarWeek: "Calendar week",
    noteForAllProducts: "Automatically applies to all products in this report.",
    noteForUpload: "Automatically applies to all records in the upload.",
    totalQuantity: "Total quantity",
    totalRevenue: "Total revenue",
    reportSale: "Report sale",
    submit: "Report sales data",
    submitSingle: "Report sale",
    saving: "Saving…",
    saved: "Sales data saved",
    success: "Sales data reported successfully",
    saveError: "Error while saving",
    submitError: "Error while submitting",
    serverError: "Server error",
    fileReadError: "Error reading the file",
  },

  loading: {
    dealer: "⏳ Loading dealer…",
    dealerData: "⏳ Loading dealer data…",
  },

  errors: {
    dealerNotFound: "Dealer not found",
    dealerLoadFailed: "Dealer could not be loaded.",
    noDealer: "No dealer found.",
    emptyCart: "No products in the cart.",
    confirmSonyShare:
      "Please confirm the SONY share for units and revenue.",
  },

  card: {
    unknownModel: "Unknown model",
    ean: "EAN",
    quantity: "Quantity",
    stock: "Stock",
    price: "Price (CHF)",
    serialNumber: "Serial no.",
    serialPlaceholder: "SN...",
    added: "✅ Added",
    report: "📊 Report",
  },

  choose: {
    manual: "Manual entry",
    upload: "CSV / Excel upload",
  },

  upload: {
    fileTable: {
      ean: "EAN",
      product: "Product",
      quantity: "Quantity",
      stockQuantity: "Stock quantity",
      price: "Price",
      date: "Date",
      stockDate: "Stock date",
    },

    calendarWeek: "Calendar week",
    sonyShareQty: "SONY share units (%)",
    sonyShareRevenue: "SONY share revenue (%)",
    sonyQty: "Sony units",
    totalQty: "Total dealer units",
    sonyRevenue: "Sony revenue",
    totalRevenue: "Total dealer revenue",
    reportedStock: "Reported stock quantity",
    confirmSonyShare:
      "I confirm that the reported SONY shares (units & revenue) correspond to the actual sales ratio for this calendar week.",
  },

  cart: {
    title: "Report sales data",
    close: "Close",
    submit: "Report sale",
    saving: "Saving…",
    sonyShareQty: "SONY share units (%)",
    sonyShareRevenue: "SONY share revenue (%)",

    reportedProducts: "Reported products",
    totalSale: "Total sales",
    totalStock: "Total stock",

    item: {
      ean: "EAN",
      sale: "Sale",
      stock: "Stock",
      price: "Price",
      serialNumber: "Serial number",
      stockDate: "Stock date",
    },

    dealer: {
      customerNo: "Customer no.",
      contact: "Contact",
      phone: "Phone",
      email: "E-mail",
      city: "City",
      kam: "KAM",
    },
    placeholders: {
      price: "e.g. 499",
    },
  },
} as const;
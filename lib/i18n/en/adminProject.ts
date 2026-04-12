export const adminProject = {
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
      pending: "⏳ Open",
    },
    empty: {
      noFiles: "No files available.",
    },
    success: {
      fileUploaded: "File uploaded successfully.",
      counterOfferSavedApproved:
        "Counter offer saved and project approved.",
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
      fileDbSaveFailed:
        "File was uploaded, but not saved in the database.",
      priceSaveFailed: "Price for {product} could not be saved.",
      statusUpdateFailed: "Status could not be updated.",
      actionFailed: "Action could not be executed.",
      noRecord: "No record found.",
    },
  },
} as const;
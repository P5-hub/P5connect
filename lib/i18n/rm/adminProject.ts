export const adminProject = {
  detail: {
    title: "Dumonda da project",
    loading: {
      data: "Chargiar datas…",
    },
    sections: {
      dealer: "Commerziant",
      projectInfo: "Infurmaziuns dal project",
      comment: "Commentari",
      projectFiles: "Documents dal project",
      projectHistory: "Istorgia dal project",
    },
    labels: {
      untitled: "(senza titel)",
      customerNumber: "Nr. client",
      projectNumber: "Nr. dal project",
      type: "Tip",
      customer: "Client",
      location: "Lieu",
      period: "Perioda",
      status: "Status:",
      unknownProduct: "Product",
      created: "creà",
    },
    table: {
      product: "Product",
      quantity: "Quantitad",
      counterOffer: "Import / cuntraofferta",
      total: "Total",
    },
    actions: {
      back: "Enavos",
      upload: "Upload",
      uploading: "Chargiar…",
      view: "Mussar",
    },
    status: {
      approved: "✅ Approvà",
      rejected: "❌ Refusà",
      pending: "⏳ Avert",
    },
    empty: {
      noFiles: "Nagins datotecas disponiblas.",
    },
    success: {
      fileUploaded: "Datoteca chargiada cun success.",
      counterOfferSavedApproved:
        "Cuntraofferta memorisada e project approvà.",
      projectApproved: "Project approvà.",
      projectRejected: "Project refusà.",
      projectReset: "Project reinitialisà.",
    },
    errors: {
      requestLoadFailed: "La dumonda da project n’ha betg pudì vegnir chargiada.",
      requestNotFound: "Dumonda da project betg chattada.",
      projectLoadFailed: "Il project n’ha betg pudì vegnir chargià.",
      projectNotFound: "Project betg chattà.",
      productsLoadFailed: "Ils products n’han betg pudì vegnir chargiads.",
      loadGeneric: "Errur tar chargiar las datas dal project.",
      fileOpenFailed: "La datoteca n’ha betg pudì vegnir averta.",
      uploadFailed: "Upload betg reussì.",
      fileDbSaveFailed:
        "La datoteca è vegnida chargiada, ma betg memorisada en la banca da datas.",
      priceSaveFailed:
        "Il pretsch per {product} n’ha betg pudì vegnir memorisà.",
      statusUpdateFailed: "Il status n’ha betg pudì vegnir actualisà.",
      actionFailed: "L’acziun n’ha betg pudì vegnir exequida.",
      noRecord: "Nagina endataziun chattada.",
    },
  },
} as const;
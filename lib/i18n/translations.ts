import { project as projectDe } from "./de/project";
import { project as projectEn } from "./en/project";
import { project as projectFr } from "./fr/project";
import { project as projectIt } from "./it/project";
import { project as projectRm } from "./rm/project";

import { support as supportDe } from "./de/support";
import { support as supportEn } from "./en/support";
import { support as supportFr } from "./fr/support";
import { support as supportIt } from "./it/support";
import { support as supportRm } from "./rm/support";

import { sofortrabatt as sofortrabattDe } from "./de/sofortrabatt";
import { sofortrabatt as sofortrabattEn } from "./en/sofortrabatt";
import { sofortrabatt as sofortrabattFr } from "./fr/sofortrabatt";
import { sofortrabatt as sofortrabattIt } from "./it/sofortrabatt";
import { sofortrabatt as sofortrabattRm } from "./rm/sofortrabatt";



  export type Lang = "de" | "en" | "fr" | "it" | "rm";

  export const translationsByLang = {
    /* 🇩🇪 Deutsch */
  de: {
    nav: {
      order: "Bestellung",
      sales: "Verkauf",
      project: "Projekt",
      support: "Support",
      instantDiscount: "Sofortrabatt",
      info: "Infos",
      password: "Passwort ändern",
      logout: "Logout",
      dashboard: "P5connect Dashboard",
      dashboardTitle: "connect Dashboard",
      backToDashboard: "Zurück zum Dashboard",
    },

    passwordForgot: "Passwort vergessen?",

      dealer: {
        infoTitle: "📋 Händlerinformationen",
        shop: "Shop",
        company: "Firma",
        address: "Adresse",
        city: "PLZ / Ort",
        email: "E-Mail",
        phone: "Telefon",
        loading: "⏳ Händerdaten werden geladen...",
        notfound: "❌ Händler nicht gefunden",
      },

    project: projectDe,  
   
      product: {
        search: "🔍 Suche nach Artikel, Name oder EAN...",
        groups: { all: "Alle Gruppen" },
        categories: { all: "Alle Kategorien" },
        sort: {
          sony_article_asc: "Artikelnummer (aufsteigend)",
          sony_article_desc: "Artikelnummer (absteigend)",
          name_asc: "Name (A–Z)",
          name_desc: "Name (Z–A)",
        },
        reset: "Zurücksetzen",
      },

    support: supportDe,

      admin: {
        promotions: "Promotionen",
        instantDiscount: "Sofortrabatt",
        projects: "Projekte",
        orders: "Bestellungen",
        support: "Support",
        monthlyOffers: "Monatsaktionen",
        reports: "Berichte / Datenauswertung",
        info: "Wichtige Infos",
        actAsDealer: "Als Händler agieren",
      },

      /* 🔵 Bestpreis-Liste */
      bestprice: {
        "page.title": "Bestellung zum Bestpreis",
        heading: "Bestellung zum Bestpreis",
        addToCart: "In den Warenkorb",
      },

      /* 💰 Preise / Marktpreise */
      pricing: {
        uvpGross: "UVP (brutto)",
        ekNormal: "EK normal",
        marketPricesCurrent: "Marktpreise (aktuell)",
        notAvailable: "nicht verfügbar",
        priceNet: "Preis (CHF, exkl. MwSt & VRG)",
        bestPrice: "Günstigster Preis (inkl. MwSt.)",
      },

      /* 📊 Verkauf melden (Seite + Modal + CSV) */
      sales: {
        "page.title": "Verkaufsdaten melden",
        heading: "Verkaufsdaten melden",
        manual: "Manuell melden",
        upload: "CSV / Excel Upload",
        uploadTemplate: "CSV-Vorlage",
        next: "Weiter",
        back: "Zurück",
        clearCsv: "CSV leeren",
        modalTitle: "Verkaufsdaten melden",
        quantity: "Anzahl",
        priceOptional: "Preis (optional)",
        date: "Datum",
        inhouseShare: "Inhouse Share (%)",
        calendarWeek: "Kalenderwoche",
        noteForAllProducts: "Gilt automatisch für alle Produkte in dieser Meldung.",
        noteForUpload: "Gilt automatisch für alle Datensätze im Upload.",
        totalQuantity: "Gesamtmenge",
        totalRevenue: "Gesamtumsatz",
        reportSale: "Verkauf melden",
      },

      /* 📁 Upload-Komponenten */
      upload: {
        dropzoneText: "Datei hierher ziehen oder auswählen",
        chooseFile: "Datei wählen",
      },

      /* ⚡ Sofortrabatt / Instant Discount */
    sofortrabatt: sofortrabattDe,
      instant: {
        "page.title": "Sofortrabatt beantragen",
        heading: "Sofortrabatt beantragen",
        step1: "1. TV auswählen",
        step2: "2. Rabatt-Level wählen",
        step3: "3. Soundbar auswählen",
        levelSingle: "Single (nur TV)",
        levelDouble: "Double (TV + Soundbar)",
        levelTriple: "Triple (TV + Soundbar + Subwoofer)",
        addToCart: "In den Warenkorb",
      },

      /* ℹ️ Support & Kontaktinformationen */
    infos: {
        title: "Support & Kontaktinformationen",

        support: {
          title: "Technischer Support",
          hours: "Montag – Freitag, 09:00–18:00 Uhr",
          phone: "Telefon",
          email: "E-Mail",
          moreHelp: "Weitere Hilfe direkt bei Sony:",
        },

        news: {
          title: "Newsletter Archiv",
          openWeb: "Newsletter im Web öffnen",

          jan2025: {
            title: "Newsletter Januar 2025",
            desc: "Die wichtigsten Informationen & Aktionen im Januar.",
          },

          feb2025: {
            title: "Newsletter Februar 2025",
            desc: "Produktnews, Aktionen und Updates für den Februar.",
          },
        },

        sales: {
          internal: "Verkauf Innendienst",
          kam: "Ansprechpartner Verkauf",
        },

        downloads: {
          title: "Downloads",
          sertronics: "Anmeldung Sertronics",
        },
      },




      /* 🛒 Bestell-Overlay / Checkout */
      checkout: {
        "page.title": "Bestellung zum Bestpreis",
        mainDistributor: "Haupt-Distributor",
        defaultVia: "Standardmäßig über",
        orderDetails: "Bestellangaben",
        delivery: "Lieferung",
        deliveryDateOptional: "Lieferdatum (optional)",
        comment: "Wichtige Infos zur Bestellung (Kommentar)",
        referenceNumber: "Ihre Bestell-/Referenz-Nr.",
        differentDeliveryAddress: "Abweichende Lieferadresse / Direktlieferung",
        pleaseSelect: "Bitte auswählen",
        cheapestSupplier: "Günstigster Anbieter",
        cheapestPrice: "Günstigster Preis (inkl. MwSt.)",
        summaryTotal: "Gesamt",
        summaryTotalPrice: "Gesamtpreis",
        unitPiece: "Stück",
        submitOrder: "Bestellung absenden",
      },
      productCard: {
        unknownModel: "Unbekanntes Modell",
        ean: "EAN",
        mainDistributor: "Haupt-Distributor:",
        distributorRequired: "Distributor (Pflicht)",
        distributorSelect: "Bitte wählen",
        uvpGross: "UVP (brutto)",
        ekNormal: "EK normal",
        marketPricesCurrent: "Marktpreise (aktuell):",
        loading: "lädt…",
        notAvailable: "nicht verfügbar",
        lastChecked: "Stand:",
        amount: "Anzahl",
        priceNet: "Preis (CHF, exkl. MwSt & VRG)",
        saving: "gespart",
        added: "Produkt hinzugefügt",
        addToCart: "In den Warenkorb"
      },
      cart: {
      "button.cart": "Warenkorb",
      "button.items": "({count})",

      "title.cart": "Bestellung zum Bestpreis",

      "dealer.customerNumber": "Kd-Nr.",
      "dealer.contactPerson": "AP",
      "dealer.phone": "Tel.",
      "dealer.kam": "KAM",

      "success.saved": "Bestellung gespeichert!",
      "success.close": "Schließen",

      "empty.noProducts": "Noch keine Produkte ausgewählt.",

      "mainDistributor.title": "Haupt-Distributor",
      "mainDistributor.placeholder": "Bitte auswählen",
      "mainDistributor.defaultHint": "Standardmäßig über ElectronicPartner Schweiz AG.",

      "orderInfo.title": "Bestellangaben",
      "orderInfo.delivery": "Lieferung",
      "orderInfo.delivery.sofort": "Sofort",
      "orderInfo.delivery.termin": "Zum Termin",
      "orderInfo.deliveryDate": "Lieferdatum (optional)",
      "orderInfo.comment": "Wichtige Infos zur Bestellung (Kommentar)",
      "orderInfo.comment.placeholder": "z. B. 'Muss zwingend bis 15.10. geliefert werden'…",
      "orderInfo.referenceNumber": "Ihre Bestell-/Referenz-Nr.",
      "orderInfo.reference.placeholder": "z. B. 45001234",

      "altDelivery.title": "Abweichende Lieferadresse / Direktlieferung",
      "altDelivery.name": "Name / Firma",
      "altDelivery.street": "Straße / Nr.",
      "altDelivery.zip": "PLZ",
      "altDelivery.city": "Ort",
      "altDelivery.country": "Land",
      "altDelivery.phone": "Telefon (optional)",
      "altDelivery.email": "E-Mail (optional)",

      "product.ean": "EAN",
      "product.remove": "Entfernen",
      "product.amount": "Anzahl",
      "product.price": "Preis (CHF)",
      "product.normalPrice": "EK normal",
      "product.saved": "{chf} CHF gespart ({percent}%)",
      "product.special": "Spezialvertrieb",

      "streetprice.bestProvider": "Günstigster Anbieter",
      "streetprice.provider.other": "Andere",
      "streetprice.providerName": "Bitte Namen des Anbieters angeben *",
      "streetprice.providerName.placeholder": "Name des Händlers",
      "streetprice.providerName.hint": "Pflichtfeld bei Auswahl von „Andere“ — bitte genaue Händlerangabe.",
      "streetprice.bestPriceGross": "Günstigster Preis (inkl. MwSt.)",

      "product.disti.required": "Distributor (Pflichtfeld)",
      "product.disti.placeholder": "Bitte auswählen",

      "footer.total": "Gesamt:",
      "footer.totalPieces": "{count} Stück",
      "footer.totalPrice": "Gesamtpreis:",
      "footer.savings": "Gesamtersparnis: {amount} CHF",
      "footer.submit": "Bestellung absenden",
      "footer.sending": "⏳ Sende…",

      "toast.noDealer": "❌ Kein Händler gefunden – bitte neu einloggen.",
      "toast.needDistributor": "❌ Bitte Haupt-Distributor auswählen.",
      "toast.needValidDate": "Bitte ein gültiges Lieferdatum (YYYY-MM-DD) wählen.",
      "toast.invalidQuantity.title": "Ungültige Eingabe",
      "toast.invalidQuantity.text": "Bitte gültige Menge für {product} eingeben!",
      "toast.missingDisti.title": "❌ Distributor fehlt",
      "toast.missingDisti.text": "Bitte Distributor für {product} auswählen.",
      "toast.missingSourceName.title": "❌ Anbieter fehlt",
      "toast.missingSourceName.text": "Bitte Händlernamen für \"Andere\" bei {product} angeben.",
      "toast.unknownDisti.title": "❌ Unbekannter Distributor-Code",
      "toast.unknownDisti.text": "Distributor \"{code}\" konnte nicht gefunden werden.",
      "toast.success.title": "✅ Bestellung gespeichert",
      "toast.success.text": "Die Bestellung wurde erfolgreich übermittelt.",
      "toast.error.title": "❌ Fehler beim Speichern",
      "toast.error.text": "Unbekannter Fehler",
    },
      /* E-Mail übersetzer*/
      /* 🇩🇪 E-Mail Labels → müssen HIER rein! */
    email: {
        firmendaten: "Firmendaten",
        ansprechperson: "Ansprechperson",
        email: "E-Mail",
        telefon: "Telefon",
        kundennr: "Kunden-Nr.",
        kam: "KAM",
        kam_email: "KAM E-Mail",
        lieferoption: "Lieferoption",
        lieferdatum: "Geplantes Lieferdatum",
        lieferadresse_warn: "⚠️ Achtung: Abweichende Lieferadresse (Direktlieferung)",
        lieferadresse: "Lieferadresse",
        kommentar: "Kommentar des Händlers",
        bestellpositionen: "Bestellpositionen",
        bestellweg: "Bestellweg",
        haendler_referenz: "Ihre Händler-Referenz",
        bestellnr: "P5 Bestell-Nr.",
        delivery_immediately: "Sofort",
        delivery_scheduled: "Geplante Lieferung",
    },
    login: {
      welcome: "Willkommen beim Login",
      portalTitle: "P5connect Partnerportal",
      portalDesc:
        "Geschützter Zugang für registrierte Handelspartner zur Übermittlung von Verkaufszahlen, Projektanfragen und Bestellungen.",
      securityNote:
        "Diese Verbindung ist verschlüsselt. Zugangsdaten werden nicht an Dritte weitergegeben.",

      loginNr: "Login-Nummer",
      loginNrPlaceholder: "Ihre Login-Nummer eingeben",
      password: "Passwort",
      passwordPlaceholder: "Passwort eingeben",
      login: "Einloggen",

      error: {
        unknownLogin: "Unbekannte Login-Nummer.",
        noEmail: "Für diesen Händler ist keine E-Mail hinterlegt.",
        failed: "Login fehlgeschlagen. Bitte Login-Nr. und Passwort prüfen.",
      },

      footerLine1: "© {year} P5connect.ch – 8047 Zürich",
      footerLine2: "support@p5connect.ch",
      legalImprint: "Impressum",
      legalPrivacy: "Datenschutz",

      footer: "Zugang nur für registrierte Partner.",
    },
  /*passwortchange*/
  auth: {
    reset: {
      title: "Neues Passwort setzen",
      newPassword: "Neues Passwort",
      confirm: "Passwort bestätigen",
      submit: "Passwort ändern",

      invalidLink: "❌ Fehler: Reset-Token fehlt oder ist ungültig.",
      expired: "❌ Der Link ist ungültig oder abgelaufen.",
      noSession: "❌ Fehler: Auth-Session nicht verfügbar.",
      mismatch: "❌ Die Passwörter stimmen nicht überein.",
      short: "❌ Passwort muss mind. 8 Zeichen lang sein.",
      success: "✅ Passwort erfolgreich geändert!",
    },
  },
  activity: {
    title: "Letzte Aktivitäten",
    loading: "Lade Aktivitäten…",
    empty: "Keine Einträge für den gewählten Zeitraum.",
    status: {
      pending: "ausstehend",
      approved: "genehmigt",
      rejected: "abgelehnt",
      unknown: "—",
    },
  },
    history: {
      header: {
        all: "Letzte Aktivitäten",
        verkauf: "Letzte Verkäufe",
        bestellung: "Letzte Bestellungen",
        projekt: "Letzte Projekte",
        support: "Letzte Supportfälle",
        sofortrabatt: "Letzte Sofortrabatte",
      },

      actions: {
        excel: "Excel",
        excelTitle: "Verlauf als Excel herunterladen",
        viewAll: "Gesamten Verlauf →",
        pdfTitle: "PDF herunterladen",
      },

      empty: "Keine Einträge gefunden.",
      loadingDetails: "Lade Details…",
      noDetails: "Keine Details gefunden.",

      meta: {
        positions: "Pos.",
        reference: "Ref.",
        delivery: "Lieferung",
        productFallback: "Produkt",
        more: "… und {count} weitere",
      },

      error: {
        excel: "Excel-Export fehlgeschlagen",
        pdf: "PDF-Export fehlgeschlagen",
      },
    }

  },
  

  /* 🇬🇧 English */
  en: {
    nav: {
      order: "Order",
      sales: "Sales",
      project: "Project",
      support: "Support",
      instantDiscount: "Instant Discount",
      info: "Info",
      password: "Change Password",    
      logout: "Logout",
      dashboard: "P5connect Dashboard",
      dashboardTitle: "connect Dashboard",
      backToDashboard: "Back to Dashboard",

    },

    passwordForgot: "Forgot password?",

    dealer: {
      infoTitle: "📋 Dealer Information",
      shop: "Shop",
      company: "Company",
      address: "Address",
      city: "ZIP / City",
      email: "Email",
      phone: "Phone",
      loading: "⏳ Loading dealer data...",
      notfound: "❌ Dealer not found",
    },
    
    project: projectEn,

    product: {
      search: "🔍 Search by product, name or EAN...",
      groups: { all: "All groups" },
      categories: { all: "All categories" },
      sort: {
        sony_article_asc: "Article number (ascending)",
        sony_article_desc: "Article number (descending)",
        name_asc: "Name (A–Z)",
        name_desc: "Name (Z–A)",
      },
      reset: "Reset",
    },

    support: supportEn,

    admin: {
      promotions: "Promotions",
      instantDiscount: "Instant Discount",
      projects: "Projects",
      orders: "Orders",
      support: "Support",
      monthlyOffers: "Monthly Offers",
      reports: "Reports / Data Analysis",
      info: "Important Information",
      actAsDealer: "Act as Dealer",
    },

    bestprice: {
      "page.title": "Best Price Order",
      heading: "Best Price Order",
      addToCart: "Add to cart",
    },

    pricing: {
      uvpGross: "SRP (gross)",
      ekNormal: "Regular purchase price",
      marketPricesCurrent: "Market prices (current)",
      notAvailable: "not available",
      priceNet: "Price (CHF, excl. VAT & fees)",
      bestPrice: "Best price (incl. VAT)",
    },

    sales: {
      "page.title": "Report Sales Data",
      heading: "Report Sales Data",
      manual: "Report manually",
      upload: "CSV / Excel upload",
      uploadTemplate: "CSV template",
      next: "Next",
      back: "Back",
      clearCsv: "Clear CSV",
      modalTitle: "Report sales",
      quantity: "Quantity",
      priceOptional: "Price (optional)",
      date: "Date",
      inhouseShare: "Inhouse share (%)",
      calendarWeek: "Calendar week",
      noteForAllProducts: "Automatically applies to all products in this report.",
      noteForUpload: "Automatically applies to all rows in the upload.",
      totalQuantity: "Total quantity",
      totalRevenue: "Total revenue",
      reportSale: "Submit sales report",
    },

    upload: {
      dropzoneText: "Drag & drop file here or click to select",
      chooseFile: "Choose file",
    },
    sofortrabatt: sofortrabattEn,
    instant: {
      "page.title": "Request Instant Discount",
      heading: "Request Instant Discount",
      step1: "1. Select TV",
      step2: "2. Select discount level",
      step3: "3. Select soundbar",
      levelSingle: "Single (TV only)",
      levelDouble: "Double (TV + soundbar)",
      levelTriple: "Triple (TV + soundbar + subwoofer)",
      addToCart: "Add to cart",
    },

    infos: {
      title: "Support & Contact Information",

      support: {
        title: "Technical Support",
        hours: "Monday – Friday, 09:00–18:00",
        phone: "Phone",
        email: "Email",
        moreHelp: "More help directly from Sony:",
      },

      sales: {
        internal: "Inside Sales",
        kam: "Sales Contacts",
      },

      downloads: {
        title: "Downloads",
        sertronics: "Sertronics Registration",
      },
    },


    checkout: {
      "page.title": "Best Price Order",
      mainDistributor: "Main distributor",
      defaultVia: "Default via",
      orderDetails: "Order details",
      delivery: "Delivery",
      deliveryDateOptional: "Delivery date (optional)",
      comment: "Important information for this order (comment)",
      referenceNumber: "Your order / reference no.",
      differentDeliveryAddress: "Different delivery address / direct shipment",
      pleaseSelect: "Please select",
      cheapestSupplier: "Cheapest supplier",
      cheapestPrice: "Cheapest price (incl. VAT)",
      summaryTotal: "Total",
      summaryTotalPrice: "Total price",
      unitPiece: "pcs",
      submitOrder: "Submit order",
    },
    productCard: {
      unknownModel: "Unknown model",
      ean: "EAN",
      mainDistributor: "Main distributor:",
      distributorRequired: "Distributor (required)",
      distributorSelect: "Please select",
      uvpGross: "RRP (gross)",
      ekNormal: "Standard dealer price",
      marketPricesCurrent: "Market prices (current):",
      loading: "loading…",
      notAvailable: "not available",
      lastChecked: "Checked on:",
      amount: "Quantity",
      priceNet: "Price (CHF, excl. VAT & fees)",
      saving: "saved",
      added: "Product added",
      addToCart: "Add to cart"
    },
    cart: {
    "button.cart": "Cart",
    "button.items": "({count})",
    "title.cart": "Best Price Order",

    "dealer.customerNumber": "Customer No.",
    "dealer.contactPerson": "Contact",
    "dealer.phone": "Phone",
    "dealer.kam": "KAM",

    "success.saved": "Order saved!",
    "success.close": "Close",

    "empty.noProducts": "No products selected yet.",

    "mainDistributor.title": "Main Distributor",
    "mainDistributor.placeholder": "Please select",
    "mainDistributor.defaultHint": "By default via ElectronicPartner Switzerland AG.",

    "orderInfo.title": "Order Information",
    "orderInfo.delivery": "Delivery",
    "orderInfo.delivery.sofort": "Immediate",
    "orderInfo.delivery.termin": "Scheduled",
    "orderInfo.deliveryDate": "Delivery date (optional)",
    "orderInfo.comment": "Important notes for the order (comment)",
    "orderInfo.comment.placeholder": "e.g. 'Must be delivered by 15.10'…",
    "orderInfo.referenceNumber": "Your order/reference no.",
    "orderInfo.reference.placeholder": "e.g. 45001234",

    "altDelivery.title": "Different delivery address / direct delivery",
    "altDelivery.name": "Name / Company",
    "altDelivery.street": "Street / No.",
    "altDelivery.zip": "ZIP",
    "altDelivery.city": "City",
    "altDelivery.country": "Country",
    "altDelivery.phone": "Phone (optional)",
    "altDelivery.email": "Email (optional)",

    "product.ean": "EAN",
    "product.remove": "Remove",
    "product.amount": "Quantity",
    "product.price": "Price (CHF)",
    "product.normalPrice": "Regular EK",
    "product.saved": "{chf} CHF saved ({percent}%)",
    "product.special": "Special Distribution",

    "streetprice.bestProvider": "Lowest provider",
    "streetprice.provider.other": "Other",
    "streetprice.providerName": "Please enter provider name *",
    "streetprice.providerName.placeholder": "Retailer name",
    "streetprice.providerName.hint": "Required if 'Other' is selected — please provide exact retailer.",
    "streetprice.bestPriceGross": "Lowest price (incl. VAT)",

    "product.disti.required": "Distributor (required)",
    "product.disti.placeholder": "Please select",

    "footer.total": "Total:",
    "footer.totalPieces": "{count} pcs",
    "footer.totalPrice": "Total price:",
    "footer.savings": "Total savings: {amount} CHF",
    "footer.submit": "Submit order",
    "footer.sending": "⏳ Sending…",

    "toast.noDealer": "❌ No dealer found – please log in again.",
    "toast.needDistributor": "❌ Please select a main distributor.",
    "toast.needValidDate": "Please enter a valid delivery date (YYYY-MM-DD).",
    "toast.invalidQuantity.title": "Invalid input",
    "toast.invalidQuantity.text": "Please enter a valid quantity for {product}!",
    "toast.missingDisti.title": "❌ Distributor missing",
    "toast.missingDisti.text": "Please select a distributor for {product}.",
    "toast.missingSourceName.title": "❌ Provider missing",
    "toast.missingSourceName.text": "Please provide the retailer name when selecting \"Other\" for {product}.",
    "toast.unknownDisti.title": "❌ Unknown distributor code",
    "toast.unknownDisti.text": "Distributor \"{code}\" could not be found.",
    "toast.success.title": "✅ Order saved",
    "toast.success.text": "The order has been successfully submitted.",
    "toast.error.title": "❌ Error saving order",
    "toast.error.text": "Unknown error",
  },
      /* E-Mail übersetzer*/
      /* 🇩🇪 E-Mail Labels → müssen HIER rein! */
    email: {
        firmendaten: "Company Information",
        ansprechperson: "Contact Person",
        email: "Email",
        telefon: "Phone",
        kundenNr: "Customer No.",
        kam: "Account Manager",
        kamEmail: "AM Email",
        lieferoption: "Delivery Option",
        lieferdatum: "Scheduled Delivery Date",
        lieferadresseWarn: "⚠️ Attention: Different delivery address (direct shipment)",
        lieferadresse: "Delivery Address",
        kommentar: "Dealer Comment",
        bestellpositionen: "Order Items",
        bestellweg: "Order Method",
        haendlerReferenz: "Your Dealer Reference",
        bestellNr: "P5 Order No.",
        sofort: "Immediate",
        geplant: "Scheduled Delivery",
    },
    login: {
      welcome: "Welcome to login",
      portalTitle: "P5connect Partner Portal",
      portalDesc:
        "Secure access for registered trade partners to submit sales reports, project requests and orders.",
      securityNote:
        "This connection is encrypted. Login credentials are not shared with third parties.",

      loginNr: "Login ID",
      loginNrPlaceholder: "Enter your login ID",
      password: "Password",
      passwordPlaceholder: "Enter password",
      login: "Sign in",

      error: {
        unknownLogin: "Unknown login ID.",
        noEmail: "No email address is stored for this partner.",
        failed: "Login failed. Please check login ID and password.",
      },

      footerLine1: "© {year} P5connect.ch – Zurich, Switzerland",
      footerLine2: "support@p5connect.ch",
      legalImprint: "Legal Notice",
      legalPrivacy: "Privacy Policy",

      footer: "Access restricted to registered partners only.",
    },

  /*passwortchange*/
  auth: {
    reset: {
      title: "Set new password",
      newPassword: "New password",
      confirm: "Confirm password",
      submit: "Change password",

      invalidLink: "❌ Error: Reset token missing or invalid.",
      expired: "❌ The link is invalid or expired.",
      noSession: "❌ Error: Auth session not available.",
      mismatch: "❌ Passwords do not match.",
      short: "❌ Password must be at least 8 characters.",
      success: "✅ Password successfully changed!",
    },
    },
    activity: {
      title: "Recent activity",
      loading: "Loading activity…",
      empty: "No entries for the selected period.",
      status: {
        pending: "pending",
        approved: "approved",
        rejected: "rejected",
        unknown: "—",
    },
  },

    history: {
      header: {
        all: "Recent activity",
        verkauf: "Recent sales",
        bestellung: "Recent orders",
        projekt: "Recent projects",
        support: "Recent support cases",
        sofortrabatt: "Recent instant discounts",
      },

      actions: {
        excel: "Excel",
        excelTitle: "Download history as Excel",
        viewAll: "View full history →",
        pdfTitle: "Download PDF",
      },

      empty: "No entries found.",
      loadingDetails: "Loading details…",
      noDetails: "No details found.",

      meta: {
        positions: "items",
        reference: "Ref.",
        delivery: "Delivery",
        productFallback: "Product",
        more: "… and {count} more",
      },

      error: {
        excel: "Excel export failed",
        pdf: "PDF export failed",
      },
    },
  },
  /* 🇫🇷 Français */
  fr: {
    nav: {
      order: "Commande",
      sales: "Vente",
      project: "Projet",
      support: "Support",
      instantDiscount: "Remise immédiate",
      info: "Infos",
      password: "Changer le mot de passe",      
      logout: "Déconnexion",
      dashboard: "Tableau de bord P5connect",
      dashboardTitle: "connect Dashboard",
      backToDashboard: "Retour au tableau de bord",

    },

    passwordForgot: "Mot de passe oublié ?",

    dealer: {
      infoTitle: "📋 Informations du revendeur",
      shop: "Magasin",
      company: "Entreprise",
      address: "Adresse",
      city: "NPA / Ville",
      email: "E-mail",
      phone: "Téléphone",
      loading: "⏳ Chargement des données du revendeur...",
      notfound: "❌ Revendeur non trouvé",
    },

    project: projectFr,
    
    product: {
      search: "🔍 Rechercher par article, nom ou EAN...",
      groups: { all: "Tous les groupes" },
      categories: { all: "Toutes les catégories" },
      sort: {
        sony_article_asc: "Numéro d’article (croissant)",
        sony_article_desc: "Numéro d’article (décroissant)",
        name_asc: "Nom (A–Z)",
        name_desc: "Nom (Z–A)",
      },
      reset: "Réinitialiser",
    },

    support: supportFr,

    admin: {
      promotions: "Promotions",
      instantDiscount: "Remise immédiate",
      projects: "Projets",
      orders: "Commandes",
      support: "Support",
      monthlyOffers: "Offres mensuelles",
      reports: "Rapports / Analyse des données",
      info: "Informations importantes",
      actAsDealer: "Agir en tant que revendeur",
    },

    bestprice: {
      "page.title": "Commande au meilleur prix",
      heading: "Commande au meilleur prix",
      addToCart: "Ajouter au panier",
    },

    pricing: {
      uvpGross: "PVC (brut)",
      ekNormal: "Prix d’achat normal",
      marketPricesCurrent: "Prix du marché (actuel)",
      notAvailable: "non disponible",
      priceNet: "Prix (CHF, hors TVA & taxes)",
      bestPrice: "Meilleur prix (TVA incl.)",
    },

    sales: {
      "page.title": "Déclarer des ventes",
      heading: "Déclarer des ventes",
      manual: "Déclarer manuellement",
      upload: "Upload CSV / Excel",
      uploadTemplate: "Modèle CSV",
      next: "Suivant",
      back: "Retour",
      clearCsv: "Vider le CSV",
      modalTitle: "Déclarer une vente",
      quantity: "Quantité",
      priceOptional: "Prix (optionnel)",
      date: "Date",
      inhouseShare: "Inhouse share (%)",
      calendarWeek: "Semaine calendrier",
      noteForAllProducts:
        "S’applique automatiquement à tous les produits de cette déclaration.",
      noteForUpload:
        "S’applique automatiquement à toutes les lignes du fichier uploadé.",
      totalQuantity: "Quantité totale",
      totalRevenue: "Chiffre d’affaires total",
      reportSale: "Envoyer la déclaration de vente",
    },

    upload: {
      dropzoneText: "Glissez-déposez le fichier ici ou cliquez pour sélectionner",
      chooseFile: "Choisir un fichier",
    },
    sofortrabatt: sofortrabattFr,
    instant: {
      "page.title": "Demander une remise immédiate",
      heading: "Demander une remise immédiate",
      step1: "1. Sélectionner la TV",
      step2: "2. Choisir le niveau de remise",
      step3: "3. Sélectionner la barre de son",
      levelSingle: "Single (TV seule)",
      levelDouble: "Double (TV + barre de son)",
      levelTriple: "Triple (TV + barre de son + caisson)",
      addToCart: "Ajouter au panier",
    },

    infos: {
      title: "Support & informations de contact",

      support: {
        title: "Support technique",
        hours: "Lundi – Vendredi, 09:00–18:00",
        phone: "Téléphone",
        email: "E-mail",
        moreHelp: "Plus d’aide directement auprès de Sony :",
      },

      sales: {
        internal: "Vente interne",
        kam: "Contact vente",
      },

      downloads: {
        title: "Téléchargements",
        sertronics: "Inscription Sertronics",
      },
    },


    checkout: {
      "page.title": "Commande au meilleur prix",
      mainDistributor: "Distributeur principal",
      defaultVia: "Standard via",
      orderDetails: "Données de commande",
      delivery: "Livraison",
      deliveryDateOptional: "Date de livraison (optionnelle)",
      comment: "Informations importantes pour la commande (commentaire)",
      referenceNumber: "Votre n° de commande / référence",
      differentDeliveryAddress:
        "Adresse de livraison différente / livraison directe",
      pleaseSelect: "Veuillez choisir",
      cheapestSupplier: "Fournisseur le moins cher",
      cheapestPrice: "Meilleur prix (TVA incl.)",
      summaryTotal: "Total",
      summaryTotalPrice: "Prix total",
      unitPiece: "pièce",
      submitOrder: "Envoyer la commande",
    },
    productCard: {
      unknownModel: "Modèle inconnu",
      ean: "EAN",
      mainDistributor: "Distributeur principal :",
      distributorRequired: "Distributeur (obligatoire)",
      distributorSelect: "Veuillez choisir",
      uvpGross: "PVC (brut)",
      ekNormal: "Prix revendeur standard",
      marketPricesCurrent: "Prix du marché (actuels) :",
      loading: "chargement…",
      notAvailable: "non disponible",
      lastChecked: "Mis à jour :",
      amount: "Quantité",
      priceNet: "Prix (CHF, hors TVA & taxes)",
      saving: "économisé",
      added: "Produit ajouté",
      addToCart: "Ajouter au panier"
    },
    cart: {
      "button.cart": "Panier",
      "button.items": "({count})",

      "title.cart": "Commande au meilleur prix",

      "dealer.customerNumber": "N° client",
      "dealer.contactPerson": "Contact",
      "dealer.phone": "Téléphone",
      "dealer.kam": "KAM",

      "success.saved": "Commande enregistrée !",
      "success.close": "Fermer",

      "empty.noProducts": "Aucun produit sélectionné.",

      "mainDistributor.title": "Distributeur principal",
      "mainDistributor.placeholder": "Veuillez choisir",
      "mainDistributor.defaultHint": "Par défaut via ElectronicPartner Suisse SA.",

      "orderInfo.title": "Informations de commande",
      "orderInfo.delivery": "Livraison",
      "orderInfo.delivery.sofort": "Immédiate",
      "orderInfo.delivery.termin": "Programmée",
      "orderInfo.deliveryDate": "Date de livraison (optionnel)",
      "orderInfo.comment": "Informations importantes (commentaire)",
      "orderInfo.comment.placeholder": "p. ex. 'Doit impérativement être livré avant le 15.10'…",
      "orderInfo.referenceNumber": "Votre n° de commande / référence",
      "orderInfo.reference.placeholder": "p. ex. 45001234",

      "altDelivery.title": "Adresse de livraison différente / livraison directe",
      "altDelivery.name": "Nom / Entreprise",
      "altDelivery.street": "Rue / N°",
      "altDelivery.zip": "NPA",
      "altDelivery.city": "Localité",
      "altDelivery.country": "Pays",
      "altDelivery.phone": "Téléphone (optionnel)",
      "altDelivery.email": "E-mail (optionnel)",

      "product.ean": "EAN",
      "product.remove": "Supprimer",
      "product.amount": "Quantité",
      "product.price": "Prix (CHF)",
      "product.normalPrice": "Prix normal",
      "product.saved": "{chf} CHF économisés ({percent}%)",
      "product.special": "Distribution spéciale",

      "streetprice.bestProvider": "Fournisseur le moins cher",
      "streetprice.provider.other": "Autre",
      "streetprice.providerName": "Nom du fournisseur *",
      "streetprice.providerName.placeholder": "Nom du revendeur",
      "streetprice.providerName.hint": "Obligatoire si 'Autre' est sélectionné — indiquer le revendeur exact.",
      "streetprice.bestPriceGross": "Prix le plus bas (TTC)",

      "product.disti.required": "Distributeur (obligatoire)",
      "product.disti.placeholder": "Veuillez choisir",

      "footer.total": "Total :",
      "footer.totalPieces": "{count} pièces",
      "footer.totalPrice": "Prix total :",
      "footer.savings": "Économies totales : {amount} CHF",
      "footer.submit": "Envoyer la commande",
      "footer.sending": "⏳ Envoi…",

      "toast.noDealer": "❌ Aucun revendeur trouvé – veuillez vous reconnecter.",
      "toast.needDistributor": "❌ Veuillez sélectionner un distributeur principal.",
      "toast.needValidDate": "Veuillez choisir une date de livraison valide (AAAA-MM-JJ).",
      "toast.invalidQuantity.title": "Entrée invalide",
      "toast.invalidQuantity.text": "Veuillez entrer une quantité valide pour {product} !",
      "toast.missingDisti.title": "❌ Distributeur manquant",
      "toast.missingDisti.text": "Veuillez sélectionner un distributeur pour {product}.",
      "toast.missingSourceName.title": "❌ Fournisseur manquant",
      "toast.missingSourceName.text": "Veuillez indiquer un fournisseur lorsque « Autre » est sélectionné pour {product}.",
      "toast.unknownDisti.title": "❌ Code distributeur inconnu",
      "toast.unknownDisti.text": "Le distributeur « {code} » est inconnu.",
      "toast.success.title": "✅ Commande enregistrée",
      "toast.success.text": "La commande a été transmise avec succès.",
      "toast.error.title": "❌ Erreur d’enregistrement",
      "toast.error.text": "Erreur inconnue",
    },
          /* E-Mail übersetzer*/
      /* 🇩🇪 E-Mail Labels → müssen HIER rein! */
    email: {
        firmendaten: "Données de l’entreprise",
        ansprechperson: "Personne de contact",
        email: "E-mail",
        telefon: "Téléphone",
        kundenNr: "N° client",
        kam: "KAM",
        kamEmail: "E-mail KAM",
        lieferoption: "Option de livraison",
        lieferdatum: "Date de livraison prévue",
        lieferadresseWarn: "⚠️ Attention : adresse de livraison différente (livraison directe)",
        lieferadresse: "Adresse de livraison",
        kommentar: "Commentaire du revendeur",
        bestellpositionen: "Positions de commande",
        bestellweg: "Méthode de commande",
        haendlerReferenz: "Votre référence revendeur",
        bestellNr: "N° de commande P5",
        sofort: "Immédiatement",
        geplant: "Livraison planifiée",
    },
    login: {
      welcome: "Bienvenue sur la page de connexion",
      portalTitle: "Portail Partenaire P5connect",
      portalDesc:
        "Accès sécurisé réservé aux partenaires commerciaux enregistrés pour la transmission des ventes, demandes de projet et commandes.",
      securityNote:
        "Cette connexion est chiffrée. Les identifiants ne sont pas transmis à des tiers.",

      loginNr: "Numéro de connexion",
      loginNrPlaceholder: "Saisir votre numéro de connexion",
      password: "Mot de passe",
      passwordPlaceholder: "Saisir le mot de passe",
      login: "Se connecter",

      error: {
        unknownLogin: "Numéro de connexion inconnu.",
        noEmail: "Aucune adresse e-mail n’est enregistrée pour ce partenaire.",
        failed: "Échec de la connexion. Veuillez vérifier vos identifiants.",
      },

      footerLine1: "© {year} P5connect.ch – Zurich, Suisse",
      footerLine2: "support@p5connect.ch",
      legalImprint: "Mentions légales",
      legalPrivacy: "Protection des données",

      footer: "Accès réservé exclusivement aux partenaires enregistrés.",
    },

    /* Reset */
    auth: {
      reset: {
        title: "Définir un nouveau mot de passe",
        newPassword: "Nouveau mot de passe",
        confirm: "Confirmer le mot de passe",
        submit: "Changer le mot de passe",

        invalidLink: "❌ Erreur : le lien de réinitialisation est manquant ou invalide.",
        expired: "❌ Le lien est invalide ou a expiré.",
        noSession: "❌ Erreur : session d’authentification non disponible.",
        mismatch: "❌ Les mots de passe ne correspondent pas.",
        short: "❌ Le mot de passe doit contenir au moins 8 caractères.",
        success: "✅ Mot de passe modifié avec succès !",
      },
    },   
      activity: {
        title: "Activités récentes",
        loading: "Chargement des activités…",
        empty: "Aucune entrée pour la période sélectionnée.",
        status: {
          pending: "en attente",
          approved: "approuvé",
          rejected: "refusé",
          unknown: "—",
      },
    },

    history: {
      header: {
        all: "Activités récentes",
        verkauf: "Ventes récentes",
        bestellung: "Commandes récentes",
        projekt: "Projets récents",
        support: "Cas de support récents",
        sofortrabatt: "Remises immédiates récentes",
      },

      actions: {
        excel: "Excel",
        excelTitle: "Télécharger l’historique en Excel",
        viewAll: "Voir l’historique complet →",
        pdfTitle: "Télécharger le PDF",
      },

      empty: "Aucune entrée trouvée.",
      loadingDetails: "Chargement des détails…",
      noDetails: "Aucun détail trouvé.",

      meta: {
        positions: "pos.",
        reference: "Réf.",
        delivery: "Livraison",
        productFallback: "Produit",
        more: "… et {count} autres",
      },

      error: {
        excel: "Échec de l’export Excel",
        pdf: "Échec de l’export PDF",
      },
    },
  },

  /* 🇮🇹 Italiano */
  it: {
    nav: {
      order: "Ordine",
      sales: "Vendite",
      project: "Progetto",
      support: "Supporto",
      instantDiscount: "Sconto immediato",
      info: "Informazioni",
      password: "Cambia password",      
      logout: "Logout",
      dashboard: "P5connect Dashboard",
      dashboardTitle: "connect Dashboard",
      backToDashboard: "Torna alla dashboard",

    },

    passwordForgot: "Password dimenticata?",

    dealer: {
      infoTitle: "📋 Informazioni sul rivenditore",
      shop: "Negozio",
      company: "Azienda",
      address: "Indirizzo",
      city: "CAP / Città",
      email: "E-mail",
      phone: "Telefono",
      loading: "⏳ Caricamento dati del rivenditore...",
      notfound: "❌ Rivenditore non trovato",
    },

    project: projectIt,

    product: {
      search: "🔍 Cerca per articolo, nome o EAN...",
      groups: { all: "Tutti i gruppi" },
      categories: { all: "Tutte le categorie" },
      sort: {
        sony_article_asc: "Numero articolo (crescente)",
        sony_article_desc: "Numero articolo (decrescente)",
        name_asc: "Nome (A–Z)",
        name_desc: "Nome (Z–A)",
      },
      reset: "Ripristina",
    },

    support: supportIt,

    admin: {
      promotions: "Promozioni",
      instantDiscount: "Sconto immediato",
      projects: "Progetti",
      orders: "Ordini",
      support: "Supporto",
      monthlyOffers: "Offerte mensili",
      reports: "Report / Analisi dei dati",
      info: "Informazioni importanti",
      actAsDealer: "Agisci come rivenditore",
    },

    bestprice: {
      "page.title": "Ordine al miglior prezzo",
      heading: "Ordine al miglior prezzo",
      addToCart: "Aggiungi al carrello",
    },

    pricing: {
      uvpGross: "Prezzo consigliato (lordo)",
      ekNormal: "Prezzo d’acquisto normale",
      marketPricesCurrent: "Prezzi di mercato (attuali)",
      notAvailable: "non disponibile",
      priceNet: "Prezzo (CHF, escl. IVA & tasse)",
      bestPrice: "Miglior prezzo (incl. IVA)",
    },

    sales: {
      "page.title": "Segnalare vendite",
      heading: "Segnalare vendite",
      manual: "Segnala manualmente",
      upload: "Upload CSV / Excel",
      uploadTemplate: "Modello CSV",
      next: "Avanti",
      back: "Indietro",
      clearCsv: "Svuota CSV",
      modalTitle: "Segnalare vendita",
      quantity: "Quantità",
      priceOptional: "Prezzo (opzionale)",
      date: "Data",
      inhouseShare: "Inhouse share (%)",
      calendarWeek: "Settimana",
      noteForAllProducts:
        "Valido automaticamente per tutti i prodotti in questa segnalazione.",
      noteForUpload:
        "Valido automaticamente per tutte le righe del file caricato.",
      totalQuantity: "Quantità totale",
      totalRevenue: "Fatturato totale",
      reportSale: "Invia segnalazione vendite",
    },

    upload: {
      dropzoneText:
        "Trascina qui il file oppure clicca per selezionarlo dal disco",
      chooseFile: "Seleziona file",
    },
    sofortrabatt: sofortrabattIt,
    instant: {
      "page.title": "Richiedi sconto immediato",
      heading: "Richiedi sconto immediato",
      step1: "1. Seleziona la TV",
      step2: "2. Seleziona il livello di sconto",
      step3: "3. Seleziona la soundbar",
      levelSingle: "Single (solo TV)",
      levelDouble: "Double (TV + soundbar)",
      levelTriple: "Triple (TV + soundbar + subwoofer)",
      addToCart: "Aggiungi al carrello",
    },

    infos: {
      title: "Supporto e informazioni di contatto",

      support: {
        title: "Supporto tecnico",
        hours: "Lunedì – Venerdì, 09:00–18:00",
        phone: "Telefono",
        email: "E-mail",
        moreHelp: "Ulteriore assistenza direttamente da Sony:",
      },

      sales: {
        internal: "Vendite interne",
        kam: "Contatti vendita",
      },

      downloads: {
        title: "Download",
        sertronics: "Registrazione Sertronics",
      },
    },


    checkout: {
      "page.title": "Ordine al miglior prezzo",
      mainDistributor: "Distributore principale",
      defaultVia: "Standard tramite",
      orderDetails: "Dati dell’ordine",
      delivery: "Consegna",
      deliveryDateOptional: "Data di consegna (facoltativa)",
      comment: "Informazioni importanti per l’ordine (commento)",
      referenceNumber: "N. ordine / riferimento",
      differentDeliveryAddress:
        "Indirizzo di consegna diverso / consegna diretta",
      pleaseSelect: "Seleziona",
      cheapestSupplier: "Fornitore più conveniente",
      cheapestPrice: "Prezzo migliore (incl. IVA)",
      summaryTotal: "Totale",
      summaryTotalPrice: "Prezzo totale",
      unitPiece: "pezzo",
      submitOrder: "Invia ordine",
    },
    productCard: {
      unknownModel: "Modello sconosciuto",
      ean: "EAN",
      mainDistributor: "Distributore principale:",
      distributorRequired: "Distributore (obbligatorio)",
      distributorSelect: "Seleziona",
      uvpGross: "Prezzo consigliato (lordo)",
      ekNormal: "Prezzo rivenditore standard",
      marketPricesCurrent: "Prezzi di mercato (attuali):",
      loading: "caricamento…",
      notAvailable: "non disponibile",
      lastChecked: "Aggiornato:",
      amount: "Quantità",
      priceNet: "Prezzo (CHF, excl. IVA & RAEE)",
      saving: "risparmiato",
      added: "Prodotto aggiunto",
      addToCart: "Aggiungi al carrello"
    },
    cart: {
      "button.cart": "Carrello",
      "button.items": "({count})",

      "title.cart": "Ordine al miglior prezzo",

      "dealer.customerNumber": "N. cliente",
      "dealer.contactPerson": "Contatto",
      "dealer.phone": "Telefono",
      "dealer.kam": "KAM",

      "success.saved": "Ordine salvato!",
      "success.close": "Chiudi",

      "empty.noProducts": "Nessun prodotto selezionato.",

      "mainDistributor.title": "Distributore principale",
      "mainDistributor.placeholder": "Seleziona",
      "mainDistributor.defaultHint": "Standard tramite ElectronicPartner Svizzera SA.",

      "orderInfo.title": "Informazioni sull’ordine",
      "orderInfo.delivery": "Consegna",
      "orderInfo.delivery.sofort": "Immediata",
      "orderInfo.delivery.termin": "Programmato",
      "orderInfo.deliveryDate": "Data di consegna (opzionale)",
      "orderInfo.comment": "Informazioni importanti (commento)",
      "orderInfo.comment.placeholder": "es. 'Consegna obbligatoria entro il 15/10'…",
      "orderInfo.referenceNumber": "N. ordine / riferimento",
      "orderInfo.reference.placeholder": "es. 45001234",

      "altDelivery.title": "Indirizzo di consegna diverso / consegna diretta",
      "altDelivery.name": "Nome / Azienda",
      "altDelivery.street": "Via / N.",
      "altDelivery.zip": "CAP",
      "altDelivery.city": "Località",
      "altDelivery.country": "Paese",
      "altDelivery.phone": "Telefono (opzionale)",
      "altDelivery.email": "E-mail (opzionale)",

      "product.ean": "EAN",
      "product.remove": "Rimuovi",
      "product.amount": "Quantità",
      "product.price": "Prezzo (CHF)",
      "product.normalPrice": "Prezzo normale",
      "product.saved": "{chf} CHF risparmiati ({percent}%)",
      "product.special": "Distribuzione speciale",

      "streetprice.bestProvider": "Rivenditore più economico",
      "streetprice.provider.other": "Altro",
      "streetprice.providerName": "Nome rivenditore *",
      "streetprice.providerName.placeholder": "Nome negozio",
      "streetprice.providerName.hint": "Obbligatorio se è selezionato «Altro».",
      "streetprice.bestPriceGross": "Prezzo più basso (incl. IVA)",

      "product.disti.required": "Distributore (obbligatorio)",
      "product.disti.placeholder": "Seleziona",

      "footer.total": "Totale:",
      "footer.totalPieces": "{count} pezzi",
      "footer.totalPrice": "Prezzo totale:",
      "footer.savings": "Risparmio totale: {amount} CHF",
      "footer.submit": "Invia ordine",
      "footer.sending": "⏳ Invio…",

      "toast.noDealer": "❌ Rivenditore non trovato – accedi nuovamente.",
      "toast.needDistributor": "❌ Seleziona un distributore principale.",
      "toast.needValidDate": "Inserisci una data valida (AAAA-MM-GG).",
      "toast.invalidQuantity.title": "Valore non valido",
      "toast.invalidQuantity.text": "Inserisci una quantità valida per {product}!",
      "toast.missingDisti.title": "❌ Distributore mancante",
      "toast.missingDisti.text": "Seleziona un distributore per {product}.",
      "toast.missingSourceName.title": "❌ Rivenditore mancante",
      "toast.missingSourceName.text": "Indica il rivenditore quando scegli «Altro» per {product}.",
      "toast.unknownDisti.title": "❌ Codice distributore sconosciuto",
      "toast.unknownDisti.text": "Il distributore «{code}» non esiste.",
      "toast.success.title": "✅ Ordine salvato",
      "toast.success.text": "L’ordine è stato inviato con successo.",
      "toast.error.title": "❌ Errore salvataggio",
      "toast.error.text": "Errore sconosciuto",
    },
          /* 🇩🇪 E-Mail Labels → müssen HIER rein! */
    email: {
        firmendaten: "Dati dell’azienda",
        ansprechperson: "Persona di contatto",
        email: "E-mail",
        telefon: "Telefono",
        kundenNr: "N. cliente",
        kam: "KAM",
        kamEmail: "E-mail KAM",
        lieferoption: "Opzione di consegna",
        lieferdatum: "Data di consegna prevista",
        lieferadresseWarn: "⚠️ Attenzione: indirizzo di consegna diverso (consegna diretta)",
        lieferadresse: "Indirizzo di consegna",
        kommentar: "Commento del rivenditore",
        bestellpositionen: "Posizioni dell’ordine",
        bestellweg: "Modalità dell’ordine",
        haendlerReferenz: "Vostra referenza rivenditore",
        bestellNr: "N. ordine P5",
        sofort: "Immediato",
        geplant: "Consegna programmata",
    },
    login: {
      welcome: "Benvenuto nella pagina di accesso",
      portalTitle: "Portale Partner P5connect",
      portalDesc:
        "Accesso protetto riservato ai partner commerciali registrati per l’invio di dati di vendita, richieste di progetto e ordini.",
      securityNote:
        "La connessione è crittografata. Le credenziali di accesso non vengono condivise con terze parti.",

      loginNr: "Numero di accesso",
      loginNrPlaceholder: "Inserire il numero di accesso",
      password: "Password",
      passwordPlaceholder: "Inserire la password",
      login: "Accedi",

      error: {
        unknownLogin: "Numero di accesso sconosciuto.",
        noEmail: "Nessun indirizzo e-mail registrato per questo partner.",
        failed: "Accesso non riuscito. Controllare numero di accesso e password.",
      },

      footerLine1: "© {year} P5connect.ch – Zurigo, Svizzera",
      footerLine2: "support@p5connect.ch",
      legalImprint: "Note legali",
      legalPrivacy: "Privacy",

      footer: "Accesso consentito solo ai partner registrati.",
    },


    /* Passwort change */    
    auth: {
      reset: {
        title: "Imposta una nuova password",
        newPassword: "Nuova password",
        confirm: "Conferma password",
        submit: "Cambia password",

        invalidLink: "❌ Errore: link di reset mancante o non valido.",
        expired: "❌ Il link non è valido o è scaduto.",
        noSession: "❌ Errore: sessione di autenticazione non disponibile.",
        mismatch: "❌ Le password non coincidono.",
        short: "❌ La password deve contenere almeno 8 caratteri.",
        success: "✅ Password modificata con successo!",
      },
    },
      activity: {
        title: "Attività recenti",
        loading: "Caricamento attività…",
        empty: "Nessuna voce per il periodo selezionato.",
        status: {
          pending: "in sospeso",
          approved: "approvato",
          rejected: "rifiutato",
          unknown: "—",
        },
      },
      history: {
        header: {
          all: "Attività recenti",
          verkauf: "Vendite recenti",
          bestellung: "Ordini recenti",
          projekt: "Progetti recenti",
          support: "Richieste di supporto recenti",
          sofortrabatt: "Sconti immediati recenti",
        },

        actions: {
          excel: "Excel",
          excelTitle: "Scarica lo storico in Excel",
          viewAll: "Visualizza lo storico completo →",
          pdfTitle: "Scarica PDF",
        },

        empty: "Nessuna voce trovata.",
        loadingDetails: "Caricamento dettagli…",
        noDetails: "Nessun dettaglio trovato.",

        meta: {
          positions: "art.",
          reference: "Rif.",
          delivery: "Consegna",
          productFallback: "Prodotto",
          more: "… e altri {count}",
        },

        error: {
          excel: "Esportazione Excel non riuscita",
          pdf: "Esportazione PDF non riuscita",
        },
    },

  },

  /* 🇷🇲 Rumantsch */
  rm: {
    nav: {
      order: "Cumanda",
      sales: "Vendita",
      project: "Project",
      support: "Support",
      instantDiscount: "Rabatt immediat",
      info: "Infurmaziuns",
      password: "Midar pled-clav",      
      logout: "Sortir",
      dashboard: "P5connect Dashboard",
      dashboardTitle: "connect Dashboard",
      backToDashboard: "Turnar al dashboard",

    },

    passwordForgot: "Emblidà il pled-clav?",

    dealer: {
      infoTitle: "📋 Infurmaziuns dal commerziant",
      shop: "Butia",
      company: "Fatschenta",
      address: "Adressa",
      city: "PLZ / Lieu",
      email: "E-mail",
      phone: "Telefon",
      loading: "⏳ Chargiar las datas dal commerziant...",
      notfound: "❌ Commerziant betg chattà",
    },
    
    project: projectRm,
    
    product: {
      search: "🔍 Tschertgar tenor artitgel, num u EAN...",
      groups: { all: "Tut las gruppas" },
      categories: { all: "Tuttas las categorias" },
      sort: {
        sony_article_asc: "Numer d’artitgel (ascendent)",
        sony_article_desc: "Numer d’artitgel (descendent)",
        name_asc: "Num (A–Z)",
        name_desc: "Num (Z–A)",
      },
      reset: "Redefinir",
    },

    support: supportRm,
    
    admin: {
      promotions: "Promoziuns",
      instantDiscount: "Rabatt immediat",
      projects: "Projects",
      orders: "Cumandas",
      support: "Sustegn",
      monthlyOffers: "Offertas dal mais",
      reports: "Rapports / Analisa da datas",
      info: "Infurmaziuns impurtantas",
      actAsDealer: "Agir sco commerziant",
    },

    bestprice: {
      "page.title": "Cumanda al meglier pretsch",
      heading: "Cumanda al meglier pretsch",
      addToCart: "Agiuntar en il chart",
    },

    pricing: {
      uvpGross: "PRA (brut)",
      ekNormal: "Pretsch d’acquist normal",
      marketPricesCurrent: "Pretschs dal martgà (actuals)",
      notAvailable: "betg disponibel",
      priceNet: "Pretsch (CHF, senza TVA & taxas)",
      bestPrice: "Meglier pretsch (incl. TVA)",
    },

    sales: {
      "page.title": "Annunziar datas da vendita",
      heading: "Annunziar datas da vendita",
      manual: "Annunziar manualmain",
      upload: "Telechargiar CSV / Excel",
      uploadTemplate: "Model CSV",
      next: "Enavant",
      back: "Enavos",
      clearCsv: "Stizzar il CSV",
      modalTitle: "Annunziar vendita",
      quantity: "Quantitad",
      priceOptional: "Pretsch (opziunal)",
      date: "Data",
      inhouseShare: "Inhouse share (%)",
      calendarWeek: "Emna dal chalender",
      noteForAllProducts:
        "Vala automaticamain per tut ils products en questa annunzia.",
      noteForUpload:
        "Vala automaticamain per tut las lingias dal datoteca telechargiada.",
      totalQuantity: "Quantitad totala",
      totalRevenue: "Svessa totala",
      reportSale: "Trametter l’annunzia da vendita",
    },

    upload: {
      dropzoneText:
        "Tirar il datotec qua ni cliccar per tscherner ina datoteca",
      chooseFile: "Tscherner datoteca",
    },
    sofortrabatt: sofortrabattRm,
    instant: {
      "page.title": "Dumandar rabatt immediat",
      heading: "Dumandar rabatt immediat",
      step1: "1. Tscherner TV",
      step2: "2. Tscherner nivel da rabatt",
      step3: "3. Tscherner soundbar",
      levelSingle: "Single (mo TV)",
      levelDouble: "Double (TV + soundbar)",
      levelTriple: "Triple (TV + soundbar + subwoofer)",
      addToCart: "Agiuntar en il chart",
    },

    infos: {
      title: "Support & infurmaziuns da contact",

      support: {
        title: "Support tecnic",
        hours: "Glindesdi – venderdi, 09:00–18:00",
        phone: "Telefon",
        email: "E-mail",
        moreHelp: "Ulteriura agid direct da Sony:",
      },

      sales: {
        internal: "Vendita interna",
        kam: "Contacts da vendita",
      },

      downloads: {
        title: "Telechargiaziuns",
        sertronics: "Annunzia Sertronics",
      },
    },


    checkout: {
      "page.title": "Cumanda al meglier pretsch",
      mainDistributor: "Distribuider principal",
      defaultVia: "Standard via",
      orderDetails: "Detagls da la cumanda",
      delivery: "Furniziun",
      deliveryDateOptional: "Data da furniziun (opziunala)",
      comment: "Infurmaziuns impurtantas per questa cumanda (commentari)",
      referenceNumber: "Vossa nr. da cumanda / referenza",
      differentDeliveryAddress:
        "Autra adressa da furniziun / furniziun directa",
      pleaseSelect: "Tscherna p.pl.",
      cheapestSupplier: "Furnitur il pli bunmarchà",
      cheapestPrice: "Meglier pretsch (incl. TVA)",
      summaryTotal: "Total",
      summaryTotalPrice: "Pretsch total",
      unitPiece: "toc",
      submitOrder: "Trametter la cumanda",
    },
    productCard: {
      unknownModel: "Model nunenconschent",
      ean: "EAN",
      mainDistributor: "Distribitur principal:",
      distributorRequired: "Distribitur (obligatori)",
      distributorSelect: "Tscherna p.pl.",
      uvpGross: "PReC cunsiglià (brut)",
      ekNormal: "Prez da vendita standard",
      marketPricesCurrent: "Prezs da martgà (actuals):",
      loading: "chargia…",
      notAvailable: "betg disponibel",
      lastChecked: "Actualisà:",
      amount: "Quantitad",
      priceNet: "Prez (CHF, senza TVA & taxas)",
      saving: "spartgà",
      added: "Product agiuntà",
      addToCart: "Agiuntar al charell"
    },
      cart: {
    "button.cart": "Carschun",
    "button.items": "({count})",

    "title.cart": "Cumanda al meglier pretsch",

    "dealer.customerNumber": "Nr. client",
    "dealer.contactPerson": "Persuna da contact",
    "dealer.phone": "Telefon",
    "dealer.kam": "KAM",

    "success.saved": "Cumanda memorisada!",
    "success.close": "Serrar",

    "empty.noProducts": "Anc nagins products tschernids.",

    "mainDistributor.title": "Distribitur principal",
    "mainDistributor.placeholder": "Tscherna",
    "mainDistributor.defaultHint":
      "Standard via ElectronicPartner Svizra SA.",

    "orderInfo.title": "Infurmaziuns da cumanda",
    "orderInfo.delivery": "Livrativa",
    "orderInfo.delivery.sofort": "Immediat",
    "orderInfo.delivery.termin": "Terminà",
    "orderInfo.deliveryDate": "Data da livrativa (optional)",
    "orderInfo.comment": "Infurmaziuns impurtantas (commentari)",
    "orderInfo.comment.placeholder":
      "p.ex. 'Sto vegnir furnì fin ils 15.10'…",
    "orderInfo.referenceNumber": "Voss nr. da cumanda / referenza",
    "orderInfo.reference.placeholder": "p.ex. 45001234",

    "altDelivery.title": "Adresa da livrativa differenta / direct",
    "altDelivery.name": "Num / Firma",
    "altDelivery.street": "Via / Nr.",
    "altDelivery.zip": "PLZ",
    "altDelivery.city": "Lieu",
    "altDelivery.country": "Pajais",
    "altDelivery.phone": "Telefon (optional)",
    "altDelivery.email": "E-mail (optional)",

    "product.ean": "EAN",
    "product.remove": "Allontanar",
    "product.amount": "Quantitad",
    "product.price": "Pretsch (CHF)",
    "product.normalPrice": "Pretsch normal",
    "product.saved": "{chf} CHF spargnads ({percent}%)",
    "product.special": "Distribuziun speziala",

    "streetprice.bestProvider": "Furnitur il pli bunmarchà",
    "streetprice.provider.other": "Auter",
    "streetprice.providerName": "Num dal furnitur *",
    "streetprice.providerName.placeholder": "Num da la butia",
    "streetprice.providerName.hint":
      "Obligatori sche «Auter» è tschernì.",
    "streetprice.bestPriceGross": "Pretsch il pli bass (incl. MWST)",

    "product.disti.required": "Distribitur (obligatori)",
    "product.disti.placeholder": "Tscherna",

    "footer.total": "Total:",
    "footer.totalPieces": "{count} tocs",
    "footer.totalPrice": "Pretsch total:",
    "footer.savings": "Spargn total: {amount} CHF",
    "footer.submit": "Trametter cumanda",
    "footer.sending": "⏳ Tramett…",

    "toast.noDealer": "❌ Betg chattà in commerziant – login danovamain.",
    "toast.needDistributor": "❌ Tscherna in distributur.",
    "toast.needValidDate": "Endatescha ina data valida (AAAA-MM-DD).",
    "toast.invalidQuantity.title": "Valur nunvalida",
    "toast.invalidQuantity.text": "Endatescha ina quantitad valida per {product}!",
    "toast.missingDisti.title": "❌ Mancanza da distributur",
    "toast.missingDisti.text": "Tscherna in distributur per {product}.",
    "toast.missingSourceName.title": "❌ Furnitur mancant",
    "toast.missingSourceName.text":
      "Inditgar il furnitur cura che «Auter» è tschernì per {product}.",
    "toast.unknownDisti.title": "❌ Code da distributur nunenconuschent",
    "toast.unknownDisti.text": "Il distributur «{code}» n'exista betg.",
    "toast.success.title": "✅ Cumanda memorisada",
    "toast.success.text": "La cumanda è vegnida transmesscha cun success.",
    "toast.error.title": "❌ Sbagl da memorisar",
    "toast.error.text": "Sbagl nunenconuschent",
  },
            /* 🇩🇪 E-Mail Labels → müssen HIER rein! */
  email: {
      firmendaten: "Datas da l'interpresa",
      ansprechperson: "Persuna da contact",
      email: "E-mail",
      telefon: "Telefon",
      kundenNr: "Nr. client",
      kam: "KAM",
      kamEmail: "E-mail KAM",
      lieferoption: "Opziun da furniziun",
      lieferdatum: "Data previsa da furniziun",
      lieferadresseWarn: "⚠️ Attenziun: Adressa da furniziun differenta (furniziun directa)",
      lieferadresse: "Adresa da furniziun",
      kommentar: "Commentari dal vendaider",
      bestellpositionen: "Posiziuns da l’ordinaziun",
      bestellweg: "Metoda d'ordinaziun",
      haendlerReferenz: "Vossa referenza dal venditaider",
      bestellNr: "Nr. d’ordinaziun P5",
      sofort: "Immediat",
      geplant: "Furniziun planisada",
  },
  login: {
    welcome: "Bainvegni sin la pagina d’access",
    portalTitle: "Portal partenari P5connect",
    portalDesc:
      "Access segirà per partenaris commerzials registrads per trametter cifras da vendita, dumondas da project e empustaziuns.",
    securityNote:
      "Questa connexiun è criptada. Datas d’access na vegnan betg dadas vinavant a terzs.",

    loginNr: "Numer d’access",
    loginNrPlaceholder: "Endatescha il numer d’access",
    password: "Pled-clav",
    passwordPlaceholder: "Endatescha il pled-clav",
    login: "S’annunziar",

    error: {
      unknownLogin: "Numer d’access nunenconuschent.",
      noEmail: "Naginas datas d’e-mail registradas per quest partenari.",
      failed: "L’annunzia n’è betg reussida. Controllescha numer d’access e pled-clav.",
    },

    footerLine1: "© {year} P5connect.ch – Turitg, Svizra",
    footerLine2: "support@p5connect.ch",
    legalImprint: "Impressum",
    legalPrivacy: "Protecziun da datas",

    footer: "Access mo per partenaris registrads.",
  },

    /*passwort change*/
    auth: {
      reset: {
        title: "Fixar in nov pled-clav",
        newPassword: "Nov pled-clav",
        confirm: "Confermar il pled-clav",
        submit: "Midar il pled-clav",

        invalidLink: "❌ Errur: il link da reset manca u n’è betg valaivel.",
        expired: "❌ Il link è nunvalaivel u è scrudà.",
        noSession: "❌ Errur: nagina session d’autentificaziun disponibla.",
        mismatch: "❌ Ils pleds-clav na correspundan betg.",
        short: "❌ Il pled-clav sto cuntegnair almain 8 cars.",
        success: "✅ Il pled-clav è vegnì midà cun success!",
      },
    },
      activity: {
        title: "Activitads novitads",
        loading: "Chargiar las activitads…",
        empty: "Naginas entradas per il temp tschernì.",
        status: {
          pending: "pendenta",
          approved: "approvada",
          rejected: "refusada",
          unknown: "—",
        },
      },
      history: {
        header: {
          all: "Activitads recentes",
          verkauf: "Venditas recentes",
          bestellung: "Cumandas recentes",
          projekt: "Projects recents",
          support: "Cas da sustegn recents",
          sofortrabatt: "Rabats immediats recents",
        },

        actions: {
          excel: "Excel",
          excelTitle: "Telechargiar l’istorgia sco Excel",
          viewAll: "Veser l’istorgia cumpletta →",
          pdfTitle: "Telechargiar PDF",
        },

        empty: "Naginas entradas chattadas.",
        loadingDetails: "Chargiar detagls…",
        noDetails: "Nagins detagls chattads.",

        meta: {
          positions: "pos.",
          reference: "Ref.",
          delivery: "Furniziun",
          productFallback: "Product",
          more: "… e {count} ulteriurs",
        },

        error: {
          excel: "Export Excel betg reussì",
          pdf: "Export PDF betg reussì",
        },
      }
    
    },
  } as const;

  /* -------------------------------------------------------
    🔥 Rekursive Keys für alle verschachtelten Übersetzungen
  --------------------------------------------------------*/

  type DeepKeys<T, P extends string = ""> =
    T extends object
      ? {
          [K in keyof T & string]:
            T[K] extends string
              ? `${P}${K}`             // direkter Key, z. B. "passwordForgot"
              : `${P}${K}` | DeepKeys<T[K], `${P}${K}.`>; // verschachtelte Keys
        }[keyof T & string]
      : never;

  export type TranslationKey = DeepKeys<typeof translationsByLang["de"]>;

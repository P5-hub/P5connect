export const admin = {
  promotions: "Promotions",
  instantDiscount: "Sofortrabatt",
  projects: "Projekte",
  orders: "Bestellungen",
  support: "Support",
  monthlyOffers: "Monatsaktionen",
  reports: "Reports",
  info: "Infos",
  actAsDealer: "Als Händler agieren",

  common: {
    logout: "Logout",
    language: "Sprache",
    navigation: "Navigation",
    adminMenu: "Admin Menü",
    open: "Öffnen",
    close: "Schliessen",
    save: "Speichern",
    cancel: "Abbrechen",
    loading: "Speichere...",
    myLogin: "Mein Login",
    show: "Anzeigen",
    hide: "Verbergen",
    searchDealer: "Händler suchen...",
    pendingItems: "Offene Punkte",
  },

  account: {
    button: "🔐 Login / Passwort",
    modalTitle: "Login / Passwort ändern",
    currentLogin: "Aktueller Login / LoginNr *",
    currentLoginPlaceholder: "z.B. VAdminP5 oder Händler-LoginNr",
    newLogin: "Neuer Login (optional)",
    newLoginPlaceholder: "Leer lassen, wenn Login gleich bleiben soll",
    newLoginHint: "Erlaubt: Buchstaben, Zahlen, „-“, „_“.",
    newPassword: "Neues Passwort *",
    newPasswordPlaceholder: "Mindestens 6 Zeichen",
    generatePassword: "Zufallspasswort erzeugen",
    passwordGenerated: "Zufallspasswort generiert.",
    passwordGeneratedCopied: "Zufallspasswort generiert und kopiert.",
    loginRequired: "Login / LoginNr ist erforderlich.",
    passwordMinLength: "Das neue Passwort muss mindestens 6 Zeichen haben.",
    invalidLoginFormat:
      "Neuer Login darf nur Buchstaben, Zahlen, '-' und '_' enthalten.",
    updateFailed: "Unbekannter Fehler bei der Aktualisierung.",
    requestFailed: "Fehler beim Senden der Anfrage.",
    successDefault: "Zugang erfolgreich aktualisiert.",
    successLogin: "Login erfolgreich aktualisiert.",
    successPassword: "Passwort erfolgreich aktualisiert.",
    successLoginAndPassword: "Login und Passwort erfolgreich aktualisiert.",
    reloginNow: "Du wirst jetzt neu angemeldet...",
    logoutRunning: "Abmeldung läuft...",
    confirmTitle: "Änderung bestätigen",
    confirmLoginChange: 'Sie ändern den Login von "{old}" auf "{new}". Fortfahren?',
    confirmPasswordChange: "Sie setzen ein neues Passwort. Fortfahren?",
    confirmLoginAndPasswordChange:
      'Sie ändern den Login von "{old}" auf "{new}" und setzen zusätzlich ein neues Passwort. Fortfahren?',
  },

  users: {
    title: "Benutzerverwaltung",
    updateExisting: "Bestehenden Benutzer aktualisieren",
    createNew: "Neuen Benutzer anlegen",
    oldLogin: "Alter Login (login_nr)",
    newLogin: "Neuer Login (login_nr)",
    newPasswordOptional: "Neues Passwort (optional)",
    updateButton: "Benutzer aktualisieren",
    updating: "Aktualisiere...",
    signingOut: "Melde ab...",
    createButton: "Benutzer erstellen",
    creating: "Erstelle...",
    loginNr: "Login-Nr (login_nr)",
    email: "E-Mail",
    password: "Passwort",
    name: "Name",
    optional: "optional",
    role: "Rolle",
    dealer: "Händler",
    admin: "Admin",
    ownAccessChanged:
      "Dein eigener Zugang wurde geändert. Du wirst jetzt abgemeldet...",
    loginChangedSuccess: "Login wurde erfolgreich aktualisiert.",
    passwordChangedSuccess: "Passwort wurde erfolgreich aktualisiert.",
    loginAndPasswordChangedSuccess:
      "Login und Passwort wurden erfolgreich aktualisiert.",
    userUpdatedSuccess: "Benutzer erfolgreich aktualisiert.",
    userCreatedSuccess: "Benutzer erfolgreich erstellt.",
    updateError: "Fehler beim Aktualisieren.",
    createError: "Fehler beim Erstellen.",
  },
  aktionen: {
    description:
      "Übersicht aller aktiven oder abgelaufenen Promotionen. Du kannst den Status ändern oder Aktionen aktivieren/deaktivieren.",
  },
  bestellungen: {
    searchPlaceholder:
      "Suche Bestellung (Händler, E-Mail, #ID, Kampagne)…",
    open: "Offen",
    approved: "Bestätigt",
    rejected: "Abgelehnt",
    all: "Alle",
    reload: "Neu laden",
    type: "Typ",
    allTypes: "Alle Typen",
    onlyMesse: "Nur Messe",
    onlyDisplay: "Nur Display",
    onlyStandard: "Nur Standard",
    loading: "Lade Bestellungen…",
    empty: "Keine Bestellungen gefunden.",
    unknownDealer: "Unbekannter Händler",
    fromProject: "aus Projekt",
    pos: "Pos.",
    statusApproved: "Bestätigt",
    statusRejected: "Abgelehnt",
    statusPending: "Offen",
    messeOrder: "Messebestellung",
  },
  adminProject: {
    detail: {
      title: "Projektanfrage",
      loading: {
        data: "Lade Daten…",
      },
      sections: {
        dealer: "Händler",
        projectInfo: "Projektinformationen",
        comment: "Kommentar",
        projectFiles: "Projektbelege",
        projectHistory: "Projektverlauf",
      },
      labels: {
        untitled: "(ohne Titel)",
        customerNumber: "Kd.-Nr.",
        projectNumber: "Projekt-Nr.",
        type: "Typ",
        customer: "Kunde",
        location: "Ort",
        period: "Zeitraum",
        status: "Status:",
        unknownProduct: "Produkt",
        created: "erstellt",
      },
      table: {
        product: "Produkt",
        quantity: "Menge",
        counterOffer: "Betrag / Gegenofferte",
        total: "Total",
      },
      actions: {
        back: "Zurück",
        upload: "Upload",
        uploading: "Lädt…",
        view: "Anzeigen",
      },
      status: {
        approved: "✅ Bestätigt",
        rejected: "❌ Abgelehnt",
        pending: "⏳ Offen",
      },
      empty: {
        noFiles: "Keine Dateien vorhanden.",
      },
      success: {
        fileUploaded: "Datei erfolgreich hochgeladen.",
        counterOfferSavedApproved: "Gegenofferte gespeichert und Projekt genehmigt.",
        projectApproved: "Projekt genehmigt.",
        projectRejected: "Projekt abgelehnt.",
        projectReset: "Projekt zurückgesetzt.",
      },
      errors: {
        requestLoadFailed: "Projektanfrage konnte nicht geladen werden.",
        requestNotFound: "Projektanfrage nicht gefunden.",
        projectLoadFailed: "Projekt konnte nicht geladen werden.",
        projectNotFound: "Projekt nicht gefunden.",
        productsLoadFailed: "Produkte konnten nicht geladen werden.",
        loadGeneric: "Fehler beim Laden der Projektdaten.",
        fileOpenFailed: "Datei konnte nicht geöffnet werden.",
        uploadFailed: "Upload fehlgeschlagen.",
        fileDbSaveFailed: "Datei wurde hochgeladen, aber nicht in der Datenbank gespeichert.",
        priceSaveFailed: "Preis für {product} konnte nicht gespeichert werden.",
        statusUpdateFailed: "Status konnte nicht aktualisiert werden.",
        actionFailed: "Aktion konnte nicht ausgeführt werden.",
        noRecord: "Kein Datensatz gefunden.",
      },
    },
  },
  adminPromotions: {
    page: {
      title: "Promotionen verwalten",
      description:
        "Hier erfasst du Promotionen, Messeaktionen und Monatsaktionen für das Frontend.",
    },

    sections: {
      masterData: "1. Stammdaten",
      products: "2. Produkte",
      dealerTargets: "3. Händler-Ziele (optional)",
      bonusTiers: "4. Bonus-Tiers (optional)",
      existingCampaigns: "Bestehende Promotionen / Kampagnen",
    },

    fields: {
      code: "Code",
      name: "Name",
      type: "Typ",
      active: "Aktiv",
      allowDisplay: "Display erlaubt",
      startDate: "Startdatum",
      endDate: "Enddatum",
      description: "Beschreibung",
      dealer: "Händler",
      targetValue: "Zielwert",
      unit: "Einheit",
      currentValue: "Ist-Wert",
      dealerOptional: "Händler optional",
      tierLevel: "Tier-Level",
      threshold: "Threshold",
      bonusType: "Bonus-Typ",
      bonusValue: "Bonus-Wert",
      label: "Label",
    },

    placeholders: {
      code: "z. B. PROMO-TV-2026",
      name: "z. B. Frühlingspromotion",
      description: "Beschreibung / Bedingungen",
      search: "Suche nach Name, Code, Typ, Datum...",
    },

    actions: {
      reset: "Reset",
      save: "Promotion speichern",
      saving: "Speichere...",
      addTarget: "Ziel hinzufügen",
      addBonusTier: "Bonus-Tier hinzufügen",
      reload: "Neu laden",
      activate: "Aktivieren",
      deactivate: "Deaktivieren",
      edit: "Bearbeiten",
      duplicate: "Duplizieren",
      delete: "Löschen",
    },

    select: {
      pleaseChoose: "Bitte wählen...",
    },

    filters: {
      allTypes: "Alle Typen",
      allStatuses: "Alle Stati",
      active: "Aktiv",
      inactive: "Inaktiv",
    },

    types: {
      promotion: "promotion",
      messe: "messe",
      monatsaktion: "monatsaktion",
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
      active: "Aktiv",
      inactive: "Inaktiv",
    },

    labels: {
      noCode: "Kein Code",
      yes: "ja",
      no: "nein",
      to: "bis",
      displayOrders: "Display Orders",
      global: "Global",
      copy: "Kopie",
    },

    loading: {
      campaigns: "Lade Kampagnen…",
    },

    empty: {
      noDealerTargets: "Keine Händler-Ziele definiert.",
      noBonusTiers: "Keine Bonus-Tiers definiert.",
      noCampaigns: "Keine Kampagnen gefunden.",
    },

    validation: {
      nameRequired: "Bitte einen Kampagnennamen eingeben.",
      startDateRequired: "Bitte ein Startdatum wählen.",
      endDateRequired: "Bitte ein Enddatum wählen.",
      endBeforeStart: "Enddatum darf nicht vor dem Startdatum liegen.",
      productRequired: "Bitte mindestens ein Produkt hinzufügen.",
      duplicateProduct: "Ein Produkt wurde mehrfach ausgewählt.",
      targetDealerMissing: "Bei Händler-Zielen fehlt ein Händler.",
      targetValueInvalid: "Bei Händler-Zielen fehlt ein gültiger Zielwert.",
      targetDealerDuplicate: "Ein Händler wurde bei den Zielvorgaben mehrfach verwendet.",
      tierLevelMissing: "Bei Bonus-Tiers fehlt das Tier-Level.",
      thresholdInvalid: "Bei Bonus-Tiers fehlt ein gültiger Threshold-Wert.",
      bonusValueInvalid: "Bei Bonus-Tiers fehlt ein gültiger Bonus-Wert.",
      duplicateTier: "Tier-Level ist doppelt vorhanden.",
    },

    messages: {
      loadError: "Daten konnten nicht geladen werden.",
      saveSuccess: "Promotion / Kampagne erfolgreich gespeichert.",
      saveError: "Die Kampagne konnte nicht gespeichert werden.",
      activated: "Kampagne aktiviert.",
      deactivated: "Kampagne deaktiviert.",
      statusChangeError: "Der Status konnte nicht geändert werden.",
      duplicateSuccess: "Kampagne erfolgreich dupliziert.",
      duplicateError: "Kampagne konnte nicht dupliziert werden.",
      deleteSuccess: "Kampagne erfolgreich gelöscht.",
      deleteError: "Kampagne konnte nicht gelöscht werden.",
      confirmDelete: 'Möchtest du die Kampagne "{name}" wirklich löschen?',
    },
  },
  adminPromotionDetail: {
    page: {
      title: "Promotion bearbeiten",
      subtitle: "Kampagne #{id} bearbeiten und speichern.",
      invalidId: "Ungültige Kampagnen-ID.",
    },

    actions: {
      back: "Zurück",
      reload: "Neu laden",
      save: "Änderungen speichern",
      saving: "Speichere...",
      addTarget: "Ziel hinzufügen",
      addBonusTier: "Bonus-Tier hinzufügen",
    },

    sections: {
      masterData: "1. Stammdaten",
      products: "2. Produkte",
      dealerTargets: "3. Händler-Ziele (optional)",
      bonusTiers: "4. Bonus-Tiers (optional)",
    },

    fields: {
      code: "Code",
      name: "Name",
      type: "Typ",
      active: "Aktiv",
      allowDisplay: "Display erlaubt",
      startDate: "Startdatum",
      endDate: "Enddatum",
      description: "Beschreibung",
      dealer: "Händler",
      targetValue: "Zielwert",
      unit: "Einheit",
      currentValue: "Ist-Wert",
      dealerOptional: "Händler optional",
      tierLevel: "Tier-Level",
      threshold: "Threshold",
      bonusType: "Bonus-Typ",
      bonusValue: "Bonus-Wert",
      label: "Label",
    },

    placeholders: {
      code: "z. B. PROMO-TV-2026",
      name: "z. B. Frühlingspromotion",
      description: "Beschreibung / Bedingungen",
    },

    select: {
      pleaseChoose: "Bitte wählen...",
      global: "Global",
    },

    empty: {
      noDealerTargets: "Keine Händler-Ziele definiert.",
      noBonusTiers: "Keine Bonus-Tiers definiert.",
    },

    loading: {
      campaign: "Lade Kampagne…",
    },

    validation: {
      nameRequired: "Bitte einen Kampagnennamen eingeben.",
      startDateRequired: "Bitte ein Startdatum wählen.",
      endDateRequired: "Bitte ein Enddatum wählen.",
      endBeforeStart: "Enddatum darf nicht vor dem Startdatum liegen.",
      productRequired: "Bitte mindestens ein Produkt hinzufügen.",
      duplicateProduct: "Ein Produkt wurde mehrfach ausgewählt.",
      targetDealerMissing: "Bei Händler-Zielen fehlt ein Händler.",
      targetValueInvalid: "Bei Händler-Zielen fehlt ein gültiger Zielwert.",
      targetDealerDuplicate: "Ein Händler wurde bei den Zielvorgaben mehrfach verwendet.",
      tierLevelMissing: "Bei Bonus-Tiers fehlt das Tier-Level.",
      thresholdInvalid: "Bei Bonus-Tiers fehlt ein gültiger Threshold-Wert.",
      bonusValueInvalid: "Bei Bonus-Tiers fehlt ein gültiger Bonus-Wert.",
      duplicateTier: "Tier-Level ist doppelt vorhanden.",
    },

    messages: {
      loadError: "Kampagne konnte nicht geladen werden.",
      saveSuccess: "Promotion / Kampagne erfolgreich aktualisiert.",
      saveError: "Die Kampagne konnte nicht gespeichert werden.",
    },
  },
  adminReports: {
    title: "Datenexport & Berichte",

    fields: {
      type: "Typ",
      from: "Von",
      to: "Bis",
    },

    placeholders: {
      search: "Produkt oder Händler suchen…",
    },

    actions: {
      exportExcel: "Exportieren (Excel)",
      exportRunning: "Export läuft…",
      reset: "Reset",
    },

    types: {
      bestellung: "Bestellungen",
      verkauf: "Verkäufe",
      projekt: "Projekte",
      support: "Support",
    },

    labels: {
      lastExport: "Letzter Export",
      hint: "Hinweis",
      hintText:
        "Anzeige, KPIs und Excel-Export basieren auf exakt denselben Filtern.",
    },

    messages: {
      exportError: "Export fehlgeschlagen",
    },
  },
  
} as const;
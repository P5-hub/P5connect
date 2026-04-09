export const bestellung = {
  common: {
    unknown: "Unbekannt",
    unknownProduct: "Unbekanntes Produkt",
    remove: "Entfernen",
    reset: "Zurücksetzen",
    close: "Schließen",
    continueShopping: "Weiter einkaufen",
    addToCart: "In den Warenkorb",
    cartOpen: "Warenkorb öffnen",
    loading: "Lädt…",
    quantity: "Anzahl",
    price: "Preis",
    total: "Gesamt",
    totalPrice: "Gesamtpreis",
    summary: "Zusammenfassung",
    pieces: "Stück",
    filesAttached: "{count} Datei(en) angehängt",
  },

  viewMode: {
    both: "Beide anzeigen",
    campaignOnly: "Nur Messeprodukte",
    standardOnly: "Nur Standardprodukte",
  },

  toast: {
    productAddedTitle: "Produkt hinzugefügt",
    productAddedText: "{product} wurde in den Warenkorb gelegt.",

    maxCampaignQtyTitle: "Maximale Aktionsmenge erreicht",
    maxCampaignQtyText:
      "Für {product} sind maximal {count} Stück pro Händler erlaubt.",

    noDealer: "❌ Kein Händler gefunden – bitte neu einloggen.",
    needDistributor: "❌ Bitte Haupt-Distributor auswählen.",
    needValidDate: "Bitte gültiges Lieferdatum (YYYY-MM-DD) wählen.",

    invalidInputTitle: "Ungültige Eingabe",
    invalidQuantityText: "Bitte gültige Menge für {product} eingeben!",

    missingDistributorTitle: "❌ Distributor fehlt",
    missingDistributorText:
      "Bitte Distributor für {product} auswählen.",

    missingProviderTitle: "❌ Anbieter fehlt",
    missingProviderText:
      "Bitte Händlernamen für „Andere“ bei {product} angeben.",

    missingDisplayReasonTitle:
      "Begründung für zusätzliches Display fehlt",
    missingDisplayReasonText:
      "Bitte für {product} im Kommentarfeld angeben, weshalb ein weiteres Display benötigt wird.",

    unknownDistributorCodeTitle:
      "❌ Unbekannter Distributor-Code",
    unknownDistributorCodeText:
      'Distributor "{code}" konnte nicht gefunden werden.',

    orderSavedTitle: "✅ Bestellung gespeichert",
    orderSavedText:
      "Die Bestellung wurde erfolgreich übermittelt.",

    orderSaveErrorTitle: "❌ Fehler beim Speichern",
    orderSaveErrorText: "Unbekannter Fehler",

    displayAlreadyOrderedTitle: "Display bereits bestellt",
    displayAlreadyOrderedText:
      "Für {product} wurde bereits mindestens ein Display bestellt. Bitte im Kommentarfeld begründen, weshalb ein zusätzliches Display benötigt wird (z. B. zweiter Standort).",

    displayLimitReachedTitle: "Display-Limit erreicht",
    displayLimitReachedText:
      "Für {product} sind maximal {max} Display-Stück gültig. Bereits bestellt: {ordered}. Noch frei für diese Position: {free}.",

    totalLimitReachedTitle: "Gesamtlimit erreicht",
    totalLimitReachedText:
      "Für {product} sind maximal {max} Aktions-Stück total gültig. Bereits bestellt: {ordered}. Noch frei für diese Position: {free}.",

    campaignLimitReachedTitle: "{mode}-Limit erreicht",
    campaignLimitReachedText:
      "Für {product} sind noch {allowed} Stück zum {modeLower}preis möglich. Bereits bestellt: {ordered}. {overflow} Stück wurden automatisch als separate Position zum Normalpreis übernommen.",

    campaignExhaustedTitle:
      "{mode}-Kontingent ausgeschöpft",
    campaignExhaustedText:
      "Für {product} ist kein {modeLower}kontingent mehr frei. Bereits bestellt: {ordered}. Die gesamte Menge wurde automatisch zum Normalpreis übernommen.",

    orderNotPossibleTitle: "Bestellung nicht möglich",
    orderNotPossibleText:
      "Die Bestellung konnte nicht gespeichert werden.",

    uploadFailed: "Datei-Upload fehlgeschlagen",

    projectIdCopied: "Projekt-ID kopiert",
  },

  provider: {
    pleaseSelect: "Bitte auswählen",
    cheapestProvider: "Günstigster Anbieter",
    providerName: "Bitte Namen des Anbieters angeben",
    providerNamePlaceholder: "Name des Händlers",
    providerNameRequiredHint:
      "Pflichtfeld bei Auswahl von „Andere“.",
    cheapestPriceGross:
      "Günstigster Preis (inkl. MwSt.)",
    other: "Andere",
  },

  campaign: {
    campaign: "Kampagne",
    activeTradefairCampaign: "Aktive Messekampagne",
    validFromTo: "Gültig von {start} bis {end}",

    campaignProductsCount: "{count} Aktionsprodukte",
    campaignProducts: "Messeprodukte",
    campaignProductsIntro:
      "Diese Produkte sind aktuell Teil der Messeaktion.",
    noCampaignProducts: "Keine Messeprodukte gefunden.",

    badge: {
      display: "Display",
      mixed: "Messe + Display",
      messe: "Messepreis",
      standard: "Aktion",
    },

    pricing: {
      upeGross: "UPE brutto",
      dealerPrice: "Händlerpreis",
      messePriceNet: "Messepreis netto",
      displayPriceNet: "Displaypreis netto",
      pricingMode: "Pricing-Modus",
      pricingModeDisplay: "Display",
      pricingModeMesse: "Messe",
      pricingModeStandard: "Standard",
      discountVsHrp: "Rabatt vs. HRP",
    },

    filters: {
      searchPlaceholder: "Suche nach Artikel, Name, EAN, Marke …",
      allGroups: "Alle Gruppen",
      allCategories: "Alle Kategorien",
    },
    
    progress: {
      title: "Bonus Fortschritt",
      afterSubmit: "Nach Absenden",
      progress: "Fortschritt",
      already: "Bereits",
      cart: "Cart",
      total: "Total",
      nextTier: "Nächste Bonusstufe",
      highestTierReached: "Höchste Bonusstufe erreicht",
      missingToNext: "Es fehlen noch: {amount}",
      noTierAvailable: "Noch keine Bonusstufe verfügbar.",
      bonus: "Bonus",
      level: "Stufe {level}",
    },

    limits: {
      displayMax:
        "Display max. {max} · bereits bestellt {ordered} · noch frei {free}",
      messeMax:
        "Messe max. {max} · bereits bestellt {ordered} · noch frei {free}",
      campaignMax:
        "Aktions max. {max} · bereits bestellt {ordered} · noch frei {free}",
      totalCampaignMax:
        "Total Aktion max. {max} · bereits bestellt {ordered} · noch frei {free}",

      rowDisplayMax:
        "In dieser Display-Position noch max. {count} Stück zum Displaypreis möglich",
      rowMesseMax:
        "In dieser Messe-Position noch max. {count} Stück zum Messepreis möglich",
      rowCampaignMax:
        "In dieser Position noch max. {count} Stück zum Aktionspreis möglich",
    },
  },

  cartSheet: {
    title: "Bestellung zum Bestpreis",
    empty: "Noch keine Produkte ausgewählt.",

    linkedProject: {
      title: "Verknüpftes Projekt",
      customer: "Kunde",
      project: "Projekt",
      open: "Projekt öffnen",
      remove: "Projekt entfernen",
      copied: "Projekt-ID kopiert",
    },

    dealerInfo: {
      title: "Händlerinformationen",
      customerNumber: "Kd-Nr.",
      contactPerson: "AP",
      phone: "Tel.",
      email: "E-Mail",
      city: "Ort",
      kam: "KAM",
    },

    distributor: {
      title: "Haupt-Distributor",
      placeholder: "Bitte auswählen",
      defaultHint:
        "Standardmäßig über ElectronicPartner Schweiz AG.",
    },

    order: {
      title: "Bestellangaben",
      delivery: "Lieferung",
      deliveryImmediate: "Sofort",
      deliveryScheduled: "Zum Termin",
      deliveryDateOptional: "Lieferdatum (optional)",
      comment:
        "Wichtige Infos zur Bestellung (Kommentar)",
      commentPlaceholder:
        "z. B. 'Muss zwingend bis 15.10. geliefert werden'…",
      referenceNumber: "Ihre Bestell-/Referenz-Nr.",
      referencePlaceholder: "z. B. 45001234",
    },

    altDelivery: {
      title:
        "Abweichende Lieferadresse / Direktlieferung",
      useAdditionalAddress:
        "Zusätzliche Lieferadresse verwenden",
      name: "Name / Firma",
      street: "Straße / Nr.",
      zip: "PLZ",
      city: "Ort",
      country: "Land",
      phoneOptional: "Telefon (optional)",
      emailOptional: "E-Mail (optional)",
    },

    files: {
      title: "Dateien zur Bestellung",
      attached: "{count} Datei(en) angehängt",
    },

    summary: {
      title: "Zusammenfassung",
      total: "Gesamt",
      totalPrice: "Gesamtpreis",
      bonusProgress: "Bonus-Fortschritt",
      savings: "Gesamtersparnis: {amount} CHF",
      missingToNext:
        "Noch {amount} bis {tier}",
      highestTierReached:
        "Höchste Bonusstufe erreicht",
      send: "Bestellung absenden",
      sending: "Sende…",
      continueShopping: "Weiter einkaufen",
      pieces: "Stück",
    },

    product: {
      unknown: "Unbekannt",
      ean: "EAN",
      specialDistribution: "Spezialvertrieb",
      bonusRelevant: "Bonusrelevant",
      normalPrice: "Normalpreis",

      quantity: "Anzahl",
      price: "Preis (CHF)",
      ekNormal: "EK normal",
      saved:
        "{amount} CHF gespart ({percent}%)",

      pricingMode: "Pricing-Modus",
      pricingModeDisplay: "Display",
      pricingModeMesse: "Messe",
      pricingModeStandard: "Standard",

      upeGross: "UPE brutto",
      displayPriceNet: "Displaypreis netto",
      messePriceNet: "Messepreis netto",
      discountVsHrp: "Rabatt vs. HRP",

      orderAsDisplay:
        "Als Display bestellen",

      reasonForAdditionalDisplay:
        "Begründung für zusätzliches Display",
      reasonPlaceholder:
        "z. B. zweiter Standort, Umbau, neue Verkaufsfläche …",
      reasonHint:
        "Für dieses Produkt wurde bereits ein Display bestellt. Bitte Zusatzbedarf begründen.",

      cheapestProvider:
        "Günstigster Anbieter",
      providerName:
        "Bitte Namen des Anbieters angeben",
      providerNamePlaceholder:
        "Name des Händlers",
      providerNameHint:
        "Pflichtfeld bei Auswahl von „Andere“.",

      cheapestPriceGross:
        "Günstigster Preis (inkl. MwSt.)",

      distributor: "Distributor",
      distributorPlaceholder:
        "Bitte auswählen",

      remove: "Entfernen",
      other: "Andere",
    },
  },

  preview: {
    title: "Warenkorb-Vorschau",
    positions: "Positionen im Warenkorb",
    quantityTotal: "Menge total",
    cartValue: "Warenwert",
  },

  loading: {
    dealerData: "Händlerdaten werden geladen…",
    campaign: "Lade Messekampagne…",
  },
  
} as const;
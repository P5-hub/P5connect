// utils/translations.ts

export const translations = {
  de: {
    login: "Einloggen",
    loginNr: "Login-Nr.",
    password: "Passwort",
    dashboard: "Dashboard",
    landing: "Händler-Startseite",
    sales: "Verkauf melden",
    project: "Projektanfrage",
    order: "Bestellung zum Bestpreis",
    support: "Support",
    cashback: "Cashback",

    welcomeLogin: "P5connect – Ihr Partnerportal",
    loginSubtitle: "P5connect – exklusiver Zugang für autorisierte Händler.",

    languageLabel: "Sprache / Language",
    heroPortal: "P5connect – Ihr Partnerportal",
    heroPillLive: "Live-Zugang für Händler",
    heroPillDashboard: "Verkaufs-Dashboard & Projektpreise",

    loginNrPlaceholder: "Ihre Login-Nummer",
    passwordPlaceholder: "Ihr Passwort",

    // ⭐ Neue fehlende Keys
    loginTitle: "P5connect – Ihr Partnerportal",
    loginFooter: "Exklusiver Zugang für autorisierte Händler",
    dealerLive: "Live-Zugang für Händler",
  },

  en: {
    login: "Login",
    loginNr: "Login No.",
    password: "Password",
    dashboard: "Dashboard",
    landing: "Dealer Landing",
    sales: "Report Sales",
    project: "Project Request",
    order: "Best Price Order",
    support: "Support",
    cashback: "Cashback",

    welcomeLogin: "P5connect – your partner portal",
    loginSubtitle: "P5connect – exclusive access for authorized dealers.",

    languageLabel: "Language",
    heroPortal: "P5connect – your partner portal",
    heroPillLive: "Live access for dealers",
    heroPillDashboard: "Sales dashboard & project pricing",

    loginNrPlaceholder: "Your login number",
    passwordPlaceholder: "Your password",

    loginTitle: "P5connect – your partner portal",
    loginFooter: "Exclusive access for authorized dealers",
    dealerLive: "Live access for dealers",
  },

  fr: {
    login: "Connexion",
    loginNr: "N° de connexion",
    password: "Mot de passe",
    dashboard: "Tableau de bord",
    landing: "Accueil revendeur",
    sales: "Déclarer des ventes",
    project: "Demande de projet",
    order: "Commande meilleur prix",
    support: "Support",
    cashback: "Cashback",

    welcomeLogin: "P5connect – votre portail partenaires",
    loginSubtitle: "P5connect – accès exclusif pour revendeurs autorisés.",

    languageLabel: "Langue",
    heroPortal: "P5connect – votre portail partenaires",
    heroPillLive: "Accès en direct pour revendeurs",
    heroPillDashboard: "Tableau de bord ventes & prix projets",

    loginNrPlaceholder: "Votre numéro de connexion",
    passwordPlaceholder: "Votre mot de passe",

    loginTitle: "P5connect – votre portail partenaires",
    loginFooter: "Accès exclusif pour revendeurs autorisés",
    dealerLive: "Accès en direct pour revendeurs",
  },

  it: {
    login: "Accedi",
    loginNr: "Nr. login",
    password: "Password",
    dashboard: "Dashboard",
    landing: "Homepage rivenditori",
    sales: "Segnala vendite",
    project: "Richiesta progetto",
    order: "Ordine al miglior prezzo",
    support: "Supporto",
    cashback: "Cashback",

    welcomeLogin: "P5connect – il tuo portale partner",
    loginSubtitle:
      "P5connect – accesso esclusivo per rivenditori autorizzati.",

    languageLabel: "Lingua",
    heroPortal: "P5connect – il tuo portale partner",
    heroPillLive: "Accesso live per rivenditori",
    heroPillDashboard: "Dashboard vendite & prezzi progetto",

    loginNrPlaceholder: "Il tuo numero di login",
    passwordPlaceholder: "La tua password",

    loginTitle: "P5connect – il tuo portale partner",
    loginFooter: "Accesso esclusivo per rivenditori autorizzati",
    dealerLive: "Accesso live per rivenditori",
  },

  rm: {
    login: "S'annunziar",
    loginNr: "Numer da login",
    password: "Pled-clav",
    dashboard: "Tabella da controll",
    landing: "Pagina da partenza per dealers",
    sales: "Annunziar vendita",
    project: "Dumonda da project",
    order: "Cumanda meglier pretsch",
    support: "Support",
    cashback: "Cashback",

    welcomeLogin: "P5connect – voss portal da partenaris",
    loginSubtitle:
      "P5connect – access exclusiv per revenders autorisads.",

    languageLabel: "Lingua",
    heroPortal: "P5connect – voss portal da partenaris",
    heroPillLive: "Access direct per commerziants",
    heroPillDashboard: "Dashboard da vendita & pretschs da projects",

    loginNrPlaceholder: "Voss numer da login",
    passwordPlaceholder: "Voss pled-clav",

    loginTitle: "P5connect – voss portal da partenaris",
    loginFooter: "Access exclusiv per revenders autorisads",
    dealerLive: "Access direct per commerziants",
  },
} as const;


// Types
export type Lang = keyof typeof translations;
export type TranslationKey = keyof typeof translations["de"];


// Sprache aus Cookie / Browser
export function getInitialLang(): Lang {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(^| )lang=([^;]+)/);
    const cookieLang = match?.[2] as Lang | undefined;
    if (cookieLang && cookieLang in translations) return cookieLang;

    const navLang = (navigator.language || "de").slice(0, 2) as Lang;
    if (navLang in translations) return navLang;
  }
  return "de";
}

// Sprache setzen
export function setCurrentLang(lang: Lang) {
  if (typeof document === "undefined") return;
  document.cookie = `lang=${lang}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

// Sprache holen
function getLangFromCookie(): Lang {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(^| )lang=([^;]+)/);
    const cookieLang = match?.[2] as Lang | undefined;
    if (cookieLang && cookieLang in translations) return cookieLang;
  }
  return "de";
}

// Übersetzen
export function _(key: TranslationKey): string {
  const lang = getLangFromCookie();
  return translations[lang]?.[key] || translations["de"][key] || key;
}

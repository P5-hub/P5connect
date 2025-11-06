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
  },
} as const;

// 🔑 Typ für alle Keys
export type TranslationKey = keyof typeof translations["de"];

// Hilfsfunktion: aktuelle Sprache aus Cookie lesen
function getLangFromCookie(): string {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(^| )lang=([^;]+)/);
    if (match?.[2]) return match[2];
  }
  return "de"; // Default
}

// Übersetzungsfunktion mit Typsicherheit
export function _(key: TranslationKey): string {
  const lang = getLangFromCookie();
  return (
    translations[lang as keyof typeof translations]?.[key] ||
    translations["de"][key] ||
    key
  );
}

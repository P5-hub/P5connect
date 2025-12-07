import {
  ShoppingCart,
  BarChart3,
  ClipboardList,
  HandCoins,
  Tag,
} from "lucide-react";

export const cartModes = {
  bestellung: {
    icon: ShoppingCart,
    title: "Bestellung abschicken",
    buttonLabel: "Warenkorb",
    submitLabel: "Bestellung senden",
    successMessage: "Bestellung erfolgreich gesendet!",
  },

  verkauf: {
    icon: BarChart3,
    title: "Verkaufsmeldung",
    buttonLabel: "Verkaufsdaten",
    submitLabel: "Verkäufe melden",
    successMessage: "Verkäufe erfolgreich gemeldet!",
  },

  projekt: {
    icon: ClipboardList,
    title: "Projektanfrage",
    buttonLabel: "Projekt-Anfrage",
    submitLabel: "Projekt absenden",
    successMessage: "Projektanfrage gespeichert!",
  },

  support: {
    icon: HandCoins,
    title: "Support-Antrag",
    buttonLabel: "Support",
    submitLabel: "Support absenden",
    successMessage: "Support-Antrag gespeichert!",
  },

  sofortrabatt: {
    icon: Tag,
    title: "Sofortrabatt einreichen",
    buttonLabel: "Sofortrabatt",
    submitLabel: "Sofortrabatt absenden",
    successMessage: "Sofortrabatt erfolgreich eingereicht!",
  },
} as const;

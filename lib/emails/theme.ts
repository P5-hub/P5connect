export const themes = {
  bestellung: {
    color: "#1E3A8A",
    light: "#EFF6FF",
    border: "#BFDBFE",
  },
  verkauf: {
    color: "#047857",
    light: "#ECFDF5",
    border: "#A7F3D0",
  },
  projekt: {
    color: "#6D28D9",
    light: "#F5F3FF",
    border: "#DDD6FE",
  },
  support: {
    color: "#EA580C",
    light: "#FFF7ED",
    border: "#FED7AA",
  },
  sofortrabatt: {
    color: "#BE185D",
    light: "#FCE7F3",
    border: "#FBCFE8",
  },
  cashback: {
    color: "#2563EB",
    light: "#EFF6FF",
    border: "#BFDBFE",
  },
  default: {
    color: "#374151",
    light: "#F3F4F6",
    border: "#D1D5DB",
  },
};

export function getEmailTheme(formType?: string) {
  return themes[formType as keyof typeof themes] ?? themes.default;
}

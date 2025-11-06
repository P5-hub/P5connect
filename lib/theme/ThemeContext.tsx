"use client";

import { createContext, useContext, useMemo } from "react";
import { usePathname } from "next/navigation";

type Theme = {
  color: string;       // Textfarbe
  bg: string;          // Hauptbuttonfarbe
  bgHover: string;     // Hoverfarbe
  bgLight: string;     // helle Hintergrundfarbe
  border: string;      // Rahmenfarbe
  accent: string;      // Fokus-Highlight
};

const ThemeContext = createContext<Theme>({
  color: "text-gray-700",
  bg: "bg-gray-600",
  bgHover: "hover:bg-gray-700",
  bgLight: "bg-gray-50",
  border: "border-gray-300",
  accent: "focus:ring-gray-400",
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()?.toLowerCase() || "";

  const theme = useMemo<Theme>(() => {
    if (pathname.includes("verkauf"))
      return {
        color: "text-green-600",
        bg: "bg-green-600",
        bgHover: "hover:bg-green-700",
        bgLight: "bg-green-50",
        border: "border-green-300",
        accent: "focus:ring-green-400",
      };
    if (pathname.includes("projekt"))
      return {
        color: "text-purple-600",
        bg: "bg-purple-600",
        bgHover: "hover:bg-purple-700",
        bgLight: "bg-purple-50",
        border: "border-purple-300",
        accent: "focus:ring-purple-400",
      };
    if (pathname.includes("bestellung"))
      return {
        color: "text-blue-600",
        bg: "bg-blue-600",
        bgHover: "hover:bg-blue-700",
        bgLight: "bg-blue-50",
        border: "border-blue-300",
        accent: "focus:ring-blue-400",
      };
    if (pathname.includes("sofortrabatt"))
      return {
        color: "text-pink-600",
        bg: "bg-pink-600",
        bgHover: "hover:bg-pink-700",
        bgLight: "bg-pink-50",
        border: "border-pink-300",
        accent: "focus:ring-pink-400",
      };
    if (pathname.includes("support"))
      return {
        color: "text-orange-600",
        bg: "bg-orange-600",
        bgHover: "hover:bg-orange-700",
        bgLight: "bg-orange-50",
        border: "border-orange-300",
        accent: "focus:ring-orange-400",
      };
    return {
      color: "text-gray-700",
      bg: "bg-gray-600",
      bgHover: "hover:bg-gray-700",
      bgLight: "bg-gray-50",
      border: "border-gray-300",
      accent: "focus:ring-gray-400",
    };
  }, [pathname]);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

/** 🔹 Direkter Zugriff auf Themes z. B. in Formularen */
export function getThemeByForm(formType?: string) {
  switch (formType) {
    case "verkauf":
      return {
        color: "text-green-600",
        bg: "bg-green-600",
        bgHover: "hover:bg-green-700",
        bgLight: "bg-green-50",
        border: "border-green-300",
        accent: "focus:ring-green-400",
      };
    case "projekt":
      return {
        color: "text-purple-600",
        bg: "bg-purple-600",
        bgHover: "hover:bg-purple-700",
        bgLight: "bg-purple-50",
        border: "border-purple-300",
        accent: "focus:ring-purple-400",
      };
    case "bestellung":
      return {
        color: "text-blue-600",
        bg: "bg-blue-600",
        bgHover: "hover:bg-blue-700",
        bgLight: "bg-blue-50",
        border: "border-blue-300",
        accent: "focus:ring-blue-400",
      };
    case "sofortrabatt":
      return {
        color: "text-pink-600",
        bg: "bg-pink-600",
        bgHover: "hover:bg-pink-700",
        bgLight: "bg-pink-50",
        border: "border-pink-300",
        accent: "focus:ring-pink-400",
      };
    case "support":
      return {
        color: "text-orange-600",
        bg: "bg-orange-600",
        bgHover: "hover:bg-orange-700",
        bgLight: "bg-orange-50",
        border: "border-orange-300",
        accent: "focus:ring-orange-400",
      };
    default:
      return {
        color: "text-gray-700",
        bg: "bg-gray-600",
        bgHover: "hover:bg-gray-700",
        bgLight: "bg-gray-50",
        border: "border-gray-300",
        accent: "focus:ring-gray-400",
      };
  }
}

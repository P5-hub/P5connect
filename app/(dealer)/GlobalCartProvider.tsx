"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useDealer } from "@/app/(dealer)/DealerContext";

/* ---------------------------------------------------------
   Welche Formulare haben eigene Warenkörbe?
--------------------------------------------------------- */
export type FormName =
  | "verkauf"
  | "bestellung"
  | "projekt"
  | "support"
  | "sofortrabatt"
  | "cashback";

/* ---------------------------------------------------------
   Projekt-Stammdaten
--------------------------------------------------------- */
type ProjectDetails = {
  type: string;
  name: string;
  customer: string;
  location: string;
  start: string;
  end: string;
  comment: string;
  files?: File[];
};

/* ---------------------------------------------------------
   Warenkorb-Typ
--------------------------------------------------------- */
export type CartState = {
  verkauf: any[];
  bestellung: any[];
  projekt: any[];
  support: any[];
  sofortrabatt: any[];
  cashback: any[];
  currentForm: FormName | null;
  open: boolean;
};

/* ---------------------------------------------------------
   Context Type
--------------------------------------------------------- */
export type CartContextType = {
  state: CartState;
  addItem: (form: FormName, item: any) => void;
  removeItem: (form: FormName, index: number) => void;
  clearCart: (form: FormName) => void;
  openCart: (form: FormName) => void;
  closeCart: () => void;
  getItems: (form: FormName) => any[];
  switchForm: (form: FormName) => void;
  updateItem: (form: FormName, index: number, updates: Partial<any>) => void;
  replaceItem: (form: FormName, index: number, newItem: any) => void;

  projectDetails: ProjectDetails | null;
  setProjectDetails: (d: ProjectDetails | null) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

/* ---------------------------------------------------------
   🔑 Aktiven Händler aus Cookie lesen
--------------------------------------------------------- */
function getActingDealerIdFromCookie(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("acting_dealer_id="));

  return match ? match.split("=")[1] : null;
}

/* ---------------------------------------------------------
   Provider – händlerspezifischer Warenkorb
--------------------------------------------------------- */
export function GlobalCartProvider({ children }: { children: ReactNode }) {
  const dealer = useDealer();

  // 🔑 aktiver Händler > eingeloggter Händler
  const actingDealerId = getActingDealerIdFromCookie();
  const effectiveDealerId = actingDealerId ?? dealer?.dealer_id ?? "none";

  const STORAGE_KEY = `p5-cart-${effectiveDealerId}`;

  const emptyState: CartState = {
    verkauf: [],
    bestellung: [],
    projekt: [],
    support: [],
    sofortrabatt: [],
    cashback: [],
    currentForm: null,
    open: false,
  };

  const [state, setState] = useState<CartState>(emptyState);
  const [projectDetails, setProjectDetails] =
    useState<ProjectDetails | null>(null);

  /* ---------------------------------------------------------
     Laden aus localStorage
  --------------------------------------------------------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const parsed = JSON.parse(raw);

        const sanitize = (arr: any[]) =>
          Array.isArray(arr)
            ? arr.filter((item) => item && item.product_id)
            : [];

        setState({
          ...emptyState,
          ...parsed,
          verkauf: sanitize(parsed.verkauf),
          bestellung: sanitize(parsed.bestellung),
          projekt: sanitize(parsed.projekt),
          support: sanitize(parsed.support),
          sofortrabatt: sanitize(parsed.sofortrabatt),
          cashback: sanitize(parsed.cashback),
        });

        setProjectDetails(parsed.projectDetails ?? null);
      } else {
        setState(emptyState);
        setProjectDetails(null);
      }
    } catch (e) {
      console.error("Fehler beim Laden des Warenkorbs:", e);
      setState(emptyState);
      setProjectDetails(null);
    }
  }, [effectiveDealerId]);

  /* ---------------------------------------------------------
     Speichern in localStorage
  --------------------------------------------------------- */
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...state,
          projectDetails,
        })
      );
    } catch (e) {
      console.error("Fehler beim Speichern des Warenkorbs:", e);
    }
  }, [state, projectDetails, STORAGE_KEY]);

  /* ---------------------------------------------------------
     Produkt hinzufügen
  --------------------------------------------------------- */
  const addItem = (form: FormName, item: any) => {
    if (!item || !item.product_id) return;
    setState((prev) => ({
      ...prev,
      [form]: [...prev[form], item],
    }));
  };

  const removeItem = (form: FormName, index: number) => {
    setState((prev) => ({
      ...prev,
      [form]: prev[form].filter((_, i) => i !== index),
    }));
  };

  const clearCart = (form: FormName) => {
    setState((prev) => ({
      ...prev,
      [form]: [],
    }));
  };

  const getItems = (form: FormName) => state[form];

  const openCart = (form: FormName) => {
    setState((prev) => ({
      ...prev,
      currentForm: form,
      open: true,
    }));
  };

  const closeCart = () => {
    setState((prev) => ({
      ...prev,
      open: false,
      currentForm: null,
    }));
  };

  const switchForm = (form: FormName) => {
    setState((prev) => ({
      ...prev,
      currentForm: form,
      open: false,
    }));
  };

  const updateItem = (
    form: FormName,
    index: number,
    updates: Partial<any>
  ) => {
    setState((prev) => {
      const newList = [...prev[form]];
      if (!newList[index]) return prev;

      newList[index] = { ...newList[index], ...updates };
      if (!newList[index].product_id) return prev;

      return { ...prev, [form]: newList };
    });
  };

  const replaceItem = (form: FormName, index: number, newItem: any) => {
    if (!newItem || !newItem.product_id) return;
    setState((prev) => {
      const newList = [...prev[form]];
      if (!newList[index]) return prev;
      newList[index] = newItem;
      return { ...prev, [form]: newList };
    });
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        clearCart,
        openCart,
        closeCart,
        getItems,
        switchForm,
        updateItem,
        replaceItem,
        projectDetails,
        setProjectDetails,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ---------------------------------------------------------
   Hook
--------------------------------------------------------- */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart() muss im GlobalCartProvider verwendet werden");
  }
  return ctx;
}

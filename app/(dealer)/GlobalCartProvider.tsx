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
};

const CartContext = createContext<CartContextType | undefined>(undefined);

/* ---------------------------------------------------------
   Provider – händlerspezifischer Warenkorb
--------------------------------------------------------- */
export function GlobalCartProvider({ children }: { children: ReactNode }) {
  const dealer = useDealer();
  const dealerId = dealer?.dealer_id ?? "none";
  const STORAGE_KEY = `p5-cart-${dealerId}`;

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

  /* ---------------------------------------------------------
     Laden aus localStorage
  --------------------------------------------------------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const parsed = JSON.parse(raw);

        // 🛡 Schutz: keine leeren Items übernehmen
        const sanitize = (arr: any[]) =>
          arr.filter((item) => item && item.product_id);

        setState({
          ...emptyState,
          ...parsed,
          verkauf: sanitize(parsed.verkauf ?? []),
          bestellung: sanitize(parsed.bestellung ?? []),
          projekt: sanitize(parsed.projekt ?? []),
          support: sanitize(parsed.support ?? []),
          sofortrabatt: sanitize(parsed.sofortrabatt ?? []),
          cashback: sanitize(parsed.cashback ?? []),
        });
      } else {
        // Händlerwechsel → Warenkorb komplett leeren
        setState(emptyState);
      }
    } catch (e) {
      console.error("Fehler beim Laden des Warenkorbs:", e);
      setState(emptyState);
    }
  }, [dealerId]);

  /* ---------------------------------------------------------
     Speichern in localStorage
  --------------------------------------------------------- */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Fehler beim Speichern des Warenkorbs:", e);
    }
  }, [state, STORAGE_KEY]);

  /* ---------------------------------------------------------
     Produkt hinzufügen
  --------------------------------------------------------- */
  const addItem = (form: FormName, item: any) => {
    if (!item || !item.product_id) return; // 🛡 Schutz
    setState((prev) => ({
      ...prev,
      [form]: [...prev[form], item],
    }));
  };

  /* ---------------------------------------------------------
     Produkt entfernen
  --------------------------------------------------------- */
  const removeItem = (form: FormName, index: number) => {
    setState((prev) => ({
      ...prev,
      [form]: prev[form].filter((_, i) => i !== index),
    }));
  };

  /* ---------------------------------------------------------
     Warenkorb leeren
  --------------------------------------------------------- */
  const clearCart = (form: FormName) => {
    setState((prev) => ({
      ...prev,
      [form]: [],
    }));
  };

  /* ---------------------------------------------------------
     Items holen
  --------------------------------------------------------- */
  const getItems = (form: FormName) => state[form];

  /* ---------------------------------------------------------
     Warenkorb öffnen
  --------------------------------------------------------- */
  const openCart = (form: FormName) => {
    setState((prev) => ({
      ...prev,
      currentForm: form,
      open: true,
    }));
  };

  /* ---------------------------------------------------------
     Warenkorb schließen
  --------------------------------------------------------- */
  const closeCart = () => {
    setState((prev) => ({
      ...prev,
      open: false,
      currentForm: null,
    }));
  };

  /* ---------------------------------------------------------
     Formular wechseln
  --------------------------------------------------------- */
  const switchForm = (form: FormName) => {
    setState((prev) => ({
      ...prev,
      currentForm: form,
      open: false,
    }));
  };

  /* ---------------------------------------------------------
     Item aktualisieren – MIT SCHUTZ
  --------------------------------------------------------- */
  const updateItem = (
    form: FormName,
    index: number,
    updates: Partial<any>
  ) => {
    setState((prev) => {
      const newList = [...prev[form]];

      // 🛡 Schutz: nur updaten, wenn Item existiert
      if (!newList[index]) return prev;

      newList[index] = { ...newList[index], ...updates };

      // 🛡 Schutz: nie leere Items erzeugen
      if (!newList[index].product_id) return prev;

      return { ...prev, [form]: newList };
    });
  };

  /* ---------------------------------------------------------
     Item vollständig ersetzen
  --------------------------------------------------------- */
  const replaceItem = (form: FormName, index: number, newItem: any) => {
    if (!newItem || !newItem.product_id) return; // 🛡 Schutz
    setState((prev) => {
      const newList = [...prev[form]];
      if (!newList[index]) return prev; // Schutz
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

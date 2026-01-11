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
   Typen
--------------------------------------------------------- */
export type FormName =
  | "verkauf"
  | "bestellung"
  | "projekt"
  | "support"
  | "sofortrabatt"
  | "cashback";

type ProjectDetails = {
  submission_id: number;      // 🔥 Projekt-ID (P-xxx)
  project_id?: string;        // 🔒 UUID (nur für Navigation)
  project_name?: string | null;
  customer?: string | null;
};

type OrderDetails = {
  files: File[];
};


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

  // 🔥 HIER FEHLTE ES
  orderDetails: OrderDetails;
  setOrderDetails: React.Dispatch<React.SetStateAction<OrderDetails>>;
};


const CartContext = createContext<CartContextType | undefined>(undefined);

/* ---------------------------------------------------------
   Helper
--------------------------------------------------------- */
function getActingDealerIdFromCookie(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("acting_dealer_id="));

  return match ? match.split("=")[1] : null;
}

/* ---------------------------------------------------------
   Provider
--------------------------------------------------------- */
export function GlobalCartProvider({ children }: { children: ReactNode }) {
  const dealer = useDealer(); // ✅ jetzt sicher Client ↔ Client

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
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    files: [],
  });
  

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      setState({ ...emptyState, ...parsed });
      // ✅ projectDetails nur übernehmen, wenn Cart tatsächlich im Bestellmodus ist
      if (parsed?.currentForm === "bestellung") {
        setProjectDetails(parsed.projectDetails ?? null);
      } else {
        setProjectDetails(null);
      }

      setOrderDetails(parsed.orderDetails ?? { files: [] });
    } catch {
      setState(emptyState);
      setProjectDetails(null);
    }
  }, [STORAGE_KEY]);

  useEffect(() => {
    const safeProjectDetails =
      state.currentForm === "bestellung" ? projectDetails : null;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...state, projectDetails: safeProjectDetails, orderDetails })
    );

  }, [state, projectDetails, orderDetails, STORAGE_KEY]);


  const addItem = (form: FormName, item: any) =>
    setState((p) => ({ ...p, [form]: [...p[form], item] }));

  const removeItem = (form: FormName, index: number) =>
    setState((p) => ({
      ...p,
      [form]: p[form].filter((_, i) => i !== index),
    }));

  const clearCart = (form: FormName) =>
    setState((p) => {
      if (form === "bestellung") {
        setOrderDetails({ files: [] });
      }
      return { ...p, [form]: [] };
    });


  const openCart = (form: FormName, opts?: { fromProject?: boolean }) =>
    setState((p) => {
      // ✅ Wenn normale Bestellung geöffnet wird → Projekt-Context löschen
      if (form === "bestellung" && !opts?.fromProject) {
        setProjectDetails(null);
      }

      // ✅ Support / Verkauf / etc. sollen NIE Projekt anzeigen
      if (form !== "bestellung") {
        setProjectDetails(null);
      }

      return { ...p, currentForm: form, open: true };
    });


  const closeCart = () =>
    setState((p) => ({ ...p, currentForm: null, open: false }));

  const getItems = (form: FormName) => state[form];

  const switchForm = (form: FormName) =>
    setState((p) => ({ ...p, currentForm: form, open: false }));

  const updateItem = (form: FormName, index: number, updates: any) =>
    setState((p) => {
      const copy = [...p[form]];
      copy[index] = { ...copy[index], ...updates };
      return { ...p, [form]: copy };
    });

  const replaceItem = (form: FormName, index: number, newItem: any) =>
    setState((p) => {
      const copy = [...p[form]];
      copy[index] = newItem;
      return { ...p, [form]: copy };
    });

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

        // 🔥 HIER FEHLTE ES
        orderDetails,
        setOrderDetails,
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

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

export type PromoType = "classic_fixed" | "tv55_soundbar_percent";

// ✅ NUR Metadaten, KEINE File-Objekte hier drin!
export type ProjectDetails = {
  submission_id: number; // lokale ID (P-xxx)
  project_id?: string; // UUID (nur Navigation)
  project_type?: string | null;
  project_name?: string | null;
  customer?: string | null;
  location?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  comment?: string | null;

  // optional: nur Namen, falls du im UI anzeigen willst
  file_names?: string[];
};

// ✅ in-memory Dateien + cart-nahe Zusatzdaten
export type OrderDetails = {
  // Projekt/Bestellung (bestehende Logik)
  files: File[];

  // ✅ Support Belege
  support_files: File[];

  // ✅ Sofortrabatt
  sofortrabatt_files: File[];
  promo_type?: PromoType;
  sofortrabatt_sales_prices?: {
    soundbar: string | number;
    subwoofer: string | number;
  };
};

// ✅ Support Meta (global, synchron Form <-> Cart)
export type SupportMeta = {
  type: "sellout" | "marketing" | "event" | "other" | "";
  comment: string;
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
  openCart: (form: FormName, opts?: { fromProject?: boolean }) => void;
  closeCart: () => void;
  getItems: (form: FormName) => any[];
  switchForm: (form: FormName) => void;
  updateItem: (form: FormName, index: number, updates: Partial<any>) => void;
  replaceItem: (form: FormName, index: number, newItem: any) => void;

  projectDetails: ProjectDetails | null;
  setProjectDetails: (d: ProjectDetails | null) => void;

  orderDetails: OrderDetails;
  setOrderDetails: React.Dispatch<React.SetStateAction<OrderDetails>>;

  clearOrderFiles: (
    which: "project" | "support" | "sofortrabatt"
  ) => void;

  supportMeta: SupportMeta;
  setSupportMeta: React.Dispatch<React.SetStateAction<SupportMeta>>;
  resetSupportMeta: () => void;
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

function isValidProductItem(item: any) {
  const pid = item?.product_id;
  return pid !== undefined && pid !== null && String(pid).trim() !== "";
}

/* ---------------------------------------------------------
   Provider
--------------------------------------------------------- */
export function GlobalCartProvider({ children }: { children: ReactNode }) {
  const dealer = useDealer();

  const effectiveDealerId = React.useMemo(() => {
    const actingDealerId = getActingDealerIdFromCookie();
    return actingDealerId ?? (dealer as any)?.dealer_id ?? "none";
  }, [dealer]);

  const STORAGE_KEY = React.useMemo(() => {
    return `p5-cart-${effectiveDealerId}`;
  }, [effectiveDealerId]);

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
    support_files: [],
    sofortrabatt_files: [],
    promo_type: "classic_fixed",
    sofortrabatt_sales_prices: {
      soundbar: "",
      subwoofer: "",
    },
  });

  const [supportMeta, setSupportMeta] = useState<SupportMeta>({
    type: "",
    comment: "",
  });

  const resetSupportMeta = () =>
    setSupportMeta({
      type: "",
      comment: "",
    });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);

      setState({ ...emptyState, ...(parsed.state ?? {}) });
      setProjectDetails(parsed.projectDetails ?? null);
      setSupportMeta(parsed.supportMeta ?? { type: "", comment: "" });
    } catch {
      setState(emptyState);
      setProjectDetails(null);
      setSupportMeta({ type: "", comment: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [STORAGE_KEY]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state, projectDetails, supportMeta })
    );
  }, [state, projectDetails, supportMeta, STORAGE_KEY]);

  const addItem = (form: FormName, item: any) => {
    if (form === "projekt" && !isValidProductItem(item)) {
      console.warn("Blocked invalid project cart item (missing product_id):", item);
      return;
    }
    setState((p) => ({ ...p, [form]: [...p[form], item] }));
  };

  const removeItem = (form: FormName, index: number) =>
    setState((p) => ({
      ...p,
      [form]: p[form].filter((_: any, i: number) => i !== index),
    }));

  const clearCart = (form: FormName) => {
    setState((p) => ({ ...p, [form]: [] }));

    if (form === "projekt") {
      setProjectDetails(null);
      setOrderDetails((prev) => ({ ...prev, files: [] }));
    }

    if (form === "support") {
      setOrderDetails((prev) => ({ ...prev, support_files: [] }));
      resetSupportMeta();
    }

    if (form === "sofortrabatt") {
      setOrderDetails((prev) => ({
        ...prev,
        sofortrabatt_files: [],
        promo_type: "classic_fixed",
        sofortrabatt_sales_prices: {
          soundbar: "",
          subwoofer: "",
        },
      }));
    }
  };

  const openCart = (form: FormName, opts?: { fromProject?: boolean }) => {
    if (form === "bestellung" && !opts?.fromProject) {
      setProjectDetails(null);
    }

    if (form !== "projekt" && form !== "bestellung") {
      setProjectDetails(null);
    }

    setState((p) => ({ ...p, currentForm: form, open: true }));
  };

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

  const clearOrderFiles = (
    which: "project" | "support" | "sofortrabatt"
  ) => {
    setOrderDetails((prev) => ({
      ...prev,
      files: which === "project" ? [] : prev.files,
      support_files: which === "support" ? [] : prev.support_files,
      sofortrabatt_files:
        which === "sofortrabatt" ? [] : prev.sofortrabatt_files,
      promo_type:
        which === "sofortrabatt" ? "classic_fixed" : prev.promo_type,
      sofortrabatt_sales_prices:
        which === "sofortrabatt"
          ? { soundbar: "", subwoofer: "" }
          : prev.sofortrabatt_sales_prices,
    }));
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
        orderDetails,
        setOrderDetails,
        clearOrderFiles,
        supportMeta,
        setSupportMeta,
        resetSupportMeta,
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
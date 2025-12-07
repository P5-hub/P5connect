"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { SupportCartItem } from "@/app/(dealer)/components/CartSupport";

type SupportDetails = {
  type: "sellout" | "custom";
  comment: string;
};

type SupportCartState = {
  cart: SupportCartItem[];
  setCart: React.Dispatch<React.SetStateAction<SupportCartItem[]>>;
  open: boolean;
  setOpen: (o: boolean) => void;
  details: SupportDetails;
  setDetails: (d: SupportDetails) => void;
};

const SupportCartContext = createContext<SupportCartState | null>(null);

export function SupportCartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<SupportCartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState<SupportDetails>({
    type: "sellout",
    comment: "",
  });

  return (
    <SupportCartContext.Provider
      value={{
        cart,
        setCart,
        open,
        setOpen,
        details,
        setDetails,
      }}
    >
      {children}
    </SupportCartContext.Provider>
  );
}

// Hooks
export function useSupportCart() {
  const ctx = useContext(SupportCartContext);
  if (!ctx) throw new Error("useSupportCart must be inside SupportCartProvider");
  return ctx;
}

export function useSupportCartState() {
  const ctx = useContext(SupportCartContext);
  if (!ctx) throw new Error("useSupportCartState must be inside SupportCartProvider");
  return {
    cart: ctx.cart,
    open: ctx.open,
    details: ctx.details,
  };
}

export function useSupportCartActions() {
  const ctx = useContext(SupportCartContext);
  if (!ctx) throw new Error("useSupportCartActions must be inside SupportCartProvider");
  return {
    setCart: ctx.setCart,
    setOpen: ctx.setOpen,
    setDetails: ctx.setDetails,
  };
}
